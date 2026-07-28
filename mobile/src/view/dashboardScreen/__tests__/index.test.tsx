import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { DashboardScreen } from '../index';

jest.mock('../../../hooks/useExpenses', () => ({
  useExpenses: () => ({ expenses: [], isLoading: false }),
}));
jest.mock('../../../hooks/useCards', () => ({
  useCards: () => ({ cards: [] }),
}));
jest.mock('../../../hooks/useBillAccounts', () => ({
  useBillAccounts: () => ({ billAccounts: [] }),
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

describe('DashboardScreen', () => {
  it('renders without crashing', () => {
    expect(wrap(<DashboardScreen />).toJSON()).toBeTruthy();
  });

  it('shows app name', () => {
    expect(wrap(<DashboardScreen />).getByText('DQ Finanças')).toBeTruthy();
  });

  it('shows zero total when no expenses', () => {
    expect(wrap(<DashboardScreen />).getByText('R$ 0,00')).toBeTruthy();
  });
});
