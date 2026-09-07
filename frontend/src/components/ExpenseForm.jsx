import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createExpense } from '../services/expenseService';
import { CATEGORIES, formatCurrency } from '../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/mask';
import { addMonths, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, CalendarClock, AlertTriangle } from 'lucide-react';
import { calcCardAvailableLimit } from '../utils/finance';

function monthLabel(date) {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export default function ExpenseForm({ open, onClose, onSuccess, cards, billAccounts, allExpenses = [], allPayments = [], cardInvoicePayments = [] }) {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('avista');
  const [amountMode, setAmountMode] = useState('total');
  const [confirmStep, setConfirmStep] = useState(false);
  const [form, setForm] = useState({
    description: '',
    total_amount: '',
    installments: '1',
    payment_type: 'avista',
    first_charge_date: '',
    category: '',
    source_type: '',
    source_id: '',
    // for card: 'next' | 'current'
    card_month_mode: 'next',
  });

  const sources = [
    ...cards.map((c) => ({ id: c.id, label: `💳 ${c.name}`, type: 'card' })),
    ...billAccounts.map((b) => ({ id: b.id, label: `📄 ${b.name}`, type: 'bill_account' })),
  ];

  const isCard = form.source_type === 'card';

  const handleSourceChange = (val) => {
    const source = sources.find((s) => `${s.type}::${s.id}` === val);
    if (source) {
      setForm({ ...form, source_type: source.type, source_id: source.id });
    }
  };

  // Compute first_charge_date for cards based on card_month_mode
  const cardChargeDate = useMemo(() => {
    const base = form.card_month_mode === 'next' ? addMonths(new Date(), 1) : new Date();
    return format(startOfMonth(base), 'yyyy-MM-dd');
  }, [form.card_month_mode]);

  const effectiveFirstChargeDate = isCard ? cardChargeDate : form.first_charge_date;

  const qty = parseInt(form.installments) || 1;
  const entered = parseCurrencyInput(form.total_amount) || 0;
  const previewPerInstallment = paymentType === 'parcelado' && entered && qty >= 2
    ? (amountMode === 'total' ? entered / qty : entered)
    : null;
  const previewTotal = paymentType === 'parcelado' && entered && qty >= 2
    ? (amountMode === 'total' ? entered : entered * qty)
    : null;
  const finalTotal = paymentType === 'parcelado' && amountMode === 'per' ? entered * qty : entered;

  // Build installment months preview (for card confirmation)
  const installmentMonths = useMemo(() => {
    if (!isCard || !effectiveFirstChargeDate) return [];
    const count = paymentType === 'parcelado' ? qty : 1;
    const base = new Date(effectiveFirstChargeDate + 'T00:00:00');
    return Array.from({ length: count }, (_, i) => {
      const d = addMonths(base, i);
      return { label: monthLabel(d), value: previewPerInstallment || (paymentType === 'recorrente' ? entered : finalTotal) };
    });
  }, [isCard, effectiveFirstChargeDate, paymentType, qty, previewPerInstallment, entered, finalTotal]);

  const selectedCard = isCard ? cards.find(c => c.id === form.source_id) : null;
  const cardAvailableLimit = useMemo(() => {
    if (!selectedCard) return null;
    const cardExpenses = allExpenses.filter(e => e.source_type === 'card' && e.source_id === selectedCard.id);
    return calcCardAvailableLimit(selectedCard, cardExpenses, allPayments, cardInvoicePayments);
  }, [selectedCard, allExpenses, allPayments, cardInvoicePayments]);
  const exceedsLimit = cardAvailableLimit !== null && finalTotal > cardAvailableLimit;

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (isCard) {
      setConfirmStep(true);
    } else {
      doSave();
    }
  };

  const doSave = async () => {
    setLoading(true);
    await createExpense({
      description: form.description,
      total_amount: finalTotal,
      installments: paymentType === 'parcelado' ? qty : 1,
      payment_type: paymentType,
      first_charge_date: effectiveFirstChargeDate,
      category: form.category,
      source_type: form.source_type,
      source_id: form.source_id,
    });
    resetForm();
    setLoading(false);
    onSuccess();
    onClose();
  };

  const resetForm = () => {
    setForm({
      description: '', total_amount: '', installments: '1', payment_type: 'avista',
      first_charge_date: '', category: '', source_type: '', source_id: '', card_month_mode: 'next',
    });
    setPaymentType('avista');
    setAmountMode('total');
    setConfirmStep(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const currentMonthLabel = monthLabel(new Date());
  const nextMonthLabel = monthLabel(addMonths(new Date(), 1));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {confirmStep ? 'Confirmar Despesa' : 'Nova Despesa'}
          </DialogTitle>
        </DialogHeader>

        {/* ── CONFIRMATION STEP ── */}
        {confirmStep ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{form.description}</p>
              <p className="text-xs text-muted-foreground">
                {sources.find(s => `${s.type}::${s.id}` === `${form.source_type}::${form.source_id}`)?.label} · {CATEGORIES[form.category]?.label}
              </p>
              <p className="text-lg font-bold text-primary">{formatCurrency(finalTotal)}</p>
            </div>

            {exceedsLimit && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Esse cartão não tem limite suficiente!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Disponível: {formatCurrency(cardAvailableLimit)} · Esta compra: {formatCurrency(finalTotal)}.<br />
                    Tem certeza que a compra é nesse cartão?
                  </p>
                </div>
              </div>
            )}

          <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                <CalendarClock className="w-3.5 h-3.5" />
                Cobranças programadas
  
              </div>
              {installmentMonths.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary border border-border/50 text-sm">
                  <span className="text-foreground capitalize">{m.label}</span>
                  <span className="font-semibold text-primary">{formatCurrency(m.value)}</span>
                </div>
              ))}

            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmStep(false)}
                className="flex-1 border-border bg-secondary text-foreground gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={doSave}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Salvando...' : 'Confirmar e Salvar'}
              </Button>
            </div>
          </div>
        ) : (
        /* ── FORM STEP ── */
        <form onSubmit={handlePreSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado, Netflix..."
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              {paymentType === 'parcelado' && amountMode === 'per' ? 'Valor por Parcela (R$)' : 'Valor Total (R$)'}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: formatCurrencyInput(e.target.value) })}
              placeholder="0,00"
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {/* Tipo de pagamento */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Tipo de Pagamento</Label>
            <div className="flex gap-2">
              {['avista', 'parcelado'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setPaymentType(type); setForm({ ...form, installments: type === 'parcelado' ? '2' : '1', payment_type: type }); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                    paymentType === type
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'avista' ? 'À vista' : 'Parcelado'}
                </button>
              ))}
            </div>
          </div>

          {paymentType === 'parcelado' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Modo de entrada</Label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAmountMode('total')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${amountMode === 'total' ? 'bg-primary/15 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                    Total ÷ parcelas
                  </button>
                  <button type="button" onClick={() => setAmountMode('per')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${amountMode === 'per' ? 'bg-primary/15 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                    Parcela × qtd
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Número de Parcelas</Label>
                <Input type="number" min="2" max="480" value={form.installments}
                  onChange={(e) => setForm({ ...form, installments: e.target.value })}
                  required className="bg-secondary border-border text-foreground" />
              </div>
              {previewPerInstallment && previewTotal && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs">
                  <p className="text-primary font-semibold">
                    {form.installments}x de {formatCurrency(previewPerInstallment)}
                  </p>
                  <p className="text-muted-foreground mt-0.5">Total: {formatCurrency(previewTotal)}</p>
                </div>
              )}
            </div>
          )}

          {/* Fonte */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Fonte</Label>
            <Select
              value={form.source_type && form.source_id ? `${form.source_type}::${form.source_id}` : ''}
              onValueChange={handleSourceChange}
            >
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Cartão ou conta..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {sources.map((s) => (
                  <SelectItem key={`${s.type}::${s.id}`} value={`${s.type}::${s.id}`}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mês de cobrança — só para cartão */}
          {isCard ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Mês de Cobrança</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, card_month_mode: 'next' })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                    form.card_month_mode === 'next'
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="block font-semibold capitalize">{nextMonthLabel}</span>
                  <span className="text-[10px] opacity-70">Recomendado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, card_month_mode: 'current' })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                    form.card_month_mode === 'current'
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="block font-semibold capitalize">{currentMonthLabel}</span>
                  <span className="text-[10px] opacity-70">Mês atual</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data da 1ª Cobrança</Label>
              <Input
                type="date"
                value={form.first_charge_date}
                onChange={(e) => setForm({ ...form, first_charge_date: e.target.value })}
                required
                className="bg-secondary border-border text-foreground"
              />
            </div>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Categoria</Label>
            <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading || !form.source_id || !form.category || (!isCard && !form.first_charge_date)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isCard ? 'Revisar Cobranças →' : 'Adicionar Despesa'}
          </Button>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}