import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IInstallment } from '../../@types/models';
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
  installment: IInstallment | null;
  onClose: () => void;
  onConfirm: (installment: IInstallment, paidAmount: number) => Promise<void>;
}

export function paymentModalGlobal({ visible, installment, onClose, onConfirm }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (installment) {
      setValue('paid_amount', String(installment.value.toFixed(2)));
    }
  }, [installment, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!installment) return;
    const amount = parseFloat(data.paid_amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor válido.');
      return;
    }
    if (amount > installment.value) {
      Alert.alert('Valor excedido', `O valor não pode ser maior que ${formatCurrency(installment.value)}.`);
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(installment, amount);
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
            {installment && (
              <PreviewBox>
                <PreviewRow>
                  <PreviewLabel>Descrição</PreviewLabel>
                  <PreviewValue numberOfLines={1}>{installment.description}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Valor da parcela</PreviewLabel>
                  <PreviewValue>{formatCurrency(installment.value)}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Parcela</PreviewLabel>
                  <PreviewValue>{installment.number}x</PreviewValue>
                </PreviewRow>
              </PreviewBox>
            )}
            <Controller control={control} name="paid_amount" render={({ field }) => (
              <InputGlobal label="Valor pago (R$)" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.paid_amount?.message} />
            )} />
            <ButtonGlobal label="Confirmar pagamento" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
