import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { AcceptInviteScreen } from '../index';

jest.mock('../../../services/authService', () => ({ authService: { acceptInvite: jest.fn() } }));
jest.mock('../../../utils/storage', () => ({ storage: { setToken: jest.fn() } }));

const wrap = (ui: React.ReactElement) =>
  render(
    <NavigationContainer>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </NavigationContainer>,
  );

describe('AcceptInviteScreen', () => {
  it('renders without crashing', () => {
    const route = { key: '', name: 'AcceptInviteScreen', params: { token: 'abc' } } as unknown as Parameters<typeof AcceptInviteScreen>[0]['route'];
    expect(wrap(<AcceptInviteScreen navigation={{} as unknown as Parameters<typeof AcceptInviteScreen>[0]['navigation']} route={route} />).toJSON()).toBeTruthy();
  });
});
