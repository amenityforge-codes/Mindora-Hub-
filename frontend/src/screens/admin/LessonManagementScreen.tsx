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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface LessonManagementScreenProps {
  navigation: any;
  route?: {
    params: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: Topic[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

interface Topic {
  id: string;
  title: string;
  videos: Video[];
  quizzes: Quiz[];
  createdAt: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnail: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  duration: number;
}

const LessonManagementScreen: React.FC<LessonManagementScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: ''
  });

  // Sample data - in real app, this would come from your backend
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: '1',
      title: 'Basic Grammar',
      description: 'Learn fundamental grammar rules',
      difficulty: 'beginner',
      topics: [
        {
          id: '1',
          title: 'Nouns and Pronouns',
          videos: [
            { id: '1', title: 'Introduction to Nouns', url: '', duration: 300, thumbnail: '' }
          ],
          quizzes: [
            { id: '1', title: 'Nouns Quiz', questions: 10, duration: 15 }
          ],
          createdAt: '2024-01-15'
        }
      ],
      createdAt: '2024-01-10',
      status: 'published'
    },
    {
      id: '2',
      title: 'Vocabulary Building',
      description: 'Expand your vocabulary',
      difficulty: 'intermediate',
      topics: [],
      createdAt: '2024-01-12',
      status: 'draft'
    }
  ]);

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
    ]).start();
  }, []);

  const getDashboardConfig = () => {
    const configs = {
      children: {
        title: 'Children Lessons',
        subtitle: 'Manage lessons for kids (6-15)',
        color: ['#ff6b6b', '#ee5a52'],
        icon: 'child-care'
      },
      teens: {
        title: 'Teen Lessons',
        subtitle: 'Manage lessons for teenagers',
        color: ['#4ecdc4', '#45b7d1'],
        icon: 'teenager'
      },
      adults: {
        title: 'Adult Lessons',
        subtitle: 'Manage lessons for adults',
        color: ['#667eea', '#764ba2'],
        icon: 'person'
      },
      business: {
        title: 'Business Lessons',
        subtitle: 'Manage business training lessons',
        color: ['#2c3e50', '#34495e'],
        icon: 'business-center'
      }
    };
    
    return configs[dashboardType as keyof typeof configs] || configs.children;
  };

  const config = getDashboardConfig();

  const renderHeader = () => {
    return (
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={config.color}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{config.title}</Text>
                <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderLessonCard = ({ item }: { item: Lesson }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner': return '#4ecdc4';
        case 'intermediate': return '#f39c12';
        case 'advanced': return '#e74c3c';
        default: return '#4ecdc4';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'published': return '#27ae60';
        case 'draft': return '#f39c12';
        case 'archived': return '#95a5a6';
        default: return '#f39c12';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.lessonCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          setSelectedLesson(item);
          setShowTopicModal(true);
        }}
      >
        <View style={styles.lessonHeader}>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.lessonActions}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.lessonStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="topic" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {Array.isArray(item.topics) ? item.topics.length : 0} Topics
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="video-library" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {Array.isArray(item.topics) ? item.topics.reduce((acc, topic) => acc + (Array.isArray(topic.videos) ? topic.videos.length : 0), 0) : 0} Videos
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="quiz" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {item.topics.reduce((acc, topic) => acc + topic.quizzes.length, 0)} Quizzes
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLessonsList = () => {
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Lessons ({lessons.length})</Text>
        <FlatList
          data={lessons}
          renderItem={renderLessonCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lessonsList}
        />
      </Animated.View>
    );
  };

  const renderAddLessonModal = () => {
    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Lesson</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Lesson title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newLesson.title}
              onChangeText={(text) => setNewLesson({...newLesson, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Lesson description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newLesson.description}
              onChangeText={(text) => setNewLesson({...newLesson, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.difficultySelector}>
              <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Difficulty:</Text>
              <View style={styles.difficultyOptions}>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyOption,
                      { 
                        backgroundColor: newLesson.difficulty === level ? config.color[0] : theme.colors.background,
                        borderColor: config.color[0]
                      }
                    ]}
                    onPress={() => setNewLesson({...newLesson, difficulty: level as any})}
                  >
                    <Text style={[
                      styles.difficultyOptionText,
                      { 
                        color: newLesson.difficulty === level ? 'white' : theme.colors.text 
                      }
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: config.color[0] }]}
                onPress={handleSaveLesson}
              >
                <Text style={styles.saveButtonText}>Create Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTopicModal = () => {
    if (!selectedLesson) return null;

    return (
      <Modal
        visible={showTopicModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTopicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedLesson.title} - Topics
            </Text>
            
            <ScrollView style={styles.topicsList}>
              {selectedLesson.topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicCard, { backgroundColor: theme.colors.background }]}
                  onPress={() => {
                    // Navigate to topic detail screen
                    navigation.navigate('TopicManagement', {
                      lessonId: selectedLesson.id,
                      topicId: topic.id,
                      dashboardType,
                      ageRange
                    });
                  }}
                >
                  <View style={styles.topicInfo}>
                    <Text style={[styles.topicTitle, { color: theme.colors.text }]}>{topic.title}</Text>
                    <View style={styles.topicStats}>
                      <Text style={[styles.topicStat, { color: theme.colors.textSecondary }]}>
                        {Array.isArray(topic.videos) ? topic.videos.length : 0} Videos
                      </Text>
                      <Text style={[styles.topicStat, { color: theme.colors.textSecondary }]}>
                        {Array.isArray(topic.quizzes) ? topic.quizzes.length : 0} Quizzes
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.addTopicButton, { backgroundColor: config.color[0] }]}
              onPress={() => {
                setShowTopicModal(false);
                // Navigate to add topic screen
                navigation.navigate('AddTopic', {
                  lessonId: selectedLesson.id,
                  dashboardType,
                  ageRange
                });
              }}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addTopicText}>Add Topic</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTopicModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSaveLesson = () => {
    if (!newLesson.title.trim()) {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    const lesson: Lesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      description: newLesson.description,
      difficulty: newLesson.difficulty,
      topics: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft'
    };

    setLessons([...lessons, lesson]);
    setNewLesson({ title: '', description: '', difficulty: 'beginner' });
    setShowAddModal(false);
    Alert.alert('Success', 'Lesson created successfully!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={config.color[0]} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderLessonsList()}
      </ScrollView>
      {renderAddLessonModal()}
      {renderTopicModal()}
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  lessonsList: {
    paddingBottom: 20,
  },
  lessonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  lessonActions: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  lessonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
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
  difficultySelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '600',
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
  topicsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicStats: {
    flexDirection: 'row',
  },
  topicStat: {
    fontSize: 12,
    marginRight: 16,
  },
  addTopicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addTopicText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LessonManagementScreen;

