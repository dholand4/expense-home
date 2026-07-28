import { addMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CATEGORIES = {
  alimentacao: { label: 'Alimentação', color: 'hsl(160, 64%, 40%)' },
  transporte: { label: 'Transporte', color: 'hsl(200, 60%, 50%)' },
  moradia: { label: 'Moradia', color: 'hsl(280, 60%, 55%)' },
  saude: { label: 'Saúde', color: 'hsl(340, 70%, 55%)' },
  educacao: { label: 'Educação', color: 'hsl(40, 80%, 55%)' },
  lazer: { label: 'Lazer', color: 'hsl(190, 70%, 50%)' },
  vestuario: { label: 'Vestuário', color: 'hsl(320, 60%, 55%)' },
  tecnologia: { label: 'Tecnologia', color: 'hsl(220, 65%, 55%)' },
  assinaturas: { label: 'Assinaturas', color: 'hsl(30, 75%, 50%)' },
  financiamento: { label: 'Financiamento', color: 'hsl(10, 70%, 50%)' },
  emprestimo: { label: 'Empréstimo', color: 'hsl(50, 80%, 45%)' },
  pet: { label: 'Pet', color: 'hsl(140, 55%, 45%)' },
  outros: { label: 'Outros', color: 'hsl(0, 0%, 55%)' },
};

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getInstallmentValue(totalAmount, installments) {
  return totalAmount / installments;
}

export function getInstallments(expense) {
  const installments = [];
  const valuePerInstallment = getInstallmentValue(expense.total_amount, expense.installments);
  const startDate = parseISO(expense.first_charge_date);

  for (let i = 0; i < expense.installments; i++) {
    const dueDate = addMonths(startDate, i);
    installments.push({
      number: i + 1,
      total: expense.installments,
      value: valuePerInstallment,
      due_date: dueDate,
      due_date_str: format(dueDate, 'yyyy-MM-dd'),
      expense_id: expense.id,
      description: expense.description,
      category: expense.category,
      source_type: expense.source_type,
      source_id: expense.source_id,
      payment_type: expense.payment_type || 'avista',
    });
  }
  return installments;
}

// Calculate available limit for a card based on pending installments + invoice payments
export function calcCardAvailableLimit(card, cardExpenses, allPayments, cardInvoicePayments = []) {
  const paymentMap = new Map();
  allPayments.forEach((p) => {
    paymentMap.set(`${p.expense_id}-${p.installment_number}`, p.paid_amount);
  });

  // Group all installments by month
  const monthTotals = new Map();
  let committed = 0;

  for (const expense of cardExpenses) {
    const installments = getInstallments(expense);
    for (const inst of installments) {
      const paid = paymentMap.get(`${inst.expense_id}-${inst.number}`) || 0;
      const remaining = inst.value - paid;
      if (remaining > 0) {
        committed += remaining;
        const mk = format(inst.due_date, 'yyyy-MM');
        monthTotals.set(mk, (monthTotals.get(mk) || 0) + remaining);
      }
    }
  }

  // Subtract invoice payments — each invoice payment reduces committed
  for (const inv of cardInvoicePayments) {
    if (inv.card_id !== card.id) continue;
    const monthRemaining = monthTotals.get(inv.month_key) || 0;
    committed -= Math.min(inv.paid_amount, monthRemaining);
  }

  return card.credit_limit - committed;
}

export function formatMonth(date) {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function getMonthKey(date) {
  return format(date, 'yyyy-MM');
}