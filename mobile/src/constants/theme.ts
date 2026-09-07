export interface ITheme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceLight: string;
    card: string;
    cardElevated: string;
    cardBorder: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    error: string;
    success: string;
    warning: string;
    info: string;
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
    xl: number;
    full: number;
  };
}

// Cores convertidas das variáveis CSS do frontend (hsl → hex)
export const theme: ITheme = {
  colors: {
    primary: '#25a77c',
    primaryLight: '#43d5a5',
    primaryDark: '#1a7758',
    secondary: '#212623',
    background: '#0c0f0d',
    surface: '#171c19',
    surfaceLight: '#202723',
    card: '#131815',
    cardElevated: '#1a211d',
    cardBorder: '#27312b',
    border: '#27312b',
    text: '#e8ece9',
    textSecondary: '#8a9992',
    textMuted: '#5b6761',
    error: '#dc2828',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#38bdf8',
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
    xl: 20,
    full: 9999,
  },
};
