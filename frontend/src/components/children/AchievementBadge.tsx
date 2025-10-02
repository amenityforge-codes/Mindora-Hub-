import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  onPress?: () => void;
  animated?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  color,
  earned,
  onPress,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Initial scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Glow animation for earned badges
      if (earned) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    }
  }, [animated, earned]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const BadgeContent = () => (
    <Animated.View
      style={[
        styles.badgeContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: earned ? 1 : 0.6,
        },
      ]}
    >
      <LinearGradient
        colors={earned ? [color, `${color}CC`] : ['#D3D3D3', '#A9A9A9']}
        style={styles.badge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={icon as any}
            size={30}
            color={earned ? 'white' : '#666'}
          />
        </View>
        
        <Text style={[styles.title, { color: earned ? 'white' : '#666' }]}>
          {title}
        </Text>
        
        <Text style={[styles.description, { color: earned ? 'white' : '#666' }]}>
          {description}
        </Text>

        {earned && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowOpacity,
                backgroundColor: color,
              },
            ]}
          />
        )}
      </LinearGradient>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <BadgeContent />
      </TouchableOpacity>
    );
  }

  return <BadgeContent />;
};

const styles = StyleSheet.create({
  badgeContainer: {
    margin: 5,
  },
  badge: {
    width: 120,
    height: 140,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.9,
  },
  glowEffect: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 25,
    zIndex: -1,
  },
});

export default AchievementBadge;

















