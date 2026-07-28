import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateExpense } from '../services/expenseService';
import { CATEGORIES } from '../utils/finance';

export default function ExpenseEditForm({ expense, open, onClose, onSuccess, cards, billAccounts }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (expense) {
      setForm({
        description: expense.description,
        total_amount: String(expense.total_amount),
        installments: String(expense.installments),
        first_charge_date: expense.first_charge_date,
        category: expense.category,
        source_type: expense.source_type,
        source_id: expense.source_id,
        payment_type: expense.payment_type || 'avista',
      });
    }
  }, [expense]);

  const sources = [
    ...cards.map((c) => ({ id: c.id, label: `💳 ${c.name}`, type: 'card' })),
    ...billAccounts.map((b) => ({ id: b.id, label: `📄 ${b.name}`, type: 'bill_account' })),
  ];

  const handleSourceChange = (val) => {
    const source = sources.find((s) => `${s.type}::${s.id}` === val);
    if (source) setForm({ ...form, source_type: source.type, source_id: source.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateExpense(expense.id, {
      description: form.description,
      total_amount: parseFloat(form.total_amount),
      installments: parseInt(form.installments),
      first_charge_date: form.first_charge_date,
      category: form.category,
      source_type: form.source_type,
      source_id: form.source_id,
      payment_type: form.payment_type || 'avista',
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Descrição</Label>
            <Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor Total (R$)</Label>
            <Input type="number" step="0.01" value={form.total_amount || ''} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Tipo de Pagamento</Label>
            <div className="flex gap-2">
              {['avista', 'parcelado'].map((type) => (
                <button key={type} type="button"
                  onClick={() => setForm({ ...form, payment_type: type })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                    (form.payment_type || 'avista') === type
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                  }`}>
                  {type === 'avista' ? 'À vista' : 'Parcelado'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Número de Parcelas</Label>
            <Input type="number" min="1" max="480" value={form.installments || ''} onChange={(e) => setForm({ ...form, installments: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data da 1ª Cobrança</Label>
            <Input type="date" value={form.first_charge_date || ''} onChange={(e) => setForm({ ...form, first_charge_date: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Categoria</Label>
            <Select value={form.category || ''} onValueChange={(val) => setForm({ ...form, category: val })}>
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
          <Button type="submit" disabled={loading || !form.source_id || !form.category} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}