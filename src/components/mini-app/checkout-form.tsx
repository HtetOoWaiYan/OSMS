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
import { Loader2, User, MapPin, CreditCard, QrCode } from 'lucide-react';
import { useTelegramUser } from '@/components/telegram-provider';
import { getPaymentQRCodesAction } from '@/lib/actions/mini-app';

interface CheckoutFormProps {
  projectId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  hasQRCode?: boolean;
  qrCodeUrl?: string;
  phoneNumber?: string;
}

type PaymentQRCodeData = {
  id: string;
  payment_method: string;
  phone_number: string;
  qr_code_url: string;
};

export function CheckoutForm({ projectId }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user: telegramUser, isLoading: userLoading } = useTelegramUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);

  // Fetch payment methods and QR codes
  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const result = await getPaymentQRCodesAction(projectId);
        const qrCodes = (result.success ? result.data : []) as PaymentQRCodeData[];

        // Create payment methods with QR code info
        const methods: PaymentMethod[] = [
          {
            id: 'cod',
            name: 'Cash on Delivery (COD)',
            description: 'Pay when your order arrives',
            enabled: true,
            hasQRCode: false,
          },
          {
            id: 'kbz_pay',
            name: 'KBZ Pay',
            description: 'Pay with KBZ Pay mobile wallet',
            enabled: true,
            hasQRCode: qrCodes.some((qr) => qr.payment_method === 'kbz_pay'),
            qrCodeUrl:
              qrCodes.find((qr) => qr.payment_method === 'kbz_pay')?.qr_code_url || undefined,
            phoneNumber:
              qrCodes.find((qr) => qr.payment_method === 'kbz_pay')?.phone_number || undefined,
          },
          {
            id: 'cb_pay',
            name: 'CB Pay',
            description: 'Pay with CB Pay mobile wallet',
            enabled: true,
            hasQRCode: qrCodes.some((qr) => qr.payment_method === 'cb_pay'),
            qrCodeUrl:
              qrCodes.find((qr) => qr.payment_method === 'cb_pay')?.qr_code_url || undefined,
            phoneNumber:
              qrCodes.find((qr) => qr.payment_method === 'cb_pay')?.phone_number || undefined,
          },
          {
            id: 'aya_pay',
            name: 'AYA Pay',
            description: 'Pay with AYA Pay mobile wallet',
            enabled: qrCodes.some((qr) => qr.payment_method === 'aya_pay'),
            hasQRCode: qrCodes.some((qr) => qr.payment_method === 'aya_pay'),
            qrCodeUrl:
              qrCodes.find((qr) => qr.payment_method === 'aya_pay')?.qr_code_url || undefined,
            phoneNumber:
              qrCodes.find((qr) => qr.payment_method === 'aya_pay')?.phone_number || undefined,
          },
        ];

        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        // Fallback to default methods
        setPaymentMethods([
          {
            id: 'cod',
            name: 'Cash on Delivery (COD)',
            description: 'Pay when your order arrives',
            enabled: true,
            hasQRCode: false,
          },
          {
            id: 'kbz_pay',
            name: 'KBZ Pay',
            description: 'Pay with KBZ Pay mobile wallet',
            enabled: true,
            hasQRCode: false,
          },
          {
            id: 'cb_pay',
            name: 'CB Pay',
            description: 'Pay with CB Pay mobile wallet',
            enabled: true,
            hasQRCode: false,
          },
          {
            id: 'aya_pay',
            name: 'AYA Pay',
            description: 'Pay with AYA Pay mobile wallet',
            enabled: false,
            hasQRCode: false,
          },
        ]);
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    }

    fetchPaymentMethods();
  }, [projectId]);

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

  // Pre-fill form with validated Telegram user data
  useEffect(() => {
    if (telegramUser) {
      form.setValue('firstName', telegramUser.first_name || '');
      form.setValue('lastName', telegramUser.last_name || '');
    }
  }, [telegramUser, form]);

  const onSubmit = async (data: CustomerInfo) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if Telegram user is still loading
    if (userLoading) {
      toast.error('Please wait while we verify your Telegram account...');
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
      // Require valid Telegram user data
      if (!telegramUser) {
        toast.error('Please access this page through Telegram to place orders.');
        return;
      }

      const telegramUserData = telegramUser;

      // Create form data
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('items', JSON.stringify(items));
      formData.append('customerInfo', JSON.stringify(data));
      formData.append('paymentMethod', selectedPaymentMethod);
      formData.append('telegramUser', JSON.stringify(telegramUserData));
      if (data.notes) {
        formData.append('deliveryNotes', data.notes);
      }

      const result = await createOrderAction(formData);

      if (result.success && result.data) {
        // Clear cart after successful order
        clearCart();

        // Check if this is a QR code payment method (automatically paid)
        const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);
        const isQRCodePayment = selectedMethod?.hasQRCode;

        if (isQRCodePayment) {
          // For QR code payments, navigate directly to invoice page
          router.push(`/app/${projectId}/invoice/${result.data.orderId}`);
          toast.success('Order created and marked as paid!');
        } else {
          // For COD, navigate to payment page
          router.push(`/app/${projectId}/payment?orderId=${result.data.orderId}`);
          toast.success('Order created successfully!');
        }
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
        {/* Telegram Authentication Warning */}
        {userLoading && (
          <Card className="border-0 border-yellow-200 bg-yellow-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Verifying your Telegram account...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!userLoading && !telegramUser && (
          <Card className="border-0 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-sm font-medium">
                  ⚠️ Please access this page through Telegram to place orders.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

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
            {isLoadingPaymentMethods ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                <span className="text-muted-foreground ml-2">Loading payment methods...</span>
              </div>
            ) : (
              <>
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
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="flex-shrink-0"
                        />
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div>
                            <p className="text-card-foreground font-semibold">{method.name}</p>
                            <p className="text-muted-foreground text-sm">{method.description}</p>
                            {method.hasQRCode && (
                              <div className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
                                <QrCode className="h-4 w-4" />
                                <span>
                                  {method.phoneNumber
                                    ? `Pay with ${method.name} on Telegram`
                                    : 'Scan QR code to pay'}
                                </span>
                              </div>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                </RadioGroup>

                {/* QR Code Display */}
                {selectedPaymentMethod !== 'cod' &&
                  paymentMethods.find((m) => m.id === selectedPaymentMethod)?.hasQRCode && (
                    <div className="border-muted-foreground/20 bg-muted/30 mt-6 rounded-lg border border-dashed p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <QrCode className="text-primary h-5 w-5" />
                        <h4 className="text-card-foreground font-semibold">
                          {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name} QR Code
                        </h4>
                      </div>
                      {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.qrCodeUrl ? (
                        <div className="flex flex-col items-center space-y-3">
                          <img
                            src={
                              paymentMethods.find((m) => m.id === selectedPaymentMethod)?.qrCodeUrl
                            }
                            alt={`${paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name} QR Code`}
                            className="border-border h-48 w-48 rounded-lg border"
                          />
                          {paymentMethods.find((m) => m.id === selectedPaymentMethod)
                            ?.phoneNumber && (
                            <p className="text-muted-foreground text-center text-sm">
                              Phone:{' '}
                              {
                                paymentMethods.find((m) => m.id === selectedPaymentMethod)
                                  ?.phoneNumber
                              }
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center text-sm">
                          QR code not available
                        </p>
                      )}
                    </div>
                  )}

                {/* Payment Status Note */}
                {selectedPaymentMethod !== 'cod' &&
                  paymentMethods.find((m) => m.id === selectedPaymentMethod)?.hasQRCode && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        💳 <strong>Payment Status:</strong> Orders with QR code payment methods will
                        be automatically marked as &ldquo;Paid&rdquo; when you place the order.
                      </p>
                    </div>
                  )}
              </>
            )}
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
            disabled={isSubmitting || items.length === 0 || userLoading || !telegramUser}
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
