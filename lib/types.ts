export type APIResponse<T> = {
  status: boolean
  message?: string
  msg?: string
  data?: T
}

export type User = {
  name: string
  email: string
  monthlyBudget?: number
  currency?: string
  createdAt?: string
}

export type LoginResponse = {
  user: User
  token: string
}

export type BalanceData = {
  availableBalance: number
  totalExpenses: number
  budget: number
}

export type Expense = {
  id: string
  userId: string
  amount: number
  description: string
  raw_category?: string
  category: string
  createdAt: string
}
