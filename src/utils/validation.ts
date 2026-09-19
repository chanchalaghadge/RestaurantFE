/**
 * Comprehensive form validation utilities
 * Provides reusable validation functions for all forms
 */

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Email validation with comprehensive checks
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Phone number validation (Indian format)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): { isValid: boolean; strength: 'weak' | 'medium' | 'strong'; message: string } => {
  if (password.length < 8) {
    return { isValid: false, strength: 'weak', message: 'Password must be at least 8 characters' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strengthCount < 2) {
    return { isValid: false, strength: 'weak', message: 'Password must include uppercase, lowercase, numbers, and special characters' };
  }
  
  if (strengthCount < 4) {
    return { isValid: true, strength: 'medium', message: 'Password strength: medium' };
  }
  
  return { isValid: true, strength: 'strong', message: 'Password strength: strong' };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Minimum length validation
 */
export const validateMinLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

/**
 * Maximum length validation
 */
export const validateMaxLength = (value: string, max: number): boolean => {
  return value.trim().length <= max;
};

/**
 * Numeric validation
 */
export const validateNumeric = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value.trim());
};

/**
 * Positive number validation
 */
export const validatePositive = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * URL validation
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Date validation
 */
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Future date validation
 */
export const validateFutureDate = (date: string): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

/**
 * Past date validation
 */
export const validatePastDate = (date: string): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
};

/**
 * Generic field validator
 */
export const validateField = (value: string, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

/**
 * Form validator for complete forms
 */
export const validateForm = (formData: Record<string, string>, validationRules: Record<string, ValidationRule[]>): ValidationResult => {
  const errors: Record<string, string> = {};
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const value = formData[fieldName] || '';
    const error = validateField(value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Common validation rules
 */
export const commonRules = {
  required: {
    validate: validateRequired,
    message: 'This field is required'
  },
  email: {
    validate: validateEmail,
    message: 'Please enter a valid email address'
  },
  phone: {
    validate: validatePhone,
    message: 'Please enter a valid 10-digit phone number'
  },
  minLength: (min: number) => ({
    validate: (value: string) => validateMinLength(value, min),
    message: `Minimum ${min} characters required`
  }),
  maxLength: (max: number) => ({
    validate: (value: string) => validateMaxLength(value, max),
    message: `Maximum ${max} characters allowed`
  }),
  numeric: {
    validate: validateNumeric,
    message: 'Please enter a valid number'
  },
  positive: {
    validate: validatePositive,
    message: 'Please enter a positive number'
  }
};