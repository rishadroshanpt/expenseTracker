/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// User Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Expense Types
export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
  description?: string;
  created_at: string;
}

export interface CreateExpenseRequest {
  amount: number;
  type: "credit" | "debit";
  date: string;
  description?: string;
}

export interface ExpensesResponse {
  expenses: Expense[];
}

// Demo response (legacy)
export interface DemoResponse {
  message: string;
}
