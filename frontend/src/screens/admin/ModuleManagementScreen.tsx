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
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ModuleManagementScreenProps {
  navigation: any;
  route?: {
    params?: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

interface Module {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  level: string;
  moduleType: string;
  thumbnail: string;
  videos: Video[];
  quizzes: Quiz[];
  createdAt: string;
  status: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnail: string;
  description: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  timeLimit: number;
  passingScore: number;
}

const ModuleManagementScreen: React.FC<ModuleManagementScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dashboardType, setDashboardType] = useState(route?.params?.dashboardType || 'admin');
  const [ageRange, setAgeRange] = useState(route?.params?.ageRange || 'all');
  
  // Get dashboard context from navigation state or route params
  const getDashboardContext = () => {
    if (route?.params?.dashboardType) {
      return {
        type: route.params.dashboardType,
        ageRange: route.params.ageRange || getAgeRangeFromDashboard(route.params.dashboardType)
      };
    }
    
    // Try to get from navigation state
    const navigationState = navigation.getState();
    const currentRoute = navigationState.routes[navigationState.index];
    
    if (currentRoute.name === 'ChildrenDashboard') {
      return { type: 'children', ageRange: '6-15' };
    } else if (currentRoute.name === 'TeensDashboard') {
      return { type: 'teens', ageRange: '16+' };
    } else if (currentRoute.name === 'AdultsDashboard') {
      return { type: 'adults', ageRange: '18+' };
    } else if (currentRoute.name === 'BusinessDashboard') {
      return { type: 'business', ageRange: 'professional' };
    }
    
    return { type: 'admin', ageRange: 'all' };
  };

  const getAgeRangeFromDashboard = (dashboardType: string) => {
    switch (dashboardType) {
      case 'children': return '6-15';
      case 'teens': return '16+';
      case 'adults': return '18+';
      case 'business': return 'professional';
      default: return 'all';
    }
  };

  const dashboardOptions = [
    { id: 'admin', title: 'Admin', ageRange: 'All Ages', color: ['#667eea', '#764ba2'] },
    { id: 'children', title: 'Children', ageRange: '6-15', color: ['#f093fb', '#f5576c'] },
    { id: 'teens', title: 'Teens', ageRange: '16+', color: ['#4facfe', '#00f2fe'] },
    { id: 'adults', title: 'Adults', ageRange: '18+', color: ['#fa709a', '#fee140'] },
    { id: 'business', title: 'Business', ageRange: 'Professional', color: ['#43e97b', '#38f9d7'] },
  ];

  const moduleTypes = [
    { id: 'all', title: 'All Modules', icon: 'apps' },
    { id: 'grammar', title: 'Grammar', icon: 'book' },
    { id: 'vocabulary', title: 'Vocabulary', icon: 'translate' },
    { id: 'reading', title: 'Reading', icon: 'menu-book' },
    { id: 'writing', title: 'Writing', icon: 'edit' },
    { id: 'speaking', title: 'Speaking', icon: 'mic' },
    { id: 'listening', title: 'Listening', icon: 'headphones' },
    { id: 'ai', title: 'AI Usage', icon: 'smart-toy' },
    { id: 'finance', title: 'Finance', icon: 'account-balance' },
  ];

  useEffect(() => {
    // Get dashboard context and update state
    const context = getDashboardContext();
    setDashboardType(context.type);
    setAgeRange(context.ageRange);
    
    loadModules();
    loadAvailableVideos();
    loadAvailableQuizzes();
  }, []);

  const loadModules = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, using sample modules');
        setSampleModules();
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://192.168.200.129:5000/api/admin/modules?ageRange=${ageRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setModules(result.data.modules);
      } else {
        console.log('Failed to load modules, using sample modules');
        setSampleModules();
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      setSampleModules();
    } finally {
      setIsLoading(false);
    }
  };

  const setSampleModules = () => {
    // Generate modules based on dashboard type and age range
    const modulesByDashboard = {
      'children': [
        {
          id: '1',
          title: 'Fun with ABCs',
          description: 'Learn the alphabet with fun activities and games',
          ageRange: '6-15',
          level: 'Beginner',
          moduleType: 'grammar',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          title: 'Animal Friends',
          description: 'Learn about animals and their names in English',
          ageRange: '6-15',
          level: 'Beginner',
          moduleType: 'vocabulary',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-20',
          status: 'active'
        },
        {
          id: '3',
          title: 'Colorful World',
          description: 'Learn colors and basic descriptions',
          ageRange: '6-15',
          level: 'Beginner',
          moduleType: 'vocabulary',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-25',
          status: 'active'
        }
      ],
      'teens': [
        {
          id: '1',
          title: 'Social Media English',
          description: 'Learn English through social media and digital communication',
          ageRange: '16+',
          level: 'Intermediate',
          moduleType: 'communication',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          title: 'Academic Writing',
          description: 'Develop writing skills for academic purposes',
          ageRange: '16+',
          level: 'Advanced',
          moduleType: 'writing',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-20',
          status: 'active'
        },
        {
          id: '3',
          title: 'Technology & Innovation',
          description: 'English vocabulary for technology and innovation',
          ageRange: '16+',
          level: 'Intermediate',
          moduleType: 'vocabulary',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-25',
          status: 'active'
        }
      ],
      'adults': [
        {
          id: '1',
          title: 'Professional Communication',
          description: 'Business communication and professional English',
          ageRange: '18+',
          level: 'Advanced',
          moduleType: 'communication',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          title: 'Financial English',
          description: 'English for finance and economic discussions',
          ageRange: '18+',
          level: 'Advanced',
          moduleType: 'finance',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-20',
          status: 'active'
        },
        {
          id: '3',
          title: 'Leadership Skills',
          description: 'English for leadership and management roles',
          ageRange: '18+',
          level: 'Advanced',
          moduleType: 'soft-skills',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-25',
          status: 'active'
        }
      ],
      'business': [
        {
          id: '1',
          title: 'Business Presentations',
          description: 'Master the art of business presentations in English',
          ageRange: 'professional',
          level: 'Advanced',
          moduleType: 'presentation',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          title: 'Negotiation Skills',
          description: 'English for business negotiations and deals',
          ageRange: 'professional',
          level: 'Advanced',
          moduleType: 'negotiation',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-20',
          status: 'active'
        },
        {
          id: '3',
          title: 'AI in Business',
          description: 'English for AI and technology in business contexts',
          ageRange: 'professional',
          level: 'Advanced',
          moduleType: 'ai',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-25',
          status: 'active'
        }
      ],
      'admin': [
        {
          id: '1',
          title: 'Basic English Grammar',
          description: 'Learn fundamental grammar rules and structures',
          ageRange: 'all',
          level: 'Beginner',
          moduleType: 'grammar',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          title: 'Vocabulary Building',
          description: 'Expand your vocabulary with essential words',
          ageRange: 'all',
          level: 'Intermediate',
          moduleType: 'vocabulary',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-20',
          status: 'active'
        },
        {
          id: '3',
          title: 'Reading Comprehension',
          description: 'Improve reading skills and understanding',
          ageRange: 'all',
          level: 'Advanced',
          moduleType: 'reading',
          thumbnail: '',
          videos: [],
          quizzes: [],
          createdAt: '2024-01-25',
          status: 'active'
        }
      ]
    };

    const sampleModules = modulesByDashboard[dashboardType as keyof typeof modulesByDashboard] || modulesByDashboard['admin'];
    setModules(sampleModules);
  };

  const loadAvailableVideos = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setSampleVideos();
        return;
      }

      const response = await fetch('http://192.168.200.129:5000/api/admin/videos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableVideos(result.data.videos);
      } else {
        setSampleVideos();
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setSampleVideos();
    }
  };

  const setSampleVideos = () => {
    const sampleVideos: Video[] = [
      {
        id: '1',
        title: 'Introduction to Grammar',
        url: 'https://example.com/video1.mp4',
        duration: 300,
        thumbnail: '',
        description: 'Basic grammar introduction'
      },
      {
        id: '2',
        title: 'Vocabulary Lesson 1',
        url: 'https://example.com/video2.mp4',
        duration: 450,
        thumbnail: '',
        description: 'Essential vocabulary words'
      },
      {
        id: '3',
        title: 'Reading Practice',
        url: 'https://example.com/video3.mp4',
        duration: 600,
        thumbnail: '',
        description: 'Reading comprehension practice'
      }
    ];
    setAvailableVideos(sampleVideos);
  };

  const loadAvailableQuizzes = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setSampleQuizzes();
        return;
      }

      const response = await fetch('http://192.168.200.129:5000/api/admin/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableQuizzes(result.data.quizzes);
      } else {
        setSampleQuizzes();
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setSampleQuizzes();
    }
  };

  const setSampleQuizzes = () => {
    const sampleQuizzes: Quiz[] = [
      {
        id: '1',
        title: 'Grammar Quiz 1',
        description: 'Test your grammar knowledge',
        questions: 10,
        timeLimit: 15,
        passingScore: 70
      },
      {
        id: '2',
        title: 'Vocabulary Test',
        description: 'Vocabulary assessment',
        questions: 20,
        timeLimit: 30,
        passingScore: 80
      },
      {
        id: '3',
        title: 'Reading Comprehension',
        description: 'Reading skills test',
        questions: 15,
        timeLimit: 25,
        passingScore: 75
      }
    ];
    setAvailableQuizzes(sampleQuizzes);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadModules();
    setRefreshing(false);
  };

  const handleAddVideo = async (videoId: string) => {
    if (!selectedModule) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await fetch(`http://192.168.200.129:5000/api/admin/modules/${selectedModule.id}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoId })
      });

      if (response.ok) {
        const video = availableVideos.find(v => v.id === videoId);
        if (video) {
          setModules(modules.map(module => 
            module.id === selectedModule.id 
              ? { ...module, videos: [...module.videos, video] }
              : module
          ));
        }
        setShowVideoModal(false);
        Alert.alert('Success', 'Video added to module successfully');
      } else {
        Alert.alert('Error', 'Failed to add video to module');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video to module');
    }
  };

  const handleAddQuiz = async (quizId: string) => {
    if (!selectedModule) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await fetch(`http://192.168.200.129:5000/api/admin/modules/${selectedModule.id}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quizId })
      });

      if (response.ok) {
        const quiz = availableQuizzes.find(q => q.id === quizId);
        if (quiz) {
          setModules(modules.map(module => 
            module.id === selectedModule.id 
              ? { ...module, quizzes: [...module.quizzes, quiz] }
              : module
          ));
        }
        setShowQuizModal(false);
        Alert.alert('Success', 'Quiz assigned to module successfully');
      } else {
        Alert.alert('Error', 'Failed to assign quiz to module');
      }
    } catch (error) {
      console.error('Error assigning quiz:', error);
      Alert.alert('Error', 'Failed to assign quiz to module');
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || module.moduleType === filterType;
    return matchesSearch && matchesFilter;
  });

  const renderHeader = () => {
    const currentDashboard = dashboardOptions.find(d => d.id === dashboardType);
    
    return (
      <LinearGradient
        colors={currentDashboard?.color || ['#667eea', '#764ba2']}
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
              <MaterialIcons name="library-books" size={32} color="white" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Module Management</Text>
            </View>
            
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <MaterialIcons
                name={isDarkMode ? "wb-sunny" : "nightlight-round"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>
            {currentDashboard?.title} Dashboard - {currentDashboard?.ageRange}
          </Text>
          
          <View style={styles.dashboardInfo}>
            <Text style={styles.dashboardInfoText}>
              {filteredModules.length} modules • {ageRange} age range
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <MaterialIcons name="search" size={20} color={theme.colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          placeholder="Search modules..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {moduleTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.surface },
              filterType === type.id && styles.activeFilterChip
            ]}
            onPress={() => setFilterType(type.id)}
          >
            <MaterialIcons 
              name={type.icon as any} 
              size={16} 
              color={filterType === type.id ? 'white' : theme.colors.onSurfaceVariant} 
            />
            <Text style={[
              styles.filterChipText,
              { color: filterType === type.id ? 'white' : theme.colors.onSurfaceVariant }
            ]}>
              {type.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderModuleCard = (module: Module) => (
    <Card key={module.id} style={[styles.moduleCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <Card.Content style={styles.moduleCardContent}>
        <View style={styles.moduleHeader}>
          <View style={styles.moduleInfo}>
            <Text style={[styles.moduleTitle, { color: theme.colors.onSurface }]}>
              {module.title}
            </Text>
            <Text style={[styles.moduleDescription, { color: theme.colors.onSurfaceVariant }]}>
              {module.description}
            </Text>
            <View style={styles.moduleMeta}>
              <View style={styles.moduleMetaItem}>
                <MaterialIcons name="schedule" size={14} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.moduleMetaText, { color: theme.colors.onSurfaceVariant }]}>
                  {module.level}
                </Text>
              </View>
              <View style={styles.moduleMetaItem}>
                <MaterialIcons name="category" size={14} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.moduleMetaText, { color: theme.colors.onSurfaceVariant }]}>
                  {module.moduleType}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.moduleStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="video-library" size={16} color="#f093fb" />
              <Text style={[styles.statText, { color: theme.colors.onSurface }]}>
                {module.videos.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="quiz" size={16} color="#4facfe" />
              <Text style={[styles.statText, { color: theme.colors.onSurface }]}>
                {module.quizzes.length}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.moduleActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f093fb' }]}
            onPress={() => {
              setSelectedModule(module);
              setShowVideoModal(true);
            }}
          >
            <MaterialIcons name="video-library" size={16} color="white" />
            <Text style={styles.actionButtonText}>Add Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4facfe' }]}
            onPress={() => {
              setSelectedModule(module);
              setShowQuizModal(true);
            }}
          >
            <MaterialIcons name="quiz" size={16} color="white" />
            <Text style={styles.actionButtonText}>Assign Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#43e97b' }]}
            onPress={() => navigation.navigate('ModuleContent', { moduleId: module.id })}
          >
            <MaterialIcons name="edit" size={16} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderVideoModal = () => (
    <Modal
      visible={showVideoModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowVideoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Add Video to {selectedModule?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowVideoModal(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalList}>
            {availableVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={[styles.modalItem, { backgroundColor: theme.colors.background }]}
                onPress={() => handleAddVideo(video.id)}
              >
                <MaterialIcons name="video-library" size={24} color="#f093fb" />
                <View style={styles.modalItemContent}>
                  <Text style={[styles.modalItemTitle, { color: theme.colors.onSurface }]}>
                    {video.title}
                  </Text>
                  <Text style={[styles.modalItemDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {video.description} • {Math.floor(video.duration / 60)} min
                  </Text>
                </View>
                <MaterialIcons name="add" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderQuizModal = () => (
    <Modal
      visible={showQuizModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowQuizModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Assign Quiz to {selectedModule?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowQuizModal(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalList}>
            {availableQuizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={[styles.modalItem, { backgroundColor: theme.colors.background }]}
                onPress={() => handleAddQuiz(quiz.id)}
              >
                <MaterialIcons name="quiz" size={24} color="#4facfe" />
                <View style={styles.modalItemContent}>
                  <Text style={[styles.modalItemTitle, { color: theme.colors.onSurface }]}>
                    {quiz.title}
                  </Text>
                  <Text style={[styles.modalItemDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {quiz.description} • {quiz.questions} questions • {quiz.timeLimit} min
                  </Text>
                </View>
                <MaterialIcons name="add" size={24} color={theme.colors.primary} />
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
            Loading modules...
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
        {renderSearchAndFilter()}
        
        <View style={styles.modulesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Modules ({filteredModules.length})
          </Text>
          
          {filteredModules.map(renderModuleCard)}
        </View>
      </ScrollView>
      
      {renderVideoModal()}
      {renderQuizModal()}
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
    justifyContent: 'space-between',
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
    marginLeft: -24,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  dashboardInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  dashboardInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  modulesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  moduleCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  moduleCardContent: {
    padding: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  moduleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  moduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
  },
  moduleStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  moduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalItemDescription: {
    fontSize: 12,
  },
});

export default ModuleManagementScreen;
