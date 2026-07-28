import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { SourcesScreen } from '../index';

jest.mock('../../../hooks/useCards', () => ({
  useCards: () => ({ cards: [], createCard: jest.fn(), removeCard: jest.fn() }),
}));
jest.mock('../../../hooks/useBillAccounts', () => ({
  useBillAccounts: () => ({ billAccounts: [], createBillAccount: jest.fn(), removeBillAccount: jest.fn() }),
}));

const queryClient = new QueryClient();

const wrap = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      </NavigationContainer>
    </QueryClientProvider>,
  );

describe('SourcesScreen', () => {
  it('renders without crashing', () => {
    expect(wrap(<SourcesScreen />).toJSON()).toBeTruthy();
  });

  it('shows sections', () => {
    const { getByText } = wrap(<SourcesScreen />);
    expect(getByText('Cartões')).toBeTruthy();
    expect(getByText('Contas de Débito / Boleto')).toBeTruthy();
  });

  it('shows add buttons', () => {
    const { getByText } = wrap(<SourcesScreen />);
    expect(getByText('Adicionar cartão')).toBeTruthy();
    expect(getByText('Adicionar conta')).toBeTruthy();
  });
});
