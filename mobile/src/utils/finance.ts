import { ICard, IExpense, IInstallment, ICardInvoicePayment, IInstallmentPayment } from '../@types/models';
import { addMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ICategory {
  label: string;
  color: string;
  emoji: string;
}

export const CATEGORIES: Record<string, ICategory> = {
  alimentacao:   { label: 'Alimentação',   color: '#EE8A20', emoji: '🍽️' },
  transporte:    { label: 'Transporte',    color: '#3B82F6', emoji: '🚗' },
  moradia:       { label: 'Moradia',       color: '#A855F7', emoji: '🏠' },
  saude:         { label: 'Saúde',         color: '#22C55E', emoji: '❤️' },
  educacao:      { label: 'Educação',      color: '#06B6D4', emoji: '📚' },
  lazer:         { label: 'Lazer',         color: '#EC4899', emoji: '🎮' },
  vestuario:     { label: 'Vestuário',     color: '#EF4444', emoji: '👕' },
  tecnologia:    { label: 'Tecnologia',    color: '#6366F1', emoji: '💻' },
  assinaturas:   { label: 'Assinaturas',   color: '#14B8A6', emoji: '📱' },
  financiamento: { label: 'Financiamento', color: '#EAB308', emoji: '🏦' },
  emprestimo:    { label: 'Empréstimo',    color: '#F97316', emoji: '💰' },
  pet:           { label: 'Pet',           color: '#84CC16', emoji: '🐾' },
  outros:        { label: 'Outros',        color: '#94A3B8', emoji: '📦' },
};

export const CATEGORY_LIST = Object.keys(CATEGORIES);

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function formatMonth(date: Date): string {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function getInstallments(expense: IExpense): IInstallment[] {
  const installments: IInstallment[] = [];
  const count = expense.installments || 1;
  const baseDate = parseISO(expense.first_charge_date);

  for (let i = 0; i < count; i++) {
    const dueDate = addMonths(baseDate, i);
    installments.push({
      number: i + 1,
      total: count,
      total_amount: expense.total_amount,
      value: expense.total_amount / count,
      due_date: format(dueDate, 'yyyy-MM-dd'),
      due_date_str: format(dueDate, 'dd/MM/yyyy'),
      expense_id: expense.id,
      description: expense.description,
      category: expense.category,
      source_type: expense.source_type,
      source_id: expense.source_id,
      payment_type: expense.payment_type,
      month_key: getMonthKey(dueDate),
    });
  }

  return installments;
}

export function calcCardAvailableLimit(
  card: ICard,
  expenses: IExpense[],
  payments: IInstallmentPayment[],
  invoicePayments: ICardInvoicePayment[],
): number {
  const cardExpenses = expenses.filter(
    (e) => e.source_type === 'card' && e.source_id === card.id,
  );

  const allInstallments = cardExpenses.flatMap(getInstallments);
  const today = new Date();
  const currentMonthKey = getMonthKey(today);

  const unpaidInstallments = allInstallments.filter((inst) => {
    if (inst.month_key < currentMonthKey) return false;
    const isPaid = payments.some(
      (p) =>
        p.expense_id === inst.expense_id &&
        p.installment_number === inst.number &&
        p.month_key === inst.month_key,
    );
    return !isPaid;
  });

  const committedAmount = unpaidInstallments.reduce((sum, inst) => sum + inst.value, 0);

  const invoicePaid = invoicePayments
    .filter((p) => p.card_id === card.id && p.month_key >= currentMonthKey)
    .reduce((sum, p) => sum + p.paid_amount, 0);

  return card.credit_limit - committedAmount + invoicePaid;
}
