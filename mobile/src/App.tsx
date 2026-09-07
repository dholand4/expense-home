import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Updates from 'expo-updates';
import { ThemeProvider } from 'styled-components/native';
import { theme } from './constants/theme';
import { networkBannerGlobal as NetworkBanner } from './components/networkBannerGlobal';
import { AuthProvider } from './providers/AuthProvider';
import { Routes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: {
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Erro inesperado';
        Toast.show({ type: 'error', text1: message, visibilityTime: 4000 });
      },
    },
  },
});

interface IErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  IErrorBoundaryState
> {
  state: IErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 24 }}>
          <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
            Erro na aplicação
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
            {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    async function checkOta() {
      if (__DEV__ || !Updates.isEnabled) return;
      try {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          await Updates.fetchUpdateAsync();
          Toast.show({
            type: 'info',
            text1: '⚡ Nova atualização baixada!',
            text2: 'Reiniciando para aplicar melhorias...',
            visibilityTime: 2000,
          });
          setTimeout(() => {
            Updates.reloadAsync();
          }, 1500);
        }
      } catch {
        // Ignora silenciosamente se estiver sem conexão
      }
    }
    checkOta();
  }, []);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
              <StatusBar style="light" backgroundColor={theme.colors.background} />
              <NetworkBanner />
              <Routes />
              <Toast />
            </View>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
