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

const AdultAdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalModules: 0,
    totalQuizzes: 0,
    totalVideos: 0,
    activeUsers: 0,
    completedModules: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDashboard] = useState('adult-admin');
  const [userProfile, setUserProfile] = useState({
    name: 'Adult Admin',
    email: 'amenityforge-adult@gmail.com',
    avatar: null,
    role: 'admin'
  });

  const dashboardOptions: DashboardOption[] = [
    {
      id: 'adult-admin',
      title: 'Adult Admin Dashboard',
      description: 'Manage adult learning platform content',
      ageRange: '16+',
      icon: 'admin-panel-settings',
      color: ['#667eea', '#764ba2'],
      route: 'AdultAdminDashboard'
    }
  ];

  useEffect(() => {
    // Load data asynchronously without blocking UI
    const loadData = async () => {
      await Promise.all([
        loadDashboardData(),
        loadUserProfile(),
        loadRecentActivity()
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
      
      // Load adult admin specific data from new endpoint
      try {
        console.log('=== ADULT ADMIN DASHBOARD: Loading data ===');
        const response = await fetch('http://192.168.1.18:5000/api/adult-admin/dashboard', {
          headers: { 
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          console.log('=== ADULT ADMIN DASHBOARD: Data loaded ===');
          console.log('Adult Admin Stats:', data.data);
          setStats({
            totalUsers: data.data.totalUsers || 0,
            totalModules: data.data.totalModules || 0,
            totalQuizzes: data.data.totalQuizzes || 0,
            totalVideos: data.data.totalVideos || 0,
            activeUsers: data.data.activeUsers || 0,
            completedModules: data.data.completedModules || 0,
          });
        } else {
          console.log('=== ADULT ADMIN DASHBOARD: Using fallback data ===');
          setDefaultData();
        }
      } catch (error) {
        console.error('Error loading adult admin dashboard data:', error);
        setDefaultData();
      }
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
          name: result.data.name || 'Adult Admin',
          email: result.data.email || 'amenityforge-adult@gmail.com',
          avatar: result.data.avatar || null,
          role: result.data.role || 'admin'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      console.log('=== ADULT ADMIN DASHBOARD: Loading activity ===');
      const response = await fetch('http://192.168.1.18:5000/api/adult-admin/activity', {
        headers: { 
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('=== ADULT ADMIN DASHBOARD: Activity loaded ===');
        console.log('Adult Activity:', data.data);
        setRecentActivity(data.data);
      }
    } catch (error) {
      console.error('Error loading adult admin activity:', error);
    }
  };

  const setDefaultData = () => {
    setStats({
      totalUsers: 850,
      totalModules: 5,
      totalQuizzes: 25,
      totalVideos: 50,
      activeUsers: 320,
      completedModules: 1200,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'adult-lesson-management',
      title: 'Lesson Management',
      description: 'Import and manage lessons for adult learning',
      icon: 'school',
      color: ['#ff6b6b', '#feca57'],
      screen: 'AdultEnhancedLessonManagement',
    },
    {
      id: 'adult-ai-finance-management',
      title: 'AI & Finance',
      description: 'Manage AI and Finance learning modules for adults',
      icon: 'trending-up',
      color: ['#4CAF50', '#45a049'],
      screen: 'AdultAIFinanceManagement',
    },
    {
      id: 'adult-soft-skills-management',
      title: 'Soft Skills',
      description: 'Manage communication and interpersonal skills for adults',
      icon: 'people',
      color: ['#2196F3', '#1976D2'],
      screen: 'AdultSoftSkillsManagement',
    },
    {
      id: 'adult-brainstorming-management',
      title: 'Brainstorming',
      description: 'Manage creative thinking and ideation modules for adults',
      icon: 'lightbulb',
      color: ['#FF9800', '#F57C00'],
      screen: 'AdultBrainstormingManagement',
    },
    {
      id: 'adult-math-management',
      title: 'Math & Logic',
      description: 'Manage mathematical concepts and problem-solving for adults',
      icon: 'calculate',
      color: ['#9C27B0', '#8E24AA'],
      screen: 'AdultMathManagement',
    },
    {
      id: 'adult-achievement-management',
      title: 'Achievement Management',
      description: 'Create and manage badges and achievements for adults',
      icon: 'emoji-events',
      color: ['#FFD700', '#FFA500'],
      screen: 'AchievementManagement',
    },
    {
      id: 'adult-exam-management',
      title: 'Exam Management',
      description: 'Create and manage certification exams for adults',
      icon: 'quiz',
      color: ['#4CAF50', '#8BC34A'],
      screen: 'ExamManagement',
    },
    {
      id: 'adult-exam-statistics',
      title: 'Exam Statistics',
      description: 'View exam performance and analytics for adults',
      icon: 'analytics',
      color: ['#2196F3', '#03DAC6'],
      screen: 'ExamStatistics',
    },
    {
      id: 'adult-certificate-management',
      title: 'Certificate Management',
      description: 'Manage and verify adult certificates',
      icon: 'verified',
      color: ['#9C27B0', '#E91E63'],
      screen: 'Certificates',
    },
    {
      id: 'adult-speaking-coach-management',
      title: 'Speaking Coach Management',
      description: 'Manage adult speaking practice tools and exercises',
      icon: 'mic',
      color: ['#ff6b6b', '#feca57'],
      screen: 'AdultSpeakingCoachManagement',
    },
    {
      id: 'adult-sentence-builder-management',
      title: 'Sentence Builder Management',
      description: 'Manage adult sentence building tools and exercises',
      icon: 'construction',
      color: ['#9c27b0', '#e91e63'],
      screen: 'AdultSentenceBuilderManagement',
    },
    {
      id: 'adult-analytics',
      title: 'Analytics',
      description: 'View adult platform analytics and reports',
      icon: 'analytics',
      color: ['#ff9800', '#ff5722'],
      screen: 'AdultAnalytics',
    },
  ];

  const handleQuickAction = (action: any) => {
    if (action.screen === 'AdultModuleManagement') {
      // Pass the current dashboard context to AdultModuleManagement
      navigation.navigate('AdultModuleManagement', {
        dashboardType: selectedDashboard,
        ageRange: '16+'
      });
    } else if (action.screen === 'AdultContentUpload') {
      // Pass dashboard context to AdultContentUpload
      navigation.navigate('AdultContentUpload', {
        dashboardType: selectedDashboard,
        ageRange: '16+'
      });
    } else if (action.screen === 'AdultVideoUpload') {
      // Pass dashboard context to AdultVideoUpload
      navigation.navigate('AdultVideoUpload', {
        dashboardType: selectedDashboard,
        ageRange: '16+'
      });
    } else if (action.screen === 'AdultQuizManagement') {
      // Pass dashboard context to AdultQuizManagement
      navigation.navigate('AdultQuizManagement', {
        dashboardType: selectedDashboard,
        ageRange: '16+'
      });
    } else if (action.screen === 'AdultUserManagement') {
      // Pass dashboard context to AdultUserManagement
      navigation.navigate('AdultUserManagement', {
        dashboardType: selectedDashboard,
        ageRange: '16+'
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
              {dashboardOptions.find(d => d.id === selectedDashboard)?.title || "Adult Admin Dashboard"}
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
          {dashboardOptions.find(d => d.id === selectedDashboard)?.description || "Manage adult learning platform content"}
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
            Loading adult admin dashboard...
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
        {/* Adult Platform Overview Stats */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Adult Learning Platform Overview
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
                        Adult Users
                      </Text>
                    </Card.Content>
                  </Card>

                  <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Card.Content style={styles.statContent}>
                      <MaterialIcons name="work" size={24} color="#f093fb" />
                      <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                        {dashboardStats.totalModules || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Adult Modules
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
                        Professional Quizzes
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
                        Training Videos
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
                        Active Adults
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

        {/* Adult Management Tools */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Adult Learning Management Tools
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

        {/* Recent Adult Activity */}
        <View style={styles.activityContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recent Adult Learning Activity
          </Text>
          
          <Card style={[styles.activityCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Card.Content style={styles.activityContent}>
              {(() => {
                const activities = recentActivity.length > 0 ? recentActivity : [
                  { icon: 'person', title: 'New adult user registered', user: 'Michael (Age 28) • 10 minutes ago', status: 'Success', color: '#4CAF50' },
                  { icon: 'work', title: 'Business Writing module completed', user: 'Lisa (Age 32) • 30 minutes ago', status: 'Completed', color: '#FF9800' },
                  { icon: 'quiz', title: 'Professional quiz submitted', user: 'David (Age 35) • 3 hours ago', status: 'Review', color: '#2196F3' },
                  { icon: 'trending-up', title: 'Presentation Skills module started', user: 'Sarah (Age 29) • 5 hours ago', status: 'In Progress', color: '#9C27B0' },
                  { icon: 'handshake', title: 'Negotiation module completed', user: 'John (Age 41) • 1 day ago', status: 'Completed', color: '#4CAF50' },
                ];

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
            Adult Learning System Status
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

export default AdultAdminDashboardScreen;