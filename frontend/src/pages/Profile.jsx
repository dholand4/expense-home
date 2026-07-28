import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/httpClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LogOut, User, Shield, Trash2, Users, Eye, EyeOff, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';
import { invalidateViewableEmails } from '../utils/viewableEmails';
import SharedAccessesIAmIn from '../components/SharedAccessesIAmIn';

export default function Profile() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [sharedAccess, setSharedAccess] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [accessEmail, setAccessEmail] = useState('');
  const [addingAccess, setAddingAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAccess();
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const list = await api.get('/users');
    setUsers(list);
    setLoadingUsers(false);
  };

  const loadAccess = async () => {
    const [granted, invites] = await Promise.all([
      api.get(`/shared-accesses?owner_email=${encodeURIComponent(user?.email)}`),
      api.get(`/shared-accesses?shared_with_email=${encodeURIComponent(user?.email)}`),
    ]);
    setSharedAccess(granted.filter(a => a.status === 'accepted' || a.status === 'pending'));
    setPendingInvites(invites.filter(a => a.status === 'pending'));
    setAcceptedGroups(invites.filter(a => a.status === 'accepted'));
  };

  const handleAcceptInvite = async (invite) => {
    await api.patch(`/shared-accesses/${invite.id}`, { status: 'accepted' });
    invalidateViewableEmails();
    loadAccess();
  };

  const handleRejectInvite = async (invite) => {
    await api.patch(`/shared-accesses/${invite.id}`, { status: 'rejected' });
    loadAccess();
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage(null);
    setInviteUrl('');
    try {
      const result = await api.post('/auth/invite', { email: inviteEmail, role: 'user' });
      setInviteMessage({ type: 'success', text: `Convite criado para ${inviteEmail}!` });
      setInviteUrl(result.invite_url);
      setInviteEmail('');
      loadUsers();
    } catch (err) {
      setInviteMessage({ type: 'error', text: err.message || 'Erro ao criar convite' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveUser = async (userId) => {
    await api.delete(`/users/${userId}`);
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    await api.patch(`/users/${u.id}`, { role: newRole });
    setUsers(users.map(x => x.id === u.id ? { ...x, role: newRole } : x));
  };

  const hasAccess = (email) => sharedAccess.some(a => a.shared_with_email === email);

  const grantAccess = async (email) => {
    if (!email || hasAccess(email)) return;
    const created = await api.post('/shared-accesses', { shared_with_email: email });
    setSharedAccess([...sharedAccess, created]);
  };

  const revokeAccess = async (email) => {
    const existing = sharedAccess.find(a => a.shared_with_email === email);
    if (!existing) return;
    await api.delete(`/shared-accesses/${existing.id}`);
    setSharedAccess(sharedAccess.filter(a => a.id !== existing.id));
    invalidateViewableEmails();
  };

  const handleAddAccessByEmail = async (e) => {
    e.preventDefault();
    setAddingAccess(true);
    setAccessMessage(null);
    if (hasAccess(accessEmail)) {
      setAccessMessage({ type: 'error', text: 'Esse e-mail já tem acesso.' });
      setAddingAccess(false);
      return;
    }
    try {
      await grantAccess(accessEmail);
      setAccessMessage({ type: 'success', text: `Convite enviado para ${accessEmail}!` });
      setAccessEmail('');
    } catch (err) {
      setAccessMessage({ type: 'error', text: err.message || 'Erro ao conceder acesso' });
    } finally {
      setAddingAccess(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Sua conta e acessos</p>
      </div>

      {/* User info card */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{user?.full_name || 'Usuário'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="border-t border-border/50 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">E-mail</span>
            <span className="text-foreground font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Perfil</span>
            <span className="text-foreground font-medium">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
          </div>
        </div>
        <div className="border-t border-border/50 pt-4">
          <Button variant="destructive" className="w-full gap-2" onClick={() => logout()}>
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>
      </div>

      <Tabs defaultValue={isAdmin ? 'users' : 'access'}>
        <TabsList className="w-full bg-secondary border border-border/50">
          {isAdmin && (
            <TabsTrigger value="users" className="flex-1 gap-2 data-[state=active]:bg-card">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
          )}
          <TabsTrigger value="access" className="flex-1 gap-2 data-[state=active]:bg-card">
            <Eye className="w-4 h-4" />
            Meu Acesso
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All users + roles — admin only */}
        {isAdmin && (
          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Todos os usuários</h2>
              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.full_name || u.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-background text-muted-foreground border border-border'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                        {u.id !== user?.id && (
                          <>
                            <Button
                              variant={hasAccess(u.email) ? 'default' : 'ghost'}
                              size="sm"
                              className={`h-7 gap-1 text-xs ${hasAccess(u.email) ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
                              onClick={() => hasAccess(u.email) ? revokeAccess(u.email) : grantAccess(u.email)}
                            >
                              {hasAccess(u.email) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span className="hidden sm:inline">{hasAccess(u.email) ? 'Acesso' : 'Sem acesso'}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => handleToggleRole(u)}
                            >
                              {u.role === 'admin' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Remover usuário?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover {u.full_name || u.email}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary border-border text-foreground">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleRemoveUser(u.id)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invite new user */}
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Convidar novo usuário</h2>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="bg-secondary border-border text-foreground flex-1"
                />
                <Button type="submit" disabled={inviteLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                  {inviteLoading ? '...' : 'Convidar'}
                </Button>
              </form>
              {inviteMessage && (
                <div className={`rounded-lg px-3 py-2 text-sm ${inviteMessage.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {inviteMessage.text}
                </div>
              )}
              {inviteUrl && (
                <div className="rounded-lg border border-border/50 bg-secondary p-3 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Link de convite</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-foreground truncate flex-1 font-mono">{inviteUrl}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                      onClick={handleCopyInviteUrl}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Tab 2: Access management */}
        <TabsContent value="access" className="mt-4 space-y-4">
          <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Quem pode ver minhas despesas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Convide alguém pelo e-mail — a pessoa precisará aceitar.</p>
            </div>

            {acceptedGroups.length > 0 ? (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-3 py-3 text-xs text-yellow-500 flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Você está no grupo de <strong>{acceptedGroups.map(g => g.owner_email).join(', ')}</strong>. Para criar seu próprio grupo e convidar pessoas, saia do grupo atual primeiro.</span>
              </div>
            ) : (
              <>
                <form onSubmit={handleAddAccessByEmail} className="flex gap-2">
                  <Input
                    type="email"
                    value={accessEmail}
                    onChange={(e) => setAccessEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                    className="bg-secondary border-border text-foreground flex-1"
                  />
                  <Button type="submit" disabled={addingAccess} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                    {addingAccess ? '...' : 'Convidar'}
                  </Button>
                </form>
                {accessMessage && (
                  <div className={`rounded-lg px-3 py-2 text-sm ${accessMessage.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    {accessMessage.text}
                  </div>
                )}
              </>
            )}

            {/* Active access list (accepted or pending) */}
            {sharedAccess.length > 0 && (
              <div className="space-y-1.5 border-t border-border/50 pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Acessos ativos</p>
                <div className="space-y-2">
                  {sharedAccess.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-primary shrink-0" />
                        <div>
                          <span className="text-sm text-foreground">{a.shared_with_email}</span>
                          {a.status === 'pending' && (
                            <span className="ml-2 text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">pendente</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => revokeAccess(a.shared_with_email)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sharedAccess.length === 0 && acceptedGroups.length === 0 && (
              <div className="rounded-lg bg-secondary px-3 py-3 text-xs text-muted-foreground flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Nenhum usuário tem acesso às suas despesas ainda.</span>
              </div>
            )}
          </div>

          {/* Invites I received */}
          {pendingInvites.length > 0 && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Convites recebidos</h2>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-card">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{invite.owner_email}</p>
                      <p className="text-xs text-muted-foreground">quer compartilhar as despesas com você</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 ml-2">
                      <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground" onClick={() => handleAcceptInvite(invite)}>Aceitar</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleRejectInvite(invite)}>Recusar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accesses I'm part of — with leave button */}
          <SharedAccessesIAmIn userEmail={user?.email} onLeave={() => { invalidateViewableEmails(); loadAccess(); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
