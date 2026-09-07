export interface IUser {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ICard {
  id: string;
  name: string;
  credit_limit: number;
  due_day: number;
}

export interface IBillAccount {
  id: string;
  name: string;
  description?: string;
  due_day?: number;
}

export type PaymentType = 'avista' | 'parcelado' | 'recorrente';
export type SourceType = 'card' | 'bill_account';

export interface IExpense {
  id: string;
  description: string;
  total_amount: number;
  installments: number;
  payment_type: PaymentType;
  first_charge_date: string;
  category: string;
  source_type: SourceType;
  source_id: string;
}

export interface IInstallment {
  number: number;
  total: number;
  total_amount?: number;
  value: number;
  due_date: string;
  due_date_str: string;
  expense_id: string;
  description: string;
  category: string;
  source_type: SourceType;
  source_id: string;
  payment_type: PaymentType;
  month_key: string;
}

export interface IInstallmentPayment {
  id: string;
  expense_id: string;
  installment_number: number;
  paid_amount: number;
  paid_date: string;
  month_key: string;
}

export interface ICardInvoicePayment {
  id: string;
  card_id: string;
  month_key: string;
  paid_amount: number;
  paid_date: string;
}

export interface IRunningDebt {
  id: string;
  name: string;
  total_amount: number;
  amount_paid: number;
  notes?: string;
}

export type DebtTransactionType = 'charge' | 'payment';

export interface IRunningDebtTransaction {
  id: string;
  debt_id: string;
  type: DebtTransactionType;
  amount: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface ISharedAccess {
  id: string;
  owner_email: string;
  shared_with_email: string;
  status: 'pending' | 'accepted' | 'rejected';
}
