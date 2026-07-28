import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { ICard, ICardInvoicePayment } from '../../@types/models';
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
  card: ICard | null;
  totalAmount: number;
  existingPayment: ICardInvoicePayment | null;
  monthKey: string;
  onClose: () => void;
  onCreate: (data: Omit<ICardInvoicePayment, 'id'>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function cardInvoiceModalGlobal({ visible, card, totalAmount, existingPayment, monthKey, onClose, onCreate, onRemove }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPaid = !!existingPayment;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (visible && !isPaid) {
      setValue('paid_amount', totalAmount.toFixed(2));
    }
  }, [visible, isPaid, totalAmount, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!card) return;
    const amount = parseFloat(data.paid_amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate({ card_id: card.id, month_key: monthKey, paid_amount: amount, paid_date: new Date().toISOString().split('T')[0] });
      reset();
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!existingPayment) return;
    setIsSubmitting(true);
    try {
      await onRemove(existingPayment.id);
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível desfazer o pagamento.');
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
              <ModalTitle>Fatura do cartão</ModalTitle>
              <CloseButton onPress={handleClose}>
                <Ionicons name="close-circle" size={28} color={theme.colors.error} />
              </CloseButton>
            </TitleRow>
            {card && (
              <PreviewBox>
                <PreviewRow>
                  <PreviewLabel>Cartão</PreviewLabel>
                  <PreviewValue>{card.name}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Total da fatura</PreviewLabel>
                  <PreviewValue>{formatCurrency(totalAmount)}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Status</PreviewLabel>
                  <PreviewValue>{isPaid ? '✓ Paga' : 'Pendente'}</PreviewValue>
                </PreviewRow>
                {existingPayment && (
                  <PreviewRow>
                    <PreviewLabel>Valor pago</PreviewLabel>
                    <PreviewValue>{formatCurrency(existingPayment.paid_amount)}</PreviewValue>
                  </PreviewRow>
                )}
              </PreviewBox>
            )}

            {isPaid ? (
              <ButtonGlobal label="Desfazer pagamento" variant="outline" onPress={handleUndo} loading={isSubmitting} />
            ) : (
              <>
                <Controller control={control} name="paid_amount" render={({ field }) => (
                  <InputGlobal
                    label="Valor a pagar (R$)"
                    keyboardType="numeric"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.paid_amount?.message}
                  />
                )} />
                <ButtonGlobal label="Confirmar pagamento" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
              </>
            )}
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
