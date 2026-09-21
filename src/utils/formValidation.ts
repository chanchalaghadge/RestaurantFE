/**
 * Comprehensive form validation utilities
 */
import { useState } from 'react';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  numeric?: boolean;
  alpha?: boolean;
  alphaNumeric?: boolean;
}

export interface FieldValidation {
  [fieldName: string]: {
    value: any;
    rules: FormValidationRules;
    label?: string;
  };
}

export interface FormErrors {
  [fieldName: string]: string;
}

/**
 * Validate a single field based on rules
 */
export function validateField(value: any, rules: FormValidationRules, label?: string): ValidationResult {
  const fieldLabel = label || 'Field';

  // Required validation
  if (rules.required && (value === null || value === undefined || value === '')) {
    return {
      isValid: false,
      error: `${fieldLabel} is required`
    };
  }

  // Skip other validations if field is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: true };
  }

  // String length validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldLabel} must be at least ${rules.minLength} characters`
      };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldLabel} must not exceed ${rules.maxLength} characters`
      };
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldLabel} format is invalid`
      };
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          isValid: false,
          error: `${fieldLabel} must be a valid email address`
        };
      }
    }

    // Phone validation
    if (rules.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        return {
          isValid: false,
          error: `${fieldLabel} must be a valid phone number`
        };
      }
    }

    // URL validation
    if (rules.url) {
      try {
        new URL(value);
      } catch {
        return {
          isValid: false,
          error: `${fieldLabel} must be a valid URL`
        };
      }
    }

    // Alpha validation (letters only)
    if (rules.alpha && !/^[a-zA-Z\s]+$/.test(value)) {
      return {
        isValid: false,
        error: `${fieldLabel} must contain only letters`
      };
    }

    // Alpha numeric validation
    if (rules.alphaNumeric && !/^[a-zA-Z0-9\s]+$/.test(value)) {
      return {
        isValid: false,
        error: `${fieldLabel} must contain only letters and numbers`
      };
    }
  }

  // Numeric validations
  if (typeof value === 'number' || (typeof value === 'string' && rules.numeric)) {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldLabel} must be a valid number`
      };
    }

    if (rules.min !== undefined && numValue < rules.min) {
      return {
        isValid: false,
        error: `${fieldLabel} must be at least ${rules.min}`
      };
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return {
        isValid: false,
        error: `${fieldLabel} must not exceed ${rules.max}`
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return { isValid: true };
}

/**
 * Validate entire form object
 */
export function validateForm(formValidation: FieldValidation): {
  isValid: boolean;
  errors: FormErrors;
} {
  const errors: FormErrors = {};
  let isValid = true;

  Object.entries(formValidation).forEach(([fieldName, { value, rules, label }]) => {
    const result = validateField(value, rules, label || fieldName);
    if (!result.isValid) {
      errors[fieldName] = result.error || 'Invalid value';
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Real-time validation hook
 */
export function useFieldValidation() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateFieldOnChange = (
    fieldName: string,
    value: any,
    rules: FormValidationRules,
    label?: string
  ) => {
    const result = validateField(value, rules, label || fieldName);
    
    setErrors(prev => {
      if (result.isValid) {
        const updatedErrors = { ...prev };
        delete updatedErrors[fieldName];
        return updatedErrors;
      }

      return {
        ...prev,
        [fieldName]: result.error || 'Invalid value'
      };
    });

    return result.isValid;
  };

  const markFieldTouched = (fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const isFieldTouched = (fieldName: string) => touched[fieldName];

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    validateFieldOnChange,
    markFieldTouched,
    isFieldTouched,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}

/**
 * Common validation rules
 */
export const commonRules = {
  required: { required: true },
  email: { email: true },
  phone: { phone: true },
  url: { url: true },
  
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    alpha: true
  },
  
  emailRequired: {
    required: true,
    email: true
  },
  
  password: {
    required: true,
    minLength: 6,
    maxLength: 128
  },
  
  strongPassword: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },
  
  phoneRequired: {
    required: true,
    phone: true
  },
  
  numeric: {
    numeric: true
  },
  
  positiveNumber: {
    numeric: true,
    min: 0
  },
  
  price: {
    required: true,
    numeric: true,
    min: 0
  },
  
  quantity: {
    required: true,
    numeric: true,
    min: 1,
    max: 9999
  },
  
  description: {
    maxLength: 500
  },
  
  address: {
    maxLength: 200
  },
  
  zipCode: {
    pattern: /^\d{5}(-\d{4})?$/
  }
};

/**
 * Form validation utilities for specific use cases
 */
export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate password strength
   */
  getPasswordStrength: (password: string): {
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    feedback: string;
  } => {
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score++;
    else feedback = 'Password should be at least 8 characters';

    if (/[a-z]/.test(password)) score++;
    else feedback = feedback || 'Include lowercase letters';

    if (/[A-Z]/.test(password)) score++;
    else feedback = feedback || 'Include uppercase letters';

    if (/\d/.test(password)) score++;
    else feedback = feedback || 'Include numbers';

    if (/[@$!%*?&]/.test(password)) score++;
    else feedback = feedback || 'Include special characters';

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return { strength, score, feedback };
  },

  /**
   * Validate date range
   */
  isValidDateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  },

  /**
   * Validate that end date is after start date
   */
  isEndDateAfterStartDate: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  },

  /**
   * Validate credit card format (basic)
   */
  isValidCreditCard: (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    const isNumeric = /^\d+$/.test(cleaned);
    const isValidLength = cleaned.length >= 13 && cleaned.length <= 19;
    
    // Luhn algorithm
    if (isNumeric && isValidLength) {
      let sum = 0;
      let isEven = false;
      
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    }
    
    return false;
  }
};
