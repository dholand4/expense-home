import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Container, Label } from './style';

interface IButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export function buttonGlobal({ label, onPress, variant = 'primary', disabled, loading }: IButtonProps) {
  const theme = useTheme();
  return (
    <Container onPress={onPress} disabled={disabled || loading} variant={variant} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.text} />
      ) : (
        <Label variant={variant}>{label}</Label>
      )}
    </Container>
  );
}
