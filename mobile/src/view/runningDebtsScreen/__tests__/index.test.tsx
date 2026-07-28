import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { RunningDebtsScreen } from '../index';

jest.mock('../../../hooks/useRunningDebts', () => ({
  useRunningDebts: () => ({
    debts: [],
    isLoading: false,
    createDebt: jest.fn(),
    updateDebt: jest.fn(),
    removeDebt: jest.fn(),
  }),
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

describe('RunningDebtsScreen', () => {
  it('renders without crashing', () => {
    expect(wrap(<RunningDebtsScreen />).toJSON()).toBeTruthy();
  });

  it('shows title', () => {
    expect(wrap(<RunningDebtsScreen />).getByText('Dívidas')).toBeTruthy();
  });

  it('shows empty state when no debts', () => {
    expect(wrap(<RunningDebtsScreen />).getByText('Nenhuma dívida')).toBeTruthy();
  });
});
