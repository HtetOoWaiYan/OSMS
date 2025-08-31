'use server';

import { getOrders, updateOrder } from '@/lib/data/orders';
import { updateOrderSchema } from '@/lib/validations/orders';
import { revalidateTag } from 'next/cache';

/**
 * Get all orders for a project
 */
export async function getOrdersAction(
  projectId: string,
  filters?: {
    search?: string;
    status?: 'pending' | 'confirmed' | 'delivering' | 'delivered' | 'paid' | 'done' | 'cancelled';
    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method?: 'cod' | 'online' | 'kbz_pay' | 'aya_pay' | 'cb_pay' | 'mobile_banking';
    sortBy?: 'created_at' | 'order_number' | 'total_amount' | 'status';
    sortOrder?: 'asc' | 'desc';
  },
) {
  try {
    const result = await getOrders(projectId, filters);
    return result;
  } catch (error) {
    console.error('Error in getOrdersAction:', error);
    return {
      success: false,
      error: 'Failed to fetch orders',
    };
  }
}

/**
 * Update an order
 */
export async function updateOrderAction(orderId: string, projectId: string, formData: FormData) {
  try {
    // Parse and validate form data
    const rawData: Record<string, unknown> = {
      status: formData.get('status'),
      payment_method: formData.get('payment_method'),
      payment_status: formData.get('payment_status'),
      delivery_notes: formData.get('delivery_notes'),
      internal_notes: formData.get('internal_notes'),
      delivery_city: formData.get('delivery_city'),
      customer_phone_secondary: formData.get('customer_phone_secondary'),
    };

    // Handle shipping address separately
    const shippingAddressData = formData.get('shipping_address');
    if (shippingAddressData) {
      try {
        const parsedAddress = JSON.parse(shippingAddressData as string);
        if (parsedAddress && typeof parsedAddress === 'object') {
          rawData.shipping_address = parsedAddress;
        }
      } catch (error) {
        console.error('Error parsing shipping address:', error);
      }
    }

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([, value]) => value !== undefined),
    );

    const validatedData = updateOrderSchema.parse(cleanData);

    // Update the order
    const result = await updateOrder(orderId, projectId, validatedData);

    if (result.success) {
      // Revalidate orders cache
      revalidateTag('orders');
    }

    return result;
  } catch (error) {
    console.error('Error in updateOrderAction:', error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as {
        errors?: Array<{ path: string[]; message: string }>;
      };
      if (zodError.errors && Array.isArray(zodError.errors)) {
        const errorMessages = zodError.errors.map((err) => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        });
        return {
          success: false,
          error: `Validation error: ${errorMessages.join(', ')}`,
        };
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to update order',
    };
  }
}
