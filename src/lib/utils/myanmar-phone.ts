import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Note: myanmar-phonenumber library might not be available, so we'll use a fallback approach
export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export function validateMyanmarPhone(phone: string): PhoneValidationResult {
  if (!phone?.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Normalize phone number to standard format
  let normalizedPhone = phone.trim().replace(/\s+/g, '');

  // Handle different input formats
  if (normalizedPhone.startsWith('+959')) {
    normalizedPhone = '09' + normalizedPhone.substring(4);
  } else if (normalizedPhone.startsWith('959')) {
    normalizedPhone = '09' + normalizedPhone.substring(3);
  } else if (!normalizedPhone.startsWith('09')) {
    // Assume it's missing the '09' prefix
    normalizedPhone = '09' + normalizedPhone;
  }

  // Basic Myanmar phone number validation
  // Myanmar phone numbers: 09 + 8-9 digits
  const myanmarPhoneRegex = /^09[0-9]{7,9}$/;

  if (!myanmarPhoneRegex.test(normalizedPhone)) {
    return {
      isValid: false,
      error: 'Invalid Myanmar phone number format. Should be 09xxxxxxxx',
    };
  }

  // Use libphonenumber-js for additional validation
  try {
    const phoneNumber = parsePhoneNumberFromString(normalizedPhone, 'MM');

    if (phoneNumber && phoneNumber.isValid()) {
      return {
        isValid: true,
        formatted: formatMyanmarPhone(normalizedPhone),
      };
    } else {
      return {
        isValid: false,
        error: 'Invalid Myanmar phone number',
      };
    }
  } catch {
    // Fallback to basic validation if libphonenumber-js fails
    return {
      isValid: true,
      formatted: formatMyanmarPhone(normalizedPhone),
    };
  }
}

export function formatMyanmarPhone(phone: string): string {
  // Normalize first
  let normalized = phone.trim().replace(/\s+/g, '');
  if (normalized.startsWith('+959')) {
    normalized = '09' + normalized.substring(4);
  } else if (normalized.startsWith('959')) {
    normalized = '09' + normalized.substring(3);
  }

  // Format as: 09 XXX XXX XXX
  if (normalized.length >= 11) {
    return `${normalized.substring(0, 2)} ${normalized.substring(2, 5)} ${normalized.substring(5, 8)} ${normalized.substring(8)}`;
  } else if (normalized.length >= 8) {
    return `${normalized.substring(0, 2)} ${normalized.substring(2, 5)} ${normalized.substring(5)}`;
  }

  return normalized;
}

// Hardcoded Myanmar cities for delivery
export const MYANMAR_CITIES = [
  'Yangon',
  'Mandalay',
  'Naypyidaw',
  'Bago',
  'Mawlamyine',
  'Pathein',
  'Meiktila',
  'Myitkyina',
  'Taunggyi',
  'Sittwe',
  'Lashio',
  'Pyay',
  'Hpa-An',
  'Magway',
  'Dawei',
] as const;

export type MyanmarCity = (typeof MYANMAR_CITIES)[number];
