import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IRunningDebt } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { CloseButton, ModalCard, ModalContent, ModalOverlay, ModalTitle, PreviewBox, PreviewLabel, PreviewRow, PreviewValue, TitleRow } from '../expenseFormGlobal/style';
import { formatCurrency } from '../../utils/finance';

const schema = z.object({
  paid_amount: z.string().min(1, 'Obrigatório'),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  debt: IRunningDebt | null;
  onClose: () => void;
  onConfirm: (id: string, newAmountPaid: number) => Promise<void>;
}

export function debtPaymentModalGlobal({ visible, debt, onClose, onConfirm }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { paid_amount: '' },
  });

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!debt) return;
    const amount = parseFloat(data.paid_amount);
    const remaining = debt.total_amount - debt.amount_paid;

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (amount > remaining) {
      Alert.alert('Valor excedido', `O valor não pode ser maior que o restante: ${formatCurrency(remaining)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(debt.id, debt.amount_paid + amount);
      reset();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalContent>
            <TitleRow>
              <ModalTitle>Registrar pagamento</ModalTitle>
              <CloseButton onPress={handleClose}>
                <Ionicons name="close-circle" size={28} color={theme.colors.error} />
              </CloseButton>
            </TitleRow>
            {debt && (
              <PreviewBox>
                <PreviewRow>
                  <PreviewLabel>Fiado</PreviewLabel>
                  <PreviewValue>{debt.name}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Restante</PreviewLabel>
                  <PreviewValue>{formatCurrency(debt.total_amount - debt.amount_paid)}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Total</PreviewLabel>
                  <PreviewValue>{formatCurrency(debt.total_amount)}</PreviewValue>
                </PreviewRow>
              </PreviewBox>
            )}
            <Controller control={control} name="paid_amount" render={({ field }) => (
              <InputGlobal label="Valor pago agora (R$)" keyboardType="numeric" placeholder="0,00" value={field.value} onChangeText={field.onChange} error={errors.paid_amount?.message} />
            )} />
            <ButtonGlobal label="Confirmar" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
