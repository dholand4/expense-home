import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { authService } from '../../services/authService';
import { AuthStackParamList } from '../../routes/types';
import {
  ActionsArea, AppName, BackLink, BackLinkText, ErrorBox, ErrorMessage,
  ErrorText, EyeBtn, FieldIcon, FieldInput, FieldRow, FieldWrapper,
  LogoArea, LogoBadge, Safe, Scroll, SuccessBox, SuccessText, Tagline,
} from './style';

const schema = z.object({
  token: z.string().min(1, 'Preencha este campo').min(8, 'Digite o código de 8 caracteres recebido no e-mail'),
  password: z.string().min(1, 'Preencha este campo').min(6, 'Mínimo 6 caracteres'),
  confirm: z.string().min(1, 'Preencha este campo'),
}).refine((d) => d.password === d.confirm, {
  message: 'As senhas não conferem',
  path: ['confirm'],
});
type IFormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPasswordScreen'>;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const paramToken = route.params?.token ?? '';
  const theme = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { token: paramToken, password: '', confirm: '' },
  });

  const onSubmit = async (data: IFormData) => {
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(data.token, data.password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Safe>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Scroll>
          <LogoArea>
            <LogoBadge>
              <Image source={require('../../assets/LOGODQ.png')} style={{ width: 72, height: 72, borderRadius: 18 }} />
            </LogoBadge>
            <AppName>DQ Finanças</AppName>
            <Tagline>Crie uma nova senha</Tagline>
          </LogoArea>

          {done ? (
            <SuccessBox>
              <Ionicons name="checkmark-circle-outline" size={28} color={theme.colors.success} />
              <SuccessText>Senha redefinida com sucesso! Faça login com a nova senha.</SuccessText>
            </SuccessBox>
          ) : (
            <>
              {error ? <ErrorBox><ErrorMessage>{error}</ErrorMessage></ErrorBox> : null}

              {/* Campo de token — preenchido automaticamente se vier por deep link */}
              <Controller
                control={control}
                name="token"
                render={({ field }) => (
                  <FieldWrapper>
                    <FieldRow hasError={!!errors.token}>
                      <FieldIcon>
                        <Ionicons name="key-outline" size={18} color={theme.colors.textSecondary} />
                      </FieldIcon>
                      <FieldInput
                        placeholder="Ex: AB3X9K2M"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        multiline={false}
                        value={field.value}
                        onChangeText={(v) => field.onChange(v.toUpperCase().trim())}
                      />
                    </FieldRow>
                    {errors.token && <ErrorText>{errors.token.message}</ErrorText>}
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FieldWrapper>
                    <FieldRow hasError={!!errors.password}>
                      <FieldIcon>
                        <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textSecondary} />
                      </FieldIcon>
                      <FieldInput
                        placeholder="Nova senha"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showPassword}
                        value={field.value}
                        onChangeText={field.onChange}
                      />
                      <EyeBtn onPress={() => setShowPassword(v => !v)} activeOpacity={0.6}>
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={theme.colors.textSecondary}
                        />
                      </EyeBtn>
                    </FieldRow>
                    {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="confirm"
                render={({ field }) => (
                  <FieldWrapper>
                    <FieldRow hasError={!!errors.confirm}>
                      <FieldIcon>
                        <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textSecondary} />
                      </FieldIcon>
                      <FieldInput
                        placeholder="Confirmar senha"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showConfirm}
                        value={field.value}
                        onChangeText={field.onChange}
                      />
                      <EyeBtn onPress={() => setShowConfirm(v => !v)} activeOpacity={0.6}>
                        <Ionicons
                          name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={theme.colors.textSecondary}
                        />
                      </EyeBtn>
                    </FieldRow>
                    {errors.confirm && <ErrorText>{errors.confirm.message}</ErrorText>}
                  </FieldWrapper>
                )}
              />

              <ActionsArea>
                <ButtonGlobal label="Redefinir senha" onPress={handleSubmit(onSubmit)} loading={loading} />
              </ActionsArea>
            </>
          )}

          <BackLink onPress={() => navigation.navigate('LoginRegisterFlow')}>
            <Ionicons name="arrow-back-outline" size={16} color={theme.colors.primary} />
            <BackLinkText>Voltar para o login</BackLinkText>
          </BackLink>
        </Scroll>
      </KeyboardAvoidingView>
    </Safe>
  );
}
