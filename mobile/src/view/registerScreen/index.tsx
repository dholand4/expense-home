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
  FieldRow, FieldWrapper, LogoArea, LogoBadge, Safe, Scroll, Tagline,
} from './style';

const schema = z.object({
  full_name: z.string().min(1, 'Preencha este campo').min(2, 'Nome muito curto'),
  email: z.string().min(1, 'Preencha este campo').email('E-mail inválido'),
  password: z.string().min(1, 'Preencha este campo').min(6, 'Mínimo 6 caracteres'),
  confirm: z.string().min(1, 'Preencha este campo'),
}).refine((d) => d.password === d.confirm, {
  message: 'As senhas não conferem',
  path: ['confirm'],
});

type IFormData = z.infer<typeof schema>;

export function RegisterScreen({ onGoToLogin }: { onGoToLogin: () => void }) {
  const theme = useTheme();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = async (data: IFormData) => {
    setError('');
    setLoading(true);
    try {
      await register(data.full_name, data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta. Tente novamente.');
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
            <Tagline>Crie sua conta gratuitamente</Tagline>
          </LogoArea>

          {error ? <ErrorBox><ErrorMessage>{error}</ErrorMessage></ErrorBox> : null}

          <Controller
            control={control}
            name="full_name"
            render={({ field }) => (
              <FieldWrapper>
                <FieldRow hasError={!!errors.full_name}>
                  <FieldIcon>
                    <Ionicons name="person-outline" size={18} color={theme.colors.textSecondary} />
                  </FieldIcon>
                  <FieldInput
                    placeholder="Nome completo"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                </FieldRow>
                {errors.full_name && <ErrorText>{errors.full_name.message}</ErrorText>}
              </FieldWrapper>
            )}
          />

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
            <ButtonGlobal label="Criar conta" onPress={handleSubmit(onSubmit)} loading={loading} />
            <Divider>
              <DividerLine /><DividerText>ou</DividerText><DividerLine />
            </Divider>
            <ButtonGlobal label="Já tenho conta" variant="outline" onPress={onGoToLogin} />
          </ActionsArea>

        </Scroll>
      </KeyboardAvoidingView>
    </Safe>
  );
}
