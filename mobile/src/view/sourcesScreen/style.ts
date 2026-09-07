export { ScreenSafe as Safe } from '../../components/screenSafe';
import styled from 'styled-components/native';

export const Header = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.Text`
  font-size: 26px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

export const Container = styled.ScrollView`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

/* ── OVERVIEW HERO CARD ── */
export const OverviewCard = styled.View`
  background-color: ${({ theme }) => theme.colors.cardElevated || theme.colors.card};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.cardBorder || theme.colors.border};
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.3;
  shadow-radius: 12px;
  elevation: 6;
`;

export const OverviewHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const OverviewTitle = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 700;
`;

export const OverviewBadge = styled.View<{ color?: string }>`
  padding: 4px 10px;
  border-radius: 9999px;
  background-color: ${({ color }) => (color ? color + '22' : '#25a77c22')};
`;

export const OverviewBadgeText = styled.Text<{ color?: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ color }) => color || '#25a77c'};
`;

export const OverviewMainAmount = styled.Text`
  font-size: 30px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.8px;
`;

export const OverviewMainLabel = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
  margin-bottom: 14px;
`;

export const OverviewMetricsRow = styled.View`
  flex-direction: row;
  padding-top: 14px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  justify-content: space-between;
`;

export const MetricItem = styled.View`
  flex: 1;
`;

export const MetricLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

export const MetricValue = styled.Text<{ color?: string }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ color, theme }) => color || theme.colors.text};
  margin-top: 2px;
`;

/* ── FILTER PILLS ── */
export const FilterScroll = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { gap: 8, paddingBottom: 16 },
})``;

export const FilterPill = styled.TouchableOpacity<{ active?: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 8px 14px;
  border-radius: 9999px;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.surface};
  border-width: 1px;
  border-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.border};
`;

export const FilterPillText = styled.Text<{ active?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ active, theme }) => (active ? '#ffffff' : theme.colors.textSecondary)};
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.2px;
`;

/* ── SMARTCARD DE LUXO ── */
export const SmartCard = styled.View<{ accentColor?: string }>`
  background-color: #121815;
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: ${({ accentColor }) => (accentColor ? accentColor + '40' : '#27312b')};
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  elevation: 5;
  overflow: hidden;
`;

export const CardTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const CardBankArea = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const CardBankIconBox = styled.View<{ bg?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: ${({ bg }) => bg || '#25a77c22'};
  align-items: center;
  justify-content: center;
`;

export const CardBankName = styled.Text`
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
`;

export const CardChipRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
`;

export const CardChip = styled.View`
  width: 34px;
  height: 24px;
  border-radius: 5px;
  background-color: #d4af3733;
  border-width: 1px;
  border-color: #d4af3788;
  align-items: center;
  justify-content: center;
`;

export const CardChipInner = styled.View`
  width: 16px;
  height: 12px;
  border-radius: 2px;
  border-width: 1px;
  border-color: #d4af37aa;
`;

export const CardNumberSim = styled.Text`
  font-size: 13px;
  font-family: ${() => (undefined)};
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 4px;
`;

export const CardLimitArea = styled.View`
  margin-top: 16px;
`;

export const CardLimitRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 6px;
`;

export const AvailableAmount = styled.Text<{ color?: string }>`
  font-size: 18px;
  font-weight: 800;
  color: ${({ color, theme }) => color || theme.colors.primaryLight};
`;

export const TotalLimitText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ProgressBar = styled.View`
  height: 7px;
  background-color: #202723;
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.View<{ percent: number; color: string }>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background-color: ${({ color }) => color};
  border-radius: 4px;
`;

export const CardFooter = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: #1e2621;
`;

export const DueDateBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  background-color: #1e2621;
  padding: 5px 10px;
  border-radius: 8px;
`;

export const DueDateText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

export const ActionPillsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const ActionPill = styled.TouchableOpacity<{ danger?: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 11px;
  border-radius: 8px;
  background-color: ${({ danger, theme }) =>
    danger ? theme.colors.error + '18' : theme.colors.surfaceLight};
`;

export const ActionPillText = styled.Text<{ danger?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ danger, theme }) => (danger ? theme.colors.error : theme.colors.text)};
`;

/* ── BILL ACCOUNTS MODERN CARD ── */
export const BillCard = styled.View`
  background-color: ${({ theme }) => theme.colors.cardElevated || theme.colors.card};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.cardBorder || theme.colors.border};
`;

export const BillTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const BillInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const BillIconBox = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.primary + '20'};
  align-items: center;
  justify-content: center;
`;

export const BillName = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const BillDescription = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1px;
`;

export const BillFooter = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border + '60'};
`;

/* ── FAB & SPEED DIAL ── */
export const FAB = styled.TouchableOpacity`
  position: absolute;
  bottom: 24px;
  right: 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  width: 56px;
  height: 56px;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
  shadow-color: ${({ theme }) => theme.colors.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.4;
  shadow-radius: 8px;
  elevation: 6;
`;

export const SpeedDial = styled.View`
  position: absolute;
  bottom: 90px;
  right: 20px;
  align-items: flex-end;
  gap: 10px;
`;

export const SpeedDialItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const SpeedDialLabel = styled.View`
  background-color: ${({ theme }) => theme.colors.cardElevated || theme.colors.card};
  border-radius: 10px;
  padding: 6px 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SpeedDialLabelText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export const SpeedDialButton = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 42px;
  height: 42px;
  border-radius: 21px;
  align-items: center;
  justify-content: center;
  elevation: 4;
`;

/* ── HUB / SELECTION SCREEN ── */
export const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  gap: 4px;
`;

export const BackButtonText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const HubContainer = styled.ScrollView`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
`;

export const SelectionCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SelectionIconBox = styled.View<{ bg?: string }>`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: ${({ bg, theme }) => bg ?? theme.colors.primary + '18'};
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const SelectionInfo = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const SelectionTitle = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 3px;
`;

export const SelectionDesc = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 18px;
  margin-bottom: 6px;
`;

export const SelectionBadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

export const SelectionBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 3px 8px;
  border-radius: 6px;
`;

export const SelectionBadgeText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ConstructionTag = styled.View`
  background-color: ${({ theme }) => theme.colors.warning + '22'};
  padding: 2px 8px;
  border-radius: 6px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.warning + '44'};
`;

export const ConstructionTagText = styled.Text`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.warning};
`;

export const UnderConstructionBox = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
`;

export const UnderConstructionIconBox = styled.View`
  width: 84px;
  height: 84px;
  border-radius: 42px;
  background-color: ${({ theme }) => theme.colors.warning + '18'};
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

export const UnderConstructionTitle = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

export const UnderConstructionSubtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 22px;
`;
