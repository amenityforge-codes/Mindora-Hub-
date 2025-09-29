import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ProgressStarProps {
  progress: number; // 0-100
  size?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressStar: React.FC<ProgressStarProps> = ({
  progress,
  size = 60,
  showPercentage = true,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && progress > 0) {
      // Scale animation when progress changes
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotation animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [progress, animated]);

  const getStarColor = () => {
    if (progress >= 80) return '#FFD700'; // Gold
    if (progress >= 60) return '#FFA500'; // Orange
    if (progress >= 40) return '#FF69B4'; // Pink
    if (progress >= 20) return '#87CEEB'; // Sky Blue
    return '#D3D3D3'; // Light Gray
  };

  const getStarIcon = () => {
    if (progress >= 80) return 'star';
    if (progress >= 60) return 'star-half';
    if (progress >= 40) return 'star-border';
    return 'star-outline';
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotateZ: rotation },
            ],
          },
        ]}
      >
        <MaterialIcons
          name={getStarIcon()}
          size={size}
          color={getStarColor()}
        />
      </Animated.View>
      
      {showPercentage && (
        <Text style={[styles.percentageText, { fontSize: size * 0.2 }]}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default ProgressStar;
