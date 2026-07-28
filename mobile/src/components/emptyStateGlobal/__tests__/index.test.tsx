import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { emptyStateGlobal as EmptyState } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('emptyStateGlobal', () => {
  it('renders title', () => {
    expect(wrap(<EmptyState title="Nenhum item" />).getByText('Nenhum item')).toBeTruthy();
  });

  it('renders description when provided', () => {
    expect(
      wrap(<EmptyState title="Vazio" description="Adicione um novo item" />).getByText(
        'Adicione um novo item',
      ),
    ).toBeTruthy();
  });

  it('renders without description', () => {
    expect(wrap(<EmptyState title="Vazio" />).queryByText('Adicione')).toBeNull();
  });
});
