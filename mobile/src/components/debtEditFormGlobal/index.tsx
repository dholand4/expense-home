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
import { CloseButton, ModalCard, ModalContent, ModalOverlay, ModalTitle, TitleRow } from '../expenseFormGlobal/style';

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  total_amount: z.string().min(1, 'Obrigatório'),
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
      setValue('total_amount', String(debt.total_amount));
      setValue('notes', debt.notes ?? '');
    }
  }, [debt, setValue]);

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!debt) return;
    setIsSubmitting(true);
    try {
      await onSubmit(debt.id, {
        name: data.name,
        total_amount: parseFloat(data.total_amount),
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalContent>
            <TitleRow>
              <ModalTitle>Editar fiado</ModalTitle>
              <CloseButton onPress={handleClose}>
                <Ionicons name="close-circle" size={28} color={theme.colors.error} />
              </CloseButton>
            </TitleRow>
            <Controller control={control} name="name" render={({ field }) => (
              <InputGlobal label="Nome" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="total_amount" render={({ field }) => (
              <InputGlobal label="Valor total (R$)" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.total_amount?.message} />
            )} />
            <Controller control={control} name="notes" render={({ field }) => (
              <InputGlobal label="Observações (opcional)" value={field.value} onChangeText={field.onChange} />
            )} />
            <ButtonGlobal label="Salvar" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
