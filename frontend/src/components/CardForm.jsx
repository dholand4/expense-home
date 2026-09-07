import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createCard } from '../services/cardService';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/mask';

export default function CardForm({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', credit_limit: '', due_day: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limitVal = parseCurrencyInput(form.credit_limit);
    if (!limitVal || limitVal <= 0) return;

    setLoading(true);
    await createCard({
      name: form.name,
      credit_limit: limitVal,
      due_day: parseInt(form.due_day),
    });
    setForm({ name: '', credit_limit: '', due_day: '' });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Novo Cartão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome do Cartão</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Nubank, Itaú..."
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Limite (R$)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={form.credit_limit}
              onChange={(e) => setForm({ ...form, credit_limit: formatCurrencyInput(e.target.value) })}
              placeholder="0,00"
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Dia de Vencimento</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={form.due_day}
              onChange={(e) => setForm({ ...form, due_day: e.target.value })}
              placeholder="Ex: 10"
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Adicionar Cartão'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}