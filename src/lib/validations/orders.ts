import { z } from 'zod';

// Order status enum
const orderStatusEnum = z.enum([
  'pending',
  'confirmed',
  'delivering',
  'delivered',
  'paid',
  'done',
  'cancelled',
]);

// Payment method enum
const paymentMethodEnum = z.enum([
  'cod',
  'online',
  'kbz_pay',
  'aya_pay',
  'cb_pay',
  'mobile_banking',
]);

// Payment status enum
const paymentStatusEnum = z.enum(['pending', 'paid', 'failed', 'refunded']);

// Shipping address schema
const shippingAddressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

// Update order schema
export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  payment_method: paymentMethodEnum.optional(),
  payment_status: paymentStatusEnum.optional(),
  shipping_address: shippingAddressSchema.optional(),
  delivery_notes: z.string().optional(),
  internal_notes: z.string().optional(),
  delivery_city: z.string().optional(),
  customer_phone_secondary: z.string().optional(),
});

export type UpdateOrderData = z.infer<typeof updateOrderSchema>;

// Order filters schema
export const orderFiltersSchema = z.object({
  search: z.string().optional(),
  status: orderStatusEnum.optional(),
  payment_status: paymentStatusEnum.optional(),
  payment_method: paymentMethodEnum.optional(),
  sortBy: z.enum(['created_at', 'order_number', 'total_amount', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type OrderFilters = z.infer<typeof orderFiltersSchema>;
