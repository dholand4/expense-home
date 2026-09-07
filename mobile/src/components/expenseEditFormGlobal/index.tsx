import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { IExpense } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { CATEGORIES, CATEGORY_LIST } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import {
  CategoryDot, CategoryItem, CategoryItemText,
  CategoryPickerCard, CategoryPickerHeader, CategoryPickerOverlay, CategoryPickerTitle,
  CategorySelector, CategorySelectorText,
  FieldLabel, WarningText,
} from '../expenseFormGlobal/style';

const schema = z.object({
  description: z.string().min(1, 'Obrigatório'),
  total_amount: z.string().min(1, 'Obrigatório'),
  category: z.string().min(1, 'Obrigatório'),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  expense: IExpense | null;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Omit<IExpense, 'id'>>) => Promise<void>;
}

export function expenseEditFormGlobal({ visible, expense, onClose, onSubmit }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { description: '', total_amount: '', category: '' },
  });

  const category = watch('category');

  useEffect(() => {
    if (expense) {
      setValue('description', expense.description);
      setValue('total_amount', formatCurrencyInput(expense.total_amount));
      setValue('category', expense.category);
    }
  }, [expense, setValue]);

  const handleClose = () => { reset(); setCategoryOpen(false); onClose(); };

  const onFormSubmit = async (data: IFormData) => {
    if (!expense) return;
    const amountVal = parseCurrencyInput(data.total_amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(expense.id, {
        description: data.description,
        total_amount: amountVal,
        category: data.category,
      });
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Editar Lançamento"
      subtitle={expense?.description}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <InputGlobal label="Descrição" value={field.value} onChangeText={field.onChange} error={errors.description?.message} />
          )}
        />
        <Controller
          control={control}
          name="total_amount"
          render={({ field }) => (
            <InputGlobal
              label="Valor total (R$)"
              keyboardType="numeric"
              placeholder="0,00"
              value={field.value}
              onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
              error={errors.total_amount?.message}
            />
          )}
        />
        <View>
          <FieldLabel>Categoria</FieldLabel>
          <CategorySelector hasValue={!!category} onPress={() => setCategoryOpen(true)}>
            <CategorySelectorText hasValue={!!category}>
              {category ? CATEGORIES[category]?.label : 'Selecione uma categoria'}
            </CategorySelectorText>
            <Ionicons name="chevron-down" size={16} color={category ? theme.colors.primary : theme.colors.textSecondary} />
          </CategorySelector>
          {errors.category && <WarningText>{errors.category.message}</WarningText>}
        </View>

        <Modal visible={categoryOpen} transparent animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
          <CategoryPickerOverlay activeOpacity={1} onPress={() => setCategoryOpen(false)}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <CategoryPickerCard>
                <CategoryPickerHeader>
                  <CategoryPickerTitle>Selecione uma categoria</CategoryPickerTitle>
                  <TouchableOpacity onPress={() => setCategoryOpen(false)}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </CategoryPickerHeader>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {CATEGORY_LIST.map(cat => {
                    const info = CATEGORIES[cat];
                    const active = category === cat;
                    return (
                      <CategoryItem
                        key={cat}
                        active={active}
                        color={info.color}
                        onPress={() => { setValue('category', cat); setCategoryOpen(false); }}
                      >
                        <CategoryDot color={info.color} />
                        <CategoryItemText active={active} color={info.color}>{info.label}</CategoryItemText>
                        {active && <Ionicons name="checkmark" size={16} color={info.color} />}
                      </CategoryItem>
                    );
                  })}
                </ScrollView>
              </CategoryPickerCard>
            </TouchableOpacity>
          </CategoryPickerOverlay>
        </Modal>

        <View style={{ marginTop: 8 }}>
          <ButtonGlobal label="Salvar Alterações" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
        </View>
      </ScrollView>
    </FluidModalGlobal>
  );
}
