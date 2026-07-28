import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, setToken } from '@/api/httpClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <p className="text-muted-foreground text-sm">Link de convite inválido ou ausente.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('As senhas não coincidem'); return; }
    setLoading(true);
    setError('');
    try {
      const { token } = await api.post('/auth/accept-invite', { token: inviteToken, password });
      setToken(token);
      setDone(true);
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (err) {
      setError(err.message || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Aceitar Convite</h1>
          <p className="text-sm text-muted-foreground mt-1">Defina uma senha para ativar sua conta</p>
        </div>

        {done ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center text-primary text-sm font-medium">
            Conta ativada com sucesso! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nova Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Confirmar Senha</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            {error && (
              <div className="rounded-lg px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Ativando...' : 'Ativar Conta'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
