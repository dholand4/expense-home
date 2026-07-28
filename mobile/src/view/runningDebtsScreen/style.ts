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

export const DebtCard = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const DebtRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const DebtName = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
`;

export const DebtMeta = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const ProgressBar = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  overflow: hidden;
`;

export const ProgressFill = styled.View<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background-color: ${({ theme }) => theme.colors.success};
  border-radius: 4px;
`;

export const ProgressLabel = styled.Text`
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

export const SmallButton = styled.View<{ variant?: 'danger' | 'success' }>`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme, variant }) =>
    variant === 'danger'
      ? theme.colors.error + '22'
      : variant === 'success'
      ? theme.colors.success + '22'
      : theme.colors.primary + '22'};
`;

export const SmallButtonText = styled.Text<{ variant?: 'danger' | 'success' }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, variant }) =>
    variant === 'danger'
      ? theme.colors.error
      : variant === 'success'
      ? theme.colors.success
      : theme.colors.primary};
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
