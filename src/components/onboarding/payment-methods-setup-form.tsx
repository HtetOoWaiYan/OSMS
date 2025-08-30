'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateProjectPaymentMethodsAction } from '@/lib/actions/projects';
import { uploadPaymentQRCodeAction } from '@/lib/actions/qr-codes';
import { QRCodeUpload } from '../dashboard/qr-code-upload';
import { Loader2, CreditCard, Smartphone, AlertCircle, Info } from 'lucide-react';

interface PaymentMethodsSetupFormProps {
  projectId: string;
}

interface PaymentMethod {
  id: 'cod' | 'kbz_pay' | 'cb_pay' | 'aya_pay';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPhone: boolean;
  requiresQR: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Customers pay when they receive the order',
    icon: CreditCard,
    requiresPhone: false,
    requiresQR: false,
  },
  {
    id: 'kbz_pay',
    name: 'KBZPay',
    description: 'Mobile payment via KBZPay app',
    icon: Smartphone,
    requiresPhone: true,
    requiresQR: true,
  },
  {
    id: 'cb_pay',
    name: 'CBPay',
    description: 'Mobile payment via CB Bank app',
    icon: Smartphone,
    requiresPhone: true,
    requiresQR: true,
  },
  {
    id: 'aya_pay',
    name: 'AYAPay',
    description: 'Mobile payment via AYA Bank app',
    icon: Smartphone,
    requiresPhone: true,
    requiresQR: true,
  },
];

export function PaymentMethodsSetupForm({ projectId }: PaymentMethodsSetupFormProps) {
  const [enabledMethods, setEnabledMethods] = useState<Set<string>>(new Set(['cod']));
  const [phoneNumbers, setPhoneNumbers] = useState<Record<string, string>>({});
  const [qrCodeFiles, setQrCodeFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMethodToggle = (methodId: string, enabled: boolean) => {
    const newEnabled = new Set(enabledMethods);
    if (enabled) {
      newEnabled.add(methodId);
    } else {
      newEnabled.delete(methodId);
      // Clear associated data when disabled
      if (phoneNumbers[methodId]) {
        const newPhones = { ...phoneNumbers };
        delete newPhones[methodId];
        setPhoneNumbers(newPhones);
      }
      if (qrCodeFiles[methodId]) {
        const newFiles = { ...qrCodeFiles };
        delete newFiles[methodId];
        setQrCodeFiles(newFiles);
      }
    }
    setEnabledMethods(newEnabled);
  };

  const handlePhoneChange = (methodId: string, phone: string) => {
    setPhoneNumbers((prev) => ({ ...prev, [methodId]: phone }));
  };

  const handleQRCodeChange = (methodId: string, file: File | null) => {
    if (file) {
      setQrCodeFiles((prev) => ({ ...prev, [methodId]: file }));
    } else {
      setQrCodeFiles((prev) => {
        const updated = { ...prev };
        delete updated[methodId];
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate that all required fields are filled for enabled methods
    for (const method of paymentMethods) {
      if (enabledMethods.has(method.id)) {
        if (method.requiresPhone && !phoneNumbers[method.id]?.trim()) {
          setError(`Phone number is required for ${method.name}`);
          return;
        }
        if (method.requiresQR && !qrCodeFiles[method.id]) {
          setError(`QR code is required for ${method.name}`);
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        // Prepare payment methods data
        const paymentMethodsData: Record<
          string,
          {
            enabled: boolean;
            name: string;
            phone?: string;
            hasQR?: boolean;
            qrCodeFileName?: string;
            qrCodeUrl?: string;
          }
        > = {};

        for (const methodId of enabledMethods) {
          const method = paymentMethods.find((m) => m.id === methodId);
          if (!method) continue;

          paymentMethodsData[methodId] = {
            enabled: true,
            name: method.name,
          };

          if (method.requiresPhone && phoneNumbers[methodId]) {
            paymentMethodsData[methodId].phone = phoneNumbers[methodId];
          }

          // Upload QR codes and get URLs
          if (method.requiresQR && qrCodeFiles[methodId]) {
            try {
              const qrUploadResult = await uploadPaymentQRCodeAction(
                projectId,
                methodId,
                phoneNumbers[methodId],
                qrCodeFiles[methodId],
              );

              if (qrUploadResult.success) {
                paymentMethodsData[methodId].hasQR = true;
                paymentMethodsData[methodId].qrCodeUrl = qrUploadResult.data?.qr_code_url;
              } else {
                throw new Error(qrUploadResult.error || 'QR code upload failed');
              }
            } catch (qrError) {
              console.error('QR code upload error:', qrError);
              setError(
                `Failed to upload QR code for ${method.name}: ${qrError instanceof Error ? qrError.message : 'Unknown error'}`,
              );
              return;
            }
          }
        }

        const result = await updateProjectPaymentMethodsAction({
          projectId,
          paymentMethods: paymentMethodsData,
        });

        if (!result.success) {
          setError(result.error || 'Failed to update payment methods');
          return;
        }

        // Success - redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Payment setup error:', err);
      }
    });
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Information */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-blue-900">
            <h4 className="mb-1 font-medium">Payment Methods for Your Mini-App</h4>
            <p className="text-sm text-blue-700">
              Configure how customers will pay for orders in your Telegram Mini-App. You can always
              change these settings later.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const isEnabled = enabledMethods.has(method.id);
          const IconComponent = method.icon;

          return (
            <Card
              key={method.id}
              className={isEnabled ? 'ring-primary ring-opacity-20 ring-2' : ''}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-lg p-2">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleMethodToggle(method.id, checked)}
                  />
                </div>
              </CardHeader>

              {isEnabled && (method.requiresPhone || method.requiresQR) && (
                <CardContent className="space-y-4">
                  {method.requiresPhone && (
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${method.id}`}>Business Phone Number *</Label>
                      <Input
                        id={`phone-${method.id}`}
                        type="tel"
                        placeholder="09xxxxxxxxx"
                        value={phoneNumbers[method.id] || ''}
                        onChange={(e) => handlePhoneChange(method.id, e.target.value)}
                      />
                      <p className="text-muted-foreground text-sm">
                        Customers will see this number for {method.name} payments
                      </p>
                    </div>
                  )}

                  {method.requiresQR && (
                    <div className="space-y-2">
                      <QRCodeUpload
                        label="QR Code *"
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onQRCodeChange={(file, _shouldDelete) =>
                          handleQRCodeChange(method.id, file)
                        }
                        maxSizeInMB={5}
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {enabledMethods.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enabled Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(enabledMethods).map((methodId) => {
                const method = paymentMethods.find((m) => m.id === methodId);
                return method ? (
                  <Badge key={methodId} variant="secondary">
                    {method.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-destructive mt-0.5 h-4 w-4" />
            <div className="text-destructive text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSkip} className="flex-1" disabled={isPending}>
          Skip for Now
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={isPending || enabledMethods.size === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        You can update payment methods anytime in your project settings
      </p>
    </div>
  );
}
