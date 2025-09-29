import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SparkleEffectProps {
  size?: number;
  color?: string;
  duration?: number;
}

const SparkleEffect: React.FC<SparkleEffectProps> = ({
  size = 20,
  color = '#FFD700',
  duration = 2000,
}) => {
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [duration]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: sparkleAnim,
          transform: [
            { rotateZ: rotation },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <MaterialIcons name="auto-awesome" size={size} color={color} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default SparkleEffect;
