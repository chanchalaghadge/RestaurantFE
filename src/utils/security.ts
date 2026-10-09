/**
 * Security utilities for the frontend application
 */

// Token storage utilities - using localStorage for now, but httpOnly cookies would be more secure
export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('restaurant-access-token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('restaurant-access-token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('restaurant-access-token');
  },
  
  // Check if token is expired (if JWT)
  isTokenExpired: (): boolean => {
    const token = tokenStorage.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;
      
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// XSS prevention for dynamic content
export const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRF token management (if backend implements CSRF)
export const csrfProtection = {
  getToken: (): string | null => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  },
  
  addToHeaders: (headers: Record<string, string>): Record<string, string> => {
    const token = csrfProtection.getToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }
};

// Content Security Policy violation handler
export const setupCSPViolationHandler = (): void => {
  if (typeof window !== 'undefined' && 'SecurityPolicyViolationEvent' in window) {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error('CSP Violation:', {
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber
      });
    });
  }
};

// Secure localStorage wrapper with encryption (basic implementation)
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // In production, use proper encryption like crypto-js
      // For now, we'll use base64 encoding as a simple obfuscation
      const encoded = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Error storing data securely:', error);
      localStorage.setItem(key, value);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      
      // Decode
      return decodeURIComponent(atob(encoded));
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return localStorage.getItem(key);
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};

// Validate URL to prevent open redirects
export const isValidUrl = (url: string, allowedDomains: string[] = []): boolean => {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // If allowed domains are specified, check against them
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
    }
    
    return true;
  } catch {
    return false;
  }
};

// Rate limiting for client-side actions
export const rateLimiter = {
  storage: new Map<string, number[]>(),
  
  canPerformAction: (actionKey: string, maxRequests: number, windowMs: number): boolean => {
    const now = Date.now();
    const timestamps = rateLimiter.storage.get(actionKey) || [];
    
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    rateLimiter.storage.set(actionKey, validTimestamps);
    
    return true;
  },
  
  reset: (actionKey: string): void => {
    rateLimiter.storage.delete(actionKey);
  }
};

// Security headers for API requests
export const securityHeaders = {
  getHeaders: (): Record<string, string> => {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
    };
  }
};