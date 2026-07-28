import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateCard } from '../services/cardService';

export default function CardEditForm({ card, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', credit_limit: '', due_day: '' });

  useEffect(() => {
    if (card) {
      setForm({ name: card.name, credit_limit: String(card.credit_limit), due_day: String(card.due_day) });
    }
  }, [card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateCard(card.id, {
      name: form.name,
      credit_limit: parseFloat(form.credit_limit),
      due_day: parseInt(form.due_day),
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Cartão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome do Cartão</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Limite (R$)</Label>
            <Input type="number" step="0.01" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Dia de Vencimento</Label>
            <Input type="number" min="1" max="31" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}