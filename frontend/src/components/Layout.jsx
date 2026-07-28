import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { setCurrentUserEmail } from '@/utils/currentUser';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, Receipt, CreditCard, CalendarClock, HandCoins, UserCircle } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/lancamentos', label: 'Lançamentos', icon: Receipt },
  { path: '/fontes', label: 'Cartões & Contas', icon: CreditCard },
  { path: '/proximas-faturas', label: 'Próximas Faturas', icon: CalendarClock },
  { path: '/dividas', label: 'Dívidas', icon: HandCoins },
];



export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user?.email) setCurrentUserEmail(user.email);
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-background font-dm">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-2.5 mr-8">
              <img src="/icon-32.png" alt="DQ Finanças" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-foreground font-semibold text-lg tracking-tight hidden sm:block">
                DQ Finanças
              </span>
            </div>
            <nav className="flex gap-1 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </Link>
                );
              })}

            </nav>
            <div className="ml-auto shrink-0">
              <Link
                to="/perfil"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/perfil'
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <UserCircle className="w-5 h-5" />
                <span className="hidden md:inline text-xs">{user?.email}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}