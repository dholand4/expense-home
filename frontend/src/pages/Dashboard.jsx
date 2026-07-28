import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import SummaryCard from '../components/SummaryCard';
import EmptyState from '../components/EmptyState';
import { listCards } from '../services/cardService';
import { listBillAccounts } from '../services/billAccountService';
import { listExpenses } from '../services/expenseService';
import { CATEGORIES, formatCurrency, getInstallments, getMonthKey } from '../utils/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [billAccounts, setBillAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    async function load() {
      const [c, b, e] = await Promise.all([listCards(), listBillAccounts(), listExpenses()]);
      setCards(c);
      setBillAccounts(b);
      setExpenses(e);
      setLoading(false);
    }
    load();
  }, []);

  const currentMonthKey = getMonthKey(new Date());

  const currentInstallments = useMemo(() => {
    return expenses
      .flatMap(getInstallments)
      .filter((inst) => getMonthKey(inst.due_date) === currentMonthKey)
      .filter((inst) => filterCategory === 'all' || inst.category === filterCategory);
  }, [expenses, currentMonthKey, filterCategory]);

  const totalMonth = useMemo(() => {
    return currentInstallments.reduce((acc, inst) => acc + inst.value, 0);
  }, [currentInstallments]);

  const totalByCard = useMemo(() => {
    const map = {};
    currentInstallments
      .filter((i) => i.source_type === 'card')
      .forEach((i) => {
        map[i.source_id] = (map[i.source_id] || 0) + i.value;
      });
    return cards.map((c) => ({ name: c.name, value: map[c.id] || 0 })).filter((c) => c.value > 0);
  }, [currentInstallments, cards]);

  const totalByBillAccount = useMemo(() => {
    const map = {};
    currentInstallments
      .filter((i) => i.source_type === 'bill_account')
      .forEach((i) => {
        map[i.source_id] = (map[i.source_id] || 0) + i.value;
      });
    return billAccounts.map((b) => ({ name: b.name, value: map[b.id] || 0 })).filter((b) => b.value > 0);
  }, [currentInstallments, billAccounts]);

  const byCategory = useMemo(() => {
    const map = {};
    currentInstallments.forEach((i) => {
      const cat = CATEGORIES[i.category] || CATEGORIES.outros;
      map[i.category] = map[i.category] || { name: cat.label, value: 0, color: cat.color };
      map[i.category].value += i.value;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [currentInstallments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const monthLabel = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Painel</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{monthLabel}</p>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground text-sm h-9">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas as categorias</SelectItem>
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {byCategory.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Sem despesas este mês"
          description="Adicione despesas para ver seu resumo financeiro aqui."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Gastos por Categoria</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={0}
                  >
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(160, 10%, 9%)',
                      border: '1px solid hsl(160, 6%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(150, 10%, 92%)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {byCategory.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Valores por Categoria</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'hsl(150, 5%, 50%)' }}
                    width={75}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(160, 10%, 9%)',
                      border: '1px solid hsl(160, 6%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(150, 10%, 92%)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Per-source breakdown */}
      {(totalByCard.length > 0 || totalByBillAccount.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {totalByCard.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Por Cartão</h3>
              <div className="space-y-2">
                {totalByCard.map((c) => (
                  <div key={c.name} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{c.name}</span>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {totalByBillAccount.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Por Conta Avulsa</h3>
              <div className="space-y-2">
                {totalByBillAccount.map((b) => (
                  <div key={b.name} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{b.name}</span>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(b.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}