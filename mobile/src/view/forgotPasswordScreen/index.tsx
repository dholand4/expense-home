import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { KeyboardSafeScreen } from '../../components/keyboardSafeScreen';
import { authService } from '../../services/authService';
import { AuthStackParamList } from '../../routes/types';
import {
  ActionsArea, AppName, BackLink, BackLinkText, ErrorBox, ErrorMessage,
  FieldIcon, FieldInput, FieldRow, FieldWrapper, LogoArea, LogoBadge,
  Safe, Scroll, SuccessBox, SuccessText, Tagline,
} from './style';

const schema = z.object({
  email: z.string().min(1, 'Preencha este campo').email('E-mail inválido'),
});
type IFormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPasswordScreen'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: IFormData) => {
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      navigation.navigate('ResetPasswordScreen', {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Safe>
      <KeyboardSafeScreen>
        <Scroll>
          <LogoArea>
            <LogoBadge>
              <Image source={require('../../assets/LOGODQ.png')} style={{ width: 72, height: 72, borderRadius: 18 }} />
            </LogoBadge>
            <AppName>DQ Finanças</AppName>
            <Tagline>Recuperar acesso à conta</Tagline>
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
                    placeholder="E-mail cadastrado"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                </FieldRow>
              </FieldWrapper>
            )}
          />

          <ActionsArea>
            <ButtonGlobal label="Enviar código de recuperação" onPress={handleSubmit(onSubmit)} loading={loading} />
          </ActionsArea>

          <BackLink onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={16} color={theme.colors.primary} />
            <BackLinkText>Voltar para o login</BackLinkText>
          </BackLink>
        </Scroll>
      </KeyboardSafeScreen>
    </Safe>
  );
}
