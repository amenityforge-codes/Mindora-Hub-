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
  url: string;
  duration: number;
  thumbnail: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
}

interface DailyQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const AdultAIFinanceManagementScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [modules, setModules] = useState<AIModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AIModule | null>(null);
  
  // Form states
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newModuleDifficulty, setNewModuleDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newModuleDuration, setNewModuleDuration] = useState('');
  
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      console.log('=== ADULT AI FINANCE MANAGEMENT: Loading modules ===');
      setLoading(true);
      
      const response = await fetch('http://192.168.1.18:5000/api/adult-content?moduleType=ai,finance', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await response.json();
      
      console.log('=== ADULT AI FINANCE MANAGEMENT: Modules response:', data);
      
      if (data.success) {
        console.log('=== ADULT AI FINANCE MANAGEMENT: Found modules:', data.data.modules.length);
        
        // Adult content endpoint already filters for adults, so we just need to filter by module type
        const filteredModules = data.data.modules.filter((module: any) => 
          module.moduleType === 'ai' || module.moduleType === 'finance'
        );
        
        console.log('=== ADULT AI FINANCE MANAGEMENT: Filtered modules:', filteredModules.length);
        console.log('=== ADULT AI FINANCE MANAGEMENT: Filtered modules:', filteredModules);
        
        // Log each filtered module for debugging
        filteredModules.forEach((module, index) => {
          console.log(`=== ADULT AI FINANCE MANAGEMENT: Module ${index}:`, {
            id: module._id,
            title: module.title,
            moduleType: module.moduleType,
            topicsCount: module.topics?.length || 0
          });
        });
        
        // Map to AIModule interface
        const mappedModules = filteredModules.map((module: any) => ({
          _id: module._id,
          title: module.title,
          description: module.description,
          difficulty: module.difficulty?.charAt(0).toUpperCase() + module.difficulty?.slice(1) || 'Beginner',
          estimatedDuration: module.estimatedDuration || 30,
          topics: module.topics || [],
          isActive: module.status === 'published',
          createdAt: module.createdAt
        }));
        
        setModules(mappedModules);
        console.log('=== ADULT AI FINANCE MANAGEMENT: Modules set in state');
      }
    } catch (error) {
      console.error('=== ADULT AI FINANCE MANAGEMENT: Error loading modules:', error);
      Alert.alert('Error', 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !newModuleDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.18:5000/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-admin-token-here'
        },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDescription,
          ageRange: '16+',
          moduleType: 'ai', // Default to AI for this screen
          difficulty: newModuleDifficulty.toLowerCase(),
          estimatedDuration: parseInt(newModuleDuration) || 30,
          tags: ['adult', 'ai', 'finance'],
          content: {
            text: newModuleDescription,
            instructions: 'Complete this module to learn new skills',
            objectives: []
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Module created successfully');
        setShowAddModule(false);
        setNewModuleTitle('');
        setNewModuleDescription('');
        setNewModuleDifficulty('Beginner');
        setNewModuleDuration('');
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
    if (!selectedModule || !newTopicTitle.trim()) {
      Alert.alert('Error', 'Please select a module and enter a topic title');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.18:5000/api/modules/${selectedModule._id}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTopicTitle,
          description: newTopicDescription
        })
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Topic added successfully');
        setShowAddTopic(false);
        setNewTopicTitle('');
        setNewTopicDescription('');
        setSelectedModule(null);
        loadModules();
      } else {
        Alert.alert('Error', data.message || 'Failed to add topic');
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      Alert.alert('Error', 'Failed to add topic');
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    Alert.alert(
      'Delete Module',
      `Are you sure you want to delete "${moduleTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.18:5000/api/admin/modules/${moduleId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Module deleted successfully');
                loadModules();
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete module');
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
              const response = await fetch(`http://192.168.1.18:5000/api/modules/${moduleId}/topics/${topicId}`, {
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

  const renderModuleItem = ({ item }: { item: AIModule }) => (
    <View style={[styles.moduleCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleInfo}>
          <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.moduleMeta}>
            <Text style={[styles.moduleDifficulty, { color: theme.colors.primary }]}>
              {item.difficulty}
            </Text>
            <Text style={[styles.moduleDuration, { color: theme.colors.textSecondary }]}>
              {item.estimatedDuration} min
            </Text>
            <Text style={[styles.moduleStatus, { 
              color: item.isActive ? '#4CAF50' : '#FF9800' 
            }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <View style={styles.moduleActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteModule(item._id, item.title)}
          >
            <MaterialIcons name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
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
                  navigation.navigate('AdultTopicDetail', {
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading modules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adult AI & Finance Management</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <MaterialIcons 
              name={isDarkMode ? "light-mode" : "dark-mode"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadModules} />
        }
      >
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAddModule(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Module</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => setShowAddTopic(true)}
          >
            <MaterialIcons name="folder" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Topic</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={modules}
          renderItem={renderModuleItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Add Module Modal */}
      <Modal
        visible={showAddModule}
        animationType="slide"
        onRequestClose={() => setShowAddModule(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModule(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Module</Text>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Module Title</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.outline
              }]}
              value={newModuleTitle}
              onChangeText={setNewModuleTitle}
              placeholder="Enter module title"
              placeholderTextColor={theme.colors.textSecondary}
            />
            
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.outline
              }]}
              value={newModuleDescription}
              onChangeText={setNewModuleDescription}
              placeholder="Enter module description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />
            
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    { 
                      backgroundColor: newModuleDifficulty === difficulty 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: theme.colors.outline
                    }
                  ]}
                  onPress={() => setNewModuleDifficulty(difficulty)}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    { 
                      color: newModuleDifficulty === difficulty 
                        ? 'white' 
                        : theme.colors.text 
                    }
                  ]}>
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.outline
              }]}
              value={newModuleDuration}
              onChangeText={setNewModuleDuration}
              placeholder="30"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
              onPress={() => setShowAddModule(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddModule}
            >
              <Text style={styles.saveButtonText}>Create Module</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        visible={showAddTopic}
        animationType="slide"
        onRequestClose={() => setShowAddTopic(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddTopic(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Topic</Text>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Select Module</Text>
            <View style={styles.moduleSelector}>
              {modules.map((module) => (
                <TouchableOpacity
                  key={module._id}
                  style={[
                    styles.moduleOption,
                    { 
                      backgroundColor: selectedModule?._id === module._id 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: theme.colors.outline
                    }
                  ]}
                  onPress={() => setSelectedModule(module)}
                >
                  <Text style={[
                    styles.moduleOptionText,
                    { 
                      color: selectedModule?._id === module._id 
                        ? 'white' 
                        : theme.colors.text 
                    }
                  ]}>
                    {module.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Topic Title</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.outline
              }]}
              value={newTopicTitle}
              onChangeText={setNewTopicTitle}
              placeholder="Enter topic title"
              placeholderTextColor={theme.colors.textSecondary}
            />
            
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.outline
              }]}
              value={newTopicDescription}
              onChangeText={setNewTopicDescription}
              placeholder="Enter topic description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
              onPress={() => setShowAddTopic(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddTopic}
            >
              <Text style={styles.saveButtonText}>Add Topic</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  moduleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moduleDuration: {
    fontSize: 12,
  },
  moduleStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  moduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  topicsPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  topicPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  topicPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicPreviewText: {
    marginLeft: 8,
    fontSize: 14,
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
  moreTopics: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moduleSelector: {
    gap: 8,
  },
  moduleOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  moduleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdultAIFinanceManagementScreen;
