import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '../utils/finance';
import { createPayment, deletePayment } from '../services/installmentPaymentService';
import { format } from 'date-fns';

export default function MarkPaidDialog({ open, onClose, installment, monthKey, existingPayment, onSuccess, sourceType }) {
  const isCard = sourceType === 'card';
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'full' | 'unmark'

  const fullValue = installment?.value || 0;

  const handleMarkFull = async () => {
    setLoading(true);
    if (existingPayment) await deletePayment(existingPayment.id);
    await createPayment({
      expense_id: installment.expense_id,
      installment_number: installment.number,
      paid_amount: fullValue,
      paid_date: date,
      month_key: monthKey,
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  const handleMarkPartial = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    if (existingPayment) await deletePayment(existingPayment.id);
    await createPayment({
      expense_id: installment.expense_id,
      installment_number: installment.number,
      paid_amount: val,
      paid_date: date,
      month_key: monthKey,
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  const handleUnmark = async () => {
    if (!existingPayment) return;
    setLoading(true);
    await deletePayment(existingPayment.id);
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!installment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Registrar Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">{installment.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Valor: {formatCurrency(fullValue)}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data do Pagamento</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary border-border text-foreground" />
          </div>

          {/* Pago Totalmente com confirmação */}
          {confirmAction === 'full' ? (
            <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2">
              <span className="text-xs text-foreground flex-1">Confirmar pagamento de {formatCurrency(fullValue)}?</span>
              <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground" onClick={handleMarkFull} disabled={loading}>
                {loading ? '...' : 'Sim'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmAction(null)}>Cancelar</Button>
            </div>
          ) : (
            <Button onClick={() => setConfirmAction('full')} disabled={loading} className="w-full bg-primary text-primary-foreground">
              ✅ Pago Totalmente ({formatCurrency(fullValue)})
            </Button>
          )}

          {/* Pagamento parcial - apenas para contas avulsas */}
          {!isCard && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Pagamento Parcial (R$)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-secondary border-border text-foreground"
                />
                <Button onClick={handleMarkPartial} disabled={loading || !amount} variant="outline" className="border-border shrink-0">
                  Salvar
                </Button>
              </div>
            </div>
          )}

          {/* Desmarcar como pago com confirmação */}
          {existingPayment && (
            confirmAction === 'unmark' ? (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <span className="text-xs text-foreground flex-1">Tem certeza que deseja desmarcar?</span>
                <Button size="sm" className="h-7 text-xs bg-destructive text-destructive-foreground" onClick={handleUnmark} disabled={loading}>
                  {loading ? '...' : 'Sim'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmAction(null)}>Não</Button>
              </div>
            ) : (
              <Button onClick={() => setConfirmAction('unmark')} disabled={loading} variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                Desmarcar como pago
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}