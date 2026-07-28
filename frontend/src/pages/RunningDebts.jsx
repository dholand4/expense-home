import { useState, useEffect } from 'react';
import { Plus, Trash2, MinusCircle, HandCoins, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EmptyState from '../components/EmptyState';
import { listRunningDebts, createRunningDebt, updateRunningDebt, deleteRunningDebt } from '../services/runningDebtService';
import { formatCurrency } from '../utils/finance';

function DebtForm({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', total_amount: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await createRunningDebt({ name: form.name, total_amount: parseFloat(form.total_amount), notes: form.notes });
    setForm({ name: '', total_amount: '', notes: '' });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Dívida Abatível</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome / Descrição</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Fiador Alex" required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Total (R$)</Label>
            <Input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} placeholder="0,00" required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Observações (opcional)</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Detalhes..." className="bg-secondary border-border text-foreground" />
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
    if (debt) setForm({ name: debt.name, total_amount: String(debt.total_amount), notes: debt.notes || '' });
  }, [debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateRunningDebt(debt.id, { name: form.name, total_amount: parseFloat(form.total_amount), notes: form.notes });
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
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Total (R$)</Label>
            <Input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Observações (opcional)</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-secondary border-border text-foreground" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentModal({ debt, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

  const remaining = (debt?.total_amount || 0) - (debt?.amount_paid || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newPaid = (debt.amount_paid || 0) + parseFloat(amount);
    await updateRunningDebt(debt.id, { amount_paid: newPaid });
    setAmount('');
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
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 mb-2">
          <p className="text-xs text-muted-foreground">Saldo restante</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(remaining)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Pago Agora (R$)</Label>
            <Input type="number" step="0.01" max={remaining} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required className="bg-secondary border-border text-foreground" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Registrando...' : 'Confirmar Pagamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RunningDebts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [payingDebt, setPayingDebt] = useState(null);
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dívidas Abatíveis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{debts.length} dívida(s) ativa(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Dívida</span>
        </Button>
      </div>

      {debts.length === 0 ? (
        <EmptyState icon={HandCoins} title="Nenhuma dívida cadastrada" description="Adicione dívidas para acompanhar o saldo e registrar pagamentos." />
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const remaining = debt.total_amount - (debt.amount_paid || 0);
            const pct = Math.min(100, ((debt.amount_paid || 0) / debt.total_amount) * 100);
            const done = remaining <= 0;
            return (
              <div key={debt.id} className={`p-5 rounded-xl border bg-card transition-all ${done ? 'border-primary/30 opacity-70' : 'border-border/50 hover:border-primary/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{debt.name}</span>
                      {done && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Quitado ✓</span>}
                    </div>
                    {debt.notes && <p className="text-xs text-muted-foreground mt-0.5">{debt.notes}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Total: <span className="text-foreground font-medium">{formatCurrency(debt.total_amount)}</span></span>
                      <span>Pago: <span className="text-primary font-medium">{formatCurrency(debt.amount_paid || 0)}</span></span>
                      <span>Restante: <span className={`font-medium ${done ? 'text-primary' : 'text-foreground'}`}>{formatCurrency(Math.max(0, remaining))}</span></span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% quitado</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8" onClick={() => setEditingDebt(debt)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {!done && (
                      <Button variant="outline" size="sm" className="border-border bg-secondary text-foreground hover:bg-primary/10 hover:text-primary gap-1.5 text-xs" onClick={() => setPayingDebt(debt)}>
                        <MinusCircle className="w-3.5 h-3.5" />
                        Pagar
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">Excluir dívida?</AlertDialogTitle>
                          <AlertDialogDescription>Essa ação não pode ser desfeita. A dívida "{debt.name}" será removida permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-secondary border-border text-foreground">Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { await deleteRunningDebt(debt.id); setDebts(debts.filter((d) => d.id !== debt.id)); }}>
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
      <PaymentModal debt={payingDebt} open={!!payingDebt} onClose={() => setPayingDebt(null)} onSuccess={load} />
      <EditDebtForm debt={editingDebt} open={!!editingDebt} onClose={() => setEditingDebt(null)} onSuccess={load} />
    </div>
  );
}