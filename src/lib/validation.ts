import { z } from 'zod';

// Kenya phone number regex (supports +254, 07, or 01 formats)
const kenyanPhoneRegex = /^(\+254|0)(7|1)\d{8}$/;

// School code regex (alphanumeric, 4-10 characters)
const schoolCodeRegex = /^[A-Za-z0-9]{4,20}$/;

export const signUpSchema = z.object({
  schoolName: z.string()
    .trim()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name must be less than 100 characters'),
  schoolCode: z.string()
    .trim()
    .regex(schoolCodeRegex, 'School code must be 4-20 alphanumeric characters'),
  schoolType: z.enum(['public', 'private'], {
    errorMap: () => ({ message: 'Please select a school type' })
  }),
  county: z.string().min(1, 'Please select a county'),
  subCounty: z.string()
    .trim()
    .min(2, 'Sub-county must be at least 2 characters')
    .max(50, 'Sub-county must be less than 50 characters'),
  zone: z.string()
    .trim()
    .min(2, 'Zone must be at least 2 characters')
    .max(50, 'Zone must be less than 50 characters'),
  contactName: z.string()
    .trim()
    .min(3, 'Contact name must be at least 3 characters')
    .max(100, 'Contact name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .trim()
    .regex(kenyanPhoneRegex, 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters'),
  confirmPassword: z.string(),
  
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  schoolCode: z.string()
    .trim()
    .min(1, 'School code is required'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Error mapping for safe user-facing messages
export const mapAuthError = (error: any): string => {
  const errorCode = error?.code;
  const errorMessage = error?.message?.toLowerCase() || '';
  
  // Log the actual error for debugging (server-side only in production)
  console.error('Auth error (internal):', { code: errorCode, message: error?.message });
  
  // Map known errors to user-friendly messages
  if (errorCode === '23505' || errorMessage.includes('duplicate')) {
    return 'This school is already registered. Please try logging in instead.';
  }
  
  if (errorCode === 'invalid_credentials' || errorMessage.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (errorMessage.includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.';
  }
  
  if (errorMessage.includes('user already registered') || errorMessage.includes('already been registered')) {
    return 'An account with this email already exists. Please try logging in.';
  }
  
  if (errorMessage.includes('password')) {
    return 'Password does not meet requirements. Please use at least 8 characters.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  
  // Generic fallback - never expose internal details
  return 'Unable to complete request. Please try again later.';
};
