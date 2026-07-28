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

export const Container = styled.ScrollView`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

export const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.h3}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const SourceCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SourceRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SourceName = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export const SourceMeta = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const ProgressBar = styled.View`
  height: 6px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  overflow: hidden;
`;

export const ProgressFill = styled.View<{ percent: number; color: string }>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background-color: ${({ color }) => color};
  border-radius: 3px;
`;

export const LimitText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  text-align: right;
`;

export const ActionRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SmallButton = styled.View<{ variant?: 'danger' }>`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.error + '22' : theme.colors.primary + '22'};
`;

export const SmallButtonText = styled.Text<{ variant?: 'danger' }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.error : theme.colors.primary};
  font-weight: 600;
`;

export const AddButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

export const AddButtonText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const FAB = styled.TouchableOpacity`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xl}px;
  right: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.primary};
  width: 56px;
  height: 56px;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
  elevation: 4;
`;

export const SpeedDial = styled.View`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xl + 64}px;
  right: ${({ theme }) => theme.spacing.lg}px;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SpeedDialItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SpeedDialLabel = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SpeedDialLabelText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export const SpeedDialButton = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  elevation: 3;
`;

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: #00000088;
  justify-content: flex-end;
`;

export const ModalCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-top-right-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const ModalTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.h3}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;
