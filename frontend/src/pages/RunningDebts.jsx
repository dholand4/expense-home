import { useState, useEffect } from 'react';
import { Plus, Trash2, MinusCircle, HandCoins, Pencil, PlusCircle, Receipt, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EmptyState from '../components/EmptyState';
import {
  listRunningDebts,
  createRunningDebt,
  updateRunningDebt,
  deleteRunningDebt,
  listDebtTransactions,
  addDebtTransaction,
  deleteDebtTransaction,
} from '../services/runningDebtService';
import { formatCurrency } from '../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/mask';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatDateSafely(dateStr) {
  if (!dateStr) return '';
  try {
    const raw = typeof dateStr === 'string' ? dateStr.slice(0, 10) : new Date(dateStr).toISOString().slice(0, 10);
    const [y, m, d] = raw.split('-').map(Number);
    return format(new Date(y, m - 1, d), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function DebtForm({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', total_amount: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseCurrencyInput(form.total_amount);
    if (!amountVal || amountVal <= 0) return;

    setLoading(true);
    await createRunningDebt({ name: form.name, total_amount: amountVal, notes: form.notes });
    setForm({ name: '', total_amount: '', notes: '' });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Dívida / Fiado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome / Descrição</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Fiado Alex, Padaria..."
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Inicial (R$)</Label>
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
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Observações (opcional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Detalhes ou itens..."
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Adicionar Dívida'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDebtForm({ debt, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', total_amount: '', notes: '' });

  useEffect(() => {
    if (debt) {
      setForm({
        name: debt.name,
        total_amount: formatCurrencyInput(debt.total_amount),
        notes: debt.notes || '',
      });
    }
  }, [debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseCurrencyInput(form.total_amount);
    if (!amountVal || amountVal <= 0) return;

    setLoading(true);
    await updateRunningDebt(debt.id, {
      name: form.name,
      total_amount: amountVal,
      notes: form.notes,
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Dívida</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome / Descrição</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Total (R$)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: formatCurrencyInput(e.target.value) })}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Observações (opcional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddChargeModal({ debt, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const chargeVal = parseCurrencyInput(amount);
    if (!chargeVal || chargeVal <= 0) return;

    setLoading(true);
    await addDebtTransaction({
      debt_id: debt.id,
      type: 'charge',
      amount: chargeVal,
      date,
      notes: notes || 'Novo gasto adicionado',
    });
    setAmount('');
    setNotes('');
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Gasto — {debt.name}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Acrescente novos itens ou valores a este fiado. O total da dívida será atualizado e a transação registrada no extrato.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor do Gasto (R$)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
              placeholder="0,00"
              required
              autoFocus
              className="bg-secondary border-border text-foreground text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data do Gasto</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Descrição / Itens (opcional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: 2 cervejas, 1 almoço..."
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Adicionando...' : 'Confirmar + Gasto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentModal({ debt, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const remaining = (debt?.total_amount || 0) - (debt?.amount_paid || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paidVal = parseCurrencyInput(amount);
    if (!paidVal || paidVal <= 0) return;

    setLoading(true);
    await addDebtTransaction({
      debt_id: debt.id,
      type: 'payment',
      amount: paidVal,
      date,
      notes: notes || 'Pagamento registrado',
    });
    setAmount('');
    setNotes('');
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Registrar Pagamento — {debt.name}</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 mb-1">
          <p className="text-xs text-muted-foreground">Saldo restante a pagar</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(remaining)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Pago Agora (R$)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
              placeholder="0,00"
              required
              autoFocus
              className="bg-secondary border-border text-foreground text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data do Pagamento</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Observações / Comprovante (opcional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pix, dinheiro..."
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Registrando...' : 'Confirmar Pagamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatementModal({ debt, open, onClose, onUpdated }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    if (!debt) return;
    setLoading(true);
    try {
      const data = await listDebtTransactions(debt.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && debt) {
      loadTransactions();
    }
  }, [open, debt]);

  const handleDelete = async (txId) => {
    await deleteDebtTransaction(txId);
    await loadTransactions();
    if (onUpdated) onUpdated();
  };

  if (!debt) return null;

  const remaining = debt.total_amount - (debt.amount_paid || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <DialogTitle className="text-foreground">Extrato do Fiado — {debt.name}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Resumo do fiado */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-secondary rounded-xl border border-border/60 text-center my-2">
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-medium">Total</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(debt.total_amount)}</span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-medium">Pago</span>
            <span className="text-sm font-bold text-emerald-500">{formatCurrency(debt.amount_paid || 0)}</span>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block uppercase font-medium">Saldo</span>
            <span className={`text-sm font-bold ${remaining <= 0 ? 'text-emerald-500' : 'text-primary'}`}>
              {formatCurrency(Math.max(0, remaining))}
            </span>
          </div>
        </div>

        {/* Timeline / Lista de movimentações */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm space-y-1">
              <Clock className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p>Nenhuma movimentação detalhada encontrada.</p>
              <p className="text-xs opacity-70">Novos gastos e pagamentos aparecerão aqui em ordem cronológica.</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isPayment = tx.type === 'payment';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/50 hover:bg-secondary transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isPayment ? 'bg-emerald-500/15 text-emerald-500' : 'bg-destructive/15 text-destructive'
                      }`}
                    >
                      {isPayment ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isPayment
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {isPayment ? 'Pagamento' : 'Gasto'}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDateSafely(tx.date)}</span>
                      </div>
                      <p className="text-xs text-foreground mt-0.5 truncate font-medium">
                        {tx.notes || (isPayment ? 'Pagamento de fiado' : 'Consumo / Gasto')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        isPayment ? 'text-emerald-500' : 'text-foreground'
                      }`}
                    >
                      {isPayment ? `- ${formatCurrency(tx.amount)}` : `+ ${formatCurrency(tx.amount)}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(tx.id)}
                      title="Remover movimentação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-border mt-2">
          <Button variant="outline" className="w-full border-border bg-secondary text-foreground" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RunningDebts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [payingDebt, setPayingDebt] = useState(null);
  const [chargingDebt, setChargingDebt] = useState(null);
  const [statementDebt, setStatementDebt] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);

  const load = async () => {
    const d = await listRunningDebts();
    setDebts(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dívidas Abatíveis & Fiados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{debts.length} dívida(s) ativa(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Dívida</span>
        </Button>
      </div>

      {debts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Nenhuma dívida cadastrada" description="Adicione fiados ou dívidas para acompanhar o saldo, adicionar gastos e emitir extrato." />
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const remaining = debt.total_amount - (debt.amount_paid || 0);
            const pct = Math.min(100, ((debt.amount_paid || 0) / (debt.total_amount || 1)) * 100);
            const done = remaining <= 0;
            return (
              <div key={debt.id} className={`p-5 rounded-xl border bg-card transition-all ${done ? 'border-primary/30 opacity-75' : 'border-border/50 hover:border-primary/20'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-base">{debt.name}</span>
                      {done && <span className="text-xs bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium">Quitado ✓</span>}
                    </div>
                    {debt.notes && <p className="text-xs text-muted-foreground mt-0.5">{debt.notes}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>Total: <span className="text-foreground font-semibold">{formatCurrency(debt.total_amount)}</span></span>
                      <span>Pago: <span className="text-emerald-500 font-semibold">{formatCurrency(debt.amount_paid || 0)}</span></span>
                      <span>Restante: <span className={`font-bold ${done ? 'text-emerald-500' : 'text-primary'}`}>{formatCurrency(Math.max(0, remaining))}</span></span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{pct.toFixed(0)}% quitado</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border bg-secondary text-foreground hover:bg-primary/10 hover:text-primary gap-1.5 text-xs h-8"
                      onClick={() => setStatementDebt(debt)}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Extrato
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border bg-secondary text-foreground hover:bg-primary/10 hover:text-primary gap-1.5 text-xs h-8"
                      onClick={() => setChargingDebt(debt)}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-primary" />
                      + Gasto
                    </Button>

                    {!done && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-secondary text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 gap-1.5 text-xs h-8"
                        onClick={() => setPayingDebt(debt)}
                      >
                        <MinusCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Pagar
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8"
                      onClick={() => setEditingDebt(debt)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">Excluir dívida?</AlertDialogTitle>
                          <AlertDialogDescription>Essa ação não pode ser desfeita. A dívida "{debt.name}" e todo o seu histórico serão removidos permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-secondary border-border text-foreground">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                              await deleteRunningDebt(debt.id);
                              setDebts(debts.filter((d) => d.id !== debt.id));
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DebtForm open={showForm} onClose={() => setShowForm(false)} onSuccess={load} />
      <AddChargeModal debt={chargingDebt} open={!!chargingDebt} onClose={() => setChargingDebt(null)} onSuccess={load} />
      <PaymentModal debt={payingDebt} open={!!payingDebt} onClose={() => setPayingDebt(null)} onSuccess={load} />
      <StatementModal debt={statementDebt} open={!!statementDebt} onClose={() => setStatementDebt(null)} onUpdated={load} />
      <EditDebtForm debt={editingDebt} open={!!editingDebt} onClose={() => setEditingDebt(null)} onSuccess={load} />
    </div>
  );
}