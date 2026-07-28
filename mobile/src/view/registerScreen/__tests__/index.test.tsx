import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { AuthProvider } from '../../../providers/AuthProvider';
import { RegisterScreen } from '../index';

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ register: jest.fn(), isAuthenticated: false }),
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <AuthProvider>{ui}</AuthProvider>
      </ThemeProvider>
    </NavigationContainer>,
  );

describe('RegisterScreen', () => {
  it('renders without crashing', () => {
    const navigation = { navigate: jest.fn() } as unknown as Parameters<typeof RegisterScreen>[0]['navigation'];
    expect(
      wrap(<RegisterScreen navigation={navigation} route={{ key: '', name: 'RegisterScreen', params: undefined }} />).toJSON(),
    ).toBeTruthy();
  });

  it('shows criar conta title', () => {
    const navigation = { navigate: jest.fn() } as unknown as Parameters<typeof RegisterScreen>[0]['navigation'];
    expect(
      wrap(<RegisterScreen navigation={navigation} route={{ key: '', name: 'RegisterScreen', params: undefined }} />).getByText('Criar conta'),
    ).toBeTruthy();
  });
});
