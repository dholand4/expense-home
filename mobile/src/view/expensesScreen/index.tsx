import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { IExpense } from '../../@types/models';
import { categoryBadgeGlobal as CategoryBadge } from '../../components/categoryBadgeGlobal';
import { emptyStateGlobal as EmptyState } from '../../components/emptyStateGlobal';
import { expenseFormGlobal as ExpenseForm } from '../../components/expenseFormGlobal';
import { expenseEditFormGlobal as ExpenseEditForm } from '../../components/expenseEditFormGlobal';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { useCards } from '../../hooks/useCards';
import { useBillAccounts } from '../../hooks/useBillAccounts';
import { useExpenses } from '../../hooks/useExpenses';
import { useInstallmentPayments } from '../../hooks/useInstallmentPayments';
import { useCardInvoicePayments } from '../../hooks/useCardInvoicePayments';
import { CATEGORIES, CATEGORY_LIST, formatCurrency, getInstallments, getMonthKey } from '../../utils/finance';
import { format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ActionRow, BadgeRow, ExpenseAmount, ExpenseDescription, ExpenseItem,
  ExpenseMeta, ExpenseRow, FAB, Header, Safe, SearchBar,
  SmallButton, SmallButtonText, Title,
} from './style';
import styled from 'styled-components/native';

const PAGE_SIZE = 10;

/* ─── Filter Panel Styles ─── */

const FilterToggleBar = styled.TouchableOpacity<{ active: boolean }>`
  flex-direction: row;
  align-items: center;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.sm}px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme, active }) => active ? theme.colors.primary + '18' : theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.border};
  gap: 8px;
`;

const FilterToggleLabel = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
`;

const ActiveBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 99px;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
`;

const ActiveBadgeText = styled.Text`
  font-size: 11px;
  color: white;
  font-weight: 700;
`;

const FilterPanel = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  gap: 16px;
`;

const FilterSection = styled.View`
  gap: 8px;
`;

const FilterSectionLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const ChipRow = styled.ScrollView``;

const Chip = styled.TouchableOpacity<{ active: boolean; color?: string }>`
  padding: 7px 14px;
  border-radius: 99px;
  border-width: 1px;
  border-color: ${({ theme, active, color }) => active ? (color ?? theme.colors.primary) : theme.colors.border};
  background-color: ${({ theme, active, color }) => active ? (color ?? theme.colors.primary) + '22' : theme.colors.surface};
  margin-right: 8px;
`;

const ChipText = styled.Text<{ active: boolean; color?: string }>`
  font-size: 13px;
  color: ${({ theme, active, color }) => active ? (color ?? theme.colors.primary) : theme.colors.textSecondary};
  font-weight: 600;
`;

const MonthRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const MonthArrow = styled.TouchableOpacity`
  padding: 4px;
`;

const MonthChip = styled.View`
  flex: 1;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 99px;
  padding: 7px 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const MonthChipText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  text-transform: capitalize;
`;

const QuickMonthRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ClearButton = styled.TouchableOpacity`
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 99px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.error};
`;

const ClearButtonText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 600;
`;

/* ─── Pagination ─── */

const PaginationRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const PageText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaidBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.success}22;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: 3px ${({ theme }) => theme.spacing.sm}px;
`;

const PaidBadgeText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`;

/* ─── Quick month options ─── */
type QuickMonth = 'all' | 'current' | 'prev';

export function ExpensesScreen({
  hideHeader = false,
  onClose,
  initialCategory,
}: {
  hideHeader?: boolean;
  onClose?: () => void;
  initialCategory?: string | null;
} = {}) {
  const theme = useTheme();
  const { expenses, isLoading, createExpense, updateExpense, removeExpense } = useExpenses();
  const { cards } = useCards();
  const { billAccounts } = useBillAccounts();
  const { payments: allPayments } = useInstallmentPayments();
  const { invoicePayments } = useCardInvoicePayments();

  const [search, setSearch] = useState('');
  const [monthOffset, setMonthOffset] = useState<number | null>(null); // null = todos
  const [quickMonth, setQuickMonth] = useState<QuickMonth>('all');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(initialCategory ?? null);
  const [page, setPage] = useState(0);
  const [panelOpen, setPanelOpen] = useState(Boolean(initialCategory));

  React.useEffect(() => {
    if (initialCategory !== undefined) {
      setCategoryFilter(initialCategory);
      if (initialCategory) {
        setPanelOpen(true);
      }
    }
  }, [initialCategory]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<IExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date();

  // Resolve o mês de filtro baseado no quick ou no offset customizado
  const resolvedDate = useMemo(() => {
    if (quickMonth === 'current') return today;
    if (quickMonth === 'prev') return subMonths(today, 1);
    if (quickMonth === 'all') return null;
    // custom offset
    if (monthOffset === null) return null;
    return monthOffset >= 0 ? addMonths(today, monthOffset) : subMonths(today, -monthOffset);
  }, [quickMonth, monthOffset]);

  const filterMonthKey = resolvedDate ? getMonthKey(resolvedDate) : null;
  const filterMonthLabel = resolvedDate
    ? format(resolvedDate, 'MMMM yyyy', { locale: ptBR })
    : 'Todos os meses';

  const allSources = useMemo(() => [
    ...cards.map(c => ({ id: c.id, name: c.name })),
    ...billAccounts.map(b => ({ id: b.id, name: b.name })),
  ], [cards, billAccounts]);

  const activeFilterCount = [
    filterMonthKey !== null,
    sourceFilter !== null,
    categoryFilter !== null,
  ].filter(Boolean).length;

  const isExpensePaid = (expense: IExpense): boolean => {
    const installments = getInstallments(expense);
    return installments.every(inst =>
      allPayments.some(p => p.expense_id === inst.expense_id && p.installment_number === inst.number),
    );
  };

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (sourceFilter && e.source_id !== sourceFilter) return false;
      if (filterMonthKey) {
        const insts = getInstallments(e);
        if (!insts.some(i => i.month_key === filterMonthKey)) return false;
      }
      return true;
    });
  }, [expenses, search, categoryFilter, sourceFilter, filterMonthKey]);

  const paginated = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page],
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const getSourceName = (sourceType: string, sourceId: string) => {
    if (sourceType === 'card') return cards.find(c => c.id === sourceId)?.name ?? sourceId;
    return billAccounts.find(b => b.id === sourceId)?.name ?? sourceId;
  };

  const clearAll = () => {
    setQuickMonth('all');
    setMonthOffset(null);
    setSourceFilter(null);
    setCategoryFilter(null);
    setPage(0);
  };

  const handleEdit = (expense: IExpense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleDelete = (expense: IExpense) => {
    setConfirmTarget(expense);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await removeExpense(confirmTarget.id);
      setConfirmTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCustomMonthOffset = (delta: number) => {
    setQuickMonth('all'); // sai do modo quick
    setMonthOffset(prev => {
      const base = prev ?? 0;
      return base + delta;
    });
    setPage(0);
  };

  const ContainerComponent = hideHeader ? View : Safe;

  return (
    <ContainerComponent style={hideHeader ? { flex: 1, backgroundColor: theme.colors.background } : undefined}>
      {!hideHeader && (
        <Header>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {onClose && (
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            <Title>{onClose ? 'Todos os Lançamentos' : 'Lançamentos'}</Title>
          </View>
        </Header>
      )}

      <SearchBar
        placeholder="Buscar lançamento..."
        placeholderTextColor={theme.colors.textSecondary}
        value={search}
        onChangeText={t => { setSearch(t); setPage(0); }}
      />

      {/* Botão de toggle do painel */}
      <FilterToggleBar active={activeFilterCount > 0} onPress={() => setPanelOpen(o => !o)}>
        <Ionicons
          name="options-outline"
          size={18}
          color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.textSecondary}
        />
        <FilterToggleLabel>Filtros</FilterToggleLabel>
        {activeFilterCount > 0 && (
          <ActiveBadge>
            <ActiveBadgeText>{activeFilterCount}</ActiveBadgeText>
          </ActiveBadge>
        )}
        <Ionicons
          name={panelOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.textSecondary}
        />
      </FilterToggleBar>

      {/* Painel expansível */}
      {panelOpen && (
        <FilterPanel>

          {/* Mês */}
          <FilterSection>
            <FilterSectionLabel>Período</FilterSectionLabel>
            <QuickMonthRow>
              <Chip active={quickMonth === 'all'} onPress={() => { setQuickMonth('all'); setMonthOffset(null); setPage(0); }}>
                <ChipText active={quickMonth === 'all'}>Todos</ChipText>
              </Chip>
              <Chip active={quickMonth === 'current'} onPress={() => { setQuickMonth('current'); setMonthOffset(null); setPage(0); }}>
                <ChipText active={quickMonth === 'current'}>Este mês</ChipText>
              </Chip>
              <Chip active={quickMonth === 'prev'} onPress={() => { setQuickMonth('prev'); setMonthOffset(null); setPage(0); }}>
                <ChipText active={quickMonth === 'prev'}>Mês anterior</ChipText>
              </Chip>
            </QuickMonthRow>
            <MonthRow>
              <MonthArrow onPress={() => handleCustomMonthOffset(-1)}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
              </MonthArrow>
              <MonthChip>
                <MonthChipText>{filterMonthLabel}</MonthChipText>
              </MonthChip>
              <MonthArrow onPress={() => handleCustomMonthOffset(1)}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
              </MonthArrow>
            </MonthRow>
          </FilterSection>

          {/* Fonte */}
          <FilterSection>
            <FilterSectionLabel>Fonte</FilterSectionLabel>
            <ChipRow horizontal showsHorizontalScrollIndicator={false}>
              <Chip active={!sourceFilter} onPress={() => { setSourceFilter(null); setPage(0); }}>
                <ChipText active={!sourceFilter}>Todas</ChipText>
              </Chip>
              {allSources.map(src => (
                <Chip key={src.id} active={sourceFilter === src.id} onPress={() => { setSourceFilter(sourceFilter === src.id ? null : src.id); setPage(0); }}>
                  <ChipText active={sourceFilter === src.id}>{src.name}</ChipText>
                </Chip>
              ))}
            </ChipRow>
          </FilterSection>

          {/* Categoria */}
          <FilterSection>
            <FilterSectionLabel>Categoria</FilterSectionLabel>
            <ChipRow horizontal showsHorizontalScrollIndicator={false}>
              <Chip active={!categoryFilter} onPress={() => { setCategoryFilter(null); setPage(0); }}>
                <ChipText active={!categoryFilter}>Todas</ChipText>
              </Chip>
              {CATEGORY_LIST.map(cat => (
                <Chip key={cat} active={categoryFilter === cat} onPress={() => { setCategoryFilter(categoryFilter === cat ? null : cat); setPage(0); }}>
                  <ChipText active={categoryFilter === cat}>{CATEGORIES[cat]?.label ?? cat}</ChipText>
                </Chip>
              ))}
            </ChipRow>
          </FilterSection>

          {/* Limpar */}
          {activeFilterCount > 0 && (
            <ClearButton onPress={clearAll}>
              <ClearButtonText>Limpar filtros</ClearButtonText>
            </ClearButton>
          )}
        </FilterPanel>
      )}

      <FlatList
        data={paginated}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="receipt-outline" title="Nenhum lançamento" description="Toque no + para adicionar" />
          ) : null
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <PaginationRow>
              <TouchableOpacity onPress={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <Ionicons name="chevron-back" size={20} color={page === 0 ? theme.colors.border : theme.colors.text} />
              </TouchableOpacity>
              <PageText>Página {page + 1} de {totalPages}</PageText>
              <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <Ionicons name="chevron-forward" size={20} color={page >= totalPages - 1 ? theme.colors.border : theme.colors.text} />
              </TouchableOpacity>
            </PaginationRow>
          ) : <View style={{ height: 80 }} />
        }
        renderItem={({ item }) => {
          const paid = isExpensePaid(item);
          return (
            <ExpenseItem>
              <ExpenseRow>
                <ExpenseDescription numberOfLines={1}>{item.description}</ExpenseDescription>
                <ExpenseAmount>{formatCurrency(item.total_amount)}</ExpenseAmount>
              </ExpenseRow>
              <ExpenseMeta>
                {getSourceName(item.source_type, item.source_id)} ·{' '}
                {item.installments > 1
                  ? `${item.installments}x (${formatCurrency(item.total_amount / item.installments)})`
                  : item.payment_type === 'avista' ? 'À vista' : 'Recorrente'}
              </ExpenseMeta>
              <BadgeRow>
                <CategoryBadge category={item.category} />
                {paid && <PaidBadge><PaidBadgeText>✓ Quitada</PaidBadgeText></PaidBadge>}
              </BadgeRow>
              <ActionRow>
                <Pressable onPress={() => handleEdit(item)}>
                  <SmallButton>
                    <SmallButtonText>Editar</SmallButtonText>
                  </SmallButton>
                </Pressable>
                <Pressable onPress={() => handleDelete(item)}>
                  <SmallButton variant="danger">
                    <SmallButtonText variant="danger">Excluir</SmallButtonText>
                  </SmallButton>
                </Pressable>
              </ActionRow>
            </ExpenseItem>
          );
        }}
      />

      <FAB onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={28} color={theme.colors.text} />
      </FAB>

      <ExpenseForm
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => { await createExpense(data); setShowCreateModal(false); }}
        cards={cards}
        billAccounts={billAccounts}
        expenses={expenses}
        installmentPayments={allPayments}
        invoicePayments={invoicePayments}
      />

      <ExpenseEditForm
        visible={showEditModal}
        expense={selectedExpense}
        onClose={() => { setShowEditModal(false); setSelectedExpense(null); }}
        onSubmit={async (id, data) => { await updateExpense({ id, data }); }}
      />

      <ConfirmModal
        visible={!!confirmTarget}
        title={`Excluir "${confirmTarget?.description ?? ''}"`}
        message="Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={isDeleting}
      />
      </ContainerComponent>
  );
}
