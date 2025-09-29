import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive, onComplete }) => {
  const confettiPieces = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-50),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (isActive) {
      startConfetti();
    }
  }, [isActive]);

  const startConfetti = () => {
    const animations = confettiPieces.map((piece, index) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FFD700'];
      const color = colors[index % colors.length];
      
      return Animated.parallel([
        Animated.timing(piece.y, {
          toValue: height + 100,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotation, {
          toValue: 360 + Math.random() * 360,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(piece.scale, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(piece.scale, {
            toValue: 0.8,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };

  if (!isActive) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece, index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FFD700'];
        const color = colors[index % colors.length];
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.confettiPiece,
              {
                left: piece.x,
                transform: [
                  { translateY: piece.y },
                  { rotateZ: piece.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }) },
                  { scale: piece.scale },
                ],
                opacity: piece.opacity,
              },
            ]}
          >
            <MaterialIcons name="star" size={20} color={color} />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
  },
});

export default ConfettiEffect;
