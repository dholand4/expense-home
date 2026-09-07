import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Alert, Modal } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IRunningDebt } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { PreviewBox, PreviewLabel, PreviewRow, PreviewValue } from '../expenseFormGlobal/style';
import { formatCurrency } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import { ScrollView, View } from 'react-native';

const schema = z.object({
  amount: z.string().min(1, 'Informe o valor'),
  notes: z.string().optional(),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  debt: IRunningDebt | null;
  onClose: () => void;
  onConfirm: (id: string, amount: number, notes?: string) => Promise<void>;
}

export function debtChargeModalGlobal({ visible, debt, onClose, onConfirm }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', notes: '' },
  });

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!debt) return;
    const amount = parseCurrencyInput(data.amount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(debt.id, amount, data.notes);
      reset();
      onClose();
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Não foi possível adicionar o gasto ao fiado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Adicionar ao Fiado"
      subtitle={debt?.name}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}
      >
        {debt && (
          <PreviewBox>
            <PreviewRow>
              <PreviewLabel>Fiado</PreviewLabel>
              <PreviewValue>{debt.name}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Total Atual</PreviewLabel>
              <PreviewValue>{formatCurrency(debt.total_amount)}</PreviewValue>
            </PreviewRow>
          </PreviewBox>
        )}
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <InputGlobal
              label="Valor a adicionar (R$)"
              keyboardType="numeric"
              placeholder="0,00"
              value={field.value}
              onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <InputGlobal
              label="Descrição / Itens (opcional)"
              placeholder="Ex: 2 cervejas, almoço..."
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <ButtonGlobal label="Adicionar Valor ao Fiado" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
      </ScrollView>
    </FluidModalGlobal>
  );
}
