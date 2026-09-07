import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { ICard } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import { ScrollView, View } from 'react-native';

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  credit_limit: z.string().min(1, 'Obrigatório'),
  due_day: z.string().min(1, 'Obrigatório'),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  card: ICard | null;
  onClose: () => void;
  onSubmit: (id: string, data: { name?: string; credit_limit?: number; due_day?: number }) => Promise<void>;
}

export function cardEditFormGlobal({ visible, card, onClose, onSubmit }: IProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      credit_limit: '',
      due_day: '',
    },
  });

  useEffect(() => {
    if (card) {
      reset({
        name: card.name,
        credit_limit: formatCurrencyInput(String(Math.round(card.credit_limit * 100))),
        due_day: String(card.due_day),
      });
    }
  }, [card, reset]);

  const onFormSubmit = async (data: IFormData) => {
    if (!card) return;
    setIsSubmitting(true);
    try {
      await onSubmit(card.id, {
        name: data.name,
        credit_limit: parseCurrencyInput(data.credit_limit),
        due_day: Number(data.due_day),
      });
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Editar Cartão"
      subtitle={card?.name}
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
            <InputGlobal label="Nome" placeholder="Ex: Nubank" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="credit_limit"
          render={({ field }) => (
            <InputGlobal
              label="Limite (R$)"
              placeholder="0,00"
              keyboardType="numeric"
              value={field.value}
              onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
              error={errors.credit_limit?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="due_day"
          render={({ field }) => (
            <InputGlobal label="Dia de vencimento" placeholder="10" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.due_day?.message} />
          )}
        />
        <ButtonGlobal label="Salvar alterações" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
      </ScrollView>
    </FluidModalGlobal>
  );
}
