import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IBillAccount } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { CloseButton, ModalCard, ModalContent, ModalOverlay, ModalTitle, TitleRow } from '../expenseFormGlobal/style';

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  description: z.string().optional(),
  due_day: z.string().optional(),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  billAccount: IBillAccount | null;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Omit<IBillAccount, 'id'>>) => Promise<void>;
}

export function billAccountEditFormGlobal({ visible, billAccount, onClose, onSubmit }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', due_day: '' },
  });

  useEffect(() => {
    if (billAccount) {
      setValue('name', billAccount.name);
      setValue('description', billAccount.description ?? '');
      setValue('due_day', billAccount.due_day ? String(billAccount.due_day) : '');
    }
  }, [billAccount, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!billAccount) return;
    setIsSubmitting(true);
    try {
      await onSubmit(billAccount.id, {
        name: data.name,
        description: data.description || undefined,
        due_day: data.due_day ? parseInt(data.due_day, 10) : undefined,
      });
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível editar a conta.');
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
              <ModalTitle>Editar conta</ModalTitle>
              <CloseButton onPress={handleClose}>
                <Ionicons name="close-circle" size={28} color={theme.colors.error} />
              </CloseButton>
            </TitleRow>
            <Controller control={control} name="name" render={({ field }) => (
              <InputGlobal label="Nome" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="description" render={({ field }) => (
              <InputGlobal label="Descrição (opcional)" value={field.value} onChangeText={field.onChange} />
            )} />
            <Controller control={control} name="due_day" render={({ field }) => (
              <InputGlobal label="Dia de vencimento (opcional)" keyboardType="numeric" value={field.value} onChangeText={field.onChange} />
            )} />
            <ButtonGlobal label="Salvar" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
