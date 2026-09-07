export { ScreenSafe as Safe } from '../../components/screenSafe';

import styled from 'styled-components/native';

export const Container = styled.ScrollView`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px
    ${({ theme }) => theme.spacing.md}px;
`;

export const GreetingBlock = styled.View``;

export const GreetingLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2px;
`;

export const GreetingName = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const AvatarButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

export const AvatarInitial = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
`;

export const MonthNav = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const MonthLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  text-transform: capitalize;
  min-width: 140px;
  text-align: center;
`;

export const TotalCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  justify-content: center;
`;

export const TotalLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  text-align: center;
`;

export const TotalValue = styled.Text`
  font-size: 32px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  text-align: center;
`;

export const TrendRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const TrendText = styled.Text<{ positive: boolean }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ positive, theme }) => positive ? theme.colors.success : theme.colors.error};
  font-weight: 500;
  text-align: center;
`;

export const SectionRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const SectionLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export const SeeAll = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const CategoryCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const CategoryItem = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

export const CategoryItemBorder = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const CategoryRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

export const CategoryIconBox = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryEmoji = styled.Text`
  font-size: 16px;
`;

export const CategoryName = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
`;

export const CategoryAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const ProgressBar = styled.View`
  height: 4px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

export const ProgressFill = styled.View<{ color: string; percent: number }>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background-color: ${({ color }) => color};
  border-radius: 2px;
`;

export const SourcesSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const SourceRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const SourceName = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`;

export const SourceAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const ExpensesSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const ExpenseItemCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const ExpenseCategoryIndicator = styled.View<{ color: string }>`
  width: 4px;
  height: 36px;
  border-radius: 2px;
  background-color: ${({ color }) => color};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const ExpenseItemInfo = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const ExpenseItemTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  margin-bottom: 3px;
`;

export const ExpenseItemMeta = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ExpenseMetaBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 2px 6px;
  border-radius: 4px;
`;

export const ExpenseMetaText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

export const ExpenseItemAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const EmptyExpensesCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const EmptyExpensesText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const FAB = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  elevation: 6;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
`;
