'use server';

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { uploadQRCode, deleteAssetFile, extractFilePathFromUrl, validateProjectAccess } from '@/lib/utils/assets-storage';
import { revalidatePath } from 'next/cache';

export interface UploadQRCodeResult {
  success: boolean;
  data?: {
    id: string;
    qr_code_url: string;
  };
  error?: string;
}

export interface DeleteQRCodeResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a QR code for a payment method
 */
export async function uploadPaymentQRCodeAction(
  projectId: string,
  paymentMethod: string,
  phoneNumber: string,
  file: File,
): Promise<UploadQRCodeResult> {
  try {
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied' };
    }

    // Validate file before upload
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Invalid file type. Please select an image file.' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB.' };
    }

    // Upload to assets bucket
    const uploadResult = await uploadQRCode(projectId, paymentMethod, file);
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    const publicUrl = uploadResult.data!.publicUrl;
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check if QR code record already exists for this project and payment method
    const { data: existingQR } = await supabase
      .from('payment_qr_codes')
      .select('id, qr_code_url')
      .eq('project_id', projectId)
      .eq('payment_method', paymentMethod)
      .single();

    if (existingQR) {
      // Delete old QR code file if it exists
      if (existingQR.qr_code_url) {
        const oldFilePath = extractFilePathFromUrl(existingQR.qr_code_url);
        if (oldFilePath) {
          const storageDeleteResult = await deleteAssetFile(oldFilePath);
          if (!storageDeleteResult.success) {
            // Failed to delete old QR code file, but we continue with update
          }
        }
      }

      // Update existing record using service role client
      const { data: updatedQR, error: updateError } = await supabaseAdmin
        .from('payment_qr_codes')
        .update({
          phone_number: phoneNumber,
          qr_code_url: publicUrl,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingQR.id)
        .select()
        .single();

      if (updateError) {
        // Clean up uploaded file if database update failed
        await deleteAssetFile(uploadResult.data!.filePath);
        return { success: false, error: 'Failed to update QR code record' };
      }

      revalidatePath(`/dashboard/${projectId}/settings`);
      return {
        success: true,
        data: {
          id: updatedQR.id,
          qr_code_url: updatedQR.qr_code_url!,
        },
      };
    } else {
      // Create new record using service role client
      const { data: newQR, error: insertError } = await supabaseAdmin
        .from('payment_qr_codes')
        .insert({
          project_id: projectId,
          payment_method: paymentMethod,
          phone_number: phoneNumber,
          qr_code_url: publicUrl,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if database insert failed
        await deleteAssetFile(uploadResult.data!.filePath);
        return { success: false, error: 'Failed to save QR code record' };
      }

      revalidatePath(`/dashboard/${projectId}/settings`);
      return {
        success: true,
        data: {
          id: newQR.id,
          qr_code_url: newQR.qr_code_url!,
        },
      };
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a QR code for a payment method
 */
export async function deletePaymentQRCodeAction(
  projectId: string,
  paymentMethod: string,
): Promise<DeleteQRCodeResult> {
  try {
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied' };
    }

    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Get QR code record first
    const { data: qrCode } = await supabase
      .from('payment_qr_codes')
      .select('id, qr_code_url')
      .eq('project_id', projectId)
      .eq('payment_method', paymentMethod)
      .single();

    if (!qrCode) {
      return { success: false, error: 'QR code not found' };
    }

    // Delete from storage first if URL exists
    if (qrCode.qr_code_url) {
      const filePath = extractFilePathFromUrl(qrCode.qr_code_url);
      if (filePath) {
        const storageResult = await deleteAssetFile(filePath);
        if (!storageResult.success) {
          // Storage deletion failed, but we continue with database cleanup
        }
      }
    }

    // Remove QR code URL from database record using service role client
    const { error: updateError } = await supabaseAdmin
      .from('payment_qr_codes')
      .update({
        qr_code_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', qrCode.id);

    if (updateError) {
      return { success: false, error: 'Failed to remove QR code' };
    }

    revalidatePath(`/dashboard/${projectId}/settings`);
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Bulk delete multiple QR codes (for future extensibility)
 */
export async function deleteMultiplePaymentQRCodesAction(
  qrCodeIds: string[],
  projectId: string,
): Promise<{
  success: boolean;
  results?: Array<{ id: string; success: boolean; error?: string }>;
  error?: string;
}> {
  try {
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied' };
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    let allSuccessful = true;

    for (const qrCodeId of qrCodeIds) {
      const deleteResult = await deletePaymentQRCodeByIdAction(qrCodeId, projectId);
      
      results.push({
        id: qrCodeId,
        success: deleteResult.success,
        error: deleteResult.error,
      });

      if (!deleteResult.success) {
        allSuccessful = false;
      }
    }

    return {
      success: allSuccessful,
      results,
      error: allSuccessful ? undefined : 'Some QR code deletions failed',
    };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get QR codes for a project
 */
export async function getPaymentQRCodesAction(projectId: string) {
  try {
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied', data: null };
    }

    const supabase = await createServiceRoleClient();

    const { data: qrCodes, error } = await supabase
      .from('payment_qr_codes')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (error) {
      return { success: false, error: 'Failed to fetch QR codes', data: null };
    }

    return { success: true, data: qrCodes };
  } catch {
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}

/**
 * Delete QR code by ID (alternative deletion method)
 */
export async function deletePaymentQRCodeByIdAction(
  qrCodeId: string,
  projectId: string,
): Promise<DeleteQRCodeResult> {
  try {
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied' };
    }

    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Get QR code record first
    const { data: qrCode } = await supabase
      .from('payment_qr_codes')
      .select('id, qr_code_url, project_id')
      .eq('id', qrCodeId)
      .eq('project_id', projectId)
      .single();

    if (!qrCode) {
      return { success: false, error: 'QR code not found' };
    }

    // Delete from storage first if URL exists
    if (qrCode.qr_code_url) {
      const filePath = extractFilePathFromUrl(qrCode.qr_code_url);
      if (filePath) {
        const storageResult = await deleteAssetFile(filePath);
        if (!storageResult.success) {
          // Storage deletion failed, but we continue with database cleanup
        }
      }
    }

    // Remove QR code URL from database record
    const { error: updateError } = await supabaseAdmin
      .from('payment_qr_codes')
      .update({
        qr_code_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', qrCodeId);

    if (updateError) {
      return { success: false, error: 'Failed to remove QR code' };
    }

    revalidatePath(`/dashboard/${projectId}/settings`);
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}