export { ScreenSafe as Safe } from '../../components/screenSafe';

import styled from 'styled-components/native';


export const Header = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px
    ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const SearchBar = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.typography.body}px;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.md}px;
`;

export const ExpenseItem = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const ExpenseRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const ExpenseDescription = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const ExpenseAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const ExpenseMeta = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const BadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ActionRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
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
  shadow-color: ${({ theme }) => theme.colors.primary};
  shadow-opacity: 0.4;
  shadow-radius: 8px;
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
  max-height: 90%;
`;

export const ModalTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.h3}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
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
