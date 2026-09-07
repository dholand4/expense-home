import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMonths, format, getDate, setDate } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView as RNScrollView, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { ICard, IBillAccount } from '../../@types/models';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { inputGlobal as InputGlobal } from '../inputGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { CATEGORIES, CATEGORY_LIST, calcCardAvailableLimit, formatCurrency } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import {
  CategoryDot, CategoryItem, CategoryItemText,
  CategoryPickerCard, CategoryPickerHeader, CategoryPickerOverlay, CategoryPickerTitle,
  CategorySelector, CategorySelectorText,
  CloseButton, FieldLabel,
  ModalCard, ModalOverlay, ModalTitle, TitleRow,
  PreviewBox, PreviewLabel, PreviewRow, PreviewValue,
  SegmentButton, SegmentRow, SegmentText,
  SourceOption, SourceOptionText, WarningBox, WarningText,
} from './style';

const schema = z.object({
  description: z.string().min(1, 'Obrigatório'),
  total_amount: z.string().min(1, 'Obrigatório'),
  installments: z.string().default('1'),
  payment_type: z.enum(['avista', 'parcelado']),
  category: z.string().min(1, 'Selecione uma categoria'),
  source_type: z.enum(['card', 'bill_account']),
  source_id: z.string().min(1, 'Selecione uma fonte'),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<IFormData, 'total_amount' | 'installments'> & {
    total_amount: number;
    installments: number;
    first_charge_date: string;
  }) => Promise<void>;
  cards: ICard[];
  billAccounts: IBillAccount[];
  expenses?: Parameters<typeof calcCardAvailableLimit>[1];
  installmentPayments?: Parameters<typeof calcCardAvailableLimit>[2];
  invoicePayments?: Parameters<typeof calcCardAvailableLimit>[3];
}

export function expenseFormGlobal({ visible, onClose, onSubmit, cards, billAccounts, expenses = [], installmentPayments = [], invoicePayments = [] }: IProps) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_type: 'avista',
      installments: '1',
      source_type: 'card',
    },
  });

  const [amountMode, setAmountMode] = useState<'total' | 'per'>('total');
  const [categoryOpen, setCategoryOpen] = useState(false);

  const paymentType = watch('payment_type');
  const sourceType = watch('source_type');
  const sourceId = watch('source_id');
  const totalAmountStr = watch('total_amount');
  const installmentsStr = watch('installments');
  const category = watch('category');

  const entered = parseCurrencyInput(totalAmountStr);
  const installmentsCount = paymentType === 'avista' ? 1 : (parseInt(installmentsStr) || 1);
  const totalAmount = paymentType === 'parcelado' && amountMode === 'per' ? entered * installmentsCount : entered;
  const installmentValue = installmentsCount > 0 ? totalAmount / installmentsCount : 0;

  const selectedCard = useMemo(() => cards.find(c => c.id === sourceId), [cards, sourceId]);

  const cardAvailableLimits = useMemo(() => {
    const map: Record<string, number> = {};
    cards.forEach(card => {
      map[card.id] = calcCardAvailableLimit(card, expenses, installmentPayments, invoicePayments);
    });
    return map;
  }, [cards, expenses, installmentPayments, invoicePayments]);

  const availableLimit = selectedCard ? (cardAvailableLimits[selectedCard.id] ?? null) : null;

  const isOverLimit = availableLimit !== null && totalAmount > availableLimit;

  const calcFirstChargeDate = () => {
    const today = new Date();
    const card = cards.find(c => c.id === sourceId);
    if (!card?.due_day) return format(today, 'yyyy-MM-dd');
    const dueDay = card.due_day;
    const currentDay = getDate(today);
    const baseDate = currentDay <= dueDay
      ? setDate(today, dueDay)
      : setDate(addMonths(today, 1), dueDay);
    return format(baseDate, 'yyyy-MM-dd');
  };

  const handleClose = () => {
    reset();
    setAmountMode('total');
    setCategoryOpen(false);
    onClose();
  };

  const onFormSubmit = async (data: IFormData) => {
    await doSubmit(data);
  };

  const doSubmit = async (data: IFormData) => {
    setIsSubmitting(true);
    try {
      const first_charge_date = data.source_type === 'card' ? calcFirstChargeDate() : format(new Date(), 'yyyy-MM-dd');
      const parsedEntered = parseCurrencyInput(data.total_amount);
      const finalAmount = paymentType === 'parcelado' && amountMode === 'per'
        ? parsedEntered * installmentsCount
        : parsedEntered;

      await onSubmit({
        ...data,
        total_amount: finalAmount,
        installments: installmentsCount,
        first_charge_date,
      });
      reset();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={handleClose}
      title="Novo Lançamento"
    >
      <RNScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
      >

            <Controller control={control} name="description" render={({ field }) => (
              <InputGlobal label="Descrição" placeholder="Ex: Supermercado" value={field.value} onChangeText={field.onChange} error={errors.description?.message} />
            )} />

            <Controller control={control} name="total_amount" render={({ field }) => (
              <InputGlobal
                label={paymentType === 'parcelado' && amountMode === 'per' ? 'Valor por parcela (R$)' : 'Valor total (R$)'}
                placeholder="0,00"
                keyboardType="numeric"
                value={field.value}
                onChangeText={(text) => field.onChange(formatCurrencyInput(text))}
                error={errors.total_amount?.message}
              />
            )} />

            <FieldLabel>Tipo de pagamento</FieldLabel>
            <SegmentRow>
              {(['avista', 'parcelado'] as const).map(type => (
                <SegmentButton
                  key={type}
                  active={paymentType === type}
                  onPress={() => { setValue('payment_type', type); setAmountMode('total'); }}
                >
                  <SegmentText active={paymentType === type}>
                    {type === 'avista' ? 'À Vista' : 'Parcelado'}
                  </SegmentText>
                </SegmentButton>
              ))}
            </SegmentRow>

            {paymentType === 'parcelado' && (
              <>
                <FieldLabel>Modo de entrada</FieldLabel>
                <SegmentRow>
                  <SegmentButton active={amountMode === 'total'} onPress={() => setAmountMode('total')}>
                    <SegmentText active={amountMode === 'total'}>Total ÷ parcelas</SegmentText>
                  </SegmentButton>
                  <SegmentButton active={amountMode === 'per'} onPress={() => setAmountMode('per')}>
                    <SegmentText active={amountMode === 'per'}>Parcela × qtd</SegmentText>
                  </SegmentButton>
                </SegmentRow>
                <Controller control={control} name="installments" render={({ field }) => (
                  <InputGlobal label="Número de parcelas" placeholder="2" keyboardType="numeric" value={field.value} onChangeText={field.onChange} />
                )} />
              </>
            )}

            {totalAmount > 0 && installmentsCount > 1 && (
              <PreviewBox>
                <PreviewRow>
                  <PreviewLabel>Valor por parcela</PreviewLabel>
                  <PreviewValue>{formatCurrency(installmentValue)}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Total de parcelas</PreviewLabel>
                  <PreviewValue>{installmentsCount}x</PreviewValue>
                </PreviewRow>
              </PreviewBox>
            )}

            <FieldLabel>Fonte de pagamento</FieldLabel>
            <SegmentRow>
              <SegmentButton active={sourceType === 'card'} onPress={() => { setValue('source_type', 'card'); setValue('source_id', ''); }}>
                <SegmentText active={sourceType === 'card'}>Cartão</SegmentText>
              </SegmentButton>
              <SegmentButton active={sourceType === 'bill_account'} onPress={() => { setValue('source_type', 'bill_account'); setValue('source_id', ''); }}>
                <SegmentText active={sourceType === 'bill_account'}>Conta</SegmentText>
              </SegmentButton>
            </SegmentRow>

            {(sourceType === 'card' ? cards : billAccounts).map(src => (
              <SourceOption key={src.id} active={sourceId === src.id} onPress={() => setValue('source_id', src.id)}>
                <Ionicons
                  name={sourceType === 'card' ? 'card-outline' : 'document-text-outline'}
                  size={16}
                  color={sourceId === src.id ? theme.colors.primary : theme.colors.textSecondary}
                />
                <SourceOptionText active={sourceId === src.id}>{src.name}</SourceOptionText>
                {sourceType === 'card' && 'credit_limit' in src && (
                  <SegmentText active={false}>Disp: {formatCurrency(cardAvailableLimits[src.id] ?? (src as ICard).credit_limit)}</SegmentText>
                )}
              </SourceOption>
            ))}
            {errors.source_id && <WarningText>{errors.source_id.message}</WarningText>}

            {isOverLimit && (
              <WarningBox>
                <WarningText>⚠ Ultrapassa o limite disponível ({formatCurrency(availableLimit!)})</WarningText>
              </WarningBox>
            )}

            <FieldLabel>Categoria</FieldLabel>
            <CategorySelector hasValue={!!category} onPress={() => setCategoryOpen(true)}>
              <CategorySelectorText hasValue={!!category}>
                {category ? CATEGORIES[category]?.label : 'Selecione uma categoria'}
              </CategorySelectorText>
              <Ionicons name="chevron-down" size={16} color={category ? theme.colors.primary : theme.colors.textSecondary} />
            </CategorySelector>
            {errors.category && <WarningText>{errors.category.message}</WarningText>}

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
                    <RNScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                    </RNScrollView>
                  </CategoryPickerCard>
                </TouchableOpacity>
              </CategoryPickerOverlay>
            </Modal>

            <View style={{ marginTop: 16 }}>
              <ButtonGlobal label="Salvar lançamento" onPress={handleSubmit(onFormSubmit)} loading={isSubmitting} />
            </View>
          </RNScrollView>
        </FluidModalGlobal>
  );
}
