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
import { CloseButton, ModalCard, ModalContent, ModalOverlay, ModalTitle, TitleRow } from '../expenseFormGlobal/style';

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
  onSubmit: (id: string, data: Partial<Omit<ICard, 'id'>>) => Promise<void>;
}

export function cardEditFormGlobal({ visible, card, onClose, onSubmit }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', credit_limit: '', due_day: '' },
  });

  useEffect(() => {
    if (card) {
      setValue('name', card.name);
      setValue('credit_limit', String(card.credit_limit));
      setValue('due_day', String(card.due_day));
    }
  }, [card, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!card) return;
    setIsSubmitting(true);
    try {
      await onSubmit(card.id, {
        name: data.name,
        credit_limit: parseFloat(data.credit_limit),
        due_day: parseInt(data.due_day, 10),
      });
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível editar o cartão.');
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
              <ModalTitle>Editar cartão</ModalTitle>
              <CloseButton onPress={handleClose}>
                <Ionicons name="close-circle" size={28} color={theme.colors.error} />
              </CloseButton>
            </TitleRow>
            <Controller control={control} name="name" render={({ field }) => (
              <InputGlobal label="Nome" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="credit_limit" render={({ field }) => (
              <InputGlobal label="Limite (R$)" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.credit_limit?.message} />
            )} />
            <Controller control={control} name="due_day" render={({ field }) => (
              <InputGlobal label="Dia de vencimento" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.due_day?.message} />
            )} />
            <ButtonGlobal label="Salvar" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
