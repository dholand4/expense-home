import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { inputGlobal as InputGlobal } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('inputGlobal', () => {
  it('renders label', () => {
    expect(wrap(<InputGlobal label="E-mail" />).getByText('E-mail')).toBeTruthy();
  });

  it('renders error message', () => {
    expect(
      wrap(<InputGlobal label="Senha" error="Campo obrigatório" />).getByText('Campo obrigatório'),
    ).toBeTruthy();
  });

  it('renders without label', () => {
    expect(wrap(<InputGlobal placeholder="Digite aqui" />).toJSON()).toBeTruthy();
  });
});
