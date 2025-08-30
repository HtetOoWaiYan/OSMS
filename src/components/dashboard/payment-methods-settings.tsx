'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updateProjectPaymentMethodsAction } from '@/lib/actions/projects';
import { uploadPaymentQRCodeAction, getPaymentQRCodesAction } from '@/lib/actions/qr-codes';
import { QRCodeUpload } from './qr-code-upload';
import {
  Loader2,
  CreditCard,
  Smartphone,
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
  qrCodeUrl?: string;
}

type PaymentMethodsData = Record<string, PaymentMethodConfig | boolean>;

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

  // Helper function to check if a method is enabled in project config
  const isMethodEnabledInProject = useCallback(
    (methodId: string): boolean => {
      const methodConfig = currentPaymentMethods[methodId];
      // Handle both boolean format: { "cod": true } and object format: { "cod": { enabled: true } }
      if (typeof methodConfig === 'boolean') {
        return methodConfig;
      }
      if (typeof methodConfig === 'object' && methodConfig !== null) {
        return (methodConfig as PaymentMethodConfig).enabled === true;
      }
      return false;
    },
    [currentPaymentMethods],
  );

  const [enabledMethods, setEnabledMethods] = useState<Set<string>>(
    new Set(Object.keys(currentPaymentMethods).filter((key) => isMethodEnabledInProject(key))),
  );
  const [phoneNumbers, setPhoneNumbers] = useState<Record<string, string>>(
    Object.keys(currentPaymentMethods).reduce(
      (acc, key) => {
        const methodConfig = currentPaymentMethods[key];
        // Handle object format: { "kbz_pay": { phone: "123" } }
        if (
          typeof methodConfig === 'object' &&
          methodConfig !== null &&
          (methodConfig as PaymentMethodConfig).phone
        ) {
          acc[key] = (methodConfig as PaymentMethodConfig).phone!;
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  );
  const [qrCodeChanges, setQrCodeChanges] = useState<
    Record<
      string,
      {
        file: File | null;
        shouldDelete: boolean;
      }
    >
  >({});
  const [qrCodes, setQrCodes] = useState<Tables<'payment_qr_codes'>[]>([]);
  const [isLoadingQrCodes, setIsLoadingQrCodes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fetch QR codes data function (reusable)
  const fetchQrCodes = useCallback(async () => {
    try {
      const result = await getPaymentQRCodesAction(project.id);
      if (result.success && result.data) {
        setQrCodes(result.data);

        // Initialize enabled methods based ONLY on project config
        // DO NOT override with QR code state - QR codes are just additional data
        const initialEnabledMethods = new Set(
          Object.keys(currentPaymentMethods).filter((key) => isMethodEnabledInProject(key)),
        );

        // Set enabled methods based purely on project configuration
        setEnabledMethods(initialEnabledMethods);

        // Update phone numbers from QR codes
        const phoneNumbersFromQr = result.data.reduce(
          (acc, qr) => {
            if (qr.phone_number) {
              acc[qr.payment_method] = qr.phone_number;
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        setPhoneNumbers((prev) => ({ ...prev, ...phoneNumbersFromQr }));
      }
    } catch (err) {
      console.error('Failed to fetch QR codes:', err);
    } finally {
      setIsLoadingQrCodes(false);
    }
  }, [project.id, currentPaymentMethods, isMethodEnabledInProject]);

  // Fetch QR codes data on component mount
  useEffect(() => {
    fetchQrCodes();
  }, [fetchQrCodes]);

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
      if (qrCodeChanges[methodId]) {
        const newQRs = { ...qrCodeChanges };
        delete newQRs[methodId];
        setQrCodeChanges(newQRs);
      }
    }
    setEnabledMethods(newEnabled);
  };

  const handlePhoneChange = (methodId: string, phone: string) => {
    setPhoneNumbers((prev) => ({ ...prev, [methodId]: phone }));
  };

  const handleQRCodeChange = (methodId: string, file: File | null, shouldDelete: boolean) => {
    setQrCodeChanges((prev) => ({
      ...prev,
      [methodId]: { file, shouldDelete },
    }));
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
        // Prepare payment methods data - include ALL existing methods
        const paymentMethodsData: PaymentMethodsData = {};

        // Process all existing payment methods (both enabled and disabled)
        for (const [methodId, config] of Object.entries(currentPaymentMethods)) {
          const isCurrentlyEnabled = enabledMethods.has(methodId);

          // Convert boolean format to object format and update enabled status
          if (typeof config === 'boolean') {
            paymentMethodsData[methodId] = {
              enabled: isCurrentlyEnabled,
              name: paymentMethods.find((m) => m.id === methodId)?.name || methodId,
            };
          } else {
            // Keep existing object config but update enabled status
            paymentMethodsData[methodId] = {
              ...config,
              enabled: isCurrentlyEnabled,
            };
          }
        }

        // Add/update newly enabled methods and handle phone numbers and QR codes
        for (const methodId of enabledMethods) {
          const method = paymentMethods.find((m) => m.id === methodId);
          if (!method) continue;

          // Ensure the method exists in paymentMethodsData
          if (!paymentMethodsData[methodId]) {
            paymentMethodsData[methodId] = {
              enabled: true,
              name: method.name,
            };
          }

          // Ensure we have an object to work with
          if (typeof paymentMethodsData[methodId] === 'boolean') {
            paymentMethodsData[methodId] = {
              enabled: true,
              name: method.name,
            };
          }

          // Update phone number if provided
          if (method.requiresPhone && phoneNumbers[methodId]) {
            (paymentMethodsData[methodId] as PaymentMethodConfig).phone = phoneNumbers[methodId];
          }

          // Handle QR code uploads and deletions
          if (method.requiresQR) {
            const qrChange = qrCodeChanges[methodId];
            if (qrChange) {
              if (qrChange.shouldDelete) {
                // Mark for deletion (this would require a delete action)
                (paymentMethodsData[methodId] as PaymentMethodConfig).hasQR = false;
                delete (paymentMethodsData[methodId] as PaymentMethodConfig).qrCodeUrl;
              } else if (qrChange.file) {
                // Upload new QR code
                try {
                  const qrUploadResult = await uploadPaymentQRCodeAction(
                    project.id,
                    methodId,
                    phoneNumbers[methodId],
                    qrChange.file,
                  );

                  if (qrUploadResult.success) {
                    (paymentMethodsData[methodId] as PaymentMethodConfig).hasQR = true;
                    (paymentMethodsData[methodId] as PaymentMethodConfig).qrCodeUrl =
                      qrUploadResult.data?.qr_code_url;
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
          }
        }

        const result = await updateProjectPaymentMethodsAction({
          projectId: project.id,
          paymentMethods: paymentMethodsData as Record<string, PaymentMethodConfig>,
        });

        if (!result.success) {
          setError(result.error || 'Failed to update payment methods');
          return;
        }

        setSuccess('Payment methods updated successfully');

        // Clear QR code changes since they've been saved
        setQrCodeChanges({});

        // Refresh QR codes and component state
        await fetchQrCodes();

        // Add small delay to ensure database changes propagate
        setTimeout(() => {
          router.refresh();
        }, 100);
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

        {/* Loading State */}
        {isLoadingQrCodes && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Loading payment methods...</span>
          </div>
        )}

        {/* Payment Methods */}
        {!isLoadingQrCodes && (
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const isEnabled = enabledMethods.has(method.id);
              const IconComponent = method.icon;
              const currentConfig = currentPaymentMethods[method.id];

              // Get QR code data from separate table
              const qrCodeData = qrCodes.find((qr) => qr.payment_method === method.id);
              const mergedConfig = {
                ...(typeof currentConfig === 'object' && currentConfig !== null
                  ? currentConfig
                  : {}),
                qrCodeUrl:
                  qrCodeData?.qr_code_url ||
                  (typeof currentConfig === 'object' && currentConfig !== null
                    ? (currentConfig as PaymentMethodConfig).qrCodeUrl
                    : undefined),
                phone:
                  qrCodeData?.phone_number ||
                  (typeof currentConfig === 'object' && currentConfig !== null
                    ? (currentConfig as PaymentMethodConfig).phone
                    : undefined),
              };

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
                        disabled={isPending || isLoadingQrCodes}
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
                            value={phoneNumbers[method.id] || mergedConfig?.phone || ''}
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
                          <QRCodeUpload
                            label={`QR Code ${mergedConfig?.qrCodeUrl ? '(Current uploaded)' : '*'}`}
                            existingQRUrl={mergedConfig?.qrCodeUrl}
                            onQRCodeChange={(file, shouldDelete) =>
                              handleQRCodeChange(method.id, file, shouldDelete)
                            }
                            disabled={isPending}
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
        )}

        {/* Summary */}
        {!isLoadingQrCodes && enabledMethods.size > 0 && (
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
          <Button
            onClick={handleSave}
            disabled={isPending || enabledMethods.size === 0 || isLoadingQrCodes}
          >
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
