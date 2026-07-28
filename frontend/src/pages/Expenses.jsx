import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Pencil, Receipt, Filter, Search, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseEditForm from '../components/ExpenseEditForm';
import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';
import { listCards } from '../services/cardService';
import { listBillAccounts } from '../services/billAccountService';
import { listExpenses, deleteExpense } from '../services/expenseService';
import { listAllPayments } from '../services/installmentPaymentService';
import { listCardInvoicePayments } from '../services/cardInvoicePaymentService';
import { CATEGORIES, formatCurrency, getInstallmentValue, getMonthKey } from '../utils/finance';
import { format, parseISO, addMonths } from 'date-fns';

export default function Expenses() {
  const [cards, setCards] = useState([]);
  const [billAccounts, setBillAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPayments, setAllPayments] = useState([]);
  const [cardInvoicePayments, setCardInvoicePayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = async () => {
    const [c, b, e, ap, cip] = await Promise.all([listCards(), listBillAccounts(), listExpenses(), listAllPayments(), listCardInvoicePayments()]);
    setCards(c);
    setBillAccounts(b);
    setExpenses(e);
    setAllPayments(ap);
    setCardInvoicePayments(cip);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sourceName = (expense) => {
    if (expense.source_type === 'card') {
      return cards.find((c) => c.id === expense.source_id)?.name || 'Cartão removido';
    }
    return billAccounts.find((b) => b.id === expense.source_id)?.name || 'Conta removida';
  };

  const availableMonths = useMemo(() => {
    const months = new Set();
    expenses.forEach((e) => {
      for (let i = 0; i < e.installments; i++) {
        months.add(getMonthKey(addMonths(parseISO(e.first_charge_date), i)));
      }
    });
    return Array.from(months).sort();
  }, [expenses]);

  const allSources = useMemo(() => [
    ...cards.map((c) => ({ key: `card::${c.id}`, label: `💳 ${c.name}` })),
    ...billAccounts.map((b) => ({ key: `bill_account::${b.id}`, label: `📄 ${b.name}` })),
  ], [cards, billAccounts]);

  const isFullyPaid = (expense) => {
    if (expense.payment_type === 'recorrente') return false;
    const expPayments = allPayments.filter(p => p.expense_id === expense.id);
    if (expense.installments === 1) return expPayments.length > 0;
    const paidNumbers = new Set(expPayments.map(p => Number(p.installment_number)));
    for (let i = 1; i <= expense.installments; i++) {
      if (!paidNumbers.has(i)) return false;
    }
    return true;
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filterMonth !== 'all') {
        const start = parseISO(e.first_charge_date);
        const months = Array.from({ length: e.installments }, (_, i) => getMonthKey(addMonths(start, i)));
        if (!months.includes(filterMonth)) return false;
      }
      if (filterSource !== 'all') {
        const [type, id] = filterSource.split('::');
        if (e.source_type !== type || e.source_id !== id) return false;
      }
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (filterSearch && !e.description.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      return true;
    });
  }, [expenses, filterMonth, filterSource, filterCategory, filterSearch, allPayments]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useMemo(() => setPage(1), [filterMonth, filterSource, filterCategory, filterSearch]);

  const handleDelete = async (id) => {
    await deleteExpense(id);
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Lançamentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{expenses.length} despesa(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Despesa</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="pl-9 bg-secondary border-border text-foreground h-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-foreground text-sm h-9">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os meses</SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground text-sm h-9">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas as fontes</SelectItem>
            {allSources.map((s) => (
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-foreground text-sm h-9">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Expense List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma despesa encontrada"
          description="Adicione sua primeira despesa ou ajuste os filtros."
        />
      ) : (
        <div className="space-y-2">
          {paginated.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm truncate">{expense.description}</span>
                  <CategoryBadge category={expense.category} />
                  {isFullyPaid(expense) && (
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Quitada
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{expense.source_type === 'card' ? '💳' : '📄'} {sourceName(expense)}</span>
                  <span>·</span>
                  <span>
                    {expense.installments > 1
                      ? `${expense.installments}x de ${formatCurrency(getInstallmentValue(expense.total_amount, expense.installments))}`
                      : 'À vista'}
                  </span>
                  <span>·</span>
                  <span>{format(parseISO(expense.first_charge_date), 'dd/MM/yyyy')}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground whitespace-nowrap">
                {formatCurrency(expense.total_amount)}
              </span>
              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8"
                onClick={() => setEditingExpense(expense)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {/* Delete with confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">Excluir despesa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir "{expense.description}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary border-border text-foreground">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(expense.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-9 px-4 text-sm"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-9 px-4 text-sm"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      <ExpenseForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={load}
        cards={cards}
        billAccounts={billAccounts}
        allExpenses={expenses}
        allPayments={allPayments}
        cardInvoicePayments={cardInvoicePayments}
      />
      <ExpenseEditForm
        expense={editingExpense}
        open={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        onSuccess={load}
        cards={cards}
        billAccounts={billAccounts}
      />
    </div>
  );
}