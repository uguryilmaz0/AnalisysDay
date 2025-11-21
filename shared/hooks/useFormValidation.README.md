# useFormValidation Hook

Generic form validation hook'u. Email, username, password ve custom validasyonlar için tek kaynak.

## Özellikler

✅ Email validation (regex pattern)  
✅ Username validation (min length, alphanumeric + underscore)  
✅ Password validation (min length)  
✅ Confirm password validation (match check)  
✅ Custom validation support  
✅ Field-level error tracking  
✅ Turkish error messages

## Kullanım

### 1. Basic Email Validation

```tsx
import { useFormValidation } from "@/shared/hooks";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { validate } = useFormValidation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validate({ email }, { validateEmail: true });

    if (!result.isValid) {
      setError(result.errors[0].message);
      return;
    }

    // Email geçerli, işleme devam et
  };
}
```

### 2. Register Form (Full Validation)

```tsx
import { useFormValidation } from "@/shared/hooks";

function RegisterPage() {
  const { validate } = useFormValidation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validate(
      { email, username, password, confirmPassword },
      {
        validateEmail: true,
        validateUsername: true,
        validatePassword: true,
        validateConfirmPassword: true,
      }
    );

    if (!result.isValid) {
      setError(result.errors[0].message);
      return;
    }

    // Tüm validasyonlar geçti
  };
}
```

### 3. Custom Validation

```tsx
const result = validate(
  { email, age: "17" },
  {
    validateEmail: true,
    customValidations: [
      {
        field: "age",
        validate: (value) => parseInt(value) >= 18,
        message: "18 yaşından küçükler kayıt olamaz!",
      },
    ],
  }
);
```

### 4. Field-Level Error Display

```tsx
const { validate, getFieldError, clearFieldError } = useFormValidation();

// Get error for specific field
const emailError = getFieldError("email");

// Clear specific field error on input change
<Input
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    clearFieldError("email");
  }}
  error={emailError}
/>;
```

## Validation Rules

### Email

- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Message: "Geçersiz email adresi!"

### Username

- Pattern: `/^[a-zA-Z0-9_]+$/` (alphanumeric + underscore)
- Min Length: 3 characters
- Messages:
  - "Kullanıcı adı en az 3 karakter olmalıdır!"
  - "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir!"

### Password

- Min Length: 6 characters
- Message: "Şifre en az 6 karakter olmalıdır!"

### Confirm Password

- Must match password field
- Message: "Şifreler eşleşmiyor!"

## API Reference

### `validate(values, options)`

Main validation function.

**Parameters:**

- `values: FormValues` - Form values to validate
- `options: ValidationOptions` - Validation configuration

**Returns:** `ValidationResult`

```ts
{
  isValid: boolean;
  errors: ValidationError[];
}
```

### `getFieldError(field: string)`

Get error message for specific field.

**Returns:** `string | undefined`

### `clearErrors()`

Clear all validation errors.

### `clearFieldError(field: string)`

Clear error for specific field.

### Individual Validators

Hook also exports individual validator functions for standalone use:

- `validateEmail(email: string)`
- `validateUsername(username: string)`
- `validatePassword(password: string)`
- `validateConfirmPassword(password: string, confirmPassword: string)`

## Before/After Comparison

### ❌ Before (Manual Validation)

```tsx
// Register.tsx - 30 satır manuel validation
if (password !== confirmPassword) {
  setError("Şifreler eşleşmiyor!");
  return;
}

if (password.length < 6) {
  setError("Şifre en az 6 karakter olmalıdır!");
  return;
}

if (username.length < 3) {
  setError("Kullanıcı adı en az 3 karakter olmalıdır!");
  return;
}

if (!/^[a-zA-Z0-9_]+$/.test(username)) {
  setError("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir!");
  return;
}
```

### ✅ After (useFormValidation Hook)

```tsx
// Register.tsx - 8 satır generic validation
const result = validate(
  { email, username, password, confirmPassword },
  {
    validateEmail: true,
    validateUsername: true,
    validatePassword: true,
    validateConfirmPassword: true,
  }
);

if (!result.isValid) {
  setError(result.errors[0].message);
  return;
}
```

**Savings:**

- 30 lines → 8 lines (-73% code reduction)
- Centralized validation rules
- Reusable across all forms
- Consistent error messages
- Type-safe with TypeScript

## Integration

### Files Updated

✅ `app/register/page.tsx` - Full validation (email, username, password, confirmPassword)  
✅ `app/forgot-password/page.tsx` - Email validation  
✅ `shared/hooks/index.ts` - Exported hook

### Future Usage

This hook can be used in:

- Login forms
- Profile update forms
- Admin user creation
- Any form requiring email/username/password validation

## Testing

```tsx
// Example test
const { validate } = useFormValidation();

// Valid email
const result1 = validate(
  { email: "test@example.com" },
  { validateEmail: true }
);
expect(result1.isValid).toBe(true);

// Invalid email
const result2 = validate({ email: "invalid-email" }, { validateEmail: true });
expect(result2.isValid).toBe(false);
expect(result2.errors[0].message).toBe("Geçersiz email adresi!");
```

## Best Practices

1. **Validate on Submit**: Always validate in form submit handler
2. **Clear on Change**: Clear field errors when user starts typing
3. **Show First Error**: Display first error to avoid overwhelming user
4. **Consistent Messages**: Use hook's built-in messages for consistency
5. **Custom Validations**: Use for business-specific rules (age, phone, etc.)
