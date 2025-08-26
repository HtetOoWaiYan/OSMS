'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updateProjectPaymentMethodsAction } from '@/lib/actions/projects';
import {
  Loader2,
  CreditCard,
  Smartphone,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

type Project = Tables<'projects'>;

// Define proper types for payment method configuration
interface PaymentMethodConfig {
  enabled: boolean;
  name: string;
  phone?: string;
  hasQR?: boolean;
  qrCodeFileName?: string;
}

type PaymentMethodsData = Record<string, PaymentMethodConfig>;

interface PaymentMethodsSettingsProps {
  project: Project;
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

export function PaymentMethodsSettings({ project }: PaymentMethodsSettingsProps) {
  const router = useRouter();

  // Initialize state from project data - safely convert from Json type
  const currentPaymentMethods = (() => {
    if (
      project.payment_methods &&
      typeof project.payment_methods === 'object' &&
      !Array.isArray(project.payment_methods)
    ) {
      return project.payment_methods as unknown as PaymentMethodsData;
    }
    return {} as PaymentMethodsData;
  })();
  const [enabledMethods, setEnabledMethods] = useState<Set<string>>(
    new Set(
      Object.keys(currentPaymentMethods).filter((key) => currentPaymentMethods[key]?.enabled),
    ),
  );
  const [phoneNumbers, setPhoneNumbers] = useState<Record<string, string>>(
    Object.keys(currentPaymentMethods).reduce(
      (acc, key) => {
        if (currentPaymentMethods[key]?.phone) {
          acc[key] = currentPaymentMethods[key].phone;
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  );
  const [qrCodes, setQrCodes] = useState<Record<string, File | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      if (qrCodes[methodId]) {
        const newQRs = { ...qrCodes };
        delete newQRs[methodId];
        setQrCodes(newQRs);
      }
    }
    setEnabledMethods(newEnabled);
  };

  const handlePhoneChange = (methodId: string, phone: string) => {
    setPhoneNumbers((prev) => ({ ...prev, [methodId]: phone }));
  };

  const handleQRUpload = (methodId: string, file: File | null) => {
    setQrCodes((prev) => ({ ...prev, [methodId]: file }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Validate that all required fields are filled for enabled methods
    for (const method of paymentMethods) {
      if (enabledMethods.has(method.id)) {
        if (method.requiresPhone && !phoneNumbers[method.id]?.trim()) {
          setError(`Phone number is required for ${method.name}`);
          return;
        }
        // Note: QR codes are optional for now in settings (they can keep existing ones)
      }
    }

    startTransition(async () => {
      try {
        // Prepare payment methods data
        const paymentMethodsData: PaymentMethodsData = {};

        // Include all currently enabled methods from existing data
        for (const [methodId, config] of Object.entries(currentPaymentMethods)) {
          if (enabledMethods.has(methodId)) {
            paymentMethodsData[methodId] = { ...config };
          }
        }

        // Add/update newly enabled methods
        for (const methodId of enabledMethods) {
          const method = paymentMethods.find((m) => m.id === methodId);
          if (!method) continue;

          if (!paymentMethodsData[methodId]) {
            paymentMethodsData[methodId] = {
              enabled: true,
              name: method.name,
            };
          }

          if (method.requiresPhone && phoneNumbers[methodId]) {
            paymentMethodsData[methodId].phone = phoneNumbers[methodId];
          }

          // TODO: Handle QR code upload to storage and store URL
          if (method.requiresQR && qrCodes[methodId]) {
            // For now, just mark that QR code is uploaded
            paymentMethodsData[methodId].hasQR = true;
            paymentMethodsData[methodId].qrCodeFileName = qrCodes[methodId]!.name;
          }
        }

        const result = await updateProjectPaymentMethodsAction({
          projectId: project.id,
          paymentMethods: paymentMethodsData,
        });

        if (!result.success) {
          setError(result.error || 'Failed to update payment methods');
          return;
        }

        setSuccess('Payment methods updated successfully');
        router.refresh();
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Payment settings update error:', err);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Configure payment options for your Telegram Mini-App customers
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/app/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Preview Mini-App
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-blue-900">
              <h4 className="mb-1 font-medium">Mini-App Payment Configuration</h4>
              <p className="text-sm text-blue-700">
                These settings control how customers can pay for orders in your Telegram Mini-App.
                Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const isEnabled = enabledMethods.has(method.id);
            const IconComponent = method.icon;
            const currentConfig = currentPaymentMethods[method.id];

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
                      disabled={isPending}
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
                          value={phoneNumbers[method.id] || currentConfig?.phone || ''}
                          onChange={(e) => handlePhoneChange(method.id, e.target.value)}
                          disabled={isPending}
                        />
                        <p className="text-muted-foreground text-sm">
                          Customers will see this number for {method.name} payments
                        </p>
                      </div>
                    )}

                    {method.requiresQR && (
                      <div className="space-y-2">
                        <Label htmlFor={`qr-${method.id}`}>
                          QR Code {currentConfig?.hasQR ? '(Current uploaded)' : '*'}
                        </Label>
                        <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-6">
                          <div className="text-center">
                            <input
                              id={`qr-${method.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleQRUpload(method.id, e.target.files?.[0] || null)
                              }
                              className="hidden"
                              disabled={isPending}
                            />
                            <label
                              htmlFor={`qr-${method.id}`}
                              className="flex cursor-pointer flex-col items-center gap-2"
                            >
                              {qrCodes[method.id] ? (
                                <>
                                  <CheckCircle className="h-8 w-8 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    {qrCodes[method.id]!.name}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    Click to change
                                  </span>
                                </>
                              ) : currentConfig?.hasQR ? (
                                <>
                                  <CheckCircle className="h-8 w-8 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">
                                    QR Code Already Uploaded
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    Click to upload new QR code
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Upload className="text-muted-foreground h-8 w-8" />
                                  <span className="text-sm font-medium">
                                    Upload {method.name} QR Code
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    PNG, JPG up to 5MB
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
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
              <CardTitle className="text-lg">Currently Enabled</CardTitle>
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

        <Separator />

        {/* Error/Success Display */}
        {error && (
          <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4" />
              <div className="text-destructive text-sm">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500 bg-green-50 p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
              <div className="text-sm text-green-800">{success}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending || enabledMethods.size === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Methods'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
