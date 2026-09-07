import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/mask';
import {
  getCardInvoicePayment,
  createCardInvoicePayment,
  updateCardInvoicePayment,
  deleteCardInvoicePayment,
} from '../services/cardInvoicePaymentService';
import { createPayment, deletePayment } from '../services/installmentPaymentService';
import { format } from 'date-fns';

export default function CardInvoicePaymentDialog({ open, onClose, card, monthKey, totalInvoice, onSuccess, recurrentItems = [], recurrentPayments = [] }) {
  const [existing, setExisting] = useState(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [confirmUnpay, setConfirmUnpay] = useState(false);

  useEffect(() => {
    if (open && card) {
      getCardInvoicePayment(card.id, monthKey).then((p) => {
        setExisting(p);
        setAmount(p ? formatCurrencyInput(p.paid_amount) : formatCurrencyInput(totalInvoice));
        setDate(p ? p.paid_date : format(new Date(), 'yyyy-MM-dd'));
      });
    }
  }, [open, card, monthKey]);

  const handleSave = async () => {
    const val = parseCurrencyInput(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    if (existing) {
      await updateCardInvoicePayment(existing.id, { paid_amount: val, paid_date: date });
    } else {
      await createCardInvoicePayment({ card_id: card.id, month_key: monthKey, paid_amount: val, paid_date: date });
    }
    // If paid full invoice, mark all recurrent items as paid too
    if (val >= totalInvoice) {
      const paidKeys = new Set(recurrentPayments.map(p => `${p.expense_id}-${p.installment_number}`));
      await Promise.all(
        recurrentItems
          .filter(i => !paidKeys.has(`${i.expense_id}-${i.number}`))
          .map(i => createPayment({ expense_id: i.expense_id, installment_number: i.number, paid_amount: i.value, paid_date: date, month_key: monthKey }))
      );
    } else {
      // Partial: unmark any recurrent payments
      await Promise.all(recurrentPayments.map(p => deletePayment(p.id)));
    }
    setLoading(false);
    onSuccess();
    onClose();
  };

  const handleUnpay = async () => {
    if (!existing) return;
    setLoading(true);
    await deleteCardInvoicePayment(existing.id);
    // Also unmark recurrent payments
    await Promise.all(recurrentPayments.map(p => deletePayment(p.id)));
    setLoading(false);
    setConfirmUnpay(false);
    onSuccess();
    onClose();
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Pagamento da Fatura — {card.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-secondary px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total da fatura</span>
              <span className="font-semibold text-foreground">{formatCurrency(totalInvoice)}</span>
            </div>
            {existing && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Já pago</span>
                <span className="font-semibold text-primary">{formatCurrency(existing.paid_amount)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Pago (R$)</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data do Pagamento</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <Button onClick={handleSave} disabled={loading || !amount} className="w-full bg-primary text-primary-foreground">
            {loading ? 'Salvando...' : existing ? 'Atualizar Pagamento' : 'Registrar Pagamento'}
          </Button>

          {existing && !confirmUnpay && (
            <Button
              onClick={() => setConfirmUnpay(true)}
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Desfazer pagamento
            </Button>
          )}

          {confirmUnpay && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              <span className="text-xs text-foreground flex-1">Tem certeza que deseja desfazer?</span>
              <Button size="sm" className="h-7 text-xs bg-destructive text-destructive-foreground" onClick={handleUnpay} disabled={loading}>Sim</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmUnpay(false)}>Não</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}