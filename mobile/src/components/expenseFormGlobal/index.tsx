import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMonths, format, getDate, getDaysInMonth, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  MonthCenterButton, MonthCenterSubtext, MonthCenterText,
  MonthNavArrow, MonthNavRow, MonthPickerCard,
  PreviewBox, PreviewLabel, PreviewRow, PreviewValue,
  QuickMonthButton, QuickMonthButtonText, QuickMonthRow,
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

  const [chargeMonth, setChargeMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const currentMonthDate = useMemo(() => startOfMonth(new Date()), []);
  const nextMonthDate = useMemo(() => addMonths(currentMonthDate, 1), [currentMonthDate]);

  const monthOptions = useMemo(() => {
    const list: Date[] = [];
    for (let i = -2; i <= 12; i++) {
      list.push(addMonths(currentMonthDate, i));
    }
    return list;
  }, [currentMonthDate]);

  const calcFirstChargeDate = (targetMonth: Date) => {
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    const maxDays = getDaysInMonth(targetMonth);

    let day = getDate(new Date());

    if (sourceType === 'card') {
      const card = cards.find(c => c.id === sourceId);
      if (card?.due_day) {
        day = card.due_day;
      }
    } else {
      const account = billAccounts.find(b => b.id === sourceId);
      if (account?.due_day) {
        day = account.due_day;
      }
    }

    const validDay = Math.min(day, maxDays);
    return format(new Date(year, month, validDay), 'yyyy-MM-dd');
  };

  const currentFirstChargeDate = useMemo(() => {
    return calcFirstChargeDate(chargeMonth);
  }, [chargeMonth, sourceType, sourceId, cards, billAccounts]);

  const formattedChargeDate = useMemo(() => {
    try {
      return format(parseISO(currentFirstChargeDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return currentFirstChargeDate;
    }
  }, [currentFirstChargeDate]);

  const handleClose = () => {
    reset();
    setAmountMode('total');
    setCategoryOpen(false);
    setMonthPickerOpen(false);
    setChargeMonth(startOfMonth(new Date()));
    onClose();
  };

  const onFormSubmit = async (data: IFormData) => {
    await doSubmit(data);
  };

  const doSubmit = async (data: IFormData) => {
    setIsSubmitting(true);
    try {
      const first_charge_date = calcFirstChargeDate(chargeMonth);
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
      handleClose();
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
                    {sourceType === 'card'
                      ? `Vencimento da fatura: ${formattedChargeDate}`
                      : `1ª cobrança em: ${formattedChargeDate}`}
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
                <PreviewRow>
                  <PreviewLabel>1ª parcela</PreviewLabel>
                  <PreviewValue>{format(parseISO(currentFirstChargeDate), "MMMM 'de' yyyy", { locale: ptBR })}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Última parcela</PreviewLabel>
                  <PreviewValue>
                    {format(addMonths(parseISO(currentFirstChargeDate), installmentsCount - 1), "MMMM 'de' yyyy", { locale: ptBR })}
                  </PreviewValue>
                </PreviewRow>
              </PreviewBox>
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
                    <RNScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
