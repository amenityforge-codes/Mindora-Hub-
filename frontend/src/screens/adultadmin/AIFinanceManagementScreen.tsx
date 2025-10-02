import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIModule {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: number;
  topics: Topic[];
  isActive: boolean;
  createdAt: string;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
  videos: Video[];
  quizzes: Quiz[];
  dailyQuestions: DailyQuestion[];
  isActive: boolean;
}

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  isActive: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  allowMultipleAttempts: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface DailyQuestion {
  _id: string;
  question: string;
  scenario: string;
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  date: string;
}

const AIFinanceManagementScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [modules, setModules] = useState<AIModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [showAddDailyQuestion, setShowAddDailyQuestion] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AIModule | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner' as const,
    estimatedDuration: 30,
  });
  
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
  });
  
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    duration: 0,
  });
  
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    questions: [] as any[],
    allowMultipleAttempts: true,
  });
  
  const [newDailyQuestion, setNewDailyQuestion] = useState({
    question: '',
    scenario: '',
    correctAnswer: '',
    explanation: '',
    difficulty: 'Medium' as const,
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      console.log('=== AI FINANCE: Loading modules ===');
      
      const token = await AsyncStorage.getItem('authToken');
      const headers: any = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://192.168.1.18:5000/api/adult-admin-content/ai-finance`, {
        headers
      });
      const data = await response.json();
      console.log('=== AI FINANCE: API Response ===', data);
      
      if (data.success && data.data && data.data.modules) {
        // Map to expected format - adult content endpoint already filters for adults
        const aiFinanceModules = data.data.modules
          .filter((module: any) => 
            module.moduleType === 'ai' || module.moduleType === 'finance'
          )
          .map((module: any) => ({
            _id: module._id,
            title: module.title,
            description: module.description,
            difficulty: module.difficulty ? module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1) : 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
            estimatedDuration: module.estimatedDuration || 30,
            topics: module.topics || [],
            isActive: module.status === 'published',
            createdAt: module.createdAt
          }));
        
        console.log('=== AI FINANCE: Filtered modules ===', aiFinanceModules);
        console.log('=== AI FINANCE: First module topics ===', aiFinanceModules[0]?.topics);
        setModules(aiFinanceModules);
      } else {
        console.error('=== AI FINANCE: API Error ===', data);
      }
    } catch (error) {
      console.error('=== AI FINANCE: Network Error ===', error);
      Alert.alert('Error', 'Failed to load AI & Finance modules');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadModules();
    setRefreshing(false);
  };

  const handleAddModule = async () => {
    if (!newModule.title.trim() || !newModule.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.18:5000/api/adult-modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          title: newModule.title,
          description: newModule.description,
          ageRange: '6-15',
          moduleType: 'ai',
          difficulty: newModule.difficulty.toLowerCase(),
          estimatedDuration: newModule.estimatedDuration,
          tags: ['ai'],
          content: {
            text: newModule.description,
            instructions: 'Complete this AI module to learn new skills',
            objectives: ['Learn AI concepts', 'Practice AI applications']
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'AI & Finance module created successfully');
        setShowAddModule(false);
        setNewModule({ title: '', description: '', difficulty: 'Beginner', estimatedDuration: 30 });
        loadModules();
      } else {
        Alert.alert('Error', data.message || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      Alert.alert('Error', 'Failed to create module');
    }
  };

  const handleAddTopic = async () => {
    if (!selectedModule || !newTopic.title.trim() || !newTopic.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${selectedModule._id}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTopic),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Topic created successfully');
        setShowAddTopic(false);
        setNewTopic({ title: '', description: '' });
        setSelectedModule(null);
        loadModules();
      } else {
        Alert.alert('Error', data.message || 'Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      Alert.alert('Error', 'Failed to create topic');
    }
  };

  const handleDeleteModule = async (module: AIModule) => {
    Alert.alert(
      'Delete Module',
      `Are you sure you want to delete "${module.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${module._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
                },
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'Module deleted successfully');
                loadModules();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete module');
              }
            } catch (error) {
              console.error('Error deleting module:', error);
              Alert.alert('Error', 'Failed to delete module');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTopic = async (moduleId: string, topicId: string, topicTitle: string) => {
    Alert.alert(
      'Delete Topic',
      `Are you sure you want to delete "${topicTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Topic deleted successfully');
                loadModules();
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete topic');
              }
            } catch (error) {
              console.error('Error deleting topic:', error);
              Alert.alert('Error', 'Failed to delete topic');
            }
          }
        }
      ]
    );
  };

  // Video Upload Function
  const uploadVideo = async () => {
    if (!selectedTopic || !newVideo.title.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploadingVideo(true);
      
      // For now, we'll create a placeholder video entry
      // In a real implementation, you would upload the actual video file
      const response = await fetch(`http://172.19.109.137:5000/api/category-modules/${selectedModule?._id}/topics/${selectedTopic._id}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newVideo.title,
          description: newVideo.description,
          duration: newVideo.duration,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Video uploaded successfully');
        setShowAddVideo(false);
        setNewVideo({ title: '', description: '', duration: 0 });
        setSelectedTopic(null);
        loadModules();
      } else {
        Alert.alert('Error', data.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#4CAF50', '#45a049', '#2E7D32']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <MaterialIcons name="trending-up" size={32} color="white" />
          <Text style={styles.headerTitle}>AI & Finance Management</Text>
          <Text style={styles.headerSubtitle}>Manage AI and Finance learning modules</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModule(true)}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderModuleItem = ({ item }: { item: AIModule }) => (
    <View style={[styles.moduleCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleInfo}>
          <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.moduleMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
              {item.estimatedDuration} min
            </Text>
          </View>
        </View>
        <View style={styles.moduleActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              setSelectedModule(item);
              setShowAddTopic(true);
            }}
          >
            <MaterialIcons name="add" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => {
              // Navigate to module details
            }}
          >
            <MaterialIcons name="edit" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleDeleteModule(item)}
          >
            <MaterialIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.moduleStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="topic" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            {item.topics?.length || 0} Topics
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="play-circle-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            {item.topics?.reduce((sum, topic) => sum + (topic.videos?.length || 0), 0) || 0} Videos
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="quiz" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            {item.topics?.reduce((sum, topic) => sum + (topic.quizzes?.length || 0), 0) || 0} Quizzes
          </Text>
        </View>
      </View>

      {item.topics && item.topics.length > 0 ? (
        <View style={styles.topicsPreview}>
          <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>Topics ({item.topics.length}):</Text>
          {item.topics.slice(0, 3).map((topic, index) => (
            <View key={topic._id || index} style={styles.topicPreview}>
              <TouchableOpacity
                style={styles.topicPreviewContent}
                onPress={() => {
                  navigation.navigate('TopicDetail', {
                    topicId: topic._id,
                    topicTitle: topic.title,
                    moduleId: item._id
                  });
                }}
              >
                <MaterialIcons name="folder" size={16} color="#4CAF50" />
                <Text style={[styles.topicPreviewText, { color: theme.colors.textSecondary }]}>
                  {topic.title}
                </Text>
              </TouchableOpacity>
              <View style={styles.topicActions}>
                <TouchableOpacity
                  style={styles.deleteTopicButton}
                  onPress={() => handleDeleteTopic(item._id, topic._id, topic.title)}
                >
                  <MaterialIcons name="delete" size={16} color="#ef4444" />
                </TouchableOpacity>
                <MaterialIcons name="chevron-right" size={20} color="#4CAF50" />
              </View>
            </View>
          ))}
          {item.topics.length > 3 && (
            <Text style={[styles.moreTopics, { color: theme.colors.textSecondary }]}>
              +{item.topics.length - 3} more topics
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.topicsPreview}>
          <Text style={[styles.topicsTitle, { color: theme.colors.textSecondary }]}>No topics yet</Text>
        </View>
      )}
    </View>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const renderAddModuleModal = () => (
    <Modal
      visible={showAddModule}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModule(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add AI & Finance Module</Text>
            <TouchableOpacity onPress={() => setShowAddModule(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Module Title *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newModule.title}
                onChangeText={(text) => setNewModule({ ...newModule, title: text })}
                placeholder="Enter AI & Finance module title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newModule.description}
                onChangeText={(text) => setNewModule({ ...newModule, description: text })}
                placeholder="Enter module description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Difficulty</Text>
              <View style={styles.difficultySelector}>
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      {
                        backgroundColor: newModule.difficulty === level 
                          ? '#4CAF50' 
                          : theme.colors.background,
                        borderColor: '#4CAF50',
                      }
                    ]}
                    onPress={() => setNewModule({ ...newModule, difficulty: level as any })}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      { color: newModule.difficulty === level ? 'white' : '#4CAF50' }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newModule.estimatedDuration.toString()}
                onChangeText={(text) => setNewModule({ ...newModule, estimatedDuration: parseInt(text) || 30 })}
                placeholder="30"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowAddModule(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleAddModule}
            >
              <Text style={styles.saveButtonText}>Create Module</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddTopicModal = () => (
    <Modal
      visible={showAddTopic}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddTopic(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Topic to {selectedModule?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowAddTopic(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Topic Title *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newTopic.title}
                onChangeText={(text) => setNewTopic({ ...newTopic, title: text })}
                placeholder="Enter topic title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newTopic.description}
                onChangeText={(text) => setNewTopic({ ...newTopic, description: text })}
                placeholder="Enter topic description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowAddTopic(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleAddTopic}
            >
              <Text style={styles.saveButtonText}>Create Topic</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddVideoModal = () => (
    <Modal
      visible={showAddVideo}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddVideo(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Video to Topic</Text>
            <TouchableOpacity onPress={() => setShowAddVideo(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Video Title *</Text>
            <TextInput
              style={styles.input}
              value={newVideo.title}
              onChangeText={(text) => setNewVideo({ ...newVideo, title: text })}
              placeholder="Enter video title"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newVideo.description}
              onChangeText={(text) => setNewVideo({ ...newVideo, description: text })}
              placeholder="Enter video description"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={newVideo.duration.toString()}
              onChangeText={(text) => setNewVideo({ ...newVideo, duration: parseInt(text) || 0 })}
              placeholder="Enter duration in minutes"
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddVideo(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={uploadVideo}
                disabled={uploadingVideo}
              >
                {uploadingVideo ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Upload Video</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="#4CAF50" />
      
      {renderHeader()}

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          AI & Finance Modules
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading AI & Finance modules...
            </Text>
          </View>
        ) : (
          <FlatList
            data={modules}
            renderItem={renderModuleItem}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#4CAF50']}
                tintColor="#4CAF50"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modulesList}
          />
        )}
      </View>

      {renderAddModuleModal()}
      {renderAddTopicModal()}
      {renderAddVideoModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  modulesList: {
    paddingBottom: 20,
  },
  moduleCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  moduleInfo: {
    flex: 1,
    marginRight: 15,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  topicsPreview: {
    marginTop: 10,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  topicPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  topicPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteTopicButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#fee2e2',
  },
  addVideoButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 6,
    marginLeft: 8,
  },
  topicPreviewText: {
    fontSize: 12,
    marginLeft: 8,
  },
  moreTopics: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AIFinanceManagementScreen;
