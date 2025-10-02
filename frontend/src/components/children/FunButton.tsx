import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface FunButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  animated?: boolean;
}

const FunButton: React.FC<FunButtonProps> = ({
  title,
  onPress,
  icon,
  colors = ['#FF6B6B', '#FF8E8E'],
  size = 'medium',
  disabled = false,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated && !disabled) {
      // Continuous bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, disabled]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 15,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: 30,
          paddingVertical: 20,
          borderRadius: 25,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: 25,
          paddingVertical: 15,
          borderRadius: 20,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleAnim },
            { scale: bounceAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#D3D3D3', '#A9A9A9'] : colors}
          style={[
            styles.button,
            {
              paddingHorizontal: sizeStyles.paddingHorizontal,
              paddingVertical: sizeStyles.paddingVertical,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonContent}>
            {icon && (
              <MaterialIcons
                name={icon as any}
                size={sizeStyles.fontSize + 4}
                color="white"
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: sizeStyles.fontSize,
                  color: disabled ? '#666' : 'white',
                },
              ]}
            >
              {title}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FunButton;

















