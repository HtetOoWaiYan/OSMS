import 'server-only';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { Tables, TablesInsert } from '@/lib/supabase/database.types';

// Type aliases for better readability
type Order = Tables<'orders'>;
type Customer = Tables<'customers'>;
type OrderItem = Tables<'order_items'>;
type Item = Tables<'items'>;

interface OrderWithCustomer extends Order {
  customer: Customer;
  order_items?: OrderItemWithItem[];
}

interface OrderItemWithItem extends Omit<OrderItem, 'item_snapshot'> {
  item?:
    | (Item & {
        item_images?: Array<{
          image_url: string;
          display_order: number | null;
          is_primary: boolean | null;
        }>;
      })
    | null;
  item_snapshot?: {
    name?: string;
    sku?: string;
    description?: string;
    image_url?: string;
  };
}

type OrderInsert = TablesInsert<'orders'>;
type OrderUpdate = Partial<OrderInsert>;

/**
 * Data access layer for order management
 * Follows the Data Access Layer pattern as recommended by Next.js security best practices
 */

// ============================================================================
// ORDER READ OPERATIONS
// ============================================================================

/**
 * Get all orders for a project with customer data
 */
export async function getOrders(
  projectId: string,
  filters?: {
    search?: string;
    status?: 'pending' | 'confirmed' | 'delivering' | 'delivered' | 'paid' | 'done' | 'cancelled';
    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method?: 'cod' | 'online' | 'kbz_pay' | 'aya_pay' | 'cb_pay' | 'mobile_banking';
    sortBy?: 'created_at' | 'order_number' | 'total_amount' | 'status';
    sortOrder?: 'asc' | 'desc';
  },
): Promise<{
  success: boolean;
  error?: string;
  data?: OrderWithCustomer[];
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Build query
    let query = supabase
      .from('orders')
      .select(
        `
        *,
        customer:customers(*),
        order_items:order_items(
          *,
          item:items(
            *,
            item_images!left(
              image_url,
              display_order,
              is_primary
            )
          )
        )
      `,
      )
      .eq('project_id', projectId);

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%,customer.first_name.ilike.%${filters.search}%,customer.last_name.ilike.%${filters.search}%,customer.phone.ilike.%${filters.search}%`,
      );
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortBy, sortOrder);

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: 'Failed to fetch orders' };
    }

    return { success: true, data: orders as OrderWithCustomer[] };
  } catch (error) {
    console.error('Error in getOrders:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// ============================================================================
// ORDER UPDATE OPERATIONS
// ============================================================================

/**
 * Update an order
 */
export async function updateOrder(
  orderId: string,
  projectId: string,
  updateData: OrderUpdate,
): Promise<{
  success: boolean;
  error?: string;
  data?: OrderWithCustomer;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user has permission to access this project
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole) {
      return { success: false, error: 'Access denied' };
    }

    // Prepare update data with timestamp updates
    const updatePayload: OrderUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Update timestamps based on status changes
    if (updateData.status === 'confirmed' && updateData.status !== undefined) {
      updatePayload.confirmed_at = new Date().toISOString();
    }
    if (updateData.status === 'delivered' && updateData.status !== undefined) {
      updatePayload.delivered_at = new Date().toISOString();
    }
    if (updateData.payment_status === 'paid' && updateData.payment_status !== undefined) {
      updatePayload.paid_at = new Date().toISOString();
    }

    // Update the order using service role client
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .eq('project_id', projectId)
      .select(
        `
        *,
        customer:customers(*),
        order_items:order_items(
          *,
          item:items(
            *,
            item_images!left(
              image_url,
              display_order,
              is_primary
            )
          )
        )
      `,
      )
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return { success: false, error: 'Failed to update order' };
    }

    return { success: true, data: updatedOrder as OrderWithCustomer };
  } catch (error) {
    console.error('Error in updateOrder:', error);
    return { success: false, error: 'Internal server error' };
  }
}
