import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { useAuth } from '../../hooks/useAuth';
import {
  ActionsArea, AppName, Divider, DividerLine, DividerText,
  ErrorBox, ErrorMessage, ErrorText, EyeBtn, FieldIcon, FieldInput,
  FieldRow, FieldWrapper, ForgotLink, ForgotLinkText,
  LogoArea, LogoBadge, Safe, Scroll, Tagline,
} from './style';

const schema = z.object({
  email: z.string().min(1, 'Preencha este campo').email('E-mail inválido'),
  password: z.string().min(1, 'Preencha este campo'),
});

type IFormData = z.infer<typeof schema>;

interface IProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export function LoginScreen({ onGoToRegister, onGoToForgotPassword }: IProps) {
  const theme = useTheme();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: IFormData) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha inválidos.');
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
            <Tagline>Controle suas finanças com facilidade</Tagline>
          </LogoArea>

          {error ? <ErrorBox><ErrorMessage>{error}</ErrorMessage></ErrorBox> : null}

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FieldWrapper>
                <FieldRow hasError={!!errors.email}>
                  <FieldIcon>
                    <Ionicons name="mail-outline" size={18} color={theme.colors.textSecondary} />
                  </FieldIcon>
                  <FieldInput
                    placeholder="E-mail"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                </FieldRow>
                {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
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
                    placeholder="Senha"
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

          <ForgotLink onPress={onGoToForgotPassword} activeOpacity={0.7}>
            <ForgotLinkText>Esqueci minha senha</ForgotLinkText>
          </ForgotLink>

          <ActionsArea>
            <ButtonGlobal label="Entrar" onPress={handleSubmit(onSubmit)} loading={loading} />
            <Divider>
              <DividerLine /><DividerText>ou</DividerText><DividerLine />
            </Divider>
            <ButtonGlobal label="Criar conta" variant="outline" onPress={onGoToRegister} />
          </ActionsArea>

        </Scroll>
      </KeyboardAvoidingView>
    </Safe>
  );
}
