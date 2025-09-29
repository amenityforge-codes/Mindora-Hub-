import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface FloatingElementsProps {
  children: React.ReactNode;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ children }) => {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const floatAnim4 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animations
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
        duration: 30000,
        useNativeDriver: true,
      })
    );

    // Start all animations
    createFloatingAnimation(floatAnim1, 4000).start();
    createFloatingAnimation(floatAnim2, 5000).start();
    createFloatingAnimation(floatAnim3, 6000).start();
    createFloatingAnimation(floatAnim4, 7000).start();
    rotationAnimation.start();
  }, []);

  const float1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const float2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const float3 = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  const float4 = floatAnim4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Floating background elements */}
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
      >
        <MaterialIcons name="star" size={30} color="#FFD700" />
      </Animated.View>
      
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
      >
        <MaterialCommunityIcons name="heart" size={25} color="#FF6B6B" />
      </Animated.View>
      
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
      >
        <MaterialIcons name="auto-awesome" size={35} color="#4ECDC4" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.element4,
          {
            transform: [
              { translateY: float4 },
              { rotateZ: rotation },
            ],
          },
        ]}
      >
        <MaterialCommunityIcons name="lightning-bolt" size={28} color="#45B7D1" />
      </Animated.View>

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
    opacity: 0.1,
  },
  element1: {
    top: height * 0.1,
    left: width * 0.1,
  },
  element2: {
    top: height * 0.3,
    right: width * 0.1,
  },
  element3: {
    bottom: height * 0.2,
    left: width * 0.2,
  },
  element4: {
    top: height * 0.5,
    right: width * 0.2,
  },
});

export default FloatingElements;
