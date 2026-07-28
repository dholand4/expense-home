import styled from 'styled-components/native';

export const Container = styled.TouchableOpacity<{ disabled?: boolean; variant?: 'primary' | 'outline' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme, variant }) => {
    if (variant === 'outline') return 'transparent';
    if (variant === 'danger') return theme.colors.error;
    return theme.colors.primary;
  }};
  border-width: ${({ variant }) => (variant === 'outline' ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

export const Label = styled.Text<{ variant?: 'primary' | 'outline' | 'danger' }>`
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 600;
  color: ${({ theme, variant }) =>
    variant === 'outline' ? theme.colors.primary : theme.colors.text};
`;
