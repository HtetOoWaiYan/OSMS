import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import type { CartItem } from "@/lib/stores/cart-store";

// Types
interface CartValidationResult {
  valid: boolean;
  adjustedItems: Array<{
    id: string;
    requestedQuantity: number;
    availableQuantity: number;
    maxQuantity: number;
  }>;
  errors: string[];
}

interface CustomerInfo {
  first_name: string;
  last_name?: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

interface CreateOrderData {
  projectId: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  paymentMethod: string;
  telegramUser?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
}

/**
 * Validate cart items against current stock
 */
export async function validateCartStock(cartItems: CartItem[]): Promise<CartValidationResult> {
  const serviceClient = createServiceRoleClient();
  
  const validationResults = await Promise.all(
    cartItems.map(async (cartItem) => {
      const { data: item } = await serviceClient
        .from('items')
        .select('stock_quantity, is_active')
        .eq('id', cartItem.id)
        .single();
      
      const availableQuantity = (item?.stock_quantity || 0);
      const isActive = item?.is_active ?? false;
      const maxQuantity = isActive ? Math.min(availableQuantity, cartItem.quantity) : 0;
      
      return {
        id: cartItem.id,
        requestedQuantity: cartItem.quantity,
        availableQuantity,
        maxQuantity,
        isValid: isActive && availableQuantity >= cartItem.quantity,
        isActive
      };
    })
  );
  
  const invalidItems = validationResults.filter(r => !r.isValid);
  const adjustedItems = invalidItems.map(item => ({
    id: item.id,
    requestedQuantity: item.requestedQuantity,
    availableQuantity: item.availableQuantity,
    maxQuantity: item.maxQuantity
  }));
  
  const errors = invalidItems.map(item => {
    if (!item.isActive) {
      return `Item ${item.id} is no longer available`;
    }
    if (item.availableQuantity === 0) {
      return `Item ${item.id} is out of stock`;
    }
    return `Item ${item.id}: only ${item.availableQuantity} available (requested ${item.requestedQuantity})`;
  });
  
  return {
    valid: invalidItems.length === 0,
    adjustedItems,
    errors
  };
}

/**
 * Create customer from Telegram user if doesn't exist
 */
async function upsertTelegramCustomer(
  projectId: string,
  telegramUser: NonNullable<CreateOrderData['telegramUser']>,
  customerInfo: CustomerInfo
) {
  const serviceClient = createServiceRoleClient();
  
  // Try to find existing customer by Telegram ID
  const { data: existingCustomer } = await serviceClient
    .from('customers')
    .select('id')
    .eq('project_id', projectId)
    .eq('telegram_user_id', telegramUser.id)
    .single();
  
  if (existingCustomer) {
    // Update existing customer with new info
    const { data: updatedCustomer, error } = await serviceClient
      .from('customers')
      .update({
        first_name: customerInfo.first_name,
        last_name: customerInfo.last_name || telegramUser.last_name,
        phone: customerInfo.phone,
        telegram_username: telegramUser.username,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCustomer.id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedCustomer;
  }
  
  // Create new customer
  const { data: newCustomer, error } = await serviceClient
    .from('customers')
    .insert({
      project_id: projectId,
      telegram_user_id: telegramUser.id,
      telegram_username: telegramUser.username,
      first_name: customerInfo.first_name,
      last_name: customerInfo.last_name || telegramUser.last_name,
      phone: customerInfo.phone,
      created_via: 'telegram'
    })
    .select()
    .single();
  
  if (error) throw error;
  return newCustomer;
}

/**
 * Generate unique order number
 */
async function generateOrderNumber(projectId: string): Promise<string> {
  const serviceClient = createServiceRoleClient();
  
  // Get count of orders for this project today
  const today = new Date().toISOString().split('T')[0];
  const { count } = await serviceClient
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);
  
  const orderCount = (count || 0) + 1;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  return `ORD-${dateStr}-${orderCount.toString().padStart(4, '0')}`;
}

/**
 * Calculate order totals
 */
function calculateOrderTotals(items: CartItem[], deliveryFee: number = 0) {
  const subtotal = items.reduce((total, item) => total + (item.current_price * item.quantity), 0);
  const totalAmount = subtotal + deliveryFee;
  
  return {
    subtotal,
    shipping_cost: deliveryFee,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: totalAmount
  };
}

/**
 * Create order with stock validation
 */
export async function createOrderAction(orderData: CreateOrderData): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    const serviceClient = createServiceRoleClient();
    
    // 1. Validate cart items
    const stockValidation = await validateCartStock(orderData.items);
    if (!stockValidation.valid) {
      return { 
        success: false, 
        error: `Stock validation failed: ${stockValidation.errors.join(', ')}`
      };
    }
    
    // 2. Create or update customer
    let customerId: string;
    
    if (orderData.telegramUser) {
      const customer = await upsertTelegramCustomer(
        orderData.projectId,
        orderData.telegramUser,
        orderData.customerInfo
      );
      customerId = customer.id;
    } else {
      // Create regular customer (fallback)
      const { data: customer, error } = await serviceClient
        .from('customers')
        .insert({
          project_id: orderData.projectId,
          first_name: orderData.customerInfo.first_name,
          last_name: orderData.customerInfo.last_name,
          phone: orderData.customerInfo.phone,
          created_via: 'telegram'
        })
        .select()
        .single();
      
      if (error) throw error;
      customerId = customer.id;
    }
    
    // 3. Generate order number
    const orderNumber = await generateOrderNumber(orderData.projectId);
    
    // 4. Calculate totals (hardcoded delivery fee for now)
    const totals = calculateOrderTotals(orderData.items, 4000);
    
    // 5. Create order
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        project_id: orderData.projectId,
        customer_id: customerId,
        order_number: orderNumber,
        status: 'pending',
        payment_method: orderData.paymentMethod as 'cod' | 'online' | 'kbz_pay' | 'aya_pay' | 'cb_pay' | 'mobile_banking',
        telegram_user_id: orderData.telegramUser?.id,
        delivery_city: orderData.customerInfo.city,
        shipping_address: {
          address: orderData.customerInfo.address,
          city: orderData.customerInfo.city,
          phone: orderData.customerInfo.phone,
          notes: orderData.customerInfo.notes
        },
        delivery_notes: orderData.customerInfo.notes,
        ...totals
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // 6. Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      item_id: item.id,
      quantity: item.quantity,
      unit_price: item.current_price,
      total_price: item.current_price * item.quantity,
      item_snapshot: {
        name: item.name,
        current_price: item.current_price,
        original_price: item.original_price,
        image_url: item.first_image_url
      }
    }));
    
    const { error: itemsError } = await serviceClient
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // 7. Update stock quantities
    for (const item of orderData.items) {
      // Get current stock
      const { data: currentItem } = await serviceClient
        .from('items')
        .select('stock_quantity')
        .eq('id', item.id)
        .single();
      
      if (currentItem) {
        // Update stock
        await serviceClient
          .from('items')
          .update({
            stock_quantity: Math.max(0, currentItem.stock_quantity - item.quantity)
          })
          .eq('id', item.id);
        
        // Create stock movement record
        await serviceClient
          .from('stock_movements')
          .insert({
            item_id: item.id,
            movement_type: 'out',
            reason: 'sale',
            quantity: item.quantity,
            reference_id: order.id,
            notes: `Order ${order.order_number}`
          });
      }
    }
    
    // 8. Revalidate caches
    revalidateTag('items');
    revalidateTag('mini-app-items');
    revalidateTag('orders');
    
    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error('Error creating order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order'
    };
  }
}