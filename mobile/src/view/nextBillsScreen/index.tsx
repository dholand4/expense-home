import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ICard, IInstallment } from '../../@types/models';
import { categoryBadgeGlobal as CategoryBadge } from '../../components/categoryBadgeGlobal';
import { emptyStateGlobal as EmptyState } from '../../components/emptyStateGlobal';
import { paymentModalGlobal as PaymentModal } from '../../components/paymentModalGlobal';
import { cardInvoiceModalGlobal as CardInvoiceModal } from '../../components/cardInvoiceModalGlobal';
import { useCards } from '../../hooks/useCards';
import { useBillAccounts } from '../../hooks/useBillAccounts';
import { useExpenses } from '../../hooks/useExpenses';
import { useInstallmentPayments } from '../../hooks/useInstallmentPayments';
import { useCardInvoicePayments } from '../../hooks/useCardInvoicePayments';
import { formatCurrency, formatMonth, getInstallments, getMonthKey } from '../../utils/finance';
import { addMonths, subMonths } from 'date-fns';
import {
  Header, MonthLabel, MonthNav,
  PaidBadge, PaidBadgeText, StatusBadge,
  PayButton, PayButtonText, Safe,
  SectionTitle,
  SourceSummaryCard, SourceSummaryName, SourceSummaryRow,
  SourceSummaryAmount, SourceSummaryStatus,
  SourceHeader, SourceExpandedContent,
  InstallmentRow, InstallmentDesc, InstallmentValue,
  ShowMoreBtn, ShowMoreBtnText,
  SummaryBar, SummaryChip, SummaryChipLabel, SummaryChipValue,
  Title, ToggleRow, ToggleText,
} from './style';

const ITEMS_LIMIT = 3;

export function NextBillsScreen() {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [showAllItems, setShowAllItems] = useState<Record<string, boolean>>({});
  const [paymentInstallment, setPaymentInstallment] = useState<IInstallment | null>(null);
  const [invoiceCard, setInvoiceCard] = useState<ICard | null>(null);

  const { expenses } = useExpenses();
  const { cards } = useCards();
  const { billAccounts } = useBillAccounts();
  const { payments, createPayment, removePayment } = useInstallmentPayments();
  const { invoicePayments, createInvoicePayment, removeInvoicePayment } = useCardInvoicePayments();

  const monthKey = getMonthKey(currentDate);

  const monthPayments = useMemo(
    () => payments.filter((p) => p.month_key === monthKey),
    [payments, monthKey],
  );

  const monthInstallments = useMemo(
    () => expenses.flatMap(getInstallments).filter((i) => i.month_key === monthKey),
    [expenses, monthKey],
  );

  const isBillInstallmentPaid = (expenseId: string, number: number) =>
    monthPayments.some((p) => p.expense_id === expenseId && p.installment_number === number);

  const toggleExpand = (id: string) =>
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleShowAll = (id: string) =>
    setShowAllItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const sourceSummaries = useMemo(() => {
    const result: Array<{
      id: string; name: string; type: 'card' | 'bill_account';
      total: number; installments: IInstallment[];
      existingInvoice?: ReturnType<typeof invoicePayments.find>;
      card?: ICard;
      paidCount?: number; allPaid?: boolean;
    }> = [];

    for (const card of cards) {
      const items = monthInstallments.filter((i) => i.source_type === 'card' && i.source_id === card.id);
      if (items.length === 0) continue;
      result.push({
        id: card.id, name: card.name, type: 'card',
        total: items.reduce((s, i) => s + i.value, 0),
        installments: items,
        existingInvoice: invoicePayments.find((p) => p.card_id === card.id && p.month_key === monthKey) ?? undefined,
        card,
      });
    }

    for (const bill of billAccounts) {
      const items = monthInstallments.filter((i) => i.source_type === 'bill_account' && i.source_id === bill.id);
      if (items.length === 0) continue;
      const paidCount = items.filter((i) => isBillInstallmentPaid(i.expense_id, i.number)).length;
      result.push({
        id: bill.id, name: bill.name, type: 'bill_account',
        total: items.reduce((s, i) => s + i.value, 0),
        installments: items,
        paidCount,
        allPaid: paidCount === items.length,
      });
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, billAccounts, monthInstallments, invoicePayments, monthPayments, monthKey]);

  const visibleSources = useMemo(() => {
    if (!unpaidOnly) return sourceSummaries;
    return sourceSummaries.filter((s) =>
      s.type === 'card' ? !s.existingInvoice : !s.allPaid,
    );
  }, [sourceSummaries, unpaidOnly]);

  const total = useMemo(() => monthInstallments.reduce((s, i) => s + i.value, 0), [monthInstallments]);
  const totalPaid = useMemo(() =>
    sourceSummaries.reduce((sum, s) => {
      if (s.type === 'card') return s.existingInvoice ? sum + s.total : sum;
      return sum + s.installments.filter((i) => isBillInstallmentPaid(i.expense_id, i.number)).reduce((a, i) => a + i.value, 0);
    }, 0),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [sourceSummaries, monthPayments, invoicePayments]);

  const handleToggleBillPaid = async (installment: IInstallment) => {
    const existing = monthPayments.find(
      (p) => p.expense_id === installment.expense_id && p.installment_number === installment.number,
    );
    try {
      if (existing) {
        await removePayment(existing.id);
      } else {
        setPaymentInstallment(installment);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o pagamento.');
    }
  };

  const handlePaymentConfirm = async (installment: IInstallment, paidAmount: number) => {
    await createPayment({
      expense_id: installment.expense_id,
      installment_number: installment.number,
      paid_amount: paidAmount,
      paid_date: new Date().toISOString().split('T')[0],
      month_key: monthKey,
    });
    setPaymentInstallment(null);
  };

  const handlePayAllBill = async (installments: IInstallment[], allPaid: boolean) => {
    try {
      if (allPaid) {
        for (const inst of installments) {
          const existing = monthPayments.find((p) => p.expense_id === inst.expense_id && p.installment_number === inst.number);
          if (existing) await removePayment(existing.id);
        }
      } else {
        for (const inst of installments) {
          if (!isBillInstallmentPaid(inst.expense_id, inst.number)) {
            await createPayment({
              expense_id: inst.expense_id,
              installment_number: inst.number,
              paid_amount: inst.value,
              paid_date: new Date().toISOString().split('T')[0],
              month_key: monthKey,
            });
          }
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar os pagamentos.');
    }
  };

  const cardForModal = invoiceCard
    ? sourceSummaries.find((s) => s.type === 'card' && s.card?.id === invoiceCard.id)
    : null;

  return (
    <Safe>
      <Header>
        <Title>Próximas Faturas</Title>
      </Header>

      <MonthNav>
        <TouchableOpacity onPress={() => setCurrentDate((d) => subMonths(d, 1))}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentDate(new Date())}>
          <MonthLabel>{formatMonth(currentDate)}</MonthLabel>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentDate((d) => addMonths(d, 1))}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </MonthNav>

      <SummaryBar>
        <SummaryChip>
          <SummaryChipLabel>Total</SummaryChipLabel>
          <SummaryChipValue>{formatCurrency(total)}</SummaryChipValue>
        </SummaryChip>
        <SummaryChip color={theme.colors.success + '22'}>
          <SummaryChipLabel>Pago</SummaryChipLabel>
          <SummaryChipValue>{formatCurrency(totalPaid)}</SummaryChipValue>
        </SummaryChip>
        <SummaryChip color={theme.colors.warning + '22'}>
          <SummaryChipLabel>Pendente</SummaryChipLabel>
          <SummaryChipValue>{formatCurrency(total - totalPaid)}</SummaryChipValue>
        </SummaryChip>
      </SummaryBar>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ToggleRow active={unpaidOnly} onPress={() => setUnpaidOnly((v) => !v)}>
          <Ionicons
            name={unpaidOnly ? 'checkbox' : 'square-outline'}
            size={18}
            color={unpaidOnly ? theme.colors.primary : theme.colors.textSecondary}
          />
          <ToggleText active={unpaidOnly}>Mostrar apenas pendentes</ToggleText>
        </ToggleRow>

        {visibleSources.length === 0 && (
          <EmptyState icon="calendar-outline" title="Nenhuma fatura" description="Sem lançamentos neste mês" />
        )}

        {visibleSources.map((src) => {
          const expanded = expandedSources.has(src.id);
          const showAll = showAllItems[src.id] ?? false;
          const displayedItems = showAll ? src.installments : src.installments.slice(0, ITEMS_LIMIT);
          const hasMore = src.installments.length > ITEMS_LIMIT;

          if (src.type === 'card') {
            const invoicePaid = !!src.existingInvoice;
            return (
              <SourceSummaryCard key={src.id}>
                <SourceHeader onPress={() => toggleExpand(src.id)}>
                  <SourceSummaryName>{src.name}</SourceSummaryName>
                  <SourceSummaryAmount>{formatCurrency(src.total)}</SourceSummaryAmount>
                  <SourceSummaryStatus paid={invoicePaid}>
                    {invoicePaid ? '✓ Paga' : 'Pendente'}
                  </SourceSummaryStatus>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.colors.textSecondary}
                    style={{ marginLeft: 4 }}
                  />
                </SourceHeader>

                {expanded && (
                  <SourceExpandedContent>
                    {displayedItems.map((item) => (
                      <InstallmentRow key={`${item.expense_id}-${item.number}`}>
                        <InstallmentDesc numberOfLines={1}>{item.description}</InstallmentDesc>
                        <InstallmentValue>{formatCurrency(item.value)}</InstallmentValue>
                        <StatusBadge paid={invoicePaid}>
                          <PaidBadgeText paid={invoicePaid}>
                            {invoicePaid ? '✓ Pago' : 'Pendente'}
                          </PaidBadgeText>
                        </StatusBadge>
                      </InstallmentRow>
                    ))}
                    {hasMore && (
                      <ShowMoreBtn onPress={() => toggleShowAll(src.id)}>
                        <ShowMoreBtnText>
                          {showAll
                            ? 'Ver menos'
                            : `Ver mais ${src.installments.length - ITEMS_LIMIT} itens`}
                        </ShowMoreBtnText>
                      </ShowMoreBtn>
                    )}
                    <PayButton onPress={() => src.card && setInvoiceCard(src.card)} style={{ marginTop: 8 }}>
                      <PayButtonText>
                        {invoicePaid
                          ? 'Ver / Desfazer pagamento'
                          : `Pagar fatura (${formatCurrency(src.total)})`}
                      </PayButtonText>
                    </PayButton>
                  </SourceExpandedContent>
                )}
              </SourceSummaryCard>
            );
          }

          // bill account
          const allPaid = src.allPaid ?? false;
          const paidCount = src.paidCount ?? 0;
          return (
            <SourceSummaryCard key={src.id}>
              <SourceHeader onPress={() => toggleExpand(src.id)}>
                <SourceSummaryName>{src.name}</SourceSummaryName>
                <SourceSummaryAmount>{formatCurrency(src.total)}</SourceSummaryAmount>
                <SourceSummaryStatus paid={allPaid}>
                  {allPaid ? '✓ Pago' : `${paidCount}/${src.installments.length} pagos`}
                </SourceSummaryStatus>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </SourceHeader>

              {expanded && (
                <SourceExpandedContent>
                  {displayedItems.map((item) => {
                    const paid = isBillInstallmentPaid(item.expense_id, item.number);
                    return (
                      <InstallmentRow key={`${item.expense_id}-${item.number}`}>
                        <InstallmentDesc numberOfLines={1}>{item.description}</InstallmentDesc>
                        <InstallmentValue>{formatCurrency(item.value)}</InstallmentValue>
                        <PaidBadge paid={paid} onPress={() => handleToggleBillPaid(item)}>
                          <PaidBadgeText paid={paid}>{paid ? '✓ Pago' : 'Pagar'}</PaidBadgeText>
                        </PaidBadge>
                      </InstallmentRow>
                    );
                  })}
                  {hasMore && (
                    <ShowMoreBtn onPress={() => toggleShowAll(src.id)}>
                      <ShowMoreBtnText>
                        {showAll
                          ? 'Ver menos'
                          : `Ver mais ${src.installments.length - ITEMS_LIMIT} itens`}
                      </ShowMoreBtnText>
                    </ShowMoreBtn>
                  )}
                  <PayButton onPress={() => handlePayAllBill(src.installments, allPaid)} style={{ marginTop: 8 }}>
                    <PayButtonText>{allPaid ? 'Desfazer todos' : 'Pagar todos'}</PayButtonText>
                  </PayButton>
                </SourceExpandedContent>
              )}
            </SourceSummaryCard>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>

      <PaymentModal
        visible={!!paymentInstallment}
        installment={paymentInstallment}
        onClose={() => setPaymentInstallment(null)}
        onConfirm={handlePaymentConfirm}
      />

      <CardInvoiceModal
        visible={!!invoiceCard}
        card={invoiceCard}
        totalAmount={cardForModal?.total ?? 0}
        existingPayment={invoiceCard
          ? (invoicePayments.find((p) => p.card_id === invoiceCard.id && p.month_key === monthKey) ?? null)
          : null}
        monthKey={monthKey}
        onClose={() => setInvoiceCard(null)}
        onCreate={createInvoicePayment}
        onRemove={removeInvoicePayment}
      />
    </Safe>
  );
}
