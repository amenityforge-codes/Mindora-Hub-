import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    shadow: string;
    onSurface: string;
    onSurfaceVariant: string;
  };
  gradients: {
    header: readonly [string, string, ...string[]];
    card: readonly [string, string, ...string[]];
    button: readonly [string, string, ...string[]];
    challenge: readonly [string, string, ...string[]];
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#4169e1', // Royal Blue
    secondary: '#4ecdc4', // Teal
    tertiary: '#2ed573', // Green
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    accent: '#4169e1', // Royal Blue
    success: '#2ed573',
    warning: '#4ecdc4', // Teal instead of orange
    error: '#ff4757',
    border: '#e1e8ed',
    shadow: '#00000020',
    onSurface: '#2c3e50',
    onSurfaceVariant: '#7f8c8d',
  },
  gradients: {
    header: ['#4169e1', '#5a7ce8', '#738fef', '#8ca1f6'] as const, // Royal Blue gradient
    card: ['#ffffff', '#f8f9fa'] as const,
    button: ['#4169e1', '#5a7ce8'] as const, // Royal Blue buttons
    challenge: ['#667eea', '#764ba2', '#f093fb'] as const,
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#4169e1', // Royal Blue
    secondary: '#4ecdc4', // Teal
    tertiary: '#2ed573', // Green
    background: '#0f1419', // Dark Royal Blue
    surface: '#1e2a3a', // Darker Royal Blue
    text: '#ffffff',
    textSecondary: '#b8c5d1',
    accent: '#4169e1', // Royal Blue
    success: '#2ed573',
    warning: '#4ecdc4', // Teal instead of orange
    error: '#ff4757',
    border: '#2a3f5f',
    shadow: '#00000060',
    onSurface: '#ffffff',
    onSurfaceVariant: '#b8c5d1',
  },
  gradients: {
    header: ['#4169e1', '#5a7ce8', '#738fef', '#8ca1f6'] as const, // Royal Blue gradient
    card: ['#1e2a3a', '#2a3f5f'] as const, // Dark Royal Blue cards
    button: ['#4169e1', '#5a7ce8'] as const, // Royal Blue buttons
    challenge: ['#667eea', '#764ba2', '#f093fb'] as const,
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
      setIsInitialized(true);
    } catch (error) {
      console.log('Error loading theme:', error);
      setIsInitialized(true);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Provide a safe toggleTheme function that works even during initialization
  const safeToggleTheme = isInitialized ? toggleTheme : (() => {
    console.warn('Theme not fully initialized yet, but toggleTheme called');
    // Still allow toggling even if not fully initialized
    setIsDarkMode(!isDarkMode);
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: safeToggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error('useTheme must be used within a ThemeProvider');
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
