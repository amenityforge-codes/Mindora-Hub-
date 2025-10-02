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
  const [showDashboardSelector, setShowDashboardSelector] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState('admin');
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
    },
    {
      id: 'children',
      title: 'Children Dashboard',
      description: 'Content for ages 6-15',
      ageRange: '6-15',
      icon: 'child-care',
      color: ['#f093fb', '#f5576c'],
      route: 'ChildrenDashboard'
    },
    {
      id: 'teens',
      title: 'Teens Dashboard',
      description: 'Content for ages 16+',
      ageRange: '16+',
      icon: 'school',
      color: ['#4facfe', '#00f2fe'],
      route: 'TeensDashboard'
    },
    {
      id: 'adults',
      title: 'Adults Dashboard',
      description: 'Professional content',
      ageRange: '18+',
      icon: 'work',
      color: ['#fa709a', '#fee140'],
      route: 'AdultsDashboard'
    },
    {
      id: 'business',
      title: 'Business Dashboard',
      description: 'Business English content',
      ageRange: 'Professional',
      icon: 'business',
      color: ['#43e97b', '#38f9d7'],
      route: 'BusinessDashboard'
    }
  ];

  useEffect(() => {
    loadDashboardData();
    loadUserProfile();
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

      const response = await fetch('http://192.168.1.18:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      } else {
        console.log('Failed to load dashboard stats, using default data');
        setDefaultData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDefaultData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await fetch('http://192.168.1.18:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setUserProfile({
            name: result.data.name || 'Admin User',
            email: result.data.email || 'admin@example.com',
            avatar: result.data.avatar || null,
            role: result.data.role || 'admin'
          });
        }
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
      id: 'content-upload',
      title: 'Upload Content',
      description: 'Add videos, documents, and media to modules',
      icon: 'cloud-upload',
      color: ['#667eea', '#764ba2'],
      screen: 'ContentUpload',
    },
    {
      id: 'video-upload',
      title: 'Video Management',
      description: 'Upload and manage video content',
      icon: 'video-library',
      color: ['#f093fb', '#f5576c'],
      screen: 'VideoUpload',
    },
    {
      id: 'lesson-management',
      title: 'Lesson Management',
      description: 'Import and manage lessons from learning interface',
      icon: 'school',
      color: ['#ff6b6b', '#feca57'],
      screen: 'EnhancedLessonManagement',
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

  const handleDashboardSelect = (dashboard: DashboardOption) => {
    setSelectedDashboard(dashboard.id);
    setShowDashboardSelector(false);
    
    // Update the dashboard content based on selection
    updateDashboardContent(dashboard.id);
    
    // Navigate to the appropriate dashboard
    if (dashboard.id === 'admin') {
      // Stay on admin dashboard but update content
      return;
    } else if (dashboard.id === 'children') {
      // Navigate to kids content management for children dashboard
      navigation.navigate('KidsContentManagement', {
        dashboardType: dashboard.id,
        ageRange: dashboard.ageRange
      });
    } else {
      // Navigate to content management for other dashboards
      navigation.navigate('AdminContentManagement', {
        dashboardType: dashboard.id,
        ageRange: dashboard.ageRange
      });
    }
  };

  const updateDashboardContent = (dashboardId: string) => {
    // Update stats and content based on selected dashboard
    const dashboard = dashboardOptions.find(d => d.id === dashboardId);
    if (dashboard) {
      // Update the header title and content based on dashboard
      console.log(`Switching to ${dashboard.title} dashboard`);
      
      // You can add logic here to fetch different data based on dashboard type
      // For example, different stats, different quick actions, etc.
    }
  };

  const getDashboardSpecificStats = () => {
    const dashboard = dashboardOptions.find(d => d.id === selectedDashboard);
    
    switch (selectedDashboard) {
      case 'children':
        return {
          totalUsers: 450,
          totalModules: 25,
          totalQuizzes: 80,
          totalVideos: 120,
          activeUsers: 320,
          completedModules: 1800,
        };
      case 'teens':
        return {
          totalUsers: 380,
          totalModules: 30,
          totalQuizzes: 95,
          totalVideos: 150,
          activeUsers: 280,
          completedModules: 2200,
        };
      case 'adults':
        return {
          totalUsers: 280,
          totalModules: 35,
          totalQuizzes: 110,
          totalVideos: 180,
          activeUsers: 200,
          completedModules: 1500,
        };
      case 'business':
        return {
          totalUsers: 150,
          totalModules: 20,
          totalQuizzes: 60,
          totalVideos: 90,
          activeUsers: 120,
          completedModules: 800,
        };
      default: // admin
        return stats;
    }
  };

  const getDashboardSpecificQuickActions = () => {
    const dashboard = dashboardOptions.find(d => d.id === selectedDashboard);
    
    switch (selectedDashboard) {
      case 'children':
        return [
          {
            id: 'content-upload',
            title: 'Upload Kids Content',
            description: 'Add fun videos, games, and activities',
            icon: 'child-care',
            color: ['#f093fb', '#f5576c'],
            screen: 'ContentUpload',
          },
          {
            id: 'video-upload',
            title: 'Kids Videos',
            description: 'Upload educational videos for children',
            icon: 'video-library',
            color: ['#4facfe', '#00f2fe'],
            screen: 'VideoUpload',
          },
          {
            id: 'quiz-management',
            title: 'Kids Quizzes',
            description: 'Create fun quizzes for children',
            icon: 'quiz',
            color: ['#fa709a', '#fee140'],
            screen: 'QuizManagement',
          },
          {
            id: 'user-management',
            title: 'Kids Users',
            description: 'Manage children user accounts',
            icon: 'people',
            color: ['#43e97b', '#38f9d7'],
            screen: 'UserManagement',
          },
        ];
      case 'teens':
        return [
          {
            id: 'content-upload',
            title: 'Upload Teen Content',
            description: 'Add engaging content for teenagers',
            icon: 'school',
            color: ['#4facfe', '#00f2fe'],
            screen: 'ContentUpload',
          },
          {
            id: 'video-upload',
            title: 'Teen Videos',
            description: 'Upload educational videos for teens',
            icon: 'video-library',
            color: ['#f093fb', '#f5576c'],
            screen: 'VideoUpload',
          },
          {
            id: 'quiz-management',
            title: 'Teen Quizzes',
            description: 'Create challenging quizzes for teens',
            icon: 'quiz',
            color: ['#fa709a', '#fee140'],
            screen: 'QuizManagement',
          },
          {
            id: 'user-management',
            title: 'Teen Users',
            description: 'Manage teen user accounts',
            icon: 'people',
            color: ['#43e97b', '#38f9d7'],
            screen: 'UserManagement',
          },
        ];
      case 'adults':
        return [
          {
            id: 'content-upload',
            title: 'Upload Adult Content',
            description: 'Add professional content for adults',
            icon: 'work',
            color: ['#fa709a', '#fee140'],
            screen: 'ContentUpload',
          },
          {
            id: 'video-upload',
            title: 'Adult Videos',
            description: 'Upload professional videos for adults',
            icon: 'video-library',
            color: ['#4facfe', '#00f2fe'],
            screen: 'VideoUpload',
          },
          {
            id: 'quiz-management',
            title: 'Adult Quizzes',
            description: 'Create professional quizzes for adults',
            icon: 'quiz',
            color: ['#f093fb', '#f5576c'],
            screen: 'QuizManagement',
          },
          {
            id: 'user-management',
            title: 'Adult Users',
            description: 'Manage adult user accounts',
            icon: 'people',
            color: ['#43e97b', '#38f9d7'],
            screen: 'UserManagement',
          },
        ];
      case 'business':
        return [
          {
            id: 'content-upload',
            title: 'Upload Business Content',
            description: 'Add business-focused content',
            icon: 'business',
            color: ['#43e97b', '#38f9d7'],
            screen: 'ContentUpload',
          },
          {
            id: 'video-upload',
            title: 'Business Videos',
            description: 'Upload professional business videos',
            icon: 'video-library',
            color: ['#4facfe', '#00f2fe'],
            screen: 'VideoUpload',
          },
          {
            id: 'quiz-management',
            title: 'Business Quizzes',
            description: 'Create business-focused quizzes',
            icon: 'quiz',
            color: ['#fa709a', '#fee140'],
            screen: 'QuizManagement',
          },
          {
            id: 'user-management',
            title: 'Business Users',
            description: 'Manage business user accounts',
            icon: 'people',
            color: ['#f093fb', '#f5576c'],
            screen: 'UserManagement',
          },
        ];
      default: // admin
        return quickActions;
    }
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
        
        {/* Dashboard Selector */}
        <TouchableOpacity 
          style={styles.dashboardSelector}
          onPress={() => setShowDashboardSelector(true)}
        >
          <MaterialIcons name="dashboard" size={20} color="white" />
          <Text style={styles.dashboardSelectorText}>
            Switch Dashboard: {dashboardOptions.find(d => d.id === selectedDashboard)?.title}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderDashboardSelector = () => (
    <Modal
      visible={showDashboardSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDashboardSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Select Dashboard
            </Text>
            <TouchableOpacity onPress={() => setShowDashboardSelector(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.dashboardOptionsList}>
            {dashboardOptions.map((dashboard) => (
              <TouchableOpacity
                key={dashboard.id}
                style={[
                  styles.dashboardOption,
                  { backgroundColor: theme.colors.background },
                  selectedDashboard === dashboard.id && styles.selectedDashboardOption
                ]}
                onPress={() => handleDashboardSelect(dashboard)}
              >
                <LinearGradient
                  colors={dashboard.color}
                  style={styles.dashboardOptionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name={dashboard.icon as any} size={32} color="white" />
                  <View style={styles.dashboardOptionContent}>
                    <Text style={styles.dashboardOptionTitle}>{dashboard.title}</Text>
                    <Text style={styles.dashboardOptionDescription}>{dashboard.description}</Text>
                    <Text style={styles.dashboardOptionAge}>{dashboard.ageRange}</Text>
                  </View>
                  {selectedDashboard === dashboard.id && (
                    <MaterialIcons name="check-circle" size={24} color="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
                        {dashboardStats.totalUsers.toLocaleString()}
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
                        {dashboardStats.totalModules}
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
                        {dashboardStats.totalQuizzes}
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
                        {dashboardStats.totalVideos}
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
                        {dashboardStats.activeUsers}
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
                        {dashboardStats.completedModules}
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
                  colors={action.color}
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
      
      {renderDashboardSelector()}
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
  dashboardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    gap: 8,
  },
  dashboardSelectorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dashboardOptionsList: {
    maxHeight: 400,
  },
  dashboardOption: {
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedDashboardOption: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  dashboardOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dashboardOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  dashboardOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  dashboardOptionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  dashboardOptionAge: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default AdminDashboardScreen;
