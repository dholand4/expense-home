import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ErrorText, EyeButton, InputRow, LabelText, StyledInput, Wrapper } from './style';

interface IInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function inputGlobal({ label, error, secureTextEntry, ...rest }: IInputProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);
  const isPassword = secureTextEntry === true;

  return (
    <Wrapper>
      {label ? <LabelText>{label}</LabelText> : null}
      <InputRow hasError={!!error}>
        <StyledInput
          hasError={!!error}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={isPassword ? hidden : false}
          {...rest}
        />
        {isPassword && (
          <EyeButton onPress={() => setHidden(h => !h)} activeOpacity={0.6}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.colors.textSecondary}
            />
          </EyeButton>
        )}
      </InputRow>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Wrapper>
  );
}
