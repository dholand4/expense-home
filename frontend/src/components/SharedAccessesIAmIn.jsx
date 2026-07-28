import { useState, useEffect } from 'react';
import { api } from '@/api/httpClient';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function SharedAccessesIAmIn({ userEmail, onLeave }) {
  const [accesses, setAccesses] = useState([]);

  useEffect(() => {
    if (!userEmail) return;
    api.get(`/shared-accesses?shared_with_email=${encodeURIComponent(userEmail)}`)
      .then(list => setAccesses(list.filter(a => a.status === 'accepted')));
  }, [userEmail]);

  if (accesses.length === 0) return null;

  const handleLeave = async (access) => {
    await api.patch(`/shared-accesses/${access.id}`, { status: 'rejected' });
    setAccesses(accesses.filter(a => a.id !== access.id));
    onLeave?.();
  };

  return (
    <div className="space-y-1.5 border-t border-border/50 pt-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Despesas que estou vendo</p>
      <div className="space-y-2">
        {accesses.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.owner_email}</p>
                <p className="text-xs text-muted-foreground">você tem acesso às despesas desta pessoa</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10 shrink-0 ml-2">
                  <LogOut className="w-3 h-3" />
                  Sair
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Sair do acesso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você deixará de ver as despesas de {a.owner_email}. Pode ser convidado novamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary border-border text-foreground">Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleLeave(a)}>
                    Sair
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}
