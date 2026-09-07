import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IInstallment } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { PreviewBox, PreviewLabel, PreviewRow, PreviewValue } from '../expenseFormGlobal/style';
import { formatCurrency } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';

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
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (installment && visible) {
      setValue('paid_amount', formatCurrencyInput(installment.value));
    }
  }, [installment, visible, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!installment) return;
    const amount = parseCurrencyInput(data.paid_amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(installment, amount);
      reset();
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Registrar Pagamento"
      subtitle={installment?.description}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}
      >
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
        <Controller
          control={control}
          name="paid_amount"
          render={({ field }) => (
            <InputGlobal
              label="Valor pago (R$)"
              keyboardType="numeric"
              placeholder="0,00"
              value={field.value}
              onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
              error={errors.paid_amount?.message}
            />
          )}
        />
        <ButtonGlobal label="Confirmar pagamento" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
      </ScrollView>
    </FluidModalGlobal>
  );
}
