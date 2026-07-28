import { DarkTheme, LinkingOptions, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { AuthStackParamList } from './types';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    border: theme.colors.border,
    primary: theme.colors.primary,
    text: theme.colors.text,
    notification: theme.colors.primary,
  },
};

const linking: LinkingOptions<AuthStackParamList> = {
  prefixes: ['dqfinancas://'],
  config: {
    screens: {
      LoginRegisterFlow: '',
      AcceptInviteScreen: {
        path: 'accept-invite',
        parse: { token: (token: string) => token },
      },
      ForgotPasswordScreen: 'forgot-password',
      ResetPasswordScreen: {
        path: 'reset-password',
        parse: { token: (token: string) => token },
      },
    },
  },
};

export function Routes() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
      <NavigationContainer theme={navTheme} linking={linking}>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
