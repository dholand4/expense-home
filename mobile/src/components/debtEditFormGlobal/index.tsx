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
import { FluidModalGlobal } from '../fluidModalGlobal';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import { ScrollView, View } from 'react-native';

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  total_amount: z.string().optional(),
  notes: z.string().optional(),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  debt: IRunningDebt | null;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Omit<IRunningDebt, 'id'>>) => Promise<void>;
}

export function debtEditFormGlobal({ visible, debt, onClose, onSubmit }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', total_amount: '', notes: '' },
  });

  useEffect(() => {
    if (debt) {
      setValue('name', debt.name);
      setValue('total_amount', formatCurrencyInput(debt.total_amount));
      setValue('notes', debt.notes ?? '');
    }
  }, [debt, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!debt) return;
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
      await onSubmit(debt.id, {
        name: data.name,
        total_amount: amount,
        notes: data.notes || undefined,
      });
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível editar o fiado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Editar Fiado"
      subtitle={debt?.name}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
      >
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <InputGlobal label="Nome" placeholder="Ex: Empréstimo pessoal" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="total_amount"
          render={({ field }) => (
            <InputGlobal
              label="Valor total (R$)"
              placeholder="0,00"
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
            <InputGlobal label="Observações (opcional)" placeholder="Ex: Detalhes do fiado" value={field.value} onChangeText={field.onChange} />
          )}
        />
        <ButtonGlobal label="Salvar alterações" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
      </ScrollView>
    </FluidModalGlobal>
  );
}
