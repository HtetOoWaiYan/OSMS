'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { updateOrderAction } from '@/lib/actions/orders';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';
import Image from 'next/image';
import type { Tables } from '@/lib/supabase/database.types';

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

interface ShippingAddress {
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface EditOrderFormProps {
  order: OrderWithCustomer;
  projectId: string;
}

// Helper function to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Helper function to format date
function formatDate(dateString: string | null) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EditOrderForm({ order, projectId }: EditOrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    status: order.status || 'pending',
    payment_method: order.payment_method || 'cod',
    payment_status: order.payment_status || 'pending',
    shipping_address: (order.shipping_address as unknown as ShippingAddress) || {
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    delivery_notes: order.delivery_notes || '',
    internal_notes: order.internal_notes || '',
    delivery_city: order.delivery_city || '',
    customer_phone_secondary: order.customer_phone_secondary || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataObj = new FormData();

      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'shipping_address') {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, String(value));
          }
        }
      });

      const result = await updateOrderAction(order.id, projectId, formDataObj);

      if (result.success) {
        toast({
          title: 'Order updated',
          description: 'Order has been updated successfully.',
        });
        router.push(`/dashboard/${projectId}/orders`);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update order.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | object) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Number (Read-only) */}
            <div className="space-y-2">
              <Label>Order Number</Label>
              <Input value={order.order_number} disabled />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivering">Delivering</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="kbz_pay">KBZ Pay</SelectItem>
                  <SelectItem value="aya_pay">AYA Pay</SelectItem>
                  <SelectItem value="cb_pay">CB Pay</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => handleInputChange('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery City */}
            <div className="space-y-2">
              <Label htmlFor="delivery_city">Delivery City</Label>
              <Input
                id="delivery_city"
                value={formData.delivery_city}
                onChange={(e) => handleInputChange('delivery_city', e.target.value)}
                placeholder="Enter delivery city"
              />
            </div>

            {/* Secondary Phone */}
            <div className="space-y-2">
              <Label htmlFor="customer_phone_secondary">Secondary Phone</Label>
              <Input
                id="customer_phone_secondary"
                value={formData.customer_phone_secondary}
                onChange={(e) => handleInputChange('customer_phone_secondary', e.target.value)}
                placeholder="Enter secondary phone number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={`${order.customer.first_name} ${order.customer.last_name}`} disabled />
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input value={order.customer.phone || ''} disabled />
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label>Customer Email</Label>
              <Input value={order.customer.email || ''} disabled />
            </div>

            {/* Telegram Username */}
            {order.customer.telegram_username && (
              <div className="space-y-2">
                <Label>Telegram Username</Label>
                <Input value={`@${order.customer.telegram_username}`} disabled />
              </div>
            )}

            {/* Order Timestamps */}
            <div className="space-y-2">
              <Label>Created At</Label>
              <Input value={formatDate(order.created_at)} disabled />
            </div>

            {order.confirmed_at && (
              <div className="space-y-2">
                <Label>Confirmed At</Label>
                <Input value={formatDate(order.confirmed_at)} disabled />
              </div>
            )}

            {order.delivered_at && (
              <div className="space-y-2">
                <Label>Delivered At</Label>
                <Input value={formatDate(order.delivered_at)} disabled />
              </div>
            )}

            {order.paid_at && (
              <div className="space-y-2">
                <Label>Paid At</Label>
                <Input value={formatDate(order.paid_at)} disabled />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_address">Address</Label>
            <Textarea
              id="shipping_address"
              value={formData.shipping_address.address}
              onChange={(e) =>
                handleInputChange('shipping_address', {
                  ...formData.shipping_address,
                  address: e.target.value,
                })
              }
              placeholder="Enter shipping address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="space-y-4">
              {order.order_items.map((orderItem) => (
                <div
                  key={orderItem.id}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <div className="bg-muted flex h-16 w-16 items-center justify-center overflow-hidden rounded-md">
                    {(() => {
                      const primaryImage = orderItem.item?.item_images?.find(
                        (img) => img.is_primary,
                      )?.image_url;
                      const firstImage = orderItem.item?.item_images?.[0]?.image_url;
                      const imageUrl =
                        primaryImage || firstImage || orderItem.item_snapshot?.image_url;

                      return imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={`${orderItem.item?.name || orderItem.item_snapshot?.name} image`}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="text-muted-foreground h-8 w-8" />
                      );
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {orderItem.item?.name || orderItem.item_snapshot?.name || 'Unknown Item'}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      SKU: {orderItem.item?.sku || orderItem.item_snapshot?.sku || 'N/A'}
                    </div>
                    <div className="text-sm">
                      Quantity: {orderItem.quantity} × {formatCurrency(orderItem.unit_price)} ={' '}
                      {formatCurrency(orderItem.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">No items in this order</div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delivery Notes */}
          <div className="space-y-2">
            <Label htmlFor="delivery_notes">Delivery Notes</Label>
            <Textarea
              id="delivery_notes"
              value={formData.delivery_notes}
              onChange={(e) => handleInputChange('delivery_notes', e.target.value)}
              placeholder="Enter delivery notes"
              rows={3}
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internal_notes">Internal Notes</Label>
            <Textarea
              id="internal_notes"
              value={formData.internal_notes}
              onChange={(e) => handleInputChange('internal_notes', e.target.value)}
              placeholder="Enter internal notes (only visible to staff)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {(order.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount_amount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping_cost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>Status:</span>
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span>Payment:</span>
                <Badge variant="outline">{order.payment_status}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span>Method:</span>
                <Badge variant="outline">{order.payment_method}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/${projectId}/orders`)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Order'}
        </Button>
      </div>
    </form>
  );
}
