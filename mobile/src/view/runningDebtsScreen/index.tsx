import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IRunningDebt } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { emptyStateGlobal as EmptyState } from '../../components/emptyStateGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { FluidModalGlobal } from '../../components/fluidModalGlobal';
import { debtEditFormGlobal as DebtEditForm } from '../../components/debtEditFormGlobal';
import { debtPaymentModalGlobal as DebtPaymentModal } from '../../components/debtPaymentModalGlobal';
import { debtChargeModalGlobal as DebtChargeModal } from '../../components/debtChargeModalGlobal';
import { debtStatementModalGlobal as DebtStatementModal } from '../../components/debtStatementModalGlobal';
import { useRunningDebts } from '../../hooks/useRunningDebts';
import { formatCurrency } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
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
  total_amount: z.string().optional(),
  notes: z.string().optional(),
});

type IFormData = z.infer<typeof schema>;

export function RunningDebtsScreen() {
  const theme = useTheme();
  const { debts, isLoading, createDebt, updateDebt, removeDebt, addTransaction } = useRunningDebts();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDebt, setEditingDebt] = useState<IRunningDebt | null>(null);
  const [payingDebt, setPayingDebt] = useState<IRunningDebt | null>(null);
  const [chargingDebt, setChargingDebt] = useState<IRunningDebt | null>(null);
  const [statementDebt, setStatementDebt] = useState<IRunningDebt | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ name: string; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', total_amount: '', notes: '' },
  });

  const onSubmit = async (data: IFormData) => {
    let amount = 0;
    if (data.total_amount && data.total_amount.trim() !== '') {
      amount = parseCurrencyInput(data.total_amount);
      if (isNaN(amount) || amount < 0) {
        Alert.alert('Valor inválido', 'Informe um valor válido.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createDebt({
        name: data.name,
        total_amount: amount,
        amount_paid: 0,
        notes: data.notes,
      });
      reset();
      setShowModal(false);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Não foi possível salvar o fiado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (debtId: string, amount: number, notes?: string) => {
    await addTransaction({
      debt_id: debtId,
      type: 'payment',
      amount,
      notes: notes || 'Pagamento',
    });
  };

  const handleConfirmCharge = async (debtId: string, amount: number, notes?: string) => {
    await addTransaction({
      debt_id: debtId,
      type: 'charge',
      amount,
      notes: notes || 'Novo gasto',
    });
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
        <Title>Dívidas e Fiados</Title>
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
          const percent = item.total_amount > 0 ? Math.min(100, Math.max(0, (item.amount_paid / item.total_amount) * 100)) : 0;
          const isZerado = item.total_amount === 0 && item.amount_paid === 0;
          const isQuitado = item.total_amount > 0 && remaining <= 0;
          return (
            <DebtCard>
              <DebtRow>
                <DebtName numberOfLines={1}>{item.name}</DebtName>
              </DebtRow>
              {isZerado ? (
                <DebtMeta style={{ color: theme.colors.textSecondary }}>Saldo zerado • Toque em "+ Gasto" para lançar compras</DebtMeta>
              ) : isQuitado ? (
                <PaidBadge><PaidBadgeText>✓ Quitado</PaidBadgeText></PaidBadge>
              ) : (
                <DebtMeta>Restante: {formatCurrency(remaining)} de {formatCurrency(item.total_amount)}</DebtMeta>
              )}
              {item.notes ? <DebtMeta>{item.notes}</DebtMeta> : null}
              {!isZerado && (
                <>
                  <ProgressBar>
                    <ProgressFill percent={percent} />
                  </ProgressBar>
                  <ProgressLabel>{percent.toFixed(0)}% quitado</ProgressLabel>
                </>
              )}
              <ActionRow>
                <Pressable onPress={() => setChargingDebt(item)}>
                  <SmallButton><SmallButtonText>+ Gasto</SmallButtonText></SmallButton>
                </Pressable>
                {!isQuitado && !isZerado && (
                  <Pressable onPress={() => setPayingDebt(item)}>
                    <SmallButton variant="success"><SmallButtonText variant="success">Pagar</SmallButtonText></SmallButton>
                  </Pressable>
                )}
                <Pressable onPress={() => setStatementDebt(item)}>
                  <SmallButton><SmallButtonText>Extrato</SmallButtonText></SmallButton>
                </Pressable>
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
      <FluidModalGlobal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Nova dívida / fiado"
        subtitle="Cadastre um novo fiado ou dívida contínua"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <InputGlobal label="Nome / Local" placeholder="Ex: Padaria, Alex, etc." value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )}
          />
          <Controller
            control={control}
            name="total_amount"
            render={({ field }) => (
              <InputGlobal
                label="Valor inicial (R$, opcional)"
                placeholder="0,00 (pode começar zerado)"
                keyboardType="numeric"
                value={field.value}
                onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
                error={errors.total_amount?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <InputGlobal label="Observações (opcional)" placeholder="Detalhes..." value={field.value} onChangeText={field.onChange} />
            )}
          />
          <View style={{ marginTop: 12 }}>
            <ButtonGlobal label="Salvar fiado" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
          </View>
        </ScrollView>
      </FluidModalGlobal>

      {/* Add Charge modal */}
      <DebtChargeModal
        visible={!!chargingDebt}
        debt={chargingDebt}
        onClose={() => setChargingDebt(null)}
        onConfirm={handleConfirmCharge}
      />

      {/* Payment modal */}
      <DebtPaymentModal
        visible={!!payingDebt}
        debt={payingDebt}
        onClose={() => setPayingDebt(null)}
        onConfirm={handleConfirmPayment}
      />

      {/* Statement modal */}
      <DebtStatementModal
        visible={!!statementDebt}
        debt={statementDebt}
        onClose={() => setStatementDebt(null)}
      />

      {/* Edit debt modal */}
      <DebtEditForm
        visible={!!editingDebt}
        debt={editingDebt}
        onClose={() => setEditingDebt(null)}
        onSubmit={async (id, data) => { await updateDebt({ id, data }); }}
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
