'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Info, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface QRCodeUploadProps {
  label: string;
  existingQRUrl?: string;
  onQRCodeChange?: (file: File | null, shouldDelete: boolean) => void;
  className?: string;
  maxSizeInMB?: number;
  disabled?: boolean;
}

export function QRCodeUpload({
  label,
  existingQRUrl,
  onQRCodeChange,
  className = '',
  maxSizeInMB = 5,
  disabled = false,
}: QRCodeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shouldDelete, setShouldDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeInMB) {
      toast.error(`File size must be less than ${maxSizeInMB}MB`);
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(preview);
    setShouldDelete(false);

    // Notify parent component
    onQRCodeChange?.(file, false);

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNew = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setShouldDelete(false);
    onQRCodeChange?.(null, false);
  };

  const handleRemoveExisting = () => {
    setShouldDelete(true);
    onQRCodeChange?.(null, true);
  };

  const handleRestoreExisting = () => {
    setShouldDelete(false);
    onQRCodeChange?.(null, false);
  };

  const hasExisting = existingQRUrl && !shouldDelete;
  const hasNew = selectedFile && previewUrl;
  const showUploadButton = !hasExisting && !hasNew && !disabled;

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>

      {/* Deletion Warning */}
      {shouldDelete && (
        <Alert className="mt-2 border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            QR code marked for deletion. Click &ldquo;Save Changes&rdquo; to confirm, or restore to
            keep it.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-2">
        {/* Upload Button */}
        {showUploadButton && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-6">
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="flex h-auto flex-col items-center gap-2 py-4"
                >
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <span className="text-sm font-medium">Upload QR Code</span>
                  <span className="text-muted-foreground text-xs">
                    PNG, JPG up to {maxSizeInMB}MB
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Existing QR Code */}
        {hasExisting && (
          <div className="group bg-card relative overflow-hidden rounded-lg border">
            <div className="relative aspect-square max-w-xs">
              <Image
                src={existingQRUrl}
                alt="Current QR Code"
                fill
                className="object-contain p-4"
              />
              <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                Current
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="bg-white"
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveExisting}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New QR Code */}
        {hasNew && (
          <div className="group bg-card relative overflow-hidden rounded-lg border">
            <div className="relative aspect-square max-w-xs">
              <Image src={previewUrl!} alt="New QR Code" fill className="object-contain p-4" />
              <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
                New
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveNew}
                className="opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Existing QR Code (Marked for Deletion) */}
        {existingQRUrl && shouldDelete && (
          <div className="group bg-card relative overflow-hidden rounded-lg border opacity-50">
            <div className="relative aspect-square max-w-xs">
              <Image
                src={existingQRUrl}
                alt="QR Code (To be deleted)"
                fill
                className="object-contain p-4"
              />
              <div className="absolute top-2 left-2 rounded bg-red-500 px-2 py-1 text-xs text-white">
                To Delete
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button type="button" size="sm" variant="secondary" onClick={handleRestoreExisting}>
                Restore
              </Button>
            </div>
          </div>
        )}

        {/* Hidden file input for replacement */}
        {(hasExisting || hasNew) && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
