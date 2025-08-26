'use server';

import { revalidateTag } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import {
  createOrderSchema,
  validateCartStockSchema,
  markOrderAsPaidSchema,
  updateOrderStatusSchema,
  type CreateOrderData,
  type ValidateCartStockData,
  type MarkOrderAsPaidData,
  type UpdateOrderStatusData,
} from '@/lib/validations/mini-app';
import { validateMyanmarPhone } from '@/lib/utils/myanmar-phone';

/**
 * Validate cart items against current stock levels
 */
export async function validateCartStockAction(data: ValidateCartStockData) {
  try {
    const validatedData = validateCartStockSchema.parse(data);
    const serviceClient = createServiceRoleClient();

    const validationResults = await Promise.all(
      validatedData.items.map(async (cartItem) => {
        const { data: item } = await serviceClient
          .from('items')
          .select('stock_quantity, name')
          .eq('id', cartItem.id)
          .single();

        return {
          id: cartItem.id,
          name: item?.name || 'Unknown Item',
          requestedQuantity: cartItem.quantity,
          availableQuantity: item?.stock_quantity || 0,
          isValid: (item?.stock_quantity || 0) >= cartItem.quantity,
        };
      }),
    );

    const isValid = validationResults.every((r) => r.isValid);
    const invalidItems = validationResults.filter((r) => !r.isValid);

    return {
      success: true,
      data: {
        valid: isValid,
        invalidItems,
        validationResults,
      },
    };
  } catch (error) {
    console.error('Error validating cart stock:', error);
    return {
      success: false,
      error: 'Failed to validate stock levels',
    };
  }
}

/**
 * Create customer from Telegram user data
 */
async function upsertTelegramCustomer(
  projectId: string,
  telegramUser: CreateOrderData['telegramUser'],
  customerInfo: CreateOrderData['customerInfo'],
) {
  const serviceClient = createServiceRoleClient();

  // Try to find existing customer first
  const { data: existingCustomer } = await serviceClient
    .from('customers')
    .select('id')
    .eq('project_id', projectId)
    .eq('telegram_user_id', telegramUser.id)
    .single();

  if (existingCustomer) {
    // Update existing customer info
    const { data, error } = await serviceClient
      .from('customers')
      .update({
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone,
        email: customerInfo.email || null,
        telegram_username: telegramUser.username || null,
      })
      .eq('id', existingCustomer.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new customer
    const { data, error } = await serviceClient
      .from('customers')
      .insert({
        project_id: projectId,
        telegram_user_id: telegramUser.id,
        telegram_username: telegramUser.username || null,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone,
        email: customerInfo.email || null,
        created_via: 'telegram',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Generate unique order number
 */
async function generateOrderNumber(projectId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();
  const year = new Date().getFullYear();

  // Get last order number for this project and year
  const { data: lastOrder } = await serviceClient
    .from('orders')
    .select('order_number')
    .eq('project_id', projectId)
    .ilike('order_number', `ORD-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastOrder?.order_number) {
    const match = lastOrder.order_number.match(/ORD-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `ORD-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Calculate order totals
 */
function calculateOrderTotals(items: CreateOrderData['items'], deliveryFee: number = 4000) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = deliveryFee;
  const taxAmount = 0; // No tax for MVP
  const discountAmount = 0; // No discount for MVP
  const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

  return {
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    totalAmount,
  };
}

/**
 * Create order from mini-app
 */
export async function createOrderAction(formData: FormData) {
  try {
    // Parse form data
    const rawData = {
      projectId: formData.get('projectId') as string,
      items: JSON.parse(formData.get('items') as string),
      customerInfo: JSON.parse(formData.get('customerInfo') as string),
      paymentMethod: formData.get('paymentMethod') as string,
      telegramUser: JSON.parse(formData.get('telegramUser') as string),
      deliveryNotes: (formData.get('deliveryNotes') as string) || undefined,
    };

    const validatedData = createOrderSchema.parse(rawData);
    const serviceClient = createServiceRoleClient();

    // Validate Myanmar phone number
    const phoneValidation = validateMyanmarPhone(validatedData.customerInfo.phone);
    if (!phoneValidation.isValid) {
      return {
        success: false,
        error: phoneValidation.error || 'Invalid phone number',
      };
    }

    // Validate stock levels
    const stockValidation = await validateCartStockAction({
      items: validatedData.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    });

    if (!stockValidation.success || !stockValidation.data?.valid) {
      return {
        success: false,
        error: 'Some items are out of stock',
        stockErrors: stockValidation.data?.invalidItems,
      };
    }

    // Create or update customer
    const customer = await upsertTelegramCustomer(
      validatedData.projectId,
      validatedData.telegramUser,
      validatedData.customerInfo,
    );

    // Generate order number
    const orderNumber = await generateOrderNumber(validatedData.projectId);

    // Calculate totals
    const totals = calculateOrderTotals(validatedData.items);

    // Create order
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        project_id: validatedData.projectId,
        customer_id: customer.id,
        order_number: orderNumber,
        status: 'pending',
        payment_method: validatedData.paymentMethod,
        payment_status: 'pending',
        telegram_user_id: validatedData.telegramUser.id,
        subtotal: totals.subtotal,
        shipping_cost: totals.shippingCost,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.totalAmount,
        shipping_address: {
          firstName: validatedData.customerInfo.firstName,
          lastName: validatedData.customerInfo.lastName,
          phone: phoneValidation.formatted,
          secondaryPhone: validatedData.customerInfo.secondaryPhone,
          email: validatedData.customerInfo.email,
          address: validatedData.customerInfo.address,
        },
        delivery_city: validatedData.customerInfo.address.city,
        customer_phone_secondary: validatedData.customerInfo.secondaryPhone || null,
        delivery_notes: validatedData.deliveryNotes || null,
        notes: validatedData.customerInfo.notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = validatedData.items.map((item) => ({
      order_id: order.id,
      item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      item_snapshot: {
        name: item.name,
        sku: item.sku,
        image_url: item.imageUrl,
        price: item.price,
      },
    }));

    const { error: orderItemsError } = await serviceClient.from('order_items').insert(orderItems);

    if (orderItemsError) throw orderItemsError;

    // Revalidate caches
    revalidateTag('orders');
    revalidateTag('user-orders');
    revalidateTag('items'); // Stock levels might change

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}

/**
 * Mark order as paid (for manual payment confirmation)
 */
export async function markOrderAsPaidAction(data: MarkOrderAsPaidData) {
  try {
    const validatedData = markOrderAsPaidSchema.parse(data);
    const serviceClient = createServiceRoleClient();

    const { data: order, error } = await serviceClient
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        paid_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        payment_reference: validatedData.paymentReference || null,
      })
      .eq('id', validatedData.orderId)
      .select()
      .single();

    if (error) throw error;

    // Revalidate caches
    revalidateTag(`order-${validatedData.orderId}`);
    revalidateTag('orders');
    revalidateTag('user-orders');

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('Error marking order as paid:', error);
    return {
      success: false,
      error: 'Failed to update payment status',
    };
  }
}

/**
 * Get order details
 */
export async function getOrderDetailsAction(orderId: string) {
  try {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('orders')
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          item_snapshot
        ),
        customers (
          id,
          first_name,
          last_name,
          phone,
          telegram_username,
          telegram_user_id
        )
      `,
      )
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      error: 'Order not found',
    };
  }
}

/**
 * Get orders for a specific Telegram user
 */
export async function getUserOrdersAction(params: {
  projectId: string;
  telegramUserId: number;
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { projectId, telegramUserId, status, page = 1, limit = 10 } = params;
    const serviceClient = createServiceRoleClient();

    // Build the query
    let query = serviceClient
      .from('orders')
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        payment_method,
        total_amount,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          item_snapshot
        )
      `,
        { count: 'exact' },
      )
      .eq('project_id', projectId)
      .eq('telegram_user_id', telegramUserId)
      .order('created_at', { ascending: false });

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status as Database['public']['Enums']['order_status_enum']);
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      data: {
        orders: data || [],
        total: count || 0,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      error: 'Failed to fetch orders',
    };
  }
}

/**
 * Update order status (for admin use)
 */
export async function updateOrderStatusAction(data: UpdateOrderStatusData) {
  try {
    const validatedData = updateOrderStatusSchema.parse(data);
    const serviceClient = createServiceRoleClient();

    const updateData: {
      status: Database['public']['Enums']['order_status_enum'];
      updated_at: string;
      confirmed_at?: string;
      delivered_at?: string;
      internal_notes?: string;
    } = {
      status: validatedData.status as Database['public']['Enums']['order_status_enum'],
      updated_at: new Date().toISOString(),
    };

    // Set timestamps based on status
    if (validatedData.status === 'confirmed' && !updateData.confirmed_at) {
      updateData.confirmed_at = new Date().toISOString();
    }
    if (validatedData.status === 'delivered' && !updateData.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }

    if (validatedData.notes) {
      updateData.internal_notes = validatedData.notes;
    }

    const { data: order, error } = await serviceClient
      .from('orders')
      .update(updateData)
      .eq('id', validatedData.orderId)
      .select()
      .single();

    if (error) throw error;

    // Revalidate caches
    revalidateTag(`order-${validatedData.orderId}`);
    revalidateTag('orders');
    revalidateTag('user-orders');

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: 'Failed to update order status',
    };
  }
}
