import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProgressStar from './ProgressStar';

interface LessonCardProps {
  title: string;
  moduleType: string;
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  onPress: () => void;
  colors: string[];
  animated?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  moduleType,
  progress,
  difficulty,
  estimatedDuration,
  onPress,
  colors,
  animated = true,
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated]);

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

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  const getModuleIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'phonics': 'alphabetical-variant',
      'grammar': 'book-open-variant',
      'vocabulary': 'bookmark-multiple',
      'reading': 'book-open',
      'writing': 'pencil',
      'listening': 'headphones',
      'speaking': 'microphone',
      'communication': 'chat',
      'ai': 'robot',
      'finance': 'currency-usd',
      'soft-skills': 'handshake',
      'brainstorming': 'lightbulb',
      'math': 'calculator',
    };
    return iconMap[type] || 'book';
  };

  const getDifficultyEmoji = () => {
    switch (difficulty) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'advanced':
        return '🔴';
      default:
        return '🟢';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getModuleIcon(moduleType) as any}
                size={40}
                color="white"
              />
            </View>
            
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyEmoji}>
                {getDifficultyEmoji()}
              </Text>
              <Text style={styles.difficultyText}>
                {difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            
            <Text style={styles.moduleType}>
              {moduleType.toUpperCase()}
            </Text>

            <View style={styles.durationContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="white"
              />
              <Text style={styles.duration}>
                {estimatedDuration} min
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <ProgressStar
              progress={progress}
              size={40}
              showPercentage={false}
              animated={true}
            />
            <Text style={styles.progressText}>
              {Math.round(progress)}% Complete
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
  },
  card: {
    width: 220,
    height: 200,
    borderRadius: 20,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 8,
  },
  difficultyContainer: {
    alignItems: 'center',
  },
  difficultyEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginBottom: 10,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moduleType: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default LessonCard;

















