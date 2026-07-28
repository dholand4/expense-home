import { useState } from 'react';
import { UserPlus, Shield, LogOut, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/httpClient';
import { useAuth } from '@/lib/AuthContext';

export default function Admin() {
  const { logout } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setInviteUrl('');
    try {
      const result = await api.post('/auth/invite', { email, role: 'user' });
      setMessage({ type: 'success', text: `Convite criado para ${email}!` });
      setInviteUrl(result.invite_url);
      setEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao criar convite' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Administração</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie acesso ao sistema</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Convidar Usuário</h2>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? 'Criando...' : 'Criar Convite'}
          </Button>
        </form>

        {message && (
          <div className={`rounded-lg px-3 py-2 text-sm ${message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
            {message.text}
          </div>
        )}

        {inviteUrl && (
          <div className="rounded-lg border border-border/50 bg-secondary p-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Link de convite — envie ao usuário</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-foreground truncate flex-1 font-mono">{inviteUrl}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground flex items-start gap-2 mt-2">
          <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Copie o link gerado e envie ao usuário convidado. O link expira em 7 dias.</span>
        </div>
      </div>
    </div>
  );
}
