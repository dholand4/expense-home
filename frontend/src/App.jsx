import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Sources from './pages/Sources';
import NextBills from './pages/NextBills';
import RunningDebts from './pages/RunningDebts';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvite from './pages/AcceptInvite';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

function AppRoutes() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <Spinner />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lancamentos" element={<Expenses />} />
        <Route path="/fontes" element={<Sources />} />
        <Route path="/proximas-faturas" element={<NextBills />} />
        <Route path="/dividas" element={<RunningDebts />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
