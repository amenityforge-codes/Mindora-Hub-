import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchModules, fetchFeaturedModules, fetchRecommendedModules } from '../../store/slices/contentSlice';
import { fetchProgress } from '../../store/slices/progressSlice';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ChildrenDashboardProps {
  navigation: any;
}

const ChildrenDashboard: React.FC<ChildrenDashboardProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const handleModuleManagement = () => {
    navigation.navigate('ModuleManagement', {
      dashboardType: 'children',
      ageRange: '6-15'
    });
  };
  const { modules, featuredModules, recommendedModules, isLoading: contentLoading, error: contentError } = useAppSelector((state) => state.content);
  const { userProgress, summary, isLoading: progressLoading, error: progressError } = useAppSelector((state) => state.progress);
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fetch real data for children dashboard
    const fetchData = async () => {
      try {
        console.log('=== CHILDREN DASHBOARD: Fetching data ===');
        await Promise.allSettled([
          dispatch(fetchModules({ ageRange: '6-15', limit: 10 })),
          dispatch(fetchFeaturedModules(5)),
          dispatch(fetchRecommendedModules(10)),
          dispatch(fetchProgress())
        ]);
        console.log('=== CHILDREN DASHBOARD: Data fetch completed ===');
      } catch (error) {
        console.log('Some API calls failed, continuing with available data:', error);
      }
    };
    
    fetchData();

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
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
              <Text style={styles.userName}>{user?.name?.split(' ')?.[0] || 'Champion'}! 👋</Text>
            </View>
            <View style={styles.headerRight}>
              {isAdmin && (
                <TouchableOpacity 
                  onPress={handleModuleManagement} 
                  style={styles.adminButton}
                >
                  <MaterialIcons name="library-books" size={20} color="white" />
                </TouchableOpacity>
              )}
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
                <MaterialIcons name="local-fire-department" size={20} color="#ff6b6b" />
              </View>
              <Text style={styles.statNumber}>{summary?.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="star" size={20} color="#ffd93d" />
              </View>
              <Text style={styles.statNumber}>85</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="emoji-events" size={20} color="#4ecdc4" />
              </View>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { 
        title: 'Continue Learning', 
        subtitle: 'Resume your journey', 
        icon: 'play-circle-filled',
        colors: ['#4169e1', '#5a7ce8'],
        onPress: () => {
          console.log('=== CHILDREN DASHBOARD: Continue Learning clicked ===');
          console.log('Navigation object:', navigation);
          try {
            navigation.navigate('Modules');
            console.log('Navigation to Modules successful!');
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }
      },
      { 
        title: 'AI Mode', 
        subtitle: 'AI-powered learning', 
        icon: 'psychology',
        colors: ['#4ecdc4', '#45b7d1'],
        onPress: () => navigation.navigate('AIMode')
      },
      { 
        title: 'View Progress', 
        subtitle: 'Track your growth', 
        icon: 'trending-up',
        colors: ['#2ed573', '#26d065'],
        onPress: () => navigation.navigate('Progress')
      },
      { 
        title: 'Daily Challenge', 
        subtitle: 'Complete today\'s task', 
        icon: 'emoji-events',
        colors: ['#ff6b6b', '#ee5a52'],
        onPress: () => navigation.navigate('AIMode')
      },
      { 
        title: 'Live Translation', 
        subtitle: 'Translate any language', 
        icon: 'translate',
        colors: ['#9b59b6', '#8e44ad'],
        onPress: () => navigation.navigate('LiveTranslation')
      },
      { 
        title: 'Grammar Check', 
        subtitle: 'Check your grammar', 
        icon: 'spellcheck',
        colors: ['#ff9a9e', '#fecfef'],
        onPress: () => navigation.navigate('GrammarCheck')
      },
      { 
        title: 'Speech Practice', 
        subtitle: 'Practice speaking', 
        icon: 'mic',
        colors: ['#a8edea', '#fed6e3'],
        onPress: () => navigation.navigate('SpeechPractice')
      },
      { 
        title: 'Sentence Builder', 
        subtitle: 'Build sentences', 
        icon: 'construction',
        colors: ['#ffecd2', '#fcb69f'],
        onPress: () => navigation.navigate('SentenceBuilderGame')
      },
      { 
        title: 'Speaking Coach', 
        subtitle: 'AI speaking coach', 
        icon: 'record-voice-over',
        colors: ['#d299c2', '#fef9d7'],
        onPress: () => navigation.navigate('SpeakingCoachPractice')
      },
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={action.onPress}
            >
              <LinearGradient
                colors={action.colors}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name={action.icon as any} size={28} color="white" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderTodayLessons = () => {
    console.log('=== CHILDREN DASHBOARD: Rendering lessons ===');
    console.log('Modules available:', Array.isArray(modules) ? modules.length : 0);
    console.log('Modules data:', modules);
    
    // Use real modules data, limit to 3 for display, with fallback
    const lessons = Array.isArray(modules) && modules.length > 0 ? modules.slice(0, 3).map((module, index) => {
      const progress = module.userProgress?.percentage || 0;
      const difficulty = module.difficulty || 'Easy';
      const colors = ['#4169e1', '#4ecdc4', '#2ed573'];
      
      return {
        id: module._id,
        title: module.title,
        progress: Math.round(progress),
        difficulty: difficulty,
        color: colors[index % colors.length]
      };
    }) : [
      // Fallback lessons when no data is available
      { id: '1', title: 'Grammar Basics', progress: 0, difficulty: 'Easy', color: '#4169e1' },
      { id: '2', title: 'Vocabulary Builder', progress: 0, difficulty: 'Medium', color: '#4ecdc4' },
      { id: '3', title: 'Reading Comprehension', progress: 0, difficulty: 'Hard', color: '#2ed573' }
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Lessons</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Modules')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lessonsScroll}>
          {lessons.map((lesson, index) => (
            <TouchableOpacity 
              key={lesson.id} 
              style={[styles.lessonCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => {
                console.log('=== CHILDREN DASHBOARD: Lesson clicked ===');
                console.log('Lesson:', lesson);
                console.log('Is Admin:', isAdmin);
                console.log('Modules available:', Array.isArray(modules) ? modules.length : 0);
                
                if (isAdmin) {
                  // Admin can access module content management
                  console.log('Navigating to ModuleContent (admin)');
                  navigation.navigate('ModuleContent' as never, { 
                    moduleId: lesson.id, 
                    moduleTitle: lesson.title,
                    moduleType: 'children'
                  });
                } else if (Array.isArray(modules) && modules.length > 0) {
                  console.log('Navigating to ModuleDetail with moduleId:', lesson.id);
                  try {
                    navigation.navigate('ModuleDetail', { moduleId: lesson.id });
                    console.log('Navigation to ModuleDetail successful!');
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                } else {
                  // For fallback data, navigate to modules list
                  console.log('No modules available, navigating to Modules list');
                  navigation.navigate('Modules');
                }
              }}
            >
              <View style={styles.lessonHeader}>
                <View style={[styles.difficultyBadge, { backgroundColor: lesson.color }]}>
                  <Text style={styles.difficultyText}>{lesson.difficulty}</Text>
                </View>
                <MaterialIcons name="more-vert" size={20} color={theme.colors.textSecondary} />
              </View>
              
              <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>{lesson.title}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${lesson.progress}%`,
                        backgroundColor: lesson.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{lesson.progress}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderFeaturedContent = () => {
    const featuredItems = [
      {
        id: '1',
        title: 'Fun with Phonics',
        subtitle: 'Learn sounds and letters',
        image: '🎵',
        progress: 75,
        color: '#ff6b6b'
      },
      {
        id: '2',
        title: 'Story Time',
        subtitle: 'Read amazing stories',
        image: '📚',
        progress: 45,
        color: '#4ecdc4'
      },
      {
        id: '3',
        title: 'Word Games',
        subtitle: 'Play and learn words',
        image: '🎮',
        progress: 90,
        color: '#45b7d1'
      }
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Content</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Modules')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.featuredCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('ModuleDetail', { moduleId: item.id })}
            >
              <View style={[styles.featuredIcon, { backgroundColor: item.color }]}>
                <Text style={styles.featuredEmoji}>{item.image}</Text>
              </View>
              <Text style={[styles.featuredTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.featuredSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${item.progress}%`,
                        backgroundColor: item.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{item.progress}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderLearningPath = () => {
    const learningSteps = [
      { step: 1, title: 'Alphabet & Sounds', completed: true, color: '#4ecdc4' },
      { step: 2, title: 'Basic Words', completed: true, color: '#45b7d1' },
      { step: 3, title: 'Simple Sentences', completed: false, color: '#ff6b6b' },
      { step: 4, title: 'Reading Stories', completed: false, color: '#9b59b6' },
      { step: 5, title: 'Writing Practice', completed: false, color: '#f39c12' }
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Learning Path</Text>
        <View style={styles.learningPathContainer}>
          {learningSteps.map((step, index) => (
            <View key={step.step} style={styles.learningStep}>
              <View style={[
                styles.stepCircle,
                { 
                  backgroundColor: step.completed ? step.color : '#ddd',
                  borderColor: step.color
                }
              ]}>
                {step.completed ? (
                  <MaterialIcons name="check" size={16} color="white" />
                ) : (
                  <Text style={[styles.stepNumber, { color: step.color }]}>{step.step}</Text>
                )}
              </View>
              <Text style={[
                styles.stepTitle,
                { 
                  color: step.completed ? theme.colors.text : theme.colors.textSecondary 
                }
              ]}>
                {step.title}
              </Text>
              {index < learningSteps.length - 1 && (
                <View style={[
                  styles.stepConnector,
                  { 
                    backgroundColor: step.completed ? step.color : '#ddd' 
                  }
                ]} />
              )}
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderAchievements = () => {
    // Use real progress data for achievements or show placeholder
    const completedCount = summary?.completedModules || 0;
    const achievements = [
      { 
        title: 'First Steps', 
        description: 'Completed your first lesson', 
        icon: 'flag', 
        earned: completedCount > 0 
      },
      { 
        title: 'Grammar Master', 
        description: 'Mastered 10 grammar rules', 
        icon: 'school', 
        earned: completedCount >= 10 
      },
      { 
        title: 'Speed Reader', 
        description: 'Read 5 stories in one day', 
        icon: 'speed', 
        earned: false // This would need specific tracking
      },
      { 
        title: 'Perfect Score', 
        description: 'Got 100% on a quiz', 
        icon: 'star', 
        earned: false // This would need specific tracking
      },
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View 
              key={index} 
              style={[
                styles.achievementCard,
                { 
                  backgroundColor: theme.colors.surface,
                  opacity: achievement.earned ? 1 : 0.5 
                }
              ]}
            >
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.earned ? '#4ecdc4' : '#ddd' }
              ]}>
                <MaterialIcons 
                  name={achievement.icon as any} 
                  size={24} 
                  color={achievement.earned ? 'white' : '#999'} 
                />
              </View>
              <Text style={[
                styles.achievementTitle,
                { color: achievement.earned ? theme.colors.text : theme.colors.textSecondary }
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementDescription,
                { color: achievement.earned ? theme.colors.textSecondary : theme.colors.border }
              ]}>
                {achievement.description}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderFunActivities = () => {
    const activities = [
      {
        title: 'Color & Learn',
        subtitle: 'Color while learning',
        icon: 'palette',
        color: '#ff6b6b',
        onPress: () => navigation.navigate('AIMode')
      },
      {
        title: 'Sing Along',
        subtitle: 'Learn with songs',
        icon: 'music-note',
        color: '#4ecdc4',
        onPress: () => navigation.navigate('AIMode')
      },
      {
        title: 'Puzzle Time',
        subtitle: 'Solve word puzzles',
        icon: 'extension',
        color: '#45b7d1',
        onPress: () => navigation.navigate('SentenceBuilderGame')
      },
      {
        title: 'Story Builder',
        subtitle: 'Create your story',
        icon: 'auto-stories',
        color: '#9b59b6',
        onPress: () => navigation.navigate('AIMode')
      }
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fun Activities</Text>
        <View style={styles.activitiesGrid}>
          {activities.map((activity, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}
              onPress={activity.onPress}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                <MaterialIcons name={activity.icon as any} size={24} color="white" />
              </View>
              <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{activity.title}</Text>
              <Text style={[styles.activitySubtitle, { color: theme.colors.textSecondary }]}>{activity.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  // Removed loading screen - dashboard shows immediately

  // Removed error screen - dashboard always shows with fallback data

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
        {renderFeaturedContent()}
        {renderLearningPath()}
        {renderAchievements()}
        {renderFunActivities()}
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
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionGradient: {
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
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  lessonsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  lessonCard: {
    width: 200,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  featuredScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredEmoji: {
    fontSize: 24,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  learningPathContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  learningStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: -50,
    height: 2,
    zIndex: -1,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ChildrenDashboard;
