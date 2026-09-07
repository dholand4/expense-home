import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { KeyboardSafeScreen } from '../../components/keyboardSafeScreen';
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

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../routes/types';

type IFormData = z.infer<typeof schema>;

interface IProps {
  navigation?: NativeStackScreenProps<AuthStackParamList, 'RegisterScreen'>['navigation'];
  onGoToLogin?: () => void;
}

export function RegisterScreen({ navigation, onGoToLogin }: IProps) {
  const handleGoToLogin = onGoToLogin ?? (() => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('LoginScreen');
    }
  });
  const theme = useTheme();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const scrollRef = useRef<any>(null);

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
      <KeyboardSafeScreen>
        <Scroll ref={scrollRef}>

          <LogoArea style={{ marginBottom: 12 }}>
            <LogoBadge style={{ width: 48, height: 48, marginBottom: 6 }}>
              <Image source={require('../../assets/LOGODQ.png')} style={{ width: 48, height: 48, borderRadius: 12 }} />
            </LogoBadge>
            <AppName style={{ fontSize: 22 }}>DQ Finanças</AppName>
            <Tagline style={{ fontSize: 13, marginTop: 2 }}>Crie sua conta gratuitamente</Tagline>
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
            <ButtonGlobal label="Já tenho conta" variant="outline" onPress={handleGoToLogin} />
          </ActionsArea>

        </Scroll>
      </KeyboardSafeScreen>
    </Safe>
  );
}
