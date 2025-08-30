'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Upload, Loader2, ArrowLeft, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { markOrderAsPaidAction } from '@/lib/actions/mini-app';

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

export function PaymentConfirmation({ order }: PaymentConfirmationProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'cod' | 'bank'>('cod');
  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBankSlipFile(file);
      toast.success('Bank slip image selected');
    }
  };

  const handleMarkAsPaid = async () => {
    setIsConfirming(true);

    try {
      const result = await markOrderAsPaidAction({
        orderId: order.id,
        paymentReference: undefined,
      });

      if (result.success) {
        toast.success('Order confirmed successfully!');
        router.push(`/app/${order.project_id}/invoice/${order.id}`);
      } else {
        toast.error(result.error || 'Failed to confirm order');
      }
    } catch {
      console.error('Order confirmation error');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Figma style */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Payment Method</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Payment Method Selection - Figma style */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <RadioGroup
              value={selectedMethod}
              onValueChange={(value) => setSelectedMethod(value as 'cod' | 'bank')}
              className="space-y-4"
            >
              {/* Cash on Delivery Option */}
              <div className="flex items-center space-x-3 rounded-lg border-2 p-4 hover:bg-gray-50 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-50">
                <RadioGroupItem value="cod" id="cod" />
                <div className="flex-1">
                  <Label htmlFor="cod" className="cursor-pointer">
                    <div className="font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="mt-1 text-sm text-gray-600">
                      🚚 ရန်ကုန်, မန်းလေး မြို့တွင်း ၂ ရက်- ၄ရက် အတွင်း
                      အိမ်တိုင်ရာရောက်ဝန်ဆောင်မှုရှိပြီး (ပစ္စည်းပို့ငွေရှင်းပါ)
                    </div>
                  </Label>
                </div>
              </div>

              {/* Bank Transfer Option */}
              <div className="flex items-center space-x-3 rounded-lg border-2 p-4 hover:bg-gray-50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
                <RadioGroupItem value="bank" id="bank" />
                <div className="flex-1">
                  <Label htmlFor="bank" className="cursor-pointer">
                    <div className="font-semibold text-gray-900">Bank Transfer</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <Banknote className="h-4 w-4" />
                      ဘဏ်မှ တိုက်ရိုက်ငွေလွှဲရန်
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Instructions Text - Figma style */}
        <div className="px-2">
          <p className="text-sm text-gray-700">အောက်ပါ ဘဏ်အကောင့်ငွေသွင်း ပေးချေနိုင်ပါသည်။</p>
        </div>

        {/* Bank Account Information - Figma style */}
        {selectedMethod === 'bank' && (
          <Card className="border border-gray-300">
            <CardContent className="space-y-6 p-6">
              {/* KBZ Pay */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">ငွေပေးချေမှုလမ်းညွှန်ချက် - KBZ Pay</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-orange-500">
                    <span className="text-xs font-bold text-white">KBZ</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Account Name (အေကာင့်နာမည်)</Label>
                    <div className="text-lg font-bold">Aura Shop</div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Account or Phone Number (အေကာင့်/ဖုန်းနံပါတ်)
                      </Label>
                      <div className="font-mono text-lg font-bold">091112233344</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('091112233344', 'Phone number')}
                      className="border-purple-600 text-purple-600"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* AYA Pay */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">ငွေပေးချေမှုလမ်းညွှန်ချက် - AYA Pay</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-600">
                    <span className="text-xs font-bold text-white">AYA</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Account Name (အေကာင့်နာမည်)</Label>
                    <div className="text-lg font-bold">Aura Shop</div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Account or Phone Number (အေကာင့်/ဖုန်းနံပါတ်)
                      </Label>
                      <div className="font-mono text-lg font-bold">091112233344</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('091112233344', 'Phone number')}
                      className="border-purple-600 text-purple-600"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Slip Upload - Figma style */}
        {selectedMethod === 'bank' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Add Bank Slip Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center hover:border-gray-400"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {bankSlipFile ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
                    <p className="text-sm text-gray-600">File selected: {bankSlipFile.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload bank slip image</p>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </CardContent>
          </Card>
        )}

        {/* Save/Confirm Button - Figma style */}
        <div className="pt-4">
          <Button
            onClick={handleMarkAsPaid}
            disabled={isConfirming}
            className="h-12 w-full bg-purple-600 font-semibold shadow-sm hover:bg-purple-700"
            size="lg"
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
