import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

interface AdminDashboardScreenProps {
  navigation: any;
}

interface DashboardStats {
  totalUsers: number;
  totalModules: number;
  totalQuizzes: number;
  totalVideos: number;
  activeUsers: number;
  completedModules: number;
}

interface DashboardOption {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  icon: string;
  color: string[];
  route: string;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalModules: 0,
    totalQuizzes: 0,
    totalVideos: 0,
    activeUsers: 0,
    completedModules: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDashboard] = useState('admin');
  const [userProfile, setUserProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: null,
    role: 'admin'
  });

  const dashboardOptions: DashboardOption[] = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Manage all platform content',
      ageRange: 'All Ages',
      icon: 'admin-panel-settings',
      color: ['#667eea', '#764ba2'],
      route: 'AdminDashboard'
    }
  ];

  useEffect(() => {
    // Load data asynchronously without blocking UI
    const loadData = async () => {
      await Promise.all([
        loadDashboardData(),
        loadUserProfile()
      ]);
    };
    
    loadData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, using default data');
        setDefaultData();
        setIsLoading(false);
        return;
      }

      // Set loading to false immediately to show UI
      setIsLoading(false);
      
      // Load data in background
      const result = await apiService.get('/admin/dashboard');
      setStats({
        totalUsers: result.data?.totalUsers || 0,
        totalModules: result.data?.totalModules || 0,
        totalQuizzes: result.data?.totalQuizzes || 0,
        totalVideos: result.data?.totalVideos || 0,
        activeUsers: result.data?.activeUsers || 0,
        completedModules: result.data?.completedModules || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDefaultData();
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const result = await apiService.get('/users/profile');
        setUserProfile({
          name: result.data.name || 'Admin User',
          email: result.data.email || 'admin@example.com',
          avatar: result.data.avatar || null,
          role: result.data.role || 'admin'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const setDefaultData = () => {
    setStats({
      totalUsers: 1250,
      totalModules: 45,
      totalQuizzes: 120,
      totalVideos: 200,
      activeUsers: 850,
      completedModules: 3200,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'lesson-management',
      title: 'Lesson Management',
      description: 'Import and manage lessons from learning interface',
      icon: 'school',
      color: ['#ff6b6b', '#feca57'],
      screen: 'EnhancedLessonManagement',
    },
    {
      id: 'ai-finance-management',
      title: 'AI & Finance',
      description: 'Manage AI and Finance learning modules',
      icon: 'trending-up',
      color: ['#4CAF50', '#45a049'],
      screen: 'AIFinanceManagement',
    },
    {
      id: 'soft-skills-management',
      title: 'Soft Skills',
      description: 'Manage communication and interpersonal skills',
      icon: 'people',
      color: ['#2196F3', '#1976D2'],
      screen: 'SoftSkillsManagement',
    },
    {
      id: 'brainstorming-management',
      title: 'Brainstorming',
      description: 'Manage creative thinking and ideation modules',
      icon: 'lightbulb',
      color: ['#FF9800', '#F57C00'],
      screen: 'BrainstormingManagement',
    },
    {
      id: 'math-management',
      title: 'Math',
      description: 'Manage mathematical concepts and problem-solving',
      icon: 'calculate',
      color: ['#9C27B0', '#8E24AA'],
      screen: 'MathManagement',
    },
    {
      id: 'login-management',
      title: 'Login',
      description: 'Manage authentication and access control modules',
      icon: 'login',
      color: ['#F44336', '#E53935'],
      screen: 'LoginManagement',
    },
    {
      id: 'achievement-management',
      title: 'Achievement Management',
      description: 'Create and manage badges and achievements',
      icon: 'emoji-events',
      color: ['#FFD700', '#FFA500'],
      screen: 'AchievementManagement',
    },
    {
      id: 'exam-management',
      title: 'Exam Management',
      description: 'Create and manage certification exams',
      icon: 'quiz',
      color: ['#4CAF50', '#8BC34A'],
      screen: 'ExamManagement',
    },
    {
      id: 'exam-statistics',
      title: 'Exam Statistics',
      description: 'View exam performance and analytics',
      icon: 'analytics',
      color: ['#2196F3', '#03DAC6'],
      screen: 'ExamStatistics',
    },
    {
      id: 'speech-coach',
      title: 'Speech Coach',
      description: 'Manage speaking practice tools',
      icon: 'mic',
      color: ['#ff6b6b', '#feca57'],
      screen: 'SpeakingCoachManagement',
    },
    {
      id: 'sentence-builder',
      title: 'Sentence Builder',
      description: 'Manage sentence building tools',
      icon: 'construction',
      color: ['#9c27b0', '#e91e63'],
      screen: 'SentenceBuilderManagement',
    },
    {
      id: 'certificate-management',
      title: 'Certificate Management',
      description: 'Manage and verify student certificates',
      icon: 'verified',
      color: ['#9C27B0', '#E91E63'],
      screen: 'Certificates',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View platform analytics and reports',
      icon: 'analytics',
      color: ['#ff9800', '#ff5722'],
      screen: 'Analytics',
    },
  ];

  const handleQuickAction = (action: any) => {
    if (action.screen === 'ModuleManagement') {
      // Pass the current dashboard context to ModuleManagement
      navigation.navigate('ModuleManagement', {
        dashboardType: selectedDashboard,
        ageRange: dashboardOptions.find(d => d.id === selectedDashboard)?.ageRange || 'all'
      });
    } else if (action.screen === 'ContentUpload') {
      // Pass dashboard context to ContentUpload
      navigation.navigate('ContentUpload', {
        dashboardType: selectedDashboard,
        ageRange: dashboardOptions.find(d => d.id === selectedDashboard)?.ageRange || 'all'
      });
    } else if (action.screen === 'VideoUpload') {
      // Pass dashboard context to VideoUpload
      navigation.navigate('VideoUpload', {
        dashboardType: selectedDashboard,
        ageRange: dashboardOptions.find(d => d.id === selectedDashboard)?.ageRange || 'all'
      });
    } else if (action.screen === 'QuizManagement') {
      // Pass dashboard context to QuizManagement
      navigation.navigate('QuizManagement', {
        dashboardType: selectedDashboard,
        ageRange: dashboardOptions.find(d => d.id === selectedDashboard)?.ageRange || 'all'
      });
    } else if (action.screen === 'UserManagement') {
      // Pass dashboard context to UserManagement
      navigation.navigate('UserManagement', {
        dashboardType: selectedDashboard,
        ageRange: dashboardOptions.find(d => d.id === selectedDashboard)?.ageRange || 'all'
      });
    } else {
      navigation.navigate(action.screen);
    }
  };



  const getDashboardSpecificStats = () => {
    return stats;
  };

  const getDashboardSpecificQuickActions = () => {
    return quickActions;
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={isDarkMode ? ['#1a1a1a', '#2d2d2d', '#3a3a3a'] : ['#667eea', '#764ba2', '#f093fb']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <MaterialIcons 
              name={dashboardOptions.find(d => d.id === selectedDashboard)?.icon as any || "admin-panel-settings"} 
              size={32} 
              color="white" 
              style={styles.headerIcon} 
            />
            <Text style={styles.headerTitle}>
              {dashboardOptions.find(d => d.id === selectedDashboard)?.title || "Admin Dashboard"}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <MaterialIcons
                name={isDarkMode ? "wb-sunny" : "nightlight-round"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            
            {/* Profile Button - Single, Prominent */}
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              <MaterialIcons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.headerSubtitle}>
          {dashboardOptions.find(d => d.id === selectedDashboard)?.description || "Manage your learning platform"}
        </Text>
        
      </View>
    </LinearGradient>
  );


  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Platform Overview Stats */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {dashboardOptions.find(d => d.id === selectedDashboard)?.title || "Platform"} Overview
          </Text>
          
          {(() => {
            const dashboardStats = getDashboardSpecificStats();
            return (
              <>
                <View style={styles.statsGrid}>
                  <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.statContent}>
                      <MaterialIcons name="people" size={24} color="#667eea" />
                      <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.totalUsers ? dashboardStats.totalUsers.toLocaleString() : '0'}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Total Users
                      </Text>
                    </Card.Content>
                  </Card>

                  <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.statContent}>
                      <MaterialIcons name="school" size={24} color="#f093fb" />
                      <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.totalModules || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Modules
                      </Text>
                    </Card.Content>
                  </Card>

                  <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.statContent}>
                      <MaterialIcons name="quiz" size={24} color="#4facfe" />
                      <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.totalQuizzes || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Quizzes
                      </Text>
                    </Card.Content>
                  </Card>

                  <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.statContent}>
                      <MaterialIcons name="video-library" size={24} color="#43e97b" />
                      <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.totalVideos || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Videos
                      </Text>
                    </Card.Content>
                  </Card>
                </View>

                {/* Additional Stats Row */}
                <View style={styles.additionalStatsRow}>
                  <Card style={[styles.additionalStatCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.additionalStatContent}>
                      <MaterialIcons name="trending-up" size={20} color="#4CAF50" />
                      <Text style={[styles.additionalStatNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.activeUsers || 0}
                      </Text>
                      <Text style={[styles.additionalStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Active Users
                      </Text>
                    </Card.Content>
                  </Card>

                  <Card style={[styles.additionalStatCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.additionalStatContent}>
                      <MaterialIcons name="check-circle" size={20} color="#FF9800" />
                      <Text style={[styles.additionalStatNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.completedModules || 0}
                      </Text>
                      <Text style={[styles.additionalStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Completed
                      </Text>
                    </Card.Content>
                  </Card>
                </View>
              </>
            );
          })()}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {dashboardOptions.find(d => d.id === selectedDashboard)?.title || "Management"} Tools
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {getDashboardSpecificQuickActions().map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action)}
              >
                <LinearGradient
                  colors={action.color as [string, string]}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name={action.icon as any} size={32} color="white" />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recent Activity - {dashboardOptions.find(d => d.id === selectedDashboard)?.title || "All"}
          </Text>
          
          <Card style={[styles.activityCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Card.Content style={styles.activityContent}>
              {(() => {
                const getDashboardSpecificActivity = () => {
                  switch (selectedDashboard) {
                    case 'children':
                      return [
                        { icon: 'child-care', title: 'New child user registered', user: 'Emma (Age 8) • 2 minutes ago', status: 'Success', color: '#4CAF50' },
                        { icon: 'school', title: 'Kids module completed', user: 'Alex (Age 10) • 15 minutes ago', status: 'Completed', color: '#FF9800' },
                        { icon: 'quiz', title: 'Kids quiz submitted', user: 'Sophie (Age 7) • 1 hour ago', status: 'Review', color: '#2196F3' },
                      ];
                    case 'teens':
                      return [
                        { icon: 'school', title: 'New teen user registered', user: 'Jake (Age 16) • 5 minutes ago', status: 'Success', color: '#4CAF50' },
                        { icon: 'book', title: 'Teen module completed', user: 'Sarah (Age 17) • 20 minutes ago', status: 'Completed', color: '#FF9800' },
                        { icon: 'quiz', title: 'Teen quiz submitted', user: 'Ryan (Age 15) • 2 hours ago', status: 'Review', color: '#2196F3' },
                      ];
                    case 'adults':
                      return [
                        { icon: 'person', title: 'New adult user registered', user: 'Michael (Age 28) • 10 minutes ago', status: 'Success', color: '#4CAF50' },
                        { icon: 'work', title: 'Professional module completed', user: 'Lisa (Age 32) • 30 minutes ago', status: 'Completed', color: '#FF9800' },
                        { icon: 'quiz', title: 'Professional quiz submitted', user: 'David (Age 35) • 3 hours ago', status: 'Review', color: '#2196F3' },
                      ];
                    case 'business':
                      return [
                        { icon: 'business', title: 'New business user registered', user: 'CEO John Smith • 15 minutes ago', status: 'Success', color: '#4CAF50' },
                        { icon: 'trending-up', title: 'Business module completed', user: 'Manager Sarah • 45 minutes ago', status: 'Completed', color: '#FF9800' },
                        { icon: 'quiz', title: 'Business quiz submitted', user: 'Director Mike • 4 hours ago', status: 'Review', color: '#2196F3' },
                      ];
                    default:
                      return [
                        { icon: 'person-add', title: 'New user registered', user: 'John Doe • 2 minutes ago', status: 'Success', color: '#4CAF50' },
                        { icon: 'school', title: 'Module completed', user: 'Jane Smith • 15 minutes ago', status: 'Pending', color: '#FF9800' },
                        { icon: 'quiz', title: 'Quiz submitted', user: 'Mike Johnson • 1 hour ago', status: 'Review', color: '#2196F3' },
                      ];
                  }
                };

                const activities = getDashboardSpecificActivity();
                return activities.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <MaterialIcons name={activity.icon as any} size={20} color={activity.color} />
                    <View style={styles.activityDetails}>
                      <Text style={[styles.activityTitle, { color: theme.colors.onSurface }]}>
                        {activity.title}
                      </Text>
                      <Text style={[styles.activityUser, { color: theme.colors.onSurfaceVariant }]}>
                        {activity.user}
                      </Text>
                    </View>
                    <View style={[styles.activityStatus, { backgroundColor: activity.color }]}>
                      <Text style={styles.activityStatusText}>{activity.status}</Text>
                    </View>
                  </View>
                ));
              })()}
            </Card.Content>
          </Card>
        </View>

        {/* System Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            System Status
          </Text>
          
          <View style={styles.statusGrid}>
            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.statusContent}>
                <MaterialIcons name="cloud-done" size={24} color="#4CAF50" />
                <Text style={[styles.statusTitle, { color: theme.colors.onSurface }]}>
                  Server Status
                </Text>
                <Text style={[styles.statusValue, { color: '#4CAF50' }]}>
                  Online
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.statusContent}>
                <MaterialIcons name="storage" size={24} color="#2196F3" />
                <Text style={[styles.statusTitle, { color: theme.colors.onSurface }]}>
                  Database
                </Text>
                <Text style={[styles.statusValue, { color: '#2196F3' }]}>
                  Connected
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.statusContent}>
                <MaterialIcons name="security" size={24} color="#FF9800" />
                <Text style={[styles.statusTitle, { color: theme.colors.onSurface }]}>
                  Security
                </Text>
                <Text style={[styles.statusValue, { color: '#FF9800' }]}>
                  Protected
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content style={styles.statusContent}>
                <MaterialIcons name="speed" size={24} color="#9C27B0" />
                <Text style={[styles.statusTitle, { color: theme.colors.onSurface }]}>
                  Performance
                </Text>
                <Text style={[styles.statusValue, { color: '#9C27B0' }]}>
                  Optimal
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerGradient: {
    paddingTop: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: 'white',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  additionalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  additionalStatCard: {
    width: '48%',
    borderRadius: 12,
  },
  additionalStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  additionalStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
  },
  additionalStatLabel: {
    fontSize: 10,
    flex: 1,
  },
  actionsContainer: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  activityContainer: {
    padding: 20,
  },
  activityCard: {
    borderRadius: 12,
  },
  activityContent: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusContainer: {
    padding: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
  },
  statusContent: {
    alignItems: 'center',
    padding: 16,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default AdminDashboardScreen;
