/**
 * Form validation utilities
 * Provides real-time validation with error messages
 */

export interface ValidationRule {
  validate: (value: string) => boolean;
  errorMessage: string;
}

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export interface FormErrors {
  [fieldName: string]: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  return {
    isValid,
    error: isValid ? '' : 'Please enter a valid email address'
  };
};

/**
 * Phone number validation (10 digits)
 */
export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const isValid = phoneRegex.test(phone);
  return {
    isValid,
    error: isValid ? '' : 'Please enter a valid 10-digit phone number'
  };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string, fieldName: string = 'This field'): ValidationResult => {
  const isValid = value.trim().length > 0;
  return {
    isValid,
    error: isValid ? '' : `${fieldName} is required`
  };
};

/**
 * Minimum length validation
 */
export const validateMinLength = (value: string, min: number, fieldName: string = 'This field'): ValidationResult => {
  const isValid = value.length >= min;
  return {
    isValid,
    error: isValid ? '' : `${fieldName} must be at least ${min} characters`
  };
};

/**
 * Maximum length validation
 */
export const validateMaxLength = (value: string, max: number, fieldName: string = 'This field'): ValidationResult => {
  const isValid = value.length <= max;
  return {
    isValid,
    error: isValid ? '' : `${fieldName} must not exceed ${max} characters`
  };
};

/**
 * Number validation
 */
export const validateNumber = (value: string, fieldName: string = 'This field'): ValidationResult => {
  const isValid = !isNaN(Number(value)) && value.trim() !== '';
  return {
    isValid,
    error: isValid ? '' : `${fieldName} must be a valid number`
  };
};

/**
 * Positive number validation
 */
export const validatePositiveNumber = (value: string, fieldName: string = 'This field'): ValidationResult => {
  const num = Number(value);
  const isValid = !isNaN(num) && num > 0;
  return {
    isValid,
    error: isValid ? '' : `${fieldName} must be a positive number`
  };
};

/**
 * Password validation (min 8 characters)
 */
export const validatePassword = (password: string): ValidationResult => {
  const isValid = password.length >= 8;
  return {
    isValid,
    error: isValid ? '' : 'Password must be at least 8 characters'
  };
};

/**
 * Password match validation
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  const isValid = password === confirmPassword;
  return {
    isValid,
    error: isValid ? '' : 'Passwords do not match'
  };
};

/**
 * Custom validation with multiple rules
 */
export const validateField = (value: string, rules: ValidationRule[]): ValidationResult => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return {
        isValid: false,
        error: rule.errorMessage
      };
    }
  }
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validate entire form
 */
export const validateForm = (formData: Record<string, string>, validationRules: Record<string, ValidationRule[]>): FormErrors => {
  const errors: FormErrors = {};
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const value = formData[fieldName] || '';
    const result = validateField(value, rules);
    if (!result.isValid) {
      errors[fieldName] = result.error;
    }
  }
  
  return errors;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Clear specific field error
 */
export const clearFieldError = (errors: FormErrors, fieldName: string): FormErrors => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Clear all form errors
 */
export const clearAllErrors = (): FormErrors => {
  return {};
};
