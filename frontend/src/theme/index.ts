import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    primaryContainer: '#BBDEFB',
    secondary: '#FF9800',
    secondaryContainer: '#FFE0B2',
    tertiary: '#4CAF50',
    tertiaryContainer: '#C8E6C9',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#F44336',
    errorContainer: '#FFCDD2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#0D47A1',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#E65100',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#1B5E20',
    onSurface: '#212121',
    onSurfaceVariant: '#424242',
    onBackground: '#212121',
    onError: '#FFFFFF',
    onErrorContainer: '#B71C1C',
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#303030',
    inverseOnSurface: '#FAFAFA',
    inversePrimary: '#90CAF9',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#1565C0',
    secondary: '#FFB74D',
    secondaryContainer: '#F57C00',
    tertiary: '#81C784',
    tertiaryContainer: '#388E3C',
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    background: '#000000',
    error: '#CF6679',
    errorContainer: '#B71C1C',
    onPrimary: '#000000',
    onPrimaryContainer: '#E3F2FD',
    onSecondary: '#000000',
    onSecondaryContainer: '#FFF3E0',
    onTertiary: '#000000',
    onTertiaryContainer: '#E8F5E8',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#E0E0E0',
    onBackground: '#FFFFFF',
    onError: '#000000',
    onErrorContainer: '#FFCDD2',
    outline: '#616161',
    outlineVariant: '#424242',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E0E0E0',
    inverseOnSurface: '#121212',
    inversePrimary: '#1976D2',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#232323',
      level3: '#252525',
      level4: '#272727',
      level5: '#2C2C2C',
    },
  },
  roundness: 12,
};

export const theme = lightTheme;

// Custom colors for the app
export const appColors = {
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  error: '#F44336',
  light: '#F5F5F5',
  dark: '#212121',
  muted: '#9E9E9E',
  accent: '#FF5722',
  gradient: {
    primary: ['#2196F3', '#21CBF3'],
    secondary: ['#FF9800', '#FF5722'],
    success: ['#4CAF50', '#8BC34A'],
    warning: ['#FF9800', '#FFC107'],
    error: ['#F44336', '#E91E63'],
  },
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};


