import { useState } from "react";

// Validation rules
export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Geçersiz email adresi!",
  },
  username: {
    pattern: /^[a-zA-Z0-9_]+$/,
    minLength: 3,
    message: "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir!",
    minLengthMessage: "Kullanıcı adı en az 3 karakter olmalıdır!",
  },
  password: {
    minLength: 6,
    message: "Şifre en az 6 karakter olmalıdır!",
  },
} as const;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Form values interface
export interface FormValues {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

// Validation options
export interface ValidationOptions {
  validateEmail?: boolean;
  validateUsername?: boolean;
  validatePassword?: boolean;
  validateConfirmPassword?: boolean;
  customValidations?: Array<{
    field: string;
    validate: (value: string) => boolean;
    message: string;
  }>;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Email validation
  const validateEmail = (email: string): ValidationError | null => {
    if (!email || email.trim() === "") {
      return { field: "email", message: "Email adresi gereklidir!" };
    }
    if (!ValidationRules.email.pattern.test(email)) {
      return { field: "email", message: ValidationRules.email.message };
    }
    return null;
  };

  // Username validation
  const validateUsername = (username: string): ValidationError | null => {
    if (!username || username.trim() === "") {
      return { field: "username", message: "Kullanıcı adı gereklidir!" };
    }
    if (username.length < ValidationRules.username.minLength) {
      return {
        field: "username",
        message: ValidationRules.username.minLengthMessage,
      };
    }
    if (!ValidationRules.username.pattern.test(username)) {
      return { field: "username", message: ValidationRules.username.message };
    }
    return null;
  };

  // Password validation
  const validatePassword = (password: string): ValidationError | null => {
    if (!password || password.trim() === "") {
      return { field: "password", message: "Şifre gereklidir!" };
    }
    if (password.length < ValidationRules.password.minLength) {
      return { field: "password", message: ValidationRules.password.message };
    }
    return null;
  };

  // Confirm password validation
  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): ValidationError | null => {
    if (!confirmPassword || confirmPassword.trim() === "") {
      return {
        field: "confirmPassword",
        message: "Şifre tekrarı gereklidir!",
      };
    }
    if (password !== confirmPassword) {
      return { field: "confirmPassword", message: "Şifreler eşleşmiyor!" };
    }
    return null;
  };

  // Main validate function
  const validate = (
    values: FormValues,
    options: ValidationOptions = {}
  ): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    // Email validation
    if (options.validateEmail && values.email !== undefined) {
      const error = validateEmail(values.email);
      if (error) validationErrors.push(error);
    }

    // Username validation
    if (options.validateUsername && values.username !== undefined) {
      const error = validateUsername(values.username);
      if (error) validationErrors.push(error);
    }

    // Password validation
    if (options.validatePassword && values.password !== undefined) {
      const error = validatePassword(values.password);
      if (error) validationErrors.push(error);
    }

    // Confirm password validation
    if (
      options.validateConfirmPassword &&
      values.password !== undefined &&
      values.confirmPassword !== undefined
    ) {
      const error = validateConfirmPassword(
        values.password,
        values.confirmPassword
      );
      if (error) validationErrors.push(error);
    }

    // Custom validations
    if (options.customValidations) {
      for (const custom of options.customValidations) {
        const value = values[custom.field];
        if (value && !custom.validate(value)) {
          validationErrors.push({
            field: custom.field,
            message: custom.message,
          });
        }
      }
    }

    setErrors(validationErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };

  // Get error for specific field
  const getFieldError = (field: string): string | undefined => {
    const error = errors.find((e) => e.field === field);
    return error?.message;
  };

  // Clear errors
  const clearErrors = () => {
    setErrors([]);
  };

  // Clear specific field error
  const clearFieldError = (field: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== field));
  };

  return {
    errors,
    validate,
    getFieldError,
    clearErrors,
    clearFieldError,
    // Individual validators for standalone use
    validateEmail,
    validateUsername,
    validatePassword,
    validateConfirmPassword,
  };
}
