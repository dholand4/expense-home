export { ScreenSafe as Safe } from '../../components/screenSafe';
import styled from 'styled-components/native';

export const Scroll = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 180,
  },
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const LogoArea = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

export const LogoBadge = styled.View`
  width: 72px;
  height: 72px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const AppName = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  letter-spacing: 0.5px;
`;

export const Tagline = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  text-align: center;
`;

export const FieldWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const FieldRow = styled.View<{ hasError?: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme, hasError }) => hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

export const FieldIcon = styled.View`
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const FieldInput = styled.TextInput`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const EyeBtn = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

export const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 4px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

export const ErrorBox = styled.View`
  background-color: ${({ theme }) => theme.colors.error}22;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ErrorMessage = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const ActionsArea = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Divider = styled.View`
  flex-direction: row;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.md}px 0;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const DividerText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ForgotLink = styled.TouchableOpacity`
  align-self: flex-end;
  margin-top: -${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const ForgotLinkText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

export const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  justify-content: center;
`;

export const FormCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const FormTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.h3}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
