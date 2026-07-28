import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IRunningDebt } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { emptyStateGlobal as EmptyState } from '../../components/emptyStateGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { debtEditFormGlobal as DebtEditForm } from '../../components/debtEditFormGlobal';
import { debtPaymentModalGlobal as DebtPaymentModal } from '../../components/debtPaymentModalGlobal';
import { useRunningDebts } from '../../hooks/useRunningDebts';
import { formatCurrency } from '../../utils/finance';
import styled from 'styled-components/native';
import {
  ActionRow,
  DebtCard,
  DebtMeta,
  DebtName,
  DebtRow,
  FAB,
  Header,
  ModalCard,
  ModalOverlay,
  ModalTitle,
  ProgressBar,
  ProgressFill,
  ProgressLabel,
  Safe,
  SmallButton,
  SmallButtonText,
  Title,
} from './style';

const PaidBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.success}22;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const PaidBadgeText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 700;
`;

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  total_amount: z.string().min(1, 'Obrigatório'),
  notes: z.string().optional(),
});

type IFormData = z.infer<typeof schema>;

export function RunningDebtsScreen() {
  const theme = useTheme();
  const { debts, isLoading, createDebt, updateDebt, removeDebt } = useRunningDebts();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDebt, setEditingDebt] = useState<IRunningDebt | null>(null);
  const [payingDebt, setPayingDebt] = useState<IRunningDebt | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ name: string; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: IFormData) => {
    setIsSubmitting(true);
    try {
      await createDebt({
        name: data.name,
        total_amount: parseFloat(data.total_amount),
        amount_paid: 0,
        notes: data.notes,
      });
      reset();
      setShowModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a dívida.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (name: string, id: string) => {
    setConfirmTarget({ name, id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await removeDebt(confirmTarget.id);
      setConfirmTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Safe>
      <Header>
        <Title>Dívidas</Title>
      </Header>
      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="trending-down-outline" title="Nenhuma dívida" description="Toque no + para adicionar" />
          ) : null
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
        renderItem={({ item }) => {
          const remaining = item.total_amount - item.amount_paid;
          const percent = item.total_amount > 0 ? (item.amount_paid / item.total_amount) * 100 : 0;
          const isQuitado = remaining <= 0;
          return (
            <DebtCard>
              <DebtRow>
                <DebtName numberOfLines={1}>{item.name}</DebtName>
              </DebtRow>
              {isQuitado ? (
                <PaidBadge><PaidBadgeText>✓ Quitado</PaidBadgeText></PaidBadge>
              ) : (
                <DebtMeta>Restante: {formatCurrency(remaining)} de {formatCurrency(item.total_amount)}</DebtMeta>
              )}
              {item.notes ? <DebtMeta>{item.notes}</DebtMeta> : null}
              <ProgressBar>
                <ProgressFill percent={percent} />
              </ProgressBar>
              <ProgressLabel>{percent.toFixed(0)}% quitado</ProgressLabel>
              <ActionRow>
                {!isQuitado && (
                  <Pressable onPress={() => setPayingDebt(item)}>
                    <SmallButton variant="success"><SmallButtonText variant="success">Pagar</SmallButtonText></SmallButton>
                  </Pressable>
                )}
                <Pressable onPress={() => setEditingDebt(item)}>
                  <SmallButton><SmallButtonText>Editar</SmallButtonText></SmallButton>
                </Pressable>
                <Pressable onPress={() => confirmDelete(item.name, item.id)}>
                  <SmallButton variant="danger"><SmallButtonText variant="danger">Excluir</SmallButtonText></SmallButton>
                </Pressable>
              </ActionRow>
            </DebtCard>
          );
        }}
      />

      <FAB onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={theme.colors.text} />
      </FAB>

      {/* Create debt modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>Nova dívida</ModalTitle>
            <Controller control={control} name="name" render={({ field }) => (
              <InputGlobal label="Nome" placeholder="Ex: Empréstimo pessoal" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="total_amount" render={({ field }) => (
              <InputGlobal label="Valor total (R$)" placeholder="0.00" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.total_amount?.message} />
            )} />
            <Controller control={control} name="notes" render={({ field }) => (
              <InputGlobal label="Observações (opcional)" value={field.value} onChangeText={field.onChange} />
            )} />
            <ButtonGlobal label="Salvar" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
            <ButtonGlobal label="Cancelar" variant="outline" onPress={() => setShowModal(false)} />
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Edit debt modal */}
      <DebtEditForm
        visible={!!editingDebt}
        debt={editingDebt}
        onClose={() => setEditingDebt(null)}
        onSubmit={async (id, data) => { await updateDebt({ id, data }); }}
      />

      {/* Payment modal */}
      <DebtPaymentModal
        visible={!!payingDebt}
        debt={payingDebt}
        onClose={() => setPayingDebt(null)}
        onConfirm={async (id, newAmountPaid) => {
          await updateDebt({ id, data: { amount_paid: newAmountPaid } });
          setPayingDebt(null);
        }}
      />

      <ConfirmModal
        visible={!!confirmTarget}
        title={`Excluir "${confirmTarget?.name ?? ''}"`}
        message="Deseja excluir esta dívida? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={isDeleting}
      />
    </Safe>
  );
}
