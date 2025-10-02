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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface KidsContentManagementScreenProps {
  navigation: any;
  route?: {
    params: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

const KidsContentManagementScreen: React.FC<KidsContentManagementScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: '',
    difficulty: 'beginner'
  });

  // Sample data for content management
  const [contentStats, setContentStats] = useState({
    totalLessons: 24,
    videosUploaded: 156,
    quizzesCreated: 89,
    activeModules: 12
  });

  const [featuredContent, setFeaturedContent] = useState([
    {
      id: '1',
      title: 'Fun with Phonics',
      subtitle: 'Learn sounds and letters',
      image: '🎵',
      progress: 75,
      color: '#ff6b6b',
      type: 'phonics'
    },
    {
      id: '2',
      title: 'Story Time',
      subtitle: 'Read amazing stories',
      image: '📚',
      progress: 45,
      color: '#4ecdc4',
      type: 'stories'
    },
    {
      id: '3',
      title: 'Word Games',
      subtitle: 'Play and learn words',
      image: '🎮',
      progress: 90,
      color: '#45b7d1',
      type: 'games'
    }
  ]);

  const [learningPath, setLearningPath] = useState([
    { step: 1, title: 'Alphabet & Sounds', completed: true, color: '#4ecdc4' },
    { step: 2, title: 'Basic Words', completed: true, color: '#45b7d1' },
    { step: 3, title: 'Simple Sentences', completed: false, color: '#ff6b6b' },
    { step: 4, title: 'Reading Stories', completed: false, color: '#9b59b6' },
    { step: 5, title: 'Writing Practice', completed: false, color: '#f39c12' }
  ]);

  const [achievements, setAchievements] = useState([
    { 
      title: 'Content Creator', 
      description: 'Created your first lesson', 
      icon: 'flag', 
      earned: true 
    },
    { 
      title: 'Video Master', 
      description: 'Uploaded 10 videos', 
      icon: 'video-library', 
      earned: true 
    },
    { 
      title: 'Quiz Builder', 
      description: 'Created 5 quizzes', 
      icon: 'quiz', 
      earned: false 
    },
    { 
      title: 'Module Manager', 
      description: 'Published 3 modules', 
      icon: 'library-books', 
      earned: false 
    },
  ]);

  const [funActivities, setFunActivities] = useState([
    {
      title: 'Color & Learn',
      subtitle: 'Create coloring activities',
      icon: 'palette',
      color: '#ff6b6b',
      type: 'coloring'
    },
    {
      title: 'Sing Along',
      subtitle: 'Add songs and music',
      icon: 'music-note',
      color: '#4ecdc4',
      type: 'music'
    },
    {
      title: 'Puzzle Time',
      subtitle: 'Create word puzzles',
      icon: 'extension',
      color: '#45b7d1',
      type: 'puzzles'
    },
    {
      title: 'Story Builder',
      subtitle: 'Create interactive stories',
      icon: 'auto-stories',
      color: '#9b59b6',
      type: 'stories'
    }
  ]);

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
          colors={['#ff6b6b', '#ee5a52']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Content Management</Text>
              <Text style={styles.userName}>Kids Learning Platform 📝</Text>
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
                onPress={() => navigation.goBack()} 
                style={styles.profileButton}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="library-books" size={20} color="#ff6b6b" />
              </View>
              <Text style={styles.statNumber}>{contentStats.totalLessons}</Text>
              <Text style={styles.statLabel}>Total Lessons</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="video-library" size={20} color="#4ecdc4" />
              </View>
              <Text style={styles.statNumber}>{contentStats.videosUploaded}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="quiz" size={20} color="#45b7d1" />
              </View>
              <Text style={styles.statNumber}>{contentStats.quizzesCreated}</Text>
              <Text style={styles.statLabel}>Quizzes</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { 
        title: 'Add Lesson', 
        subtitle: 'Create new lesson', 
        icon: 'add-circle',
        colors: ['#4169e1', '#5a7ce8'],
        onPress: () => handleAddContent('lesson')
      },
      { 
        title: 'Add Video', 
        subtitle: 'Upload video content', 
        icon: 'video-library',
        colors: ['#4ecdc4', '#45b7d1'],
        onPress: () => handleAddContent('video')
      },
      { 
        title: 'Add Quiz', 
        subtitle: 'Create quiz questions', 
        icon: 'quiz',
        colors: ['#2ed573', '#26d065'],
        onPress: () => handleAddContent('quiz')
      },
      { 
        title: 'Add Module', 
        subtitle: 'Create learning module', 
        icon: 'library-books',
        colors: ['#9b59b6', '#8e44ad'],
        onPress: () => handleAddContent('module')
      },
      { 
        title: 'Grammar Guru', 
        subtitle: 'Manage grammar rules', 
        icon: 'spellcheck',
        colors: ['#ff9a9e', '#fecfef'],
        onPress: () => navigation.navigate('GrammarGuruManagement', { dashboardType, ageRange })
      },
      { 
        title: 'Vocabulary Vault', 
        subtitle: 'Manage vocabulary', 
        icon: 'book',
        colors: ['#a8edea', '#fed6e3'],
        onPress: () => navigation.navigate('VocabularyVaultManagement', { dashboardType, ageRange })
      },
      { 
        title: 'Listening Legend', 
        subtitle: 'Add listening content', 
        icon: 'headphones',
        colors: ['#ffecd2', '#fcb69f'],
        onPress: () => handleAddContent('listening')
      },
      { 
        title: 'Speaking Coach', 
        subtitle: 'Manage speaking practice', 
        icon: 'record-voice-over',
        colors: ['#d299c2', '#fef9d7'],
        onPress: () => navigation.navigate('SpeakingCoachManagement', { dashboardType, ageRange })
      },
      { 
        title: 'Fun Activities', 
        subtitle: 'Create fun activities', 
        icon: 'games',
        colors: ['#ff6b6b', '#ee5a52'],
        onPress: () => handleAddContent('activities')
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Content Creation</Text>
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

  const renderFeaturedContent = () => {
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
          <TouchableOpacity onPress={() => handleAddContent('featured')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredContent.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.featuredCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleEditContent(item.type, item.id)}
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
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: item.color }]}
                onPress={() => handleEditContent(item.type, item.id)}
              >
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderLearningPath = () => {
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Learning Path Management</Text>
        <View style={styles.learningPathContainer}>
          {learningPath.map((step, index) => (
            <View key={step.step} style={styles.learningStep}>
              <TouchableOpacity
                style={[
                  styles.stepCircle,
                  { 
                    backgroundColor: step.completed ? step.color : '#ddd',
                    borderColor: step.color
                  }
                ]}
                onPress={() => handleEditLearningStep(step.step)}
              >
                {step.completed ? (
                  <MaterialIcons name="check" size={16} color="white" />
                ) : (
                  <Text style={[styles.stepNumber, { color: step.color }]}>{step.step}</Text>
                )}
              </TouchableOpacity>
              <Text style={[
                styles.stepTitle,
                { 
                  color: step.completed ? theme.colors.text : theme.colors.textSecondary 
                }
              ]}>
                {step.title}
              </Text>
              {index < learningPath.length - 1 && (
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Content Achievements</Text>
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fun Activities Management</Text>
        <View style={styles.activitiesGrid}>
          {funActivities.map((activity, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleAddActivity(activity.type)}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                <MaterialIcons name={activity.icon as any} size={24} color="white" />
              </View>
              <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{activity.title}</Text>
              <Text style={[styles.activitySubtitle, { color: theme.colors.textSecondary }]}>{activity.subtitle}</Text>
              <TouchableOpacity
                style={[styles.addActivityButton, { backgroundColor: activity.color }]}
                onPress={() => handleAddActivity(activity.type)}
              >
                <MaterialIcons name="add" size={16} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const handleAddContent = (type: string) => {
    setModalType(type);
    setNewContent({
      title: '',
      description: '',
      type: type,
      difficulty: 'beginner'
    });
    setShowAddModal(true);
  };

  const handleEditContent = (type: string, id: string) => {
    // Navigate to edit screen for specific content
    console.log(`Editing ${type} with id: ${id}`);
    // Implementation would navigate to edit screen
  };

  const handleEditLearningStep = (step: number) => {
    // Navigate to edit learning step
    console.log(`Editing learning step ${step}`);
    // Implementation would navigate to edit learning step screen
  };

  const handleAddActivity = (type: string) => {
    // Navigate to add activity screen
    console.log(`Adding activity type: ${type}`);
    // Implementation would navigate to add activity screen
  };

  const handleSaveContent = () => {
    if (!newContent.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    // Here you would save the content to your backend
    console.log('Saving content:', newContent);
    
    Alert.alert('Success', `${modalType} created successfully!`);
    setShowAddModal(false);
    setNewContent({ title: '', description: '', type: '', difficulty: 'beginner' });
  };

  const renderAddModal = () => {
    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newContent.title}
              onChangeText={(text) => setNewContent({...newContent, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newContent.description}
              onChangeText={(text) => setNewContent({...newContent, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveContent}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="#ff6b6b" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderQuickActions()}
        {renderFeaturedContent()}
        {renderLearningPath()}
        {renderAchievements()}
        {renderFunActivities()}
      </ScrollView>
      {renderAddModal()}
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
    position: 'relative',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'relative',
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
  addActivityButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default KidsContentManagementScreen;




