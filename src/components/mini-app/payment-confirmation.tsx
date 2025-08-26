'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Copy, CreditCard, QrCode, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { markOrderAsPaidAction } from '@/lib/actions/mini-app';
import Image from 'next/image';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  payment_method: string;
  project_id?: string;
}

interface PaymentMethodConfig {
  enabled?: boolean;
  phone_number?: string;
  qr_code_url?: string;
}

interface PaymentConfirmationProps {
  order: Order;
  paymentMethodConfig?: PaymentMethodConfig;
}

export function PaymentConfirmation({ order, paymentMethodConfig }: PaymentConfirmationProps) {
  const router = useRouter();
  const [paymentReference, setPaymentReference] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      kbz_pay: 'KBZ Pay',
      cb_pay: 'CB Pay',
      aya_pay: 'AYA Pay',
    };
    return names[method] || method;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleMarkAsPaid = async () => {
    setIsConfirming(true);

    try {
      const result = await markOrderAsPaidAction({
        orderId: order.id,
        paymentReference: paymentReference.trim() || undefined,
      });

      if (result.success) {
        toast.success('Payment confirmed successfully!');
        router.push(`/app/${order.project_id}/invoice/${order.id}`);
      } else {
        toast.error(result.error || 'Failed to confirm payment');
      }
    } catch {
      console.error('Payment confirmation error');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6 text-center">
          <QrCode className="mx-auto mb-4 h-16 w-16 text-blue-500" />
          <h1 className="mb-2 text-2xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground mb-4">
            Please complete your payment using {getPaymentMethodName(order.payment_method)}
          </p>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-medium text-blue-800">Order #{order.order_number}</p>
            <p className="text-2xl font-bold text-blue-600">{formatPrice(order.total_amount)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code */}
          {paymentMethodConfig?.qr_code_url && (
            <div className="text-center">
              <Label className="text-base font-semibold">
                Scan QR Code with {getPaymentMethodName(order.payment_method)}
              </Label>
              <div className="mt-3 flex justify-center">
                <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-4">
                  <Image
                    src={paymentMethodConfig.qr_code_url}
                    alt={`${getPaymentMethodName(order.payment_method)} QR Code`}
                    width={200}
                    height={200}
                    className="h-48 w-48 object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Manual Payment Details */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Or send manually to:</Label>

            {paymentMethodConfig?.phone_number && (
              <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">{paymentMethodConfig.phone_number}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentMethodConfig.phone_number!, 'Phone number')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="bg-muted flex items-center justify-between rounded-lg p-3">
              <div>
                <span className="text-muted-foreground text-sm">Amount:</span>
                <p className="font-mono font-bold">{formatPrice(order.total_amount)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(order.total_amount.toString(), 'Amount')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Payment Steps */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Payment Steps:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
              <li>Open your {getPaymentMethodName(order.payment_method)} app</li>
              <li>Scan the QR code above or send to the phone number</li>
              <li>Send exactly {formatPrice(order.total_amount)}</li>
              <li>Take a screenshot or note the transaction ID</li>
              <li>Click &quot;Mark as Paid&quot; below to confirm</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Payment Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>Confirm Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paymentReference">Transaction ID or Reference (Optional)</Label>
            <Input
              id="paymentReference"
              placeholder="Enter transaction ID from your payment app"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              This helps us verify your payment faster
            </p>
          </div>

          <Button onClick={handleMarkAsPaid} disabled={isConfirming} className="w-full" size="lg">
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming Payment...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Paid & Confirm Order
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            By clicking &quot;Mark as Paid&quot;, you confirm that you have completed the payment.
            Your order will be processed after verification.
          </p>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="mb-2 font-semibold text-yellow-900">Important</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Only mark as paid after completing the payment</li>
              <li>• Keep your transaction receipt for verification</li>
              <li>• Contact support if you encounter any issues</li>
              <li>• Your order will be processed after payment verification</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
