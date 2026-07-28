import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { addMonths, subMonths } from 'date-fns';
import { useTheme } from 'styled-components/native';
import { useCards } from '../../hooks/useCards';
import { useBillAccounts } from '../../hooks/useBillAccounts';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, formatCurrency, formatMonth, getInstallments, getMonthKey } from '../../utils/finance';
import { useProfile } from '../../providers/profileProvider';
import {
  AvatarButton, AvatarInitial, CategoryAmount, CategoryCard,
  CategoryEmoji, CategoryIconBox, CategoryItem, CategoryItemBorder,
  CategoryName, CategoryRow, Container, GreetingBlock, GreetingLabel,
  GreetingName, Header, MonthLabel, MonthNav, ProgressBar, ProgressFill,
  Safe, SectionLabel, SectionRow, SeeAll, SourceAmount, SourceName,
  SourceRow, SourcesSection, TotalCard, TotalLabel, TotalValue,
  TrendRow, TrendText,
} from './style';

const VISIBLE_LIMIT = 4;

export function DashboardScreen() {
  const theme = useTheme();
  const { openProfile } = useProfile();
  const { user } = useAuth();
  const { expenses, isLoading } = useExpenses();
  const { cards } = useCards();
  const { billAccounts } = useBillAccounts();
  const [monthOffset, setMonthOffset] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  const selectedDate =
    monthOffset === 0 ? today
    : monthOffset > 0 ? addMonths(today, monthOffset)
    : subMonths(today, -monthOffset);
  const currentMonthKey = getMonthKey(selectedDate);
  const prevMonthKey = getMonthKey(subMonths(selectedDate, 1));

  const firstName = user?.full_name?.split(' ')[0] ?? 'Você';
  const initial = firstName[0]?.toUpperCase() ?? '?';

  const allInstallments = useMemo(
    () => expenses.flatMap(getInstallments),
    [expenses],
  );

  const currentInstallments = useMemo(
    () => allInstallments.filter(i => i.month_key === currentMonthKey),
    [allInstallments, currentMonthKey],
  );

  const prevInstallments = useMemo(
    () => allInstallments.filter(i => i.month_key === prevMonthKey),
    [allInstallments, prevMonthKey],
  );

  const totalMonth = useMemo(
    () => currentInstallments.reduce((sum, i) => sum + i.value, 0),
    [currentInstallments],
  );

  const totalPrevMonth = useMemo(
    () => prevInstallments.reduce((sum, i) => sum + i.value, 0),
    [prevInstallments],
  );

  const trendPercent = useMemo(() => {
    if (totalPrevMonth === 0) return null;
    return ((totalMonth - totalPrevMonth) / totalPrevMonth) * 100;
  }, [totalMonth, totalPrevMonth]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    currentInstallments.forEach(i => {
      map[i.category] = (map[i.category] ?? 0) + i.value;
    });
    return Object.entries(map)
      .map(([key, amount]) => ({
        name: CATEGORIES[key]?.label ?? key,
        emoji: CATEGORIES[key]?.emoji ?? '📦',
        key,
        amount,
        color: CATEGORIES[key]?.color ?? '#94A3B8',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentInstallments]);

  const visibleCategories = showAll ? byCategory : byCategory.slice(0, VISIBLE_LIMIT);

  const cardTotals = useMemo(() =>
    cards.map(card => ({
      name: card.name,
      amount: currentInstallments
        .filter(i => i.source_type === 'card' && i.source_id === card.id)
        .reduce((s, i) => s + i.value, 0),
    })).filter(s => s.amount > 0),
    [cards, currentInstallments],
  );

  const billTotals = useMemo(() =>
    billAccounts.map(bill => ({
      name: bill.name,
      amount: currentInstallments
        .filter(i => i.source_type === 'bill_account' && i.source_id === bill.id)
        .reduce((s, i) => s + i.value, 0),
    })).filter(s => s.amount > 0),
    [billAccounts, currentInstallments],
  );

  if (isLoading) {
    return (
      <Safe>
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      </Safe>
    );
  }

  const isPositiveTrend = trendPercent !== null && trendPercent < 0;

  return (
    <Safe>
      <Header>
        <GreetingBlock>
          <GreetingLabel>Olá,</GreetingLabel>
          <GreetingName>{firstName}</GreetingName>
        </GreetingBlock>
        <AvatarButton onPress={openProfile} activeOpacity={0.8}>
          <AvatarInitial>{initial}</AvatarInitial>
        </AvatarButton>
      </Header>

      <Container showsVerticalScrollIndicator={false}>

        <MonthNav>
          <TouchableOpacity onPress={() => setMonthOffset(o => o - 1)}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMonthOffset(0)}>
            <MonthLabel>{formatMonth(selectedDate)}</MonthLabel>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMonthOffset(o => o + 1)}>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </MonthNav>

        <TotalCard>
          <TotalLabel>Gastos do mês</TotalLabel>
          <TotalValue>{formatCurrency(totalMonth)}</TotalValue>
          {trendPercent !== null && (
            <TrendRow>
              <Ionicons
                name={isPositiveTrend ? 'arrow-down' : 'arrow-up'}
                size={13}
                color={isPositiveTrend ? theme.colors.success : theme.colors.error}
              />
              <TrendText positive={isPositiveTrend}>
                {Math.abs(trendPercent).toFixed(0)}%{' '}
                {isPositiveTrend ? 'abaixo do mês passado' : 'acima do mês passado'}
              </TrendText>
            </TrendRow>
          )}
        </TotalCard>

        {byCategory.length > 0 && (
          <>
            <SectionRow>
              <SectionLabel>Gastos por categoria</SectionLabel>
              {byCategory.length > VISIBLE_LIMIT && (
                <TouchableOpacity onPress={() => setShowAll(v => !v)}>
                  <SeeAll>{showAll ? 'Ver menos' : 'Ver tudo'}</SeeAll>
                </TouchableOpacity>
              )}
            </SectionRow>

            <CategoryCard>
              {visibleCategories.map((c, index) => {
                const percent = totalMonth > 0 ? (c.amount / totalMonth) * 100 : 0;
                const isLast = index === visibleCategories.length - 1;
                const Wrapper = isLast ? CategoryItem : CategoryItemBorder;
                return (
                  <Wrapper key={c.key}>
                    <CategoryRow>
                      <CategoryIconBox>
                        <CategoryEmoji>{c.emoji}</CategoryEmoji>
                      </CategoryIconBox>
                      <CategoryName>{c.name}</CategoryName>
                      <CategoryAmount>{formatCurrency(c.amount)}</CategoryAmount>
                    </CategoryRow>
                    <ProgressBar>
                      <ProgressFill color={c.color} percent={percent} />
                    </ProgressBar>
                  </Wrapper>
                );
              })}
            </CategoryCard>
          </>
        )}

        {(cardTotals.length > 0 || billTotals.length > 0) && (
          <SourcesSection>
            {cardTotals.length > 0 && (
              <>
                <SectionRow>
                  <SectionLabel>Por cartão</SectionLabel>
                </SectionRow>
                {cardTotals.map(s => (
                  <SourceRow key={s.name}>
                    <SourceName>{s.name}</SourceName>
                    <SourceAmount>{formatCurrency(s.amount)}</SourceAmount>
                  </SourceRow>
                ))}
              </>
            )}
            {billTotals.length > 0 && (
              <View style={{ marginTop: cardTotals.length > 0 ? 16 : 0 }}>
                <SectionRow>
                  <SectionLabel>Por débito / boleto</SectionLabel>
                </SectionRow>
                {billTotals.map(s => (
                  <SourceRow key={s.name}>
                    <SourceName>{s.name}</SourceName>
                    <SourceAmount>{formatCurrency(s.amount)}</SourceAmount>
                  </SourceRow>
                ))}
              </View>
            )}
          </SourcesSection>
        )}

        <View style={{ height: 32 }} />
      </Container>
    </Safe>
  );
}
