import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface TeensDashboardProps {
  navigation: any;
}

const TeensDashboard: React.FC<TeensDashboardProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for interactive elements
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const renderHeader = () => {
    return (
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradients.header}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>Teen Learner! 🎓</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={styles.themeToggle}
              >
                <MaterialIcons 
                  name={isDarkMode ? "wb-sunny" : "nightlight-round"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Profile')} 
                style={styles.profileButton}
              >
                <MaterialIcons name="account-circle" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="school" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Modules</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="trending-up" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="star" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      {
        title: 'Grammar Mastery',
        subtitle: 'Advanced grammar rules',
        icon: 'book',
        color: '#4ECDC4',
        onPress: () => navigation.navigate('GrammarModule'),
      },
      {
        title: 'Essay Writing',
        subtitle: 'Academic writing skills',
        icon: 'edit',
        color: '#45B7D1',
        onPress: () => navigation.navigate('WritingModule'),
      },
      {
        title: 'Speaking Practice',
        subtitle: 'Conversation skills',
        icon: 'mic',
        color: '#96CEB4',
        onPress: () => navigation.navigate('SpeakingModule'),
      },
      {
        title: 'Reading Comprehension',
        subtitle: 'Advanced reading',
        icon: 'menu-book',
        color: '#FFB74D',
        onPress: () => navigation.navigate('ReadingModule'),
      },
    ];

    return (
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <Animated.View
              key={index}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionContent}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <MaterialIcons name={action.icon as any} size={24} color="white" />
                </View>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                  {action.subtitle}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderTodayLessons = () => {
    const lessons = [
      {
        id: '1',
        title: 'Advanced Grammar',
        progress: 75,
        time: '15 min',
        difficulty: 'Medium',
        icon: 'school',
      },
      {
        id: '2',
        title: 'Essay Structure',
        progress: 60,
        time: '20 min',
        difficulty: 'Hard',
        icon: 'edit',
      },
      {
        id: '3',
        title: 'Vocabulary Builder',
        progress: 90,
        time: '10 min',
        difficulty: 'Easy',
        icon: 'book',
      },
    ];

    return (
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Today's Lessons
        </Text>
        {lessons.map((lesson, index) => (
          <Animated.View
            key={lesson.id}
            style={[
              styles.lessonCard,
              {
                backgroundColor: theme.colors.surface,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.lessonContent}
              onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
            >
              <View style={styles.lessonLeft}>
                <View style={[styles.lessonIcon, { backgroundColor: theme.colors.primary }]}>
                  <MaterialIcons name={lesson.icon as any} size={24} color="white" />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonMeta, { color: theme.colors.textSecondary }]}>
                    {lesson.time} • {lesson.difficulty}
                  </Text>
                </View>
              </View>
              <View style={styles.lessonRight}>
                <Text style={[styles.lessonProgress, { color: theme.colors.primary }]}>
                  {lesson.progress}%
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${lesson.progress}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderQuickActions()}
        {renderTodayLessons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  lessonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonMeta: {
    fontSize: 12,
    opacity: 0.7,
  },
  lessonRight: {
    alignItems: 'flex-end',
  },
  lessonProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default TeensDashboard;
