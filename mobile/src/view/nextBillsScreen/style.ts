export { ScreenSafe as Safe } from '../../components/screenSafe';

import styled from 'styled-components/native';


export const Header = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const MonthNav = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const MonthLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  min-width: 140px;
  text-align: center;
  text-transform: capitalize;
`;

export const SummaryBar = styled.View`
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SummaryChip = styled.TouchableOpacity<{
  active?: boolean;
  activeColor?: string;
  bgColor?: string;
}>`
  flex: 1;
  background-color: ${({ theme, active, bgColor }) =>
    active ? (bgColor ?? theme.colors.primary + '22') : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  border-width: 1.5px;
  border-color: ${({ theme, active, activeColor }) =>
    active ? (activeColor ?? theme.colors.primary) : 'transparent'};
`;

export const SummaryChipLabel = styled.Text<{ active?: boolean; activeColor?: string }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, active, activeColor }) =>
    active ? (activeColor ?? theme.colors.primary) : theme.colors.textSecondary};
  font-weight: ${({ active }) => (active ? '700' : '500')};
  margin-bottom: 2px;
`;

export const SummaryChipValue = styled.Text<{ active?: boolean; activeColor?: string }>`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme, active, activeColor }) =>
    active ? (activeColor ?? theme.colors.primary) : theme.colors.text};
  font-weight: 700;
`;

export const SourceSummaryCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SourceSummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const SourceSummaryName = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
`;

export const SourceSummaryAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const SourceSummaryStatus = styled.Text<{ paid: boolean }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, paid }) => (paid ? theme.colors.success : theme.colors.warning)};
  font-weight: 600;
`;

export const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
`;

export const BillItem = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const BillRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const BillDescription = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
`;

export const BillAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const BillMeta = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const StatusBadge = styled.View<{ paid: boolean }>`
  background-color: ${({ theme, paid }) =>
    paid ? theme.colors.success + '22' : theme.colors.warning + '22'};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
`;

export const PaidBadge = styled.TouchableOpacity<{ paid: boolean }>`
  background-color: ${({ theme, paid }) =>
    paid ? theme.colors.success + '22' : theme.colors.warning + '22'};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
`;

export const PaidBadgeText = styled.Text<{ paid: boolean }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, paid }) => (paid ? theme.colors.success : theme.colors.warning)};
  font-weight: 600;
`;

export const SourceHeader = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

export const SourceExpandedContent = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const InstallmentRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border}44;
`;

export const InstallmentInfo = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const InstallmentDesc = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export const InstallmentMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

export const InstallmentBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 2px 6px;
`;

export const InstallmentBadgeText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

export const InstallmentRight = styled.View`
  align-items: flex-end;
  gap: 4px;
`;

export const InstallmentValue = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const ShowMoreBtn = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.xs}px 0;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const ShowMoreBtnText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const PayButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary}22;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

export const PayButtonText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;
