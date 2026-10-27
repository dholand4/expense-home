import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMonths, format, getDate, getDaysInMonth, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useMemo, useState } from 'react';
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
  MonthCenterButton, MonthCenterSubtext, MonthCenterText,
  MonthNavArrow, MonthNavRow, MonthPickerCard,
  QuickMonthButton, QuickMonthButtonText, QuickMonthRow,
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
  const [chargeMonth, setChargeMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const currentMonthDate = useMemo(() => startOfMonth(new Date()), []);
  const nextMonthDate = useMemo(() => addMonths(currentMonthDate, 1), [currentMonthDate]);

  const monthOptions = useMemo(() => {
    const list: Date[] = [];
    for (let i = -6; i <= 12; i++) {
      list.push(addMonths(currentMonthDate, i));
    }
    return list;
  }, [currentMonthDate]);

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
      if (expense.first_charge_date) {
        setChargeMonth(startOfMonth(parseISO(expense.first_charge_date)));
      }
    }
  }, [expense, setValue]);

  const calcUpdatedFirstChargeDate = (targetMonth: Date) => {
    if (!expense?.first_charge_date) {
      return format(targetMonth, 'yyyy-MM-dd');
    }
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    const maxDays = getDaysInMonth(targetMonth);

    let originalDay = 1;
    try {
      originalDay = getDate(parseISO(expense.first_charge_date));
    } catch {
      originalDay = 1;
    }

    const validDay = Math.min(originalDay, maxDays);
    return format(new Date(year, month, validDay), 'yyyy-MM-dd');
  };

  const currentFirstChargeDate = useMemo(() => {
    return calcUpdatedFirstChargeDate(chargeMonth);
  }, [chargeMonth, expense]);

  const formattedChargeDate = useMemo(() => {
    try {
      return format(parseISO(currentFirstChargeDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return currentFirstChargeDate;
    }
  }, [currentFirstChargeDate]);

  const handleClose = () => {
    reset();
    setCategoryOpen(false);
    setMonthPickerOpen(false);
    onClose();
  };

  const onFormSubmit = async (data: IFormData) => {
    if (!expense) return;
    const amountVal = parseCurrencyInput(data.total_amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedChargeDate = calcUpdatedFirstChargeDate(chargeMonth);
      await onSubmit(expense.id, {
        description: data.description,
        total_amount: amountVal,
        category: data.category,
        first_charge_date: updatedChargeDate,
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
          <FieldLabel>Mês de início da cobrança</FieldLabel>
          <MonthPickerCard>
            <MonthNavRow>
              <MonthNavArrow onPress={() => setChargeMonth(prev => startOfMonth(subMonths(prev, 1)))}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
              </MonthNavArrow>
              <MonthCenterButton onPress={() => setMonthPickerOpen(true)}>
                <MonthCenterText>
                  {format(chargeMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </MonthCenterText>
                <MonthCenterSubtext>
                  Cobrança em: {formattedChargeDate}
                </MonthCenterSubtext>
              </MonthCenterButton>
              <MonthNavArrow onPress={() => setChargeMonth(prev => startOfMonth(addMonths(prev, 1)))}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
              </MonthNavArrow>
            </MonthNavRow>

            <QuickMonthRow>
              <QuickMonthButton
                active={isSameMonth(chargeMonth, currentMonthDate)}
                onPress={() => setChargeMonth(currentMonthDate)}
              >
                <QuickMonthButtonText active={isSameMonth(chargeMonth, currentMonthDate)}>
                  Mês atual ({format(currentMonthDate, 'MMM', { locale: ptBR })})
                </QuickMonthButtonText>
              </QuickMonthButton>

              <QuickMonthButton
                active={isSameMonth(chargeMonth, nextMonthDate)}
                onPress={() => setChargeMonth(nextMonthDate)}
              >
                <QuickMonthButtonText active={isSameMonth(chargeMonth, nextMonthDate)}>
                  Próximo mês ({format(nextMonthDate, 'MMM', { locale: ptBR })})
                </QuickMonthButtonText>
              </QuickMonthButton>
            </QuickMonthRow>
          </MonthPickerCard>
        </View>

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

        <Modal visible={monthPickerOpen} transparent animationType="fade" onRequestClose={() => setMonthPickerOpen(false)}>
          <CategoryPickerOverlay activeOpacity={1} onPress={() => setMonthPickerOpen(false)}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <CategoryPickerCard>
                <CategoryPickerHeader>
                  <CategoryPickerTitle>Selecione o mês de início</CategoryPickerTitle>
                  <TouchableOpacity onPress={() => setMonthPickerOpen(false)}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </CategoryPickerHeader>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {monthOptions.map(mDate => {
                    const active = isSameMonth(chargeMonth, mDate);
                    const isCurrent = isSameMonth(mDate, currentMonthDate);
                    const isNext = isSameMonth(mDate, nextMonthDate);
                    const label = format(mDate, "MMMM 'de' yyyy", { locale: ptBR });
                    const suffix = isCurrent ? ' (Mês atual)' : isNext ? ' (Próximo mês)' : '';
                    return (
                      <CategoryItem
                        key={mDate.toISOString()}
                        active={active}
                        color={theme.colors.primary}
                        onPress={() => { setChargeMonth(mDate); setMonthPickerOpen(false); }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={active ? theme.colors.primary : theme.colors.textSecondary}
                          style={{ marginRight: 10 }}
                        />
                        <CategoryItemText active={active} color={theme.colors.primary}>
                          {label}{suffix}
                        </CategoryItemText>
                        {active && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
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
