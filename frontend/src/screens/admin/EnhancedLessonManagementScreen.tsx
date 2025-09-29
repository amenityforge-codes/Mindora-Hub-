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
  ActivityIndicator,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface EnhancedLessonManagementScreenProps {
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
  ageRange: string;
  estimatedDuration: number;
  tags: string[];
}

interface Topic {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  quizzes: Quiz[];
  createdAt: string;
  order: number;
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
  questions: number;
  duration: number;
  description: string;
}

const EnhancedLessonManagementScreen: React.FC<EnhancedLessonManagementScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    ageRange: ageRange,
    estimatedDuration: 0,
    tags: ''
  });
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: ''
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: 0,
    description: '',
    file: null as any,
    thumbnail: null as any
  });

  // Imported lessons from main learning interface
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Import lessons from main learning interface
  const importLessonsFromMainInterface = () => {
    const importedLessons: Lesson[] = [
      {
        id: '1',
        title: 'Alphabet & Phonics',
        description: 'Learn the English alphabet and basic phonics sounds',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 120,
        tags: ['phonics', 'alphabet', 'beginner'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          {
            id: '1',
            title: 'ABC Song Fun',
            description: 'Learn A-Z sounds with fun animations and examples',
            order: 1,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '2',
            title: 'Letter Hunt Game',
            description: 'Practice recognizing letters A through Z',
            order: 2,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '3',
            title: 'Magic Writing',
            description: 'Practice writing letters with guided tracing exercises',
            order: 3,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          }
        ]
      },
      {
        id: '2',
        title: 'Basic Vocabulary',
        description: 'Essential words for daily communication',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 90,
        tags: ['vocabulary', 'words', 'beginner'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          {
            id: '4',
            title: 'Family Words',
            description: 'Learn words for family members',
            order: 1,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '5',
            title: 'Color Words',
            description: 'Learn names of different colors',
            order: 2,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          }
        ]
      },
      {
        id: '3',
        title: 'Numbers & Counting',
        description: 'Learn numbers 1-100 and basic counting',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 60,
        tags: ['numbers', 'counting', 'math'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          {
            id: '6',
            title: 'Numbers 1-10',
            description: 'Learn to count from 1 to 10',
            order: 1,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '7',
            title: 'Counting Objects',
            description: 'Practice counting different objects',
            order: 2,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          }
        ]
      },
      {
        id: '4',
        title: 'Grammar Basics',
        description: 'Learn fundamental grammar rules and structures',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 150,
        tags: ['grammar', 'rules', 'intermediate'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          {
            id: '8',
            title: 'Nouns and Pronouns',
            description: 'Learn about different types of nouns and pronouns',
            order: 1,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '9',
            title: 'Verbs and Tenses',
            description: 'Master verb forms and different tenses',
            order: 2,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          }
        ]
      },
      {
        id: '5',
        title: 'Reading Comprehension',
        description: 'Develop reading skills and comprehension',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 180,
        tags: ['reading', 'comprehension', 'intermediate'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          {
            id: '10',
            title: 'Short Stories',
            description: 'Read and understand short stories',
            order: 1,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '11',
            title: 'Reading Strategies',
            description: 'Learn effective reading techniques',
            order: 2,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          }
        ]
      },
      {
        id: '6',
        title: 'Speaking Practice',
        description: 'Improve pronunciation and speaking confidence',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 120,
        tags: ['speaking', 'pronunciation', 'confidence'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          {
            id: '12',
            title: 'Pronunciation Drills',
            description: 'Practice correct pronunciation of sounds',
            order: 1,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          },
          {
            id: '13',
            title: 'Conversation Practice',
            description: 'Engage in structured conversations',
            order: 2,
            createdAt: new Date().toISOString(),
            videos: [],
            quizzes: []
          }
        ]
      }
    ];

    setLessons(importedLessons);
  };

  useEffect(() => {
    importLessonsFromMainInterface();
    
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddLesson = () => {
    if (!newLesson.title.trim()) {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    const lesson: Lesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      description: newLesson.description,
      difficulty: newLesson.difficulty,
      ageRange: newLesson.ageRange,
      estimatedDuration: newLesson.estimatedDuration,
      tags: newLesson.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      status: 'draft',
      createdAt: new Date().toISOString(),
      topics: []
    };

    setLessons(prev => [...prev, lesson]);
    setNewLesson({
      title: '',
      description: '',
      difficulty: 'beginner',
      ageRange: ageRange,
      estimatedDuration: 0,
      tags: ''
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Lesson added successfully!');
  };

  const handleAddTopic = () => {
    if (!selectedLesson || !newTopic.title.trim()) {
      Alert.alert('Error', 'Please enter a topic title');
      return;
    }

    const topic: Topic = {
      id: Date.now().toString(),
      title: newTopic.title,
      description: newTopic.description,
      order: selectedLesson.topics.length + 1,
      createdAt: new Date().toISOString(),
      videos: [],
      quizzes: []
    };

    setLessons(prev => prev.map(lesson => 
      lesson.id === selectedLesson.id 
        ? { ...lesson, topics: [...lesson.topics, topic] }
        : lesson
    ));

    setNewTopic({ title: '', description: '' });
    setShowTopicModal(false);
    Alert.alert('Success', 'Topic added successfully!');
  };

  const handleAddVideo = () => {
    if (!selectedTopic || !newVideo.title.trim()) {
      Alert.alert('Error', 'Please enter a video title');
      return;
    }

    const video: Video = {
      id: Date.now().toString(),
      title: newVideo.title,
      url: newVideo.file ? newVideo.file.uri : newVideo.url,
      duration: newVideo.duration,
      thumbnail: newVideo.thumbnail ? newVideo.thumbnail.uri : '',
      description: newVideo.description
    };

    setLessons(prev => prev.map(lesson => 
      lesson.id === selectedLesson?.id 
        ? {
            ...lesson,
            topics: lesson.topics.map(topic =>
              topic.id === selectedTopic.id
                ? { ...topic, videos: [...topic.videos, video] }
                : topic
            )
          }
        : lesson
    ));

    setNewVideo({ title: '', url: '', duration: 0, description: '', file: null, thumbnail: null });
    setShowVideoModal(false);
    Alert.alert('Success', 'Video added successfully!');
  };

  const pickVideoFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setNewVideo(prev => ({ ...prev, file }));
        Alert.alert('Success', `Video file selected: ${file.name}`);
      }
    } catch (error) {
      console.error('Error picking video file:', error);
      Alert.alert('Error', 'Failed to select video file');
    }
  };

  const pickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setNewVideo(prev => ({ ...prev, thumbnail: image }));
        Alert.alert('Success', 'Thumbnail selected');
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to select thumbnail');
    }
  };

  const renderLessonCard = ({ item }: { item: Lesson }) => (
    <Animated.View 
      style={[
        styles.lessonCard,
        { backgroundColor: theme.colors.surface }
      ]}
    >
      <View style={styles.lessonHeader}>
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.lessonMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
              {item.estimatedDuration} min
            </Text>
            <Text style={[styles.topicsCount, { color: theme.colors.textSecondary }]}>
              {item.topics.length} topics
            </Text>
          </View>
        </View>
        <View style={styles.lessonActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setSelectedLesson(item);
              setShowTopicModal(true);
            }}
          >
            <MaterialIcons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {item.topics.length > 0 && (
        <View style={styles.topicsContainer}>
          <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>
            Topics:
          </Text>
          {item.topics.map((topic, index) => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicItem, { backgroundColor: theme.colors.background }]}
              onPress={() => {
                setSelectedLesson(item);
                setSelectedTopic(topic);
                setShowVideoModal(true);
              }}
            >
              <View style={styles.topicInfo}>
                <Text style={[styles.topicTitle, { color: theme.colors.text }]}>
                  {topic.title}
                </Text>
                <Text style={[styles.topicDescription, { color: theme.colors.textSecondary }]}>
                  {topic.description}
                </Text>
                <View style={styles.topicMeta}>
                  <Text style={[styles.videoCount, { color: theme.colors.textSecondary }]}>
                    {topic.videos.length} videos
                  </Text>
                  <Text style={[styles.quizCount, { color: theme.colors.textSecondary }]}>
                    {topic.quizzes.length} quizzes
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Lesson Management</Text>
            <Text style={styles.headerSubtitle}>Manage lessons and topics</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <FlatList
          data={lessons}
          renderItem={renderLessonCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Add Lesson Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add New Lesson
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Lesson Title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newLesson.title}
              onChangeText={(text) => setNewLesson(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newLesson.description}
              onChangeText={(text) => setNewLesson(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddLesson}
              >
                <Text style={styles.saveButtonText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        visible={showTopicModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Topic to {selectedLesson?.title}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Topic Title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTopic.title}
              onChangeText={(text) => setNewTopic(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Topic Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTopic.description}
              onChangeText={(text) => setNewTopic(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTopicModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTopic}
              >
                <Text style={styles.saveButtonText}>Add Topic</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Video to {selectedTopic?.title}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Video Title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.title}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, title: text }))}
            />
            
            {/* Video File Upload */}
            <TouchableOpacity
              style={[styles.uploadButton, { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary
              }]}
              onPress={pickVideoFile}
            >
              <MaterialIcons name="video-library" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {newVideo.file ? `Selected: ${newVideo.file.name}` : 'Select Video File'}
              </Text>
            </TouchableOpacity>

            {/* Or URL Input */}
            <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>OR</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Video URL (if not uploading file)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.url}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, url: text }))}
            />

            {/* Thumbnail Upload */}
            <TouchableOpacity
              style={[styles.uploadButton, { 
                backgroundColor: theme.colors.secondary || '#6c757d',
                borderColor: theme.colors.secondary || '#6c757d'
              }]}
              onPress={pickThumbnail}
            >
              <MaterialIcons name="image" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {newVideo.thumbnail ? 'Thumbnail Selected' : 'Select Thumbnail'}
              </Text>
            </TouchableOpacity>

            {newVideo.thumbnail && (
              <Image 
                source={{ uri: newVideo.thumbnail.uri }} 
                style={styles.thumbnailPreview}
                resizeMode="cover"
              />
            )}
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Duration (minutes)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.duration.toString()}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Video Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.description}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowVideoModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddVideo}
              >
                <Text style={styles.saveButtonText}>Add Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  lessonCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 12,
  },
  topicsCount: {
    fontSize: 12,
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  topicsContainer: {
    marginTop: 16,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
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
  topicDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  topicMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  videoCount: {
    fontSize: 12,
  },
  quizCount: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '600',
  },
  thumbnailPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
});

export default EnhancedLessonManagementScreen;
