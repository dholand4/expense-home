import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { categoryBadgeGlobal as CategoryBadge } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('categoryBadgeGlobal', () => {
  it('renders known category label', () => {
    expect(wrap(<CategoryBadge category="Alimentação" />).getByText('Alimentação')).toBeTruthy();
  });

  it('renders unknown category as fallback', () => {
    expect(wrap(<CategoryBadge category="Desconhecido" />).getByText('Desconhecido')).toBeTruthy();
  });
});
