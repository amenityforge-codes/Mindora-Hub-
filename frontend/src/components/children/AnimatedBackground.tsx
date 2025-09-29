import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation for background elements
    const createFloatingAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Start all animations
    createFloatingAnimation(floatAnim1, 3000).start();
    createFloatingAnimation(floatAnim2, 4000).start();
    createFloatingAnimation(floatAnim3, 5000).start();
    rotationAnimation.start();
  }, []);

  const float1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const float2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const float3 = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background floating elements */}
      <Animated.View
        style={[
          styles.floatingElement,
          styles.element1,
          {
            transform: [
              { translateY: float1 },
              { rotateZ: rotation },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.floatingElement,
          styles.element2,
          {
            transform: [
              { translateY: float2 },
              { rotateZ: rotation },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.floatingElement,
          styles.element3,
          {
            transform: [
              { translateY: float3 },
              { rotateZ: rotation },
            ],
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  element1: {
    width: 100,
    height: 100,
    backgroundColor: '#FF6B6B',
    top: height * 0.1,
    left: width * 0.1,
  },
  element2: {
    width: 80,
    height: 80,
    backgroundColor: '#4ECDC4',
    top: height * 0.3,
    right: width * 0.1,
  },
  element3: {
    width: 120,
    height: 120,
    backgroundColor: '#45B7D1',
    bottom: height * 0.2,
    left: width * 0.2,
  },
});

export default AnimatedBackground;
