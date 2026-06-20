import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(200),
  date: z.string().or(z.date()),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet']),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional().default([]),
})
export const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  source: z.string().min(1, 'Source is required').max(100),
  date: z.string().or(z.date()),
  notes: z.string().max(500).optional(),
})
export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
})
export const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  currency: z.string().length(3),
  theme: z.enum(['light', 'dark', 'system']),
})
