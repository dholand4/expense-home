import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { ICard, IBillAccount } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { cardEditFormGlobal as CardEditForm } from '../../components/cardEditFormGlobal';
import { billAccountEditFormGlobal as BillAccountEditForm } from '../../components/billAccountEditFormGlobal';
import { useCards } from '../../hooks/useCards';
import { useBillAccounts } from '../../hooks/useBillAccounts';
import { useExpenses } from '../../hooks/useExpenses';
import { useInstallmentPayments } from '../../hooks/useInstallmentPayments';
import { useCardInvoicePayments } from '../../hooks/useCardInvoicePayments';
import { calcCardAvailableLimit, formatCurrency } from '../../utils/finance';
import {
  ActionRow,
  Container,
  FAB,
  Header,
  LimitText,
  ModalCard,
  ModalOverlay,
  ModalTitle,
  ProgressBar,
  ProgressFill,
  Safe,
  SectionTitle,
  SmallButton,
  SmallButtonText,
  SourceCard,
  SourceMeta,
  SourceName,
  SourceRow,
  SpeedDial,
  SpeedDialButton,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialLabelText,
  Title,
} from './style';

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

export function SourcesScreen() {
  const theme = useTheme();
  const { cards, createCard, updateCard, removeCard } = useCards();
  const { billAccounts, createBillAccount, updateBillAccount, removeBillAccount } = useBillAccounts();
  const { expenses } = useExpenses();
  const { payments: allPayments } = useInstallmentPayments();
  const { invoicePayments } = useCardInvoicePayments();

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

  const handleAddCard = async (data: ICardForm) => {
    setIsSubmitting(true);
    try {
      await createCard({ name: data.name, credit_limit: parseFloat(data.credit_limit), due_day: parseInt(data.due_day, 10) });
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
      await createBillAccount({ name: data.name, description: data.description, due_day: data.due_day ? parseInt(data.due_day, 10) : undefined });
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

  return (
    <Safe>
      <Header>
        <Title>Fontes</Title>
      </Header>
      <Container showsVerticalScrollIndicator={false}>
        <SectionTitle>Cartões</SectionTitle>
        {cards.map((card) => {
          const available = cardLimits[card.id] ?? card.credit_limit;
          const used = card.credit_limit - available;
          const usedPercent = card.credit_limit > 0 ? Math.min(100, Math.max(0, (used / card.credit_limit) * 100)) : 0;
          const limitColor = usedPercent > 80 ? theme.colors.error : usedPercent > 50 ? theme.colors.warning : theme.colors.primary;
          return (
            <SourceCard key={card.id}>
              <SourceRow>
                <SourceName>{card.name}</SourceName>
                <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
              </SourceRow>
              <SourceMeta>Limite: {formatCurrency(card.credit_limit)} · Venc. dia {card.due_day}</SourceMeta>
              <ProgressBar>
                <ProgressFill percent={usedPercent} color={limitColor} />
              </ProgressBar>
              <LimitText style={{ color: limitColor }}>{formatCurrency(available)} disponível</LimitText>
              <ActionRow>
                <Pressable onPress={() => setEditingCard(card)}>
                  <SmallButton><SmallButtonText>Editar</SmallButtonText></SmallButton>
                </Pressable>
                <Pressable onPress={() => confirmDelete(card.name, () => removeCard(card.id))}>
                  <SmallButton variant="danger"><SmallButtonText variant="danger">Excluir</SmallButtonText></SmallButton>
                </Pressable>
              </ActionRow>
            </SourceCard>
          );
        })}

        <SectionTitle>Contas de Débito / Boleto</SectionTitle>
        {billAccounts.map((bill) => (
          <SourceCard key={bill.id}>
            <SourceRow>
              <SourceName>{bill.name}</SourceName>
              <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
            </SourceRow>
            {bill.description ? <SourceMeta>{bill.description}</SourceMeta> : null}
            {bill.due_day ? <SourceMeta>Venc. dia {bill.due_day}</SourceMeta> : null}
            <ActionRow>
              <Pressable onPress={() => setEditingBill(bill)}>
                <SmallButton><SmallButtonText>Editar</SmallButtonText></SmallButton>
              </Pressable>
              <Pressable onPress={() => confirmDelete(bill.name, () => removeBillAccount(bill.id))}>
                <SmallButton variant="danger"><SmallButtonText variant="danger">Excluir</SmallButtonText></SmallButton>
              </Pressable>
            </ActionRow>
          </SourceCard>
        ))}
        <View style={{ height: 80 }} />
      </Container>

      {/* Speed dial */}
      {fabOpen && (
        <SpeedDial>
          <SpeedDialItem onPress={() => { setFabOpen(false); setShowBillModal(true); }}>
            <SpeedDialLabel><SpeedDialLabelText>Nova conta</SpeedDialLabelText></SpeedDialLabel>
            <SpeedDialButton><Ionicons name="business-outline" size={18} color={theme.colors.text} /></SpeedDialButton>
          </SpeedDialItem>
          <SpeedDialItem onPress={() => { setFabOpen(false); setShowCardModal(true); }}>
            <SpeedDialLabel><SpeedDialLabelText>Novo cartão</SpeedDialLabelText></SpeedDialLabel>
            <SpeedDialButton><Ionicons name="card-outline" size={18} color={theme.colors.text} /></SpeedDialButton>
          </SpeedDialItem>
        </SpeedDial>
      )}

      <FAB onPress={() => setFabOpen(o => !o)}>
        <Ionicons name={fabOpen ? 'close' : 'add'} size={28} color={theme.colors.text} />
      </FAB>

      {/* Create card modal */}
      <Modal visible={showCardModal} transparent animationType="slide" onRequestClose={() => setShowCardModal(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>Novo cartão</ModalTitle>
            <Controller control={cardForm.control} name="name" render={({ field }) => (
              <InputGlobal label="Nome" placeholder="Ex: Nubank" value={field.value} onChangeText={field.onChange} error={cardForm.formState.errors.name?.message} />
            )} />
            <Controller control={cardForm.control} name="credit_limit" render={({ field }) => (
              <InputGlobal label="Limite (R$)" placeholder="5000" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={cardForm.formState.errors.credit_limit?.message} />
            )} />
            <Controller control={cardForm.control} name="due_day" render={({ field }) => (
              <InputGlobal label="Dia de vencimento" placeholder="10" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={cardForm.formState.errors.due_day?.message} />
            )} />
            <ButtonGlobal label="Salvar" onPress={cardForm.handleSubmit(handleAddCard)} loading={isSubmitting} />
            <ButtonGlobal label="Cancelar" variant="outline" onPress={() => setShowCardModal(false)} />
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Create bill account modal */}
      <Modal visible={showBillModal} transparent animationType="slide" onRequestClose={() => setShowBillModal(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>Nova conta</ModalTitle>
            <Controller control={billForm.control} name="name" render={({ field }) => (
              <InputGlobal label="Nome" placeholder="Ex: Água" value={field.value} onChangeText={field.onChange} error={billForm.formState.errors.name?.message} />
            )} />
            <Controller control={billForm.control} name="description" render={({ field }) => (
              <InputGlobal label="Descrição (opcional)" value={field.value} onChangeText={field.onChange} />
            )} />
            <Controller control={billForm.control} name="due_day" render={({ field }) => (
              <InputGlobal label="Dia de vencimento (opcional)" keyboardType="numeric" value={field.value} onChangeText={field.onChange} />
            )} />
            <ButtonGlobal label="Salvar" onPress={billForm.handleSubmit(handleAddBill)} loading={isSubmitting} />
            <ButtonGlobal label="Cancelar" variant="outline" onPress={() => setShowBillModal(false)} />
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Edit card modal */}
      <CardEditForm
        visible={!!editingCard}
        card={editingCard}
        onClose={() => setEditingCard(null)}
        onSubmit={async (id, data) => { await updateCard({ id, data }); }}
      />

      {/* Edit bill account modal */}
      <BillAccountEditForm
        visible={!!editingBill}
        billAccount={editingBill}
        onClose={() => setEditingBill(null)}
        onSubmit={async (id, data) => { await updateBillAccount({ id, data }); }}
      />

      <ConfirmModal
        visible={!!confirmTarget}
        title={`Excluir "${confirmTarget?.name ?? ''}"`}
        message="Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={isDeleting}
      />
    </Safe>
  );
}
