// Reutiliza estilos do loginScreen
export {
  Safe, Scroll, LogoArea, LogoBadge, AppName, Tagline,
  FieldWrapper, FieldRow, FieldIcon, FieldInput,
  ErrorText, ErrorBox, ErrorMessage, ActionsArea,
} from '../loginScreen/style';

import styled from 'styled-components/native';

export const SuccessBox = styled.View`
  background-color: ${({ theme }) => theme.colors.success}22;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.success}55;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const SuccessText = styled.Text`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.body}px;
  text-align: center;
  font-weight: 500;
`;

export const BackLink = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  gap: 4px;
`;

export const BackLinkText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 500;
`;
