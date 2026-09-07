import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { ICard, ICardInvoicePayment } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { PreviewBox, PreviewLabel, PreviewRow, PreviewValue } from '../expenseFormGlobal/style';
import { formatCurrency } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import { ProportionalBadge } from '../proportionalBadge';

const schema = z.object({
  paid_amount: z.string().min(1, 'Obrigatório'),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  card: ICard | null;
  totalAmount: number;
  existingPayment?: ICardInvoicePayment | null;
  monthKey: string;
  onClose: () => void;
  onCreate: (data: { card_id: string; month_key: string; paid_amount: number; paid_date: string }) => Promise<void>;
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
      setValue('paid_amount', formatCurrencyInput(totalAmount));
    }
  }, [visible, isPaid, totalAmount, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!card) return;
    const amount = parseCurrencyInput(data.paid_amount);
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
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Fatura do Cartão"
      subtitle={card?.name}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}
      >
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
            <PreviewRow style={{ alignItems: 'flex-start' }}>
              <PreviewLabel>Rateio proporcional</PreviewLabel>
              <View style={{ alignItems: 'flex-end', flex: 1 }}>
                <ProportionalBadge amount={totalAmount} />
              </View>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Status</PreviewLabel>
              <PreviewValue style={{ color: isPaid ? theme.colors.success : theme.colors.warning }}>
                {isPaid ? '✓ Fatura Paga' : 'Pendente de pagamento'}
              </PreviewValue>
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
          <ButtonGlobal label="Desfazer pagamento da fatura" variant="outline" onPress={handleUndo} loading={isSubmitting} />
        ) : (
          <>
            <Controller
              control={control}
              name="paid_amount"
              render={({ field }) => (
                <InputGlobal
                  label="Valor a pagar (R$)"
                  keyboardType="numeric"
                  placeholder="0,00"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
                  error={errors.paid_amount?.message}
                />
              )}
            />
            <ButtonGlobal label="Confirmar pagamento" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
          </>
        )}
      </ScrollView>
    </FluidModalGlobal>
  );
}
