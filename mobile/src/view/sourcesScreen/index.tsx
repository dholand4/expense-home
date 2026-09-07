import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { ICard, IBillAccount } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { cardEditFormGlobal as CardEditForm } from '../../components/cardEditFormGlobal';
import { billAccountEditFormGlobal as BillAccountEditForm } from '../../components/billAccountEditFormGlobal';
import { emptyStateGlobal as EmptyState } from '../../components/emptyStateGlobal';
import { FluidModalGlobal } from '../../components/fluidModalGlobal';
import { useCards } from '../../hooks/useCards';
import { useBillAccounts } from '../../hooks/useBillAccounts';
import { useExpenses } from '../../hooks/useExpenses';
import { useInstallmentPayments } from '../../hooks/useInstallmentPayments';
import { useCardInvoicePayments } from '../../hooks/useCardInvoicePayments';
import { useIncomes } from '../../hooks/useIncomes';
import { calcCardAvailableLimit, formatCurrency } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import {
  ActionPill,
  ActionPillText,
  ActionPillsRow,
  AvailableAmount,
  BackButton,
  BackButtonText,
  BillCard,
  BillDescription,
  BillFooter,
  BillIconBox,
  BillInfo,
  BillName,
  BillTopRow,
  CardBankArea,
  CardBankIconBox,
  CardBankName,
  CardChip,
  CardChipInner,
  CardChipRow,
  CardFooter,
  CardLimitArea,
  CardLimitRow,
  CardNumberSim,
  CardTopRow,
  Container,
  DueDateBadge,
  DueDateText,
  FAB,
  FilterPill,
  FilterPillText,
  FilterScroll,
  Header,
  HubContainer,
  MetricItem,
  MetricLabel,
  MetricValue,
  OverviewBadge,
  OverviewBadgeText,
  OverviewCard,
  OverviewHeader,
  OverviewMainAmount,
  OverviewMainLabel,
  OverviewMetricsRow,
  OverviewTitle,
  ProgressBar,
  ProgressFill,
  Safe,
  SectionTitle,
  SelectionBadge,
  SelectionBadgeRow,
  SelectionBadgeText,
  SelectionCard,
  SelectionDesc,
  SelectionIconBox,
  SelectionInfo,
  SelectionTitle,
  SmartCard,
  SpeedDial,
  SpeedDialButton,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialLabelText,
  Subtitle,
  Title,
  TotalLimitText,
} from './style';
import { RevenuesView } from './RevenuesView';

const cardSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  credit_limit: z.string().min(1, 'Obrigatório'),
  due_day: z.string().min(1, 'Obrigatório'),
});

const billSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  description: z.string().optional(),
  due_day: z.string().optional(),
});

type ICardForm = z.infer<typeof cardSchema>;
type IBillForm = z.infer<typeof billSchema>;

function getCardBrandColor(name: string): { bg: string; accent: string } {
  const lower = name.toLowerCase();
  if (lower.includes('nu')) return { bg: '#820ad133', accent: '#9b3ee8' };
  if (lower.includes('itau') || lower.includes('itaú')) return { bg: '#ec700033', accent: '#ec7000' };
  if (lower.includes('inter')) return { bg: '#ff7a0033', accent: '#ff7a00' };
  if (lower.includes('brad')) return { bg: '#cc092f33', accent: '#cc092f' };
  if (lower.includes('santander')) return { bg: '#ea1d2533', accent: '#ea1d25' };
  if (lower.includes('xp')) return { bg: '#d4af3733', accent: '#d4af37' };
  if (lower.includes('c6')) return { bg: '#2b2b2b', accent: '#e0e0e0' };
  return { bg: '#25a77c26', accent: '#25a77c' };
}

export function SourcesScreen() {
  const theme = useTheme();
  const { cards, createCard, updateCard, removeCard } = useCards();
  const { billAccounts, createBillAccount, updateBillAccount, removeBillAccount } = useBillAccounts();
  const { expenses } = useExpenses();
  const { payments: allPayments } = useInstallmentPayments();
  const { invoicePayments } = useCardInvoicePayments();
  const { incomes } = useIncomes();

  const [currentView, setCurrentView] = useState<'hub' | 'expenses' | 'revenues'>('hub');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cards' | 'bills'>('all');
  const [showCardModal, setShowCardModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCard, setEditingCard] = useState<ICard | null>(null);
  const [editingBill, setEditingBill] = useState<IBillAccount | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ name: string; action: () => Promise<void> } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cardForm = useForm<ICardForm>({ resolver: zodResolver(cardSchema) });
  const billForm = useForm<IBillForm>({ resolver: zodResolver(billSchema) });

  const cardLimits = useMemo(() =>
    cards.reduce<Record<string, number>>((acc, card) => {
      acc[card.id] = calcCardAvailableLimit(card, expenses, allPayments, invoicePayments);
      return acc;
    }, {}),
    [cards, expenses, allPayments, invoicePayments],
  );

  // Financial summary metrics
  const totalCreditLimit = useMemo(() =>
    cards.reduce((acc, c) => acc + (c.credit_limit || 0), 0),
    [cards]
  );

  const totalAvailableLimit = useMemo(() =>
    cards.reduce((acc, c) => acc + (cardLimits[c.id] ?? c.credit_limit), 0),
    [cards, cardLimits]
  );

  const totalUsedLimit = Math.max(0, totalCreditLimit - totalAvailableLimit);
  const utilizationPercent = totalCreditLimit > 0 ? (totalUsedLimit / totalCreditLimit) * 100 : 0;
  const healthColor =
    utilizationPercent > 75
      ? theme.colors.error
      : utilizationPercent > 45
      ? theme.colors.warning
      : theme.colors.primaryLight;

  const handleAddCard = async (data: ICardForm) => {
    const limit = parseCurrencyInput(data.credit_limit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Valor inválido', 'Informe um limite maior que zero.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCard({ name: data.name, credit_limit: limit, due_day: parseInt(data.due_day, 10) });
      cardForm.reset();
      setShowCardModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o cartão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBill = async (data: IBillForm) => {
    setIsSubmitting(true);
    try {
      await createBillAccount({
        name: data.name,
        description: data.description,
        due_day: data.due_day ? parseInt(data.due_day, 10) : undefined,
      });
      billForm.reset();
      setShowBillModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (name: string, action: () => Promise<void>) => {
    setConfirmTarget({ name, action });
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await confirmTarget.action();
      setConfirmTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const showCards = activeFilter === 'all' || activeFilter === 'cards';
  const showBills = activeFilter === 'all' || activeFilter === 'bills';

  if (currentView === 'hub') {
    return (
      <Safe>
        <Header>
          <View>
            <Title>Fontes</Title>
            <Subtitle>Selecione uma categoria de fontes</Subtitle>
          </View>
        </Header>

        <HubContainer showsVerticalScrollIndicator={false}>
          <SelectionCard onPress={() => setCurrentView('expenses')} activeOpacity={0.75}>
            <SelectionIconBox bg={theme.colors.primary + '18'}>
              <Ionicons name="card-outline" size={26} color={theme.colors.primary} />
            </SelectionIconBox>
            <SelectionInfo>
              <SelectionTitle>Despesas</SelectionTitle>
              <SelectionDesc>Cartões de crédito, contas bancárias e boletos cadastrados</SelectionDesc>
              <SelectionBadgeRow>
                <SelectionBadge>
                  <SelectionBadgeText>{cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}</SelectionBadgeText>
                </SelectionBadge>
                <SelectionBadge>
                  <SelectionBadgeText>{billAccounts.length} {billAccounts.length === 1 ? 'conta' : 'contas'}</SelectionBadgeText>
                </SelectionBadge>
              </SelectionBadgeRow>
            </SelectionInfo>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
          </SelectionCard>

          <SelectionCard onPress={() => setCurrentView('revenues')} activeOpacity={0.75}>
            <SelectionIconBox bg={theme.colors.success + '18'}>
              <Ionicons name="trending-up-outline" size={26} color={theme.colors.success} />
            </SelectionIconBox>
            <SelectionInfo>
              <SelectionTitle>Receitas</SelectionTitle>
              <SelectionDesc>Salários, rendimentos e divisão proporcional</SelectionDesc>
              <SelectionBadgeRow>
                <SelectionBadge>
                  <SelectionBadgeText>
                    {incomes.length} {incomes.length === 1 ? 'receita' : 'receitas'}
                  </SelectionBadgeText>
                </SelectionBadge>
              </SelectionBadgeRow>
            </SelectionInfo>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
          </SelectionCard>
        </HubContainer>
      </Safe>
    );
  }

  if (currentView === 'revenues') {
    return <RevenuesView onBack={() => setCurrentView('hub')} />;
  }

  return (
    <Safe>
      <Header>
        <View style={{ flex: 1 }}>
          <BackButton onPress={() => setCurrentView('hub')} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
            <BackButtonText>Voltar para Fontes</BackButtonText>
          </BackButton>
          <Title>Fontes de Despesas</Title>
          <Subtitle>
            {cards.length} cartão(ões) · {billAccounts.length} conta(s)
          </Subtitle>
        </View>
      </Header>

      <Container showsVerticalScrollIndicator={false}>
        {/* ── OVERVIEW HERO BANNER ── */}
        {cards.length > 0 && (
          <OverviewCard>
            <OverviewHeader>
              <OverviewTitle>Disponível nos Cartões</OverviewTitle>
              <OverviewBadge color={healthColor}>
                <OverviewBadgeText color={healthColor}>
                  {utilizationPercent.toFixed(0)}% comprometido
                </OverviewBadgeText>
              </OverviewBadge>
            </OverviewHeader>

            <OverviewMainAmount>{formatCurrency(totalAvailableLimit)}</OverviewMainAmount>
            <OverviewMainLabel>Limite livre para novas compras</OverviewMainLabel>

            <ProgressBar style={{ marginBottom: 14 }}>
              <ProgressFill percent={utilizationPercent} color={healthColor} />
            </ProgressBar>

            <OverviewMetricsRow>
              <MetricItem>
                <MetricLabel>Limite Contratado</MetricLabel>
                <MetricValue>{formatCurrency(totalCreditLimit)}</MetricValue>
              </MetricItem>
              <MetricItem style={{ alignItems: 'flex-end' }}>
                <MetricLabel>Faturas em Aberto</MetricLabel>
                <MetricValue color={theme.colors.warning}>
                  {formatCurrency(totalUsedLimit)}
                </MetricValue>
              </MetricItem>
            </OverviewMetricsRow>
          </OverviewCard>
        )}

        {/* ── FILTER PILLS ── */}
        <FilterScroll>
          <FilterPill active={activeFilter === 'all'} onPress={() => setActiveFilter('all')}>
            <FilterPillText active={activeFilter === 'all'}>
              Todos ({cards.length + billAccounts.length})
            </FilterPillText>
          </FilterPill>
          <FilterPill active={activeFilter === 'cards'} onPress={() => setActiveFilter('cards')}>
            <FilterPillText active={activeFilter === 'cards'}>
              Cartões ({cards.length})
            </FilterPillText>
          </FilterPill>
          <FilterPill active={activeFilter === 'bills'} onPress={() => setActiveFilter('bills')}>
            <FilterPillText active={activeFilter === 'bills'}>
              Contas & Boletos ({billAccounts.length})
            </FilterPillText>
          </FilterPill>
        </FilterScroll>

        {/* ── CREDIT CARDS SECTION ── */}
        {showCards && (
          <View style={{ marginBottom: 16 }}>
            <SectionTitle>Cartões de Crédito</SectionTitle>
            {cards.length === 0 ? (
              <EmptyState
                icon="card-outline"
                title="Nenhum cartão cadastrado"
                description="Cadastre seus cartões para acompanhar limites e faturas mensais."
              />
            ) : (
              cards.map((card) => {
                const available = cardLimits[card.id] ?? card.credit_limit;
                const used = Math.max(0, card.credit_limit - available);
                const usedPercent =
                  card.credit_limit > 0
                    ? Math.min(100, Math.max(0, (used / card.credit_limit) * 100))
                    : 0;
                const limitColor =
                  usedPercent > 80
                    ? theme.colors.error
                    : usedPercent > 50
                    ? theme.colors.warning
                    : theme.colors.primaryLight;
                const brand = getCardBrandColor(card.name);

                return (
                  <SmartCard key={card.id} accentColor={brand.accent}>
                    {/* Top Row: Bank Name + Brand Wave */}
                    <CardTopRow>
                      <CardBankArea>
                        <CardBankIconBox bg={brand.bg}>
                          <Ionicons name="card" size={20} color={brand.accent} />
                        </CardBankIconBox>
                        <CardBankName>{card.name}</CardBankName>
                      </CardBankArea>
                      <Ionicons name="wifi" size={18} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                    </CardTopRow>

                    {/* Chip + Simulated Digits */}
                    <CardChipRow>
                      <CardChip>
                        <CardChipInner />
                      </CardChip>
                      <CardNumberSim>•••• •••• •••• {String(card.due_day).padStart(2, '0')}{card.name.length}</CardNumberSim>
                    </CardChipRow>

                    {/* Limit Values & Progress */}
                    <CardLimitArea>
                      <CardLimitRow>
                        <View>
                          <TotalLimitText>Disponível</TotalLimitText>
                          <AvailableAmount color={limitColor}>
                            {formatCurrency(available)}
                          </AvailableAmount>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <TotalLimitText>Limite Total</TotalLimitText>
                          <MetricValue style={{ fontSize: 13 }}>
                            {formatCurrency(card.credit_limit)}
                          </MetricValue>
                        </View>
                      </CardLimitRow>

                      <ProgressBar>
                        <ProgressFill percent={usedPercent} color={limitColor} />
                      </ProgressBar>
                    </CardLimitArea>

                    {/* Footer: Due Date Badge & Action Pills */}
                    <CardFooter>
                      <DueDateBadge>
                        <Ionicons name="calendar-outline" size={13} color={theme.colors.textSecondary} />
                        <DueDateText>Venc. dia {card.due_day}</DueDateText>
                      </DueDateBadge>

                      <ActionPillsRow>
                        <ActionPill onPress={() => setEditingCard(card)} activeOpacity={0.7}>
                          <Ionicons name="create-outline" size={13} color={theme.colors.text} />
                          <ActionPillText>Editar</ActionPillText>
                        </ActionPill>
                        <ActionPill
                          danger
                          onPress={() => confirmDelete(card.name, () => removeCard(card.id))}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={13} color={theme.colors.error} />
                          <ActionPillText danger>Excluir</ActionPillText>
                        </ActionPill>
                      </ActionPillsRow>
                    </CardFooter>
                  </SmartCard>
                );
              })
            )}
          </View>
        )}

        {/* ── BILL ACCOUNTS SECTION ── */}
        {showBills && (
          <View style={{ marginBottom: 24 }}>
            <SectionTitle>Contas Fixas & Boletos</SectionTitle>
            {billAccounts.length === 0 ? (
              <EmptyState
                icon="business-outline"
                title="Nenhuma conta cadastrada"
                description="Cadastre contas fixas como luz, água, internet ou aluguel."
              />
            ) : (
              billAccounts.map((bill) => (
                <BillCard key={bill.id}>
                  <BillTopRow>
                    <BillInfo>
                      <BillIconBox>
                        <Ionicons name="business" size={20} color={theme.colors.primary} />
                      </BillIconBox>
                      <View style={{ flex: 1 }}>
                        <BillName>{bill.name}</BillName>
                        {bill.description ? (
                          <BillDescription numberOfLines={1}>
                            {bill.description}
                          </BillDescription>
                        ) : null}
                      </View>
                    </BillInfo>
                  </BillTopRow>

                  <BillFooter>
                    {bill.due_day ? (
                      <DueDateBadge>
                        <Ionicons name="calendar-outline" size={13} color={theme.colors.textSecondary} />
                        <DueDateText>Venc. dia {bill.due_day}</DueDateText>
                      </DueDateBadge>
                    ) : (
                      <DueDateBadge>
                        <Ionicons name="checkmark-circle-outline" size={13} color={theme.colors.textSecondary} />
                        <DueDateText>Conta recorrente</DueDateText>
                      </DueDateBadge>
                    )}

                    <ActionPillsRow>
                      <ActionPill onPress={() => setEditingBill(bill)} activeOpacity={0.7}>
                        <Ionicons name="create-outline" size={13} color={theme.colors.text} />
                        <ActionPillText>Editar</ActionPillText>
                      </ActionPill>
                      <ActionPill
                        danger
                        onPress={() => confirmDelete(bill.name, () => removeBillAccount(bill.id))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={13} color={theme.colors.error} />
                        <ActionPillText danger>Excluir</ActionPillText>
                      </ActionPill>
                    </ActionPillsRow>
                  </BillFooter>
                </BillCard>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </Container>

      {/* Speed dial */}
      {fabOpen && (
        <SpeedDial>
          <SpeedDialItem
            onPress={() => {
              setFabOpen(false);
              setShowBillModal(true);
            }}
          >
            <SpeedDialLabel>
              <SpeedDialLabelText>Nova conta ou boleto</SpeedDialLabelText>
            </SpeedDialLabel>
            <SpeedDialButton>
              <Ionicons name="business-outline" size={20} color="#ffffff" />
            </SpeedDialButton>
          </SpeedDialItem>
          <SpeedDialItem
            onPress={() => {
              setFabOpen(false);
              setShowCardModal(true);
            }}
          >
            <SpeedDialLabel>
              <SpeedDialLabelText>Novo cartão de crédito</SpeedDialLabelText>
            </SpeedDialLabel>
            <SpeedDialButton>
              <Ionicons name="card-outline" size={20} color="#ffffff" />
            </SpeedDialButton>
          </SpeedDialItem>
        </SpeedDial>
      )}

      <FAB onPress={() => setFabOpen((o) => !o)} activeOpacity={0.85}>
        <Ionicons name={fabOpen ? 'close' : 'add'} size={30} color="#ffffff" />
      </FAB>

      {/* ── CREATE CARD FLUID MODAL ── */}
      <FluidModalGlobal
        visible={showCardModal}
        onClose={() => setShowCardModal(false)}
        title="Novo Cartão de Crédito"
        subtitle="Informe os dados e limite do seu cartão"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          <Controller
            control={cardForm.control}
            name="name"
            render={({ field }) => (
              <InputGlobal
                label="Nome do Cartão"
                placeholder="Ex: Nubank, Itaú, Inter..."
                value={field.value}
                onChangeText={field.onChange}
                error={cardForm.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={cardForm.control}
            name="credit_limit"
            render={({ field }) => (
              <InputGlobal
                label="Limite Total (R$)"
                placeholder="0,00"
                keyboardType="numeric"
                value={field.value}
                onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
                error={cardForm.formState.errors.credit_limit?.message}
              />
            )}
          />
          <Controller
            control={cardForm.control}
            name="due_day"
            render={({ field }) => (
              <InputGlobal
                label="Dia de Vencimento da Fatura"
                placeholder="Ex: 10"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={cardForm.formState.errors.due_day?.message}
              />
            )}
          />
          <View style={{ marginTop: 8, gap: 8 }}>
            <ButtonGlobal label="Salvar Cartão" onPress={cardForm.handleSubmit(handleAddCard)} loading={isSubmitting} />
            <ButtonGlobal label="Cancelar" variant="outline" onPress={() => setShowCardModal(false)} />
          </View>
        </ScrollView>
      </FluidModalGlobal>

      {/* ── CREATE BILL FLUID MODAL ── */}
      <FluidModalGlobal
        visible={showBillModal}
        onClose={() => setShowBillModal(false)}
        title="Nova Conta / Boleto"
        subtitle="Cadastre contas fixas como luz, água, internet ou aluguel"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          <Controller
            control={billForm.control}
            name="name"
            render={({ field }) => (
              <InputGlobal
                label="Nome da Conta"
                placeholder="Ex: Energia Elétrica, Aluguel..."
                value={field.value}
                onChangeText={field.onChange}
                error={billForm.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={billForm.control}
            name="description"
            render={({ field }) => (
              <InputGlobal
                label="Descrição (opcional)"
                placeholder="Ex: Apartamento, Escritório..."
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={billForm.control}
            name="due_day"
            render={({ field }) => (
              <InputGlobal
                label="Dia de Vencimento (opcional)"
                placeholder="Ex: 15"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <View style={{ marginTop: 8, gap: 8 }}>
            <ButtonGlobal label="Salvar Conta" onPress={billForm.handleSubmit(handleAddBill)} loading={isSubmitting} />
            <ButtonGlobal label="Cancelar" variant="outline" onPress={() => setShowBillModal(false)} />
          </View>
        </ScrollView>
      </FluidModalGlobal>

      {/* Edit card modal */}
      <CardEditForm
        visible={!!editingCard}
        card={editingCard}
        onClose={() => setEditingCard(null)}
        onSubmit={async (id, data) => {
          await updateCard({ id, data });
        }}
      />

      {/* Edit bill account modal */}
      <BillAccountEditForm
        visible={!!editingBill}
        billAccount={editingBill}
        onClose={() => setEditingBill(null)}
        onSubmit={async (id, data) => {
          await updateBillAccount({ id, data });
        }}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        visible={!!confirmTarget}
        title={`Excluir "${confirmTarget?.name ?? ''}"`}
        message="Essa fonte será removida. Despesas vinculadas a ela não serão excluídas automaticamente."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={isDeleting}
      />
    </Safe>
  );
}
