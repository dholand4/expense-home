import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/httpClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      // vai direto para a tela de inserir o código
      navigate('/reset-password');
    } catch (err) {
      setError(err.message || 'Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/icon-180.png"
            alt="DQ Finanças"
            className="w-[72px] h-[72px] rounded-[18px] object-cover"
          />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">DQ Finanças</h1>
            <p className="text-sm text-muted-foreground mt-1">Recuperar acesso à conta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Digite seu e-mail cadastrado. Vamos enviar um código para redefinir sua senha.
          </p>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
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
            {loading ? 'Enviando...' : 'Enviar código de recuperação'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-foreground font-medium hover:underline underline-offset-4">
            Entrar
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground/50">
          <Link to="/" className="hover:text-muted-foreground transition-colors">
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
