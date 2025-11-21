/**
 * Zod Validation Schemas
 * API Routes için input validation
 * 
 * Best Practice:
 * - Her API endpoint için ayrı schema
 * - Client-side ve server-side validation tutarlı
 * - Error messages kullanıcı dostu
 */

import { z } from 'zod';

/**
 * Analysis Schemas
 */
export const CreateAnalysisSchema = z.object({
  title: z.string()
    .min(3, 'Başlık en az 3 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  
  imageUrls: z.array(z.string().url('Geçerli bir URL olmalı'))
    .min(1, 'En az 1 görsel gerekli')
    .max(10, 'En fazla 10 görsel yüklenebilir'),
  
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  
  isVisible: z.boolean().default(true),
});

export const UpdateAnalysisSchema = z.object({
  title: z.string()
    .min(3, 'Başlık en az 3 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir')
    .optional(),
  
  imageUrls: z.array(z.string().url())
    .min(1, 'En az 1 görsel gerekli')
    .max(10, 'En fazla 10 görsel yüklenebilir')
    .optional(),
  
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  
  isVisible: z.boolean().optional(),
});

/**
 * User Management Schemas
 */
export const UpdateUserPremiumSchema = z.object({
  isPaid: z.boolean(),
  subscriptionEndDate: z.string()
    .datetime()
    .optional()
    .nullable(),
});

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    message: 'Rol sadece "user" veya "admin" olabilir',
  }),
});

/**
 * Payment Schemas
 */
export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    message: 'Durum "pending", "approved" veya "rejected" olmalı',
  }),
  subscriptionDays: z.number()
    .int()
    .positive('Abonelik süresi pozitif olmalı')
    .max(365, 'Abonelik süresi maksimum 365 gün olabilir')
    .default(30)
    .optional(),
});

/**
 * Authentication Schemas
 */
export const LoginSchema = z.object({
  email: z.string()
    .email('Geçerli bir email adresi girin')
    .or(z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı')),
  
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalı'),
});

export const RegisterSchema = z.object({
  email: z.string()
    .email('Geçerli bir email adresi girin'),
  
  username: z.string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
    .max(20, 'Kullanıcı adı en fazla 20 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  
  firstName: z.string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  
  lastName: z.string()
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalı')
    .max(100, 'Şifre en fazla 100 karakter olabilir'),
  
  ageConfirmed: z.literal(true, {
    message: '18 yaşından büyük olduğunuzu onaylamalısınız',
  }),
  
  kvkkConsents: z.object({
    terms: z.literal(true),
    privacy: z.literal(true),
    kvkk: z.literal(true),
    explicitConsent: z.literal(true),
  }),
});

/**
 * Query Parameter Schemas
 */
export const PaginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Sayfa numarası geçerli bir sayı olmalı')
    .default('1')
    .transform(Number),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limit geçerli bir sayı olmalı')
    .default('10')
    .transform(Number),
});

export const AnalysisQuerySchema = z.object({
  visible: z.string()
    .transform(val => val === 'true')
    .optional(),
  
  fromDate: z.string()
    .datetime()
    .optional(),
  
  toDate: z.string()
    .datetime()
    .optional(),
});

/**
 * Type exports (TypeScript inference)
 */
export type CreateAnalysisInput = z.infer<typeof CreateAnalysisSchema>;
export type UpdateAnalysisInput = z.infer<typeof UpdateAnalysisSchema>;
export type UpdateUserPremiumInput = z.infer<typeof UpdateUserPremiumSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type AnalysisQueryInput = z.infer<typeof AnalysisQuerySchema>;
