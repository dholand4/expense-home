export interface ITheme {
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    border: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

// Cores convertidas das variáveis CSS do frontend (hsl → hex)
// --primary: 160 64% 40%  → #25a77c (verde)
// --background: 160 10% 6% → #0e110f
// --card: 160 10% 9%       → #151917
// --secondary: 160 8% 14%  → #212623
// --border: 160 6% 18%     → #2b312e
// --foreground: 150 10% 92% → #e8ece9
// --muted-foreground: 150 5% 50% → #798680
export const theme: ITheme = {
  colors: {
    primary: '#25a77c',
    primaryLight: '#43d5a5',
    secondary: '#212623',
    background: '#0e110f',
    surface: '#212623',
    card: '#151917',
    border: '#2b312e',
    text: '#e8ece9',
    textSecondary: '#798680',
    error: '#dc2828',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 14,
    caption: 12,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};
