import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { NextBillsScreen } from '../index';

jest.mock('../../../hooks/useExpenses', () => ({ useExpenses: () => ({ expenses: [] }) }));
jest.mock('../../../hooks/useCards', () => ({ useCards: () => ({ cards: [] }) }));
jest.mock('../../../hooks/useBillAccounts', () => ({ useBillAccounts: () => ({ billAccounts: [] }) }));
jest.mock('../../../services/installmentPaymentService', () => ({
  installmentPaymentService: { listByMonth: jest.fn().mockResolvedValue([]) },
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

describe('NextBillsScreen', () => {
  it('renders without crashing', () => {
    expect(wrap(<NextBillsScreen />).toJSON()).toBeTruthy();
  });

  it('shows title', () => {
    expect(wrap(<NextBillsScreen />).getByText('Próximas Faturas')).toBeTruthy();
  });

  it('shows month navigation buttons', () => {
    const { getAllByRole } = wrap(<NextBillsScreen />);
    expect(getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });
});
