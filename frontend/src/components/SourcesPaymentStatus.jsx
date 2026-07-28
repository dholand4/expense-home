import { CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/finance';

export default function SourcesPaymentStatus({ allSources, items, payments, onSelectSource, cardInvoicePayments = [], monthKey }) {
  if (allSources.length === 0 || items.length === 0) return null;

  function getPaymentForInst(inst) {
    return payments.find((p) => p.expense_id === inst.expense_id && p.installment_number === inst.number);
  }

  const sourcesWithItems = allSources
    .map((source) => {
      const sourceItems = items.filter((inst) => `${inst.source_type}::${inst.source_id}` === source.key);
      if (sourceItems.length === 0) return null;
      const isCard = source.key.startsWith('card::');
      const cardId = isCard ? source.key.replace('card::', '') : null;
      const paidItems = sourceItems.filter((inst) => !!getPaymentForInst(inst));
      const unpaidItems = sourceItems.filter((inst) => !getPaymentForInst(inst));
      const invoiceTotal = sourceItems.reduce((a, i) => a + i.value, 0);
      const invoicePayment = isCard ? cardInvoicePayments.find(p => p.card_id === cardId && (!monthKey || p.month_key === monthKey)) : null;
      const invoiceFullyPaid = invoicePayment && invoicePayment.paid_amount >= invoiceTotal;
      const allIndividuallyPaid = sourceItems.length > 0 && sourceItems.every(i => !!getPaymentForInst(i));
      const allPaid = isCard ? (invoiceFullyPaid || allIndividuallyPaid) : unpaidItems.length === 0;
      // For cards: remaining = total - invoice paid amount (or individual payments)
      const cardPaidAmount = isCard
        ? (invoicePayment ? Math.min(invoicePayment.paid_amount, invoiceTotal) : paidItems.reduce((a, i) => a + (getPaymentForInst(i)?.paid_amount || i.value), 0))
        : 0;
      const unpaidTotal = isCard
        ? Math.max(0, invoiceTotal - cardPaidAmount)
        : unpaidItems.reduce((a, i) => a + i.value, 0);
      const isPartialInvoice = isCard && invoicePayment && !invoiceFullyPaid && !allIndividuallyPaid;
      return { ...source, sourceItems, paidItems, unpaidItems, unpaidTotal, allPaid, isCard, isPartialInvoice };
    })
    .filter(Boolean);

  if (sourcesWithItems.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {sourcesWithItems.map((source) => (
        <button
          key={source.key}
          onClick={() => onSelectSource(source.key)}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:border-primary/40 ${
            source.allPaid
              ? 'border-primary/20 bg-primary/5'
              : 'border-destructive/30 bg-destructive/5'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {source.allPaid
              ? <CheckCircle2 className="w-4 h-4 text-primary" />
              : <AlertCircle className="w-4 h-4 text-destructive" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{source.label}</p>
            {source.allPaid ? (
              <p className="text-xs text-primary mt-0.5">Tudo pago ✓</p>
            ) : source.isCard ? (
              <p className="text-xs text-destructive mt-0.5">
                {source.isPartialInvoice ? `Parcial · ${formatCurrency(source.unpaidTotal)}` : `Pendência · ${formatCurrency(source.unpaidTotal)}`}
              </p>
            ) : (
              <p className="text-xs text-destructive mt-0.5">
                {source.unpaidItems.length} pendente{source.unpaidItems.length > 1 ? 's' : ''} · {formatCurrency(source.unpaidTotal)}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}