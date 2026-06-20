export type Category = 'Food'|'Shopping'|'Rent'|'Utilities'|'Transportation'|'Entertainment'|'Travel'|'Healthcare'|'Education'|'Bills'|'Investment'|'Other'
export type PaymentMethod = 'cash'|'credit_card'|'debit_card'|'bank_transfer'|'digital_wallet'

export interface Expense { id: string; amount: number; category: string; description: string; date: string; paymentMethod: string; notes?: string; tags: string[]; createdAt: string }
export interface Income { id: string; amount: number; source: string; date: string; notes?: string; createdAt: string }
export interface Budget { id: string; category: string; amount: number; month: number; year: number; spent?: number }

export const CATEGORIES: Category[] = ['Food','Shopping','Rent','Utilities','Transportation','Entertainment','Travel','Healthcare','Education','Bills','Investment','Other']
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
]
export const CATEGORY_COLORS: Record<string, string> = {
  Food:'#f97316', Shopping:'#8b5cf6', Rent:'#ef4444', Utilities:'#3b82f6',
  Transportation:'#06b6d4', Entertainment:'#ec4899', Travel:'#14b8a6',
  Healthcare:'#10b981', Education:'#f59e0b', Bills:'#6366f1', Investment:'#22c55e', Other:'#94a3b8',
}
