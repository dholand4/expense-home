import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { ProfileScreen } from '../index';

const mockUser = { id: '1', full_name: 'Daniel Holanda', email: 'daniel@test.com', role: 'admin' as const };

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, logout: jest.fn() }),
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <NavigationContainer>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </NavigationContainer>,
  );

describe('ProfileScreen', () => {
  it('renders without crashing', () => {
    expect(wrap(<ProfileScreen />).toJSON()).toBeTruthy();
  });

  it('shows user name', () => {
    expect(wrap(<ProfileScreen />).getByText('Daniel Holanda')).toBeTruthy();
  });

  it('shows user email', () => {
    expect(wrap(<ProfileScreen />).getByText('daniel@test.com')).toBeTruthy();
  });

  it('shows admin section for admin users', () => {
    expect(wrap(<ProfileScreen />).getByText('Administração')).toBeTruthy();
  });

  it('shows logout option', () => {
    expect(wrap(<ProfileScreen />).getByText('Sair da conta')).toBeTruthy();
  });
});
