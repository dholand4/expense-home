import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateBillAccount } from '../services/billAccountService';

export default function BillAccountEditForm({ bill, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', due_day: '' });

  useEffect(() => {
    if (bill) {
      setForm({ name: bill.name, description: bill.description || '', due_day: bill.due_day ? String(bill.due_day) : '' });
    }
  }, [bill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateBillAccount(bill.id, { name: form.name, description: form.description, due_day: form.due_day ? parseInt(form.due_day) : undefined });
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Conta Avulsa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nome da Pessoa / Credor</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Descrição (opcional)</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Dia de Vencimento (opcional)</Label>
            <Input type="number" min="1" max="31" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} placeholder="Ex: 10" className="bg-secondary border-border text-foreground" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}