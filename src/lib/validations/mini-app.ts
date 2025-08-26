import { z } from 'zod';
import { MYANMAR_CITIES } from '@/lib/utils/myanmar-phone';

// Cart item validation
export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().positive(),
  maxStock: z.number().nonnegative(),
  imageUrl: z.string().optional(),
  sku: z.string().optional(),
});

// Customer info validation for checkout
export const customerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  secondaryPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.object({
    addressLine1: z.string().min(1, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.enum([...MYANMAR_CITIES], {
      message: 'Please select a valid city',
    }),
    postalCode: z.string().optional(),
  }),
  notes: z.string().optional(),
});

// Order creation validation
export const createOrderSchema = z.object({
  projectId: z.string().uuid(),
  items: z.array(cartItemSchema).min(1, 'At least one item is required'),
  customerInfo: customerInfoSchema,
  paymentMethod: z.enum(['cod', 'kbz_pay', 'cb_pay', 'aya_pay'], {
    message: 'Please select a valid payment method',
  }),
  telegramUser: z.object({
    id: z.number(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z.string().optional(),
  }),
  deliveryNotes: z.string().optional(),
});

// Stock validation for cart items
export const validateCartStockSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().positive(),
    }),
  ),
});

// Payment confirmation schema
export const markOrderAsPaidSchema = z.object({
  orderId: z.string().uuid(),
  paymentReference: z.string().optional(),
});

// Order status update schema
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'paid', 'delivering', 'delivered', 'cancelled']),
  notes: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type CustomerInfo = z.infer<typeof customerInfoSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type ValidateCartStockData = z.infer<typeof validateCartStockSchema>;
export type MarkOrderAsPaidData = z.infer<typeof markOrderAsPaidSchema>;
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
