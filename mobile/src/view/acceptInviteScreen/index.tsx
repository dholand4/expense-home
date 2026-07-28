import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { authService } from '../../services/authService';
import { storage } from '../../utils/storage';
import { AuthStackParamList } from '../../routes/types';
import {
  AppName,
  Container,
  ErrorBox,
  ErrorMessage,
  FormCard,
  FormTitle,
  Safe,
  Tagline,
} from '../loginScreen/style';

const schema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type IFormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'AcceptInviteScreen'>;

export function AcceptInviteScreen({ route }: Props) {
  const { token } = route.params;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<IFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: IFormData) => {
    setError('');
    setLoading(true);
    try {
      const { token: authToken } = await authService.acceptInvite({ token, password: data.password });
      await storage.setToken(authToken);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Safe>
        <Container>
          <FormCard>
            <FormTitle>Conta ativada!</FormTitle>
            <AppName>Reinicie o app para entrar.</AppName>
          </FormCard>
        </Container>
      </Safe>
    );
  }

  return (
    <Safe>
      <Container>
        <AppName>DQ Finanças</AppName>
        <Tagline>Defina sua senha para ativar a conta</Tagline>
        <FormCard style={{ marginTop: 24 }}>
          <FormTitle>Aceitar convite</FormTitle>
          {error ? (
            <ErrorBox>
              <ErrorMessage>{error}</ErrorMessage>
            </ErrorBox>
          ) : null}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <InputGlobal
                label="Nova senha"
                placeholder="••••••"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
          <ButtonGlobal label="Ativar conta" onPress={handleSubmit(onSubmit)} loading={loading} />
        </FormCard>
      </Container>
    </Safe>
  );
}
