import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  style?: any;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24, style }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isDarkMode ? (
          <MaterialIcons 
            name="wb-sunny" 
            size={size} 
            color={theme.colors.warning} 
          />
        ) : (
          <MaterialIcons 
            name="nightlight-round" 
            size={size} 
            color={theme.colors.primary} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeToggle;

















