import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { summaryCardGlobal as SummaryCard } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('summaryCardGlobal', () => {
  it('renders title and value', () => {
    const { getByText } = wrap(<SummaryCard title="Total" value="R$ 1.000,00" />);
    expect(getByText('Total')).toBeTruthy();
    expect(getByText('R$ 1.000,00')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    expect(
      wrap(<SummaryCard title="Total" value="R$ 500,00" subtitle="Este mês" />).getByText(
        'Este mês',
      ),
    ).toBeTruthy();
  });
});
