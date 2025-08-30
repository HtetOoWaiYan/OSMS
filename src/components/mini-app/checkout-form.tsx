'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/hooks/use-cart-store';
import { createOrderAction } from '@/lib/actions/mini-app';
import { customerInfoSchema, type CustomerInfo } from '@/lib/validations/mini-app';
import { validateMyanmarPhone, MYANMAR_CITIES } from '@/lib/utils/myanmar-phone';
import { toast } from 'sonner';
import { Loader2, User, MapPin, CreditCard } from 'lucide-react';

interface CheckoutFormProps {
  projectId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export function CheckoutForm({ projectId }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');

  // Mock payment methods - in real implementation, fetch from server
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      description: 'Pay when your order arrives',
      enabled: true,
    },
    {
      id: 'kbz_pay',
      name: 'KBZ Pay',
      description: 'Pay with KBZ Pay mobile wallet',
      enabled: true,
    },
    {
      id: 'cb_pay',
      name: 'CB Pay',
      description: 'Pay with CB Pay mobile wallet',
      enabled: true,
    },
    {
      id: 'aya_pay',
      name: 'AYA Pay',
      description: 'Pay with AYA Pay mobile wallet',
      enabled: false,
    },
  ];

  const form = useForm<CustomerInfo>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      secondaryPhone: '',
      email: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: 'Yangon',
        postalCode: '',
      },
      notes: '',
    },
  });

  // Get Telegram user data if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp as {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
      if (webapp.initDataUnsafe?.user) {
        const user = webapp.initDataUnsafe.user;
        form.setValue('firstName', user.first_name || '');
        form.setValue('lastName', user.last_name || '');
      }
    }
  }, [form]);

  const onSubmit = async (data: CustomerInfo) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate phone number
    const phoneValidation = validateMyanmarPhone(data.phone);
    if (!phoneValidation.isValid) {
      form.setError('phone', { message: phoneValidation.error || 'Invalid phone number' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get Telegram user data
      const telegramUser = (() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const webapp = window.Telegram.WebApp as {
            initDataUnsafe?: {
              user?: {
                id: number;
                first_name?: string;
                last_name?: string;
                username?: string;
              };
            };
          };
          return (
            webapp.initDataUnsafe?.user || {
              id: Date.now(),
              first_name: data.firstName,
              last_name: data.lastName,
            }
          );
        }
        return { id: Date.now(), first_name: data.firstName, last_name: data.lastName };
      })();

      // Create form data
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('items', JSON.stringify(items));
      formData.append('customerInfo', JSON.stringify(data));
      formData.append('paymentMethod', selectedPaymentMethod);
      formData.append('telegramUser', JSON.stringify(telegramUser));
      if (data.notes) {
        formData.append('deliveryNotes', data.notes);
      }

      const result = await createOrderAction(formData);

      if (result.success && result.data) {
        // Clear cart after successful order
        clearCart();

        // Navigate to payment page
        router.push(`/app/${projectId}/payment?orderId=${result.data.orderId}`);

        toast.success('Order created successfully!');
      } else {
        toast.error(result.error || 'Failed to create order');

        // Handle stock errors
        if (result.stockErrors) {
          const errorMessage = result.stockErrors
            .map(
              (item: { name: string; availableQuantity: number }) =>
                `${item.name}: only ${item.availableQuantity} available`,
            )
            .join(', ');
          toast.error(`Stock updated: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <User className="text-primary h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground text-sm font-semibold">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="border-border focus:border-primary focus:ring-primary h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground text-sm font-semibold">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="border-border focus:border-primary focus:ring-primary h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-card-foreground text-sm font-semibold">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="09123456789"
                      className="border-border focus:border-primary focus:ring-primary h-11"
                      {...field}
                      onChange={(e) => {
                        // Auto-format phone number
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.startsWith('959')) {
                          value = '09' + value.substring(3);
                        } else if (!value.startsWith('09') && value.length > 0) {
                          value = '09' + value;
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="09987654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <MapPin className="text-chart-1 h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address.addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address, building name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Apartment, suite, unit, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MYANMAR_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="11181" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <CreditCard className="text-chart-2 h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="space-y-3"
            >
              {paymentMethods
                .filter((method) => method.enabled)
                .map((method) => (
                  <div
                    key={method.id}
                    className="hover:bg-muted data-[state=checked]:border-primary data-[state=checked]:bg-primary/5 flex items-center space-x-3 rounded-xl border-2 p-4 transition-colors"
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="flex-shrink-0" />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div>
                        <p className="text-card-foreground font-semibold">{method.name}</p>
                        <p className="text-muted-foreground text-sm">{method.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Delivery Notes */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-card-foreground text-base font-semibold">
                    Delivery Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special instructions for delivery..."
                      className="border-border focus:border-primary focus:ring-primary resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="bg-primary hover:bg-primary/90 h-12 w-full text-base font-semibold shadow-sm"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
