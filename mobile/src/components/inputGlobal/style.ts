import styled from 'styled-components/native';

export const Wrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const LabelText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  font-weight: 500;
`;

export const InputRow = styled.View<{ hasError?: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

export const StyledInput = styled.TextInput<{ hasError?: boolean; hasEye?: boolean }>`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const EyeButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  justify-content: center;
  align-items: center;
`;

export const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;
