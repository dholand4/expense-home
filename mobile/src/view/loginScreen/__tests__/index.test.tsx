import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { AuthProvider } from '../../../providers/AuthProvider';
import { LoginScreen } from '../index';

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ login: jest.fn(), isAuthenticated: false, isLoadingAuth: false }),
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <AuthProvider>{ui}</AuthProvider>
      </ThemeProvider>
    </NavigationContainer>,
  );

describe('LoginScreen', () => {
  it('renders without crashing', () => {
    const navigation = { navigate: jest.fn() } as unknown as Parameters<typeof LoginScreen>[0]['navigation'];
    expect(wrap(<LoginScreen navigation={navigation} route={{ key: '', name: 'LoginScreen', params: undefined }} />).toJSON()).toBeTruthy();
  });

  it('shows app name', () => {
    const navigation = { navigate: jest.fn() } as unknown as Parameters<typeof LoginScreen>[0]['navigation'];
    expect(
      wrap(<LoginScreen navigation={navigation} route={{ key: '', name: 'LoginScreen', params: undefined }} />).getByText('DQ Finanças'),
    ).toBeTruthy();
  });
});
