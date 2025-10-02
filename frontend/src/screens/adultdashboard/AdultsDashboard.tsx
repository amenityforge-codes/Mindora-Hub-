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
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
// Removed unused imports - using lessons directly from lesson management system
import { fetchProgress } from '../../store/slices/progressSlice';
import { useTheme } from '../../contexts/ThemeContext';
import AchievementDisplay from '../../components/children/AchievementDisplay';
import apiService from '../../services/api';

const { width, height } = Dimensions.get('window');

interface AdultsDashboardProps {
  navigation: any;
}

const AdultsDashboard: React.FC<AdultsDashboardProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  // Achievements state
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  
  // Lessons state - direct from lesson management system
  const [lessons, setLessons] = useState([]);
  
  const handleModuleManagement = () => {
    navigation.navigate('AdultModuleManagement', {
      dashboardType: 'adults',
      ageRange: '16+'
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
    // Fetch real data for adults dashboard
    const fetchData = async () => {
      try {
        console.log('=== ADULTS DASHBOARD: Fetching data ===');
        
        // Fetch modules from the modules API instead of lessons
        try {
          console.log('=== ADULTS DASHBOARD: Fetching modules ===');
          const modulesResponse = await fetch('http://192.168.1.18:5000/api/adult-modules', {
            headers: { 'Cache-Control': 'no-cache' }
          });
          const modulesData = await modulesResponse.json();
          console.log('=== ADULTS DASHBOARD: Modules response:', modulesData);
          
          if (modulesData.success) {
            console.log('=== ADULTS DASHBOARD: Found modules:', modulesData.data.modules.length);
            console.log('=== ADULTS DASHBOARD: First module:', modulesData.data.modules[0]);
            
            // Filter for specific module types you want to display for adults
            const desiredModuleTypes = ['business-writing', 'presentation', 'negotiation', 'interview', 'communication'];
            const filteredModules = modulesData.data.modules.filter((module: any) => 
              desiredModuleTypes.includes(module.moduleType)
            );
            
            console.log('=== ADULTS DASHBOARD: Filtered modules:', filteredModules.length);
            console.log('=== ADULTS DASHBOARD: Filtered modules:', filteredModules);
            
            // Log each filtered module for debugging
            filteredModules.forEach((module, index) => {
              console.log(`=== ADULTS DASHBOARD: Module ${index}:`, {
                id: module._id,
                title: module.title,
                moduleType: module.moduleType,
                topicsCount: module.topics?.length || 0
              });
            });
            
            // Store modules in local state
            setLessons(filteredModules);
            console.log('=== ADULTS DASHBOARD: Modules stored in local state');
            
            // Update Redux store with modules data
            dispatch({ type: 'content/fetchModules/fulfilled', payload: modulesData });
          }
        } catch (error) {
          console.error('=== ADULTS DASHBOARD: Modules API call failed:', error);
        }
        
        // Call progress and achievements
        await Promise.allSettled([
          dispatch(fetchProgress())
        ]);
        
        // Load achievements
        try {
          const achievementsData = await apiService.get('/achievements');
          setAchievements(achievementsData);
          
          if (user?.id) {
            const userAchievementsData = await apiService.get(`/achievements/user/${user.id}`);
            setUserAchievements(userAchievementsData.map((ua: any) => ua.achievement));
          }
        } catch (error) {
          console.log('Failed to load achievements:', error);
        }
        
        console.log('=== ADULTS DASHBOARD: Data fetch completed ===');
      } catch (error) {
        console.log('Some API calls failed, continuing with available data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Refresh data when screen comes into focus (e.g., after syncing)
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        try {
          console.log('=== ADULTS DASHBOARD: Refreshing data on focus ===');
          
          // Fetch modules from the modules API instead of lessons
          try {
            console.log('=== ADULTS DASHBOARD: Fetching modules (refresh) ===');
            const modulesResponse = await fetch('http://192.168.1.18:5000/api/adult-modules', {
            headers: { 'Cache-Control': 'no-cache' }
          });
            const modulesData = await modulesResponse.json();
            console.log('=== ADULTS DASHBOARD: Modules response (refresh):', modulesData);
            
            if (modulesData.success) {
              console.log('=== ADULTS DASHBOARD: Found modules (refresh):', modulesData.data.modules.length);
              
              // Filter for specific module types you want to display
              const desiredModuleTypes = ['finance', 'ai', 'math', 'brainstorming', 'soft-skills'];
              const filteredModules = modulesData.data.modules.filter((module: any) => 
                desiredModuleTypes.includes(module.moduleType)
              );
              
              console.log('=== ADULTS DASHBOARD: Filtered modules (refresh):', filteredModules.length);
              
              // Log each filtered module for debugging
              filteredModules.forEach((module, index) => {
                console.log(`=== ADULTS DASHBOARD: Module ${index} (refresh):`, {
                  id: module._id,
                  title: module.title,
                  moduleType: module.moduleType,
                  topicsCount: module.topics?.length || 0
                });
              });
              
              // Store modules in local state
              setLessons(filteredModules);
              
              // Update Redux store with fresh modules data
              dispatch({ type: 'content/fetchModules/fulfilled', payload: modulesData });
            }
          } catch (error) {
            console.error('=== ADULTS DASHBOARD: Modules API call failed (refresh):', error);
          }
          
          // Call progress
          await Promise.allSettled([
            dispatch(fetchProgress())
          ]);
        } catch (error) {
          console.error('Error refreshing dashboard data:', error);
        }
      };

      refreshData();
    }, [])
  );

  // Entrance animations
  useEffect(() => {
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
              <Text style={styles.userName}>{user?.name?.split(' ')?.[0] || 'Professional'}! 👋</Text>
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
              <Text style={styles.statNumber}>{user?.progress?.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="emoji-events" size={20} color="#4ecdc4" />
              </View>
              <Text style={styles.statNumber}>{user?.progress?.totalModulesCompleted || 0}</Text>
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
        title: 'Business English', 
        subtitle: 'Professional communication', 
        icon: 'business',
        colors: ['#4169e1', '#5a7ce8'],
        onPress: () => {
          console.log('=== ADULTS DASHBOARD: Business English clicked ===');
          console.log('Navigation object:', navigation);
          try {
            navigation.navigate('AdultModules');
            console.log('Navigation to AdultModules successful!');
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
        title: 'Achievements', 
        subtitle: 'Professional milestones', 
        icon: 'emoji-events',
        colors: ['#FFD700', '#FFA500'],
        onPress: () => navigation.navigate('Achievements')
      },
      { 
        title: 'View Progress', 
        subtitle: 'Track your growth', 
        icon: 'trending-up',
        colors: ['#2ed573', '#26d065'],
        onPress: () => navigation.navigate('Progress')
      },
      { 
        title: 'Live Translation', 
        subtitle: 'Translate any language', 
        icon: 'translate',
        colors: ['#9b59b6', '#8e44ad'],
        onPress: () => navigation.navigate('LiveTranslation')
      },
      { 
        title: 'Certifications', 
        subtitle: 'Professional credentials', 
        icon: 'school',
        colors: ['#e74c3c', '#c0392b'],
        onPress: () => navigation.navigate('Certifications')
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
    console.log('=== ADULTS DASHBOARD: Rendering adult modules ===');
    console.log('Adult modules available:', Array.isArray(lessons) ? lessons.length : 0);
    console.log('Adult modules data:', lessons);
    
    // Use actual adult modules from the API
    const adultModules = Array.isArray(lessons) && lessons.length > 0 ? lessons : [];
    
    const modulesList = adultModules.length > 0 ? adultModules.slice(0, 8).map((module, index) => {
      const progress = module.userProgress?.percentage || 0;
      const difficulty = module.difficulty || 'Intermediate';
      const colors = ['#4169e1', '#4ecdc4', '#2ed573', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
      
      return {
        id: module._id,
        title: module.title,
        progress: Math.round(progress),
        difficulty: difficulty,
        color: colors[index % colors.length],
        moduleType: module.moduleType,
        topicsCount: module.topics?.length || 0
      };
    }) : [];

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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Business English Modules - {adultModules.length} modules available
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdultModules')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {adultModules.length === 0 && (
          <View style={{ backgroundColor: '#ff6b6b', padding: 15, margin: 10, borderRadius: 8 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', marginBottom: 5 }}>
              No Adult Modules Available
            </Text>
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
              Please contact admin to add adult modules
            </Text>
          </View>
        )}
        
        {adultModules.length > 0 && (
          <View style={{ backgroundColor: '#4ecdc4', padding: 15, margin: 10, borderRadius: 8 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              {adultModules.length} Adult Modules Loaded
            </Text>
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 12, marginTop: 5 }}>
              Modules: {adultModules.slice(0, 3).map(m => m.title).join(', ')}...
            </Text>
          </View>
        )}
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lessonsScroll}>
          {modulesList.map((module, index) => (
            <TouchableOpacity 
              key={module.id} 
              style={[styles.lessonCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => {
                console.log('=== ADULTS DASHBOARD: Adult module clicked ===');
                console.log('Module:', module);
                console.log('Is Admin:', isAdmin);
                
                if (isAdmin) {
                  // Admin can access module content management
                  console.log('Navigating to AdultModuleContent (admin)');
                  navigation.navigate('AdultModuleContent' as never, { 
                    moduleId: module.id, 
                    moduleTitle: module.title,
                    moduleType: 'adults'
                  });
                } else {
                  // Regular users navigate to module detail
                  console.log('Navigating to ModuleDetail with moduleId:', module.id);
                  try {
                    navigation.navigate('ModuleDetail', { moduleId: module.id });
                    console.log('Navigation to ModuleDetail successful!');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    // Fallback to modules list
                    navigation.navigate('AdultModules');
                  }
                }
              }}
            >
              <View style={styles.lessonHeader}>
                <View style={[styles.difficultyBadge, { backgroundColor: module.color }]}>
                  <Text style={styles.difficultyText}>{module.difficulty}</Text>
                </View>
                <MaterialIcons name="more-vert" size={20} color={theme.colors.textSecondary} />
              </View>
              
              <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>{module.title}</Text>
              <Text style={[styles.lessonSubtitle, { color: theme.colors.textSecondary }]}>
                {module.topicsCount} topics • {module.moduleType}
              </Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${module.progress}%`,
                        backgroundColor: module.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{module.progress}%</Text>
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
        title: 'Business Writing',
        subtitle: 'Professional documents',
        image: '📝',
        progress: 75,
        color: '#ff6b6b'
      },
      {
        id: '2',
        title: 'Presentation Skills',
        subtitle: 'Master public speaking',
        image: '🎤',
        progress: 45,
        color: '#4ecdc4'
      },
      {
        id: '3',
        title: 'Negotiation',
        subtitle: 'Advanced business skills',
        image: '🤝',
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
          <TouchableOpacity onPress={() => navigation.navigate('AdultModules')}>
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
    // Use actual adult modules from the API
    const adultModules = Array.isArray(lessons) && lessons.length > 0 ? lessons : [];
    
    const learningSteps = adultModules.length > 0 
      ? adultModules.slice(0, 5).map((module, index) => ({
          step: index + 1,
          title: module.title,
          completed: module.userProgress?.percentage > 80 || false,
          color: ['#4ecdc4', '#45b7d1', '#ff6b6b', '#9b59b6', '#f39c12'][index % 5],
          moduleType: module.moduleType
        }))
        : [];

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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Professional Learning Path - {adultModules.length} modules
        </Text>
        
        {adultModules.length === 0 && (
          <View style={{ backgroundColor: '#ff6b6b', padding: 15, margin: 10, borderRadius: 8 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              No Learning Path Available
            </Text>
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
              Adult modules need to be added by admin
            </Text>
          </View>
        )}
        
        {adultModules.length > 0 && (
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
                <Text style={[
                  styles.stepSubtitle,
                  { color: theme.colors.textSecondary }
                ]}>
                  {step.moduleType}
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
        )}
      </Animated.View>
    );
  };

  const renderAchievements = () => {
    // Show first 3 achievements as preview
    const previewAchievements = achievements && Array.isArray(achievements) ? achievements.slice(0, 3) : [];
    const earnedCount = userAchievements && Array.isArray(userAchievements) ? userAchievements.length : 0;

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
        <View style={styles.achievementsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => setShowAchievements(true)}
          >
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
            <MaterialIcons name="arrow-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.achievementsGrid}>
          {previewAchievements.map((achievement, index) => {
            const isEarned = userAchievements.includes(achievement._id);
            return (
              <View 
                key={achievement._id} 
                style={[
                  styles.achievementCard,
                  { 
                    backgroundColor: theme.colors.surface,
                    opacity: isEarned ? 1 : 0.5 
                  }
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: isEarned ? achievement.color : '#ddd' }
                ]}>
                  {achievement.symbol && achievement.symbol.startsWith('http') ? (
                    <Image source={{ uri: achievement.symbol }} style={styles.achievementImage} />
                  ) : (
                    <Text style={styles.achievementSymbol}>{achievement.symbol}</Text>
                  )}
                </View>
                <Text style={[
                  styles.achievementTitle,
                  { color: isEarned ? theme.colors.text : theme.colors.textSecondary }
                ]}>
                  {achievement.name}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  { color: isEarned ? theme.colors.textSecondary : theme.colors.border }
                ]}>
                  {achievement.description}
                </Text>
              </View>
            );
          })}
        </View>
        
        <TouchableOpacity 
          style={[styles.achievementsButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAchievements(true)}
        >
          <MaterialIcons name="emoji-events" size={20} color="white" />
          <Text style={styles.achievementsButtonText}>
            View All Achievements ({earnedCount}/{achievements && Array.isArray(achievements) ? achievements.length : 0})
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderProfessionalActivities = () => {
    // Use actual adult modules for professional activities
    const adultModules = Array.isArray(lessons) && lessons.length > 0 ? lessons : [];
    
    const activities = adultModules.length > 0 
      ? adultModules.slice(0, 4).map((module, index) => {
          const iconMap: { [key: string]: string } = {
            'business-writing': 'edit',
            'presentation': 'mic',
            'negotiation': 'handshake',
            'interview': 'work',
            'communication': 'chat'
          };
          
          const colorMap: { [key: string]: string } = {
            'business-writing': '#ff6b6b',
            'presentation': '#4ecdc4',
            'negotiation': '#45b7d1',
            'interview': '#9b59b6',
            'communication': '#f39c12'
          };
          
          return {
            title: module.title,
            subtitle: module.description || `${module.moduleType} skills`,
            icon: iconMap[module.moduleType] || 'work',
            color: colorMap[module.moduleType] || '#45b7d1',
            onPress: () => {
              if (isAdmin) {
                navigation.navigate('AdultModuleContent' as never, { 
                  moduleId: module._id, 
                  moduleTitle: module.title,
                  moduleType: 'adults'
                });
              } else {
                navigation.navigate('ModuleDetail', { moduleId: module._id });
              }
            }
          };
        })
      : [
          {
            title: 'Business Writing',
            subtitle: 'Professional documents',
            icon: 'edit',
            color: '#ff6b6b',
            onPress: () => navigation.navigate('AdultModules')
          },
          {
            title: 'Presentation Skills',
            subtitle: 'Public speaking mastery',
            icon: 'mic',
            color: '#4ecdc4',
            onPress: () => navigation.navigate('AdultModules')
          },
          {
            title: 'Negotiation',
            subtitle: 'Advanced business skills',
            icon: 'handshake',
            color: '#45b7d1',
            onPress: () => navigation.navigate('AdultModules')
          },
          {
            title: 'Interview Prep',
            subtitle: 'Career advancement',
            icon: 'work',
            color: '#9b59b6',
            onPress: () => navigation.navigate('AdultModules')
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Professional Activities</Text>
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
        {renderLearningPath()}
        {renderProfessionalActivities()}
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
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  achievementsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  achievementSymbol: {
    fontSize: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementsModal: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
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
  stepSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  lessonSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
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

export default AdultsDashboard;
