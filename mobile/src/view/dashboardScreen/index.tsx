import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { addMonths, subMonths } from 'date-fns';
import { useTheme } from 'styled-components/native';
import { useCards } from '../../hooks/useCards';
import { useBillAccounts } from '../../hooks/useBillAccounts';
import { useExpenses } from '../../hooks/useExpenses';
import { useInstallmentPayments } from '../../hooks/useInstallmentPayments';
import { useCardInvoicePayments } from '../../hooks/useCardInvoicePayments';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, formatCurrency, formatMonth, getInstallments, getMonthKey } from '../../utils/finance';
import { useProfile } from '../../providers/profileProvider';
import { ExpensesScreen } from '../expensesScreen';
import { CategoryPieChart } from './CategoryPieChart';
import { expenseFormGlobal as ExpenseForm } from '../../components/expenseFormGlobal';
import { expenseEditFormGlobal as ExpenseEditForm } from '../../components/expenseEditFormGlobal';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { IExpense } from '../../@types/models';
import {
  AvatarButton, AvatarInitial, CategoryCard,
  Container, EmptyExpensesCard, EmptyExpensesText,
  ExpenseCategoryIndicator, ExpenseItemAmount, ExpenseItemCard,
  ExpenseItemInfo, ExpenseItemMeta, ExpenseItemTitle, ExpenseMetaBadge,
  ExpenseMetaText, ExpensesSection, FAB, GreetingBlock, GreetingLabel,
  GreetingName, Header, MonthLabel, MonthNav, Safe,
  SectionLabel, SectionRow, SeeAll,
  SourceAmount, SourceName, SourceRow, SourcesSection,
  TotalCard, TotalLabel, TotalValue, TrendRow, TrendText,
} from './style';

export function DashboardScreen() {
  const theme = useTheme();
  const { openProfile } = useProfile();
  const { user } = useAuth();
  const { expenses, isLoading, createExpense, updateExpense, removeExpense } = useExpenses();
  const { cards } = useCards();
  const { billAccounts } = useBillAccounts();
  const { payments: allPayments } = useInstallmentPayments();
  const { invoicePayments } = useCardInvoicePayments();

  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<IExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date();
  const selectedDate =
    monthOffset === 0 ? today
    : monthOffset > 0 ? addMonths(today, monthOffset)
    : subMonths(today, -monthOffset);
  const currentMonthKey = getMonthKey(selectedDate);
  const prevMonthKey = getMonthKey(subMonths(selectedDate, 1));

  const firstName = user?.full_name?.split(' ')[0] ?? 'Você';
  const initial = firstName[0]?.toUpperCase() ?? '?';

  const allInstallments = useMemo(
    () => expenses.flatMap(getInstallments),
    [expenses],
  );

  const currentInstallments = useMemo(
    () => allInstallments.filter(i => i.month_key === currentMonthKey),
    [allInstallments, currentMonthKey],
  );

  const prevInstallments = useMemo(
    () => allInstallments.filter(i => i.month_key === prevMonthKey),
    [allInstallments, prevMonthKey],
  );

  const totalMonth = useMemo(
    () => currentInstallments.reduce((sum, i) => sum + i.value, 0),
    [currentInstallments],
  );

  const totalPrevMonth = useMemo(
    () => prevInstallments.reduce((sum, i) => sum + i.value, 0),
    [prevInstallments],
  );

  const trendPercent = useMemo(() => {
    if (totalPrevMonth === 0) return null;
    return ((totalMonth - totalPrevMonth) / totalPrevMonth) * 100;
  }, [totalMonth, totalPrevMonth]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    currentInstallments.forEach(i => {
      map[i.category] = (map[i.category] ?? 0) + i.value;
    });
    return Object.entries(map)
      .map(([key, amount]) => ({
        name: CATEGORIES[key]?.label ?? key,
        key,
        amount,
        color: CATEGORIES[key]?.color ?? '#94A3B8',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentInstallments]);

  const top5Keys = useMemo(
    () => new Set(byCategory.slice(0, 5).map(c => c.key)),
    [byCategory]
  );

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    if (selectedCategory === '__outros_agrupados__') return 'Outros';
    return CATEGORIES[selectedCategory]?.label ?? 'Outros';
  }, [selectedCategory]);

  const cardTotals = useMemo(() =>
    cards.map(card => ({
      id: card.id,
      name: card.name,
      amount: currentInstallments
        .filter(i => i.source_type === 'card' && i.source_id === card.id)
        .reduce((s, i) => s + i.value, 0),
    })).filter(s => s.amount > 0),
    [cards, currentInstallments],
  );

  const monthExpensesList = useMemo(() => {
    let list = currentInstallments;
    if (selectedCategory) {
      if (
        selectedCategory === '__outros_agrupados__' ||
        (selectedCategory === 'outros' && byCategory.length > 5)
      ) {
        list = list.filter(i => !top5Keys.has(i.category) || i.category === 'outros');
      } else {
        list = list.filter(i => i.category === selectedCategory);
      }
    }
    return [...list]
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }, [currentInstallments, selectedCategory, top5Keys, byCategory]);

  if (isLoading) {
    return (
      <Safe>
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      </Safe>
    );
  }

  const isPositiveTrend = trendPercent !== null && trendPercent < 0;

  return (
    <Safe>
      <Header>
        <GreetingBlock>
          <GreetingLabel>Olá,</GreetingLabel>
          <GreetingName>{firstName}</GreetingName>
        </GreetingBlock>
        <AvatarButton onPress={openProfile} activeOpacity={0.8}>
          <AvatarInitial>{initial}</AvatarInitial>
        </AvatarButton>
      </Header>

      <View style={{ flex: 1 }}>
        <Container showsVerticalScrollIndicator={false}>
          <MonthNav>
            <TouchableOpacity onPress={() => { setMonthOffset(o => o - 1); setSelectedCategory(null); }}>
              <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMonthOffset(0); setSelectedCategory(null); }}>
              <MonthLabel>{formatMonth(selectedDate)}</MonthLabel>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMonthOffset(o => o + 1); setSelectedCategory(null); }}>
              <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </MonthNav>

          <TotalCard>
            <TotalLabel>Gastos do mês</TotalLabel>
            <TotalValue>{formatCurrency(totalMonth)}</TotalValue>
            {trendPercent !== null && (
              <TrendRow>
                <Ionicons
                  name={isPositiveTrend ? 'arrow-down' : 'arrow-up'}
                  size={13}
                  color={isPositiveTrend ? theme.colors.success : theme.colors.error}
                />
                <TrendText positive={isPositiveTrend}>
                  {Math.abs(trendPercent).toFixed(0)}%{' '}
                  {isPositiveTrend ? 'abaixo do mês passado' : 'acima do mês passado'}
                </TrendText>
              </TrendRow>
            )}
          </TotalCard>

          {byCategory.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <SectionRow>
                <SectionLabel>Gastos por categoria</SectionLabel>
              </SectionRow>
              <CategoryCard>
                <CategoryPieChart
                  categories={byCategory}
                  total={totalMonth}
                  selectedCategoryKey={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </CategoryCard>
            </View>
          )}

          {cardTotals.length > 0 && (
            <SourcesSection>
              <SectionRow>
                <SectionLabel>Por cartão</SectionLabel>
              </SectionRow>
              {cardTotals.map(s => (
                <SourceRow key={s.id}>
                  <SourceName>{s.name}</SourceName>
                  <SourceAmount>{formatCurrency(s.amount)}</SourceAmount>
                </SourceRow>
              ))}
            </SourcesSection>
          )}

          <ExpensesSection>
            <SectionRow>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <SectionLabel>Lançamentos</SectionLabel>
                {selectedCategory && (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.colors.primary + '20',
                      paddingVertical: 3,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      gap: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.primary }}>
                      {selectedCategoryName}
                    </Text>
                    <Ionicons name="close-circle" size={14} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowAllModal(true)} activeOpacity={0.7}>
                <SeeAll>Ver todos</SeeAll>
              </TouchableOpacity>
            </SectionRow>

            {monthExpensesList.length === 0 ? (
              <EmptyExpensesCard>
                <Ionicons name="receipt-outline" size={28} color={theme.colors.textSecondary} />
                <EmptyExpensesText>
                  {selectedCategory
                    ? `Nenhum lançamento em "${selectedCategoryName}"`
                    : 'Nenhum gasto lançado neste mês'}
                </EmptyExpensesText>
                {selectedCategory && (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    style={{
                      marginTop: 10,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: theme.colors.primary + '20',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>
                      Limpar filtro
                    </Text>
                  </TouchableOpacity>
                )}
              </EmptyExpensesCard>
            ) : (
              monthExpensesList.map((item, index) => {
                const catInfo = CATEGORIES[item.category];
                const catColor = catInfo?.color ?? theme.colors.primary;
                const catLabel = catInfo?.label ?? item.category;
                const isInstallment = item.total > 1;
                const installmentLabel = isInstallment
                  ? `Parcela ${item.number}/${item.total}`
                  : item.payment_type === 'recorrente'
                  ? 'Recorrente'
                  : 'À vista';
                const sourceName = item.source_type === 'card'
                  ? (cards.find(c => c.id === item.source_id)?.name ?? 'Cartão')
                  : (billAccounts.find(b => b.id === item.source_id)?.name ?? 'Conta');

                return (
                  <ExpenseItemCard
                    key={`${item.expense_id}-${item.number}-${index}`}
                    onPress={() => {
                      const exp = expenses.find(e => e.id === item.expense_id);
                      if (exp) setSelectedExpense(exp);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <ExpenseCategoryIndicator color={catColor} />
                      <ExpenseItemInfo>
                        <ExpenseItemTitle numberOfLines={1}>{item.description}</ExpenseItemTitle>
                        <ExpenseItemMeta>
                          <ExpenseMetaBadge>
                            <ExpenseMetaText>{installmentLabel}</ExpenseMetaText>
                          </ExpenseMetaBadge>
                          <ExpenseMetaBadge>
                            <ExpenseMetaText>{catLabel}</ExpenseMetaText>
                          </ExpenseMetaBadge>
                          <ExpenseMetaBadge>
                            <ExpenseMetaText>{sourceName}</ExpenseMetaText>
                          </ExpenseMetaBadge>
                        </ExpenseItemMeta>
                      </ExpenseItemInfo>
                    </View>
                    <ExpenseItemAmount>{formatCurrency(item.value)}</ExpenseItemAmount>
                  </ExpenseItemCard>
                );
              })
            )}
          </ExpensesSection>

          <View style={{ height: 80 }} />
        </Container>

        <FAB onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </FAB>
      </View>

      <ExpenseForm
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createExpense(data);
          setShowCreateModal(false);
        }}
        cards={cards}
        billAccounts={billAccounts}
        expenses={expenses}
        installmentPayments={allPayments}
        invoicePayments={invoicePayments}
      />

      <ExpenseEditForm
        visible={!!selectedExpense}
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onSubmit={async (id, data) => {
          await updateExpense({ id, data });
          setSelectedExpense(null);
        }}
      />

      <ConfirmModal
        visible={!!confirmTarget}
        title={`Excluir "${confirmTarget?.description ?? ''}"`}
        message="Esta ação não pode ser desfeita."
        onConfirm={async () => {
          if (!confirmTarget) return;
          setIsDeleting(true);
          try {
            await removeExpense(confirmTarget.id);
            setConfirmTarget(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => setConfirmTarget(null)}
        loading={isDeleting}
      />

      <Modal
        visible={showAllModal}
        animationType="slide"
        onRequestClose={() => setShowAllModal(false)}
      >
        <ExpensesScreen
          onClose={() => setShowAllModal(false)}
          initialCategory={selectedCategory === '__outros_agrupados__' ? null : selectedCategory}
        />
      </Modal>
    </Safe>
  );
}
