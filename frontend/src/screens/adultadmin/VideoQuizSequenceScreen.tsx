import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VideoQuizSequenceScreenProps {
  route: {
    params: {
      moduleId: string;
      moduleTitle: string;
      topicTitle: string;
    };
  };
}

interface VideoItem {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  topic: string;
  associatedQuiz?: string;
  sequenceOrder: number;
}

interface QuizItem {
  _id: string;
  title: string;
  questions: any[];
  associatedVideo?: string;
  sequenceOrder: number;
  unlockAfterVideo: boolean;
}

const VideoQuizSequenceScreen: React.FC<VideoQuizSequenceScreenProps> = ({ route }) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { moduleId, moduleTitle, topicTitle } = route.params;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuizSelector, setShowQuizSelector] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizItem[]>([]);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizQuestions, setNewQuizQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);

  useEffect(() => {
    loadContent();
  }, [moduleId, topicTitle]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const [videosResponse, quizzesResponse] = await Promise.all([
        fetch(`http://192.168.1.18:5000/api/video/module/${moduleId}`, { headers }),
        fetch(`http://192.168.1.18:5000/api/quiz/module/${moduleId}`, { headers })
      ]);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        const topicVideos = videosData.data?.videos?.filter((video: any) => 
          video.topic === topicTitle
        ) || [];
        setVideos(topicVideos.sort((a: any, b: any) => a.sequenceOrder - b.sequenceOrder));
      }

      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        const topicQuizzes = quizzesData.data?.quizzes?.filter((quiz: any) => 
          quiz.topic === topicTitle
        ) || [];
        setQuizzes(topicQuizzes.sort((a: any, b: any) => a.sequenceOrder - b.sequenceOrder));
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateQuiz = async (video: VideoItem) => {
    setSelectedVideo(video);
    
    // Get quizzes that are not already associated with videos
    const unassociatedQuizzes = quizzes.filter(quiz => 
      !quiz.associatedVideo && quiz.topic === topicTitle
    );
    
    if (unassociatedQuizzes.length === 0) {
      Alert.alert(
        'No Available Quizzes',
        'All quizzes for this topic are already associated with videos. Create a new quiz first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setAvailableQuizzes(unassociatedQuizzes);
    setShowQuizSelector(true);
  };

  const associateQuizWithVideo = async (quiz: QuizItem) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Update video with associated quiz
      const videoResponse = await fetch(`http://192.168.1.18:5000/api/video/${selectedVideo?._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          associatedQuiz: quiz._id,
          sequenceOrder: videos.length + 1
        })
      });

      // Update quiz with associated video
      const quizResponse = await fetch(`http://192.168.1.18:5000/api/quiz/${quiz._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          associatedVideo: selectedVideo?._id,
          unlockAfterVideo: true,
          sequenceOrder: videos.length + 1
        })
      });

      if (videoResponse.ok && quizResponse.ok) {
        Alert.alert('Success', 'Quiz associated with video successfully!');
        setShowQuizSelector(false);
        setSelectedVideo(null);
        loadContent(); // Reload to show updated associations
      } else {
        Alert.alert('Error', 'Failed to associate quiz with video');
      }
    } catch (error) {
      console.error('Error associating quiz:', error);
      Alert.alert('Error', 'Failed to associate quiz with video');
    }
  };

  const removeAssociation = async (video: VideoItem) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Find the associated quiz
      const associatedQuiz = quizzes.find(quiz => quiz.associatedVideo === video._id);
      
      if (associatedQuiz) {
        // Update quiz to remove association
        await fetch(`http://192.168.1.18:5000/api/quiz/${associatedQuiz._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            associatedVideo: null,
            unlockAfterVideo: false
          })
        });
      }

      // Update video to remove association
      await fetch(`http://192.168.1.18:5000/api/video/${video._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          associatedQuiz: null
        })
      });

      Alert.alert('Success', 'Association removed successfully!');
      loadContent();
    } catch (error) {
      console.error('Error removing association:', error);
      Alert.alert('Error', 'Failed to remove association');
    }
  };

  const createNewQuiz = async () => {
    if (!newQuizTitle.trim()) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    if (newQuizQuestions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
      Alert.alert('Error', 'Please fill in all questions and options');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch('http://192.168.1.18:5000/api/quiz', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newQuizTitle,
          description: `Quiz for ${topicTitle}`,
          level: 1,
          moduleId: moduleId,
          timeLimit: 10,
          passingScore: 70,
          questions: newQuizQuestions.map(q => ({
            prompt: q.question,
            type: 'mcq',
            options: q.options.map(option => ({ text: option })),
            correctAnswer: q.correctAnswer
          })),
          topic: topicTitle,
          topicDescription: `Quiz related to ${topicTitle} topic`
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Quiz created successfully!');
        setShowCreateQuiz(false);
        setNewQuizTitle('');
        setNewQuizQuestions([{
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }]);
        loadContent(); // Reload to show new quiz
      } else {
        Alert.alert('Error', 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      Alert.alert('Error', 'Failed to create quiz');
    }
  };

  const addQuestion = () => {
    setNewQuizQuestions([...newQuizQuestions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const removeQuestion = (index: number) => {
    if (newQuizQuestions.length > 1) {
      setNewQuizQuestions(newQuizQuestions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...newQuizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setNewQuizQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...newQuizQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setNewQuizQuestions(updated);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={theme.gradients.header}
      style={styles.header}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Video-Quiz Sequence</Text>
        <Text style={styles.headerSubtitle}>{topicTitle}</Text>
      </View>
    </LinearGradient>
  );

  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    const associatedQuiz = quizzes.find(quiz => quiz.associatedVideo === item._id);
    
    return (
      <View style={[styles.sequenceCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sequenceHeader}>
          <View style={[styles.sequenceNumber, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.sequenceNumberText}>{item.sequenceOrder || '?'}</Text>
          </View>
          <View style={styles.sequenceInfo}>
            <Text style={[styles.sequenceTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.sequenceMeta, { color: theme.colors.textSecondary }]}>
              Video • {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : 'Unknown duration'}
            </Text>
          </View>
          <View style={styles.sequenceIcon}>
            <MaterialIcons name="play-circle-filled" size={24} color="#FF6B6B" />
          </View>
        </View>

        {associatedQuiz ? (
          <View style={styles.associatedQuiz}>
            <View style={styles.quizInfo}>
              <MaterialIcons name="quiz" size={20} color="#4ECDC4" />
              <Text style={[styles.quizTitle, { color: theme.colors.text }]}>
                {associatedQuiz.title}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
              onPress={() => removeAssociation(item)}
            >
              <MaterialIcons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.associateButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleAssociateQuiz(item)}
          >
            <MaterialIcons name="add" size={16} color="white" />
            <Text style={styles.associateButtonText}>Add Quiz</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuizSelector = () => (
    <Modal
      visible={showQuizSelector}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowQuizSelector(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Select Quiz for "{selectedVideo?.title}"
          </Text>
          <TouchableOpacity onPress={() => setShowQuizSelector(false)}>
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createQuizButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setShowQuizSelector(false);
            setShowCreateQuiz(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.createQuizButtonText}>Create New Quiz</Text>
        </TouchableOpacity>

        <FlatList
          data={availableQuizzes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.quizOption, { backgroundColor: theme.colors.surface }]}
              onPress={() => associateQuizWithVideo(item)}
            >
              <View style={styles.quizOptionLeft}>
                <MaterialIcons name="quiz" size={24} color="#4ECDC4" />
                <View style={styles.quizOptionInfo}>
                  <Text style={[styles.quizOptionTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.quizOptionMeta, { color: theme.colors.textSecondary }]}>
                    {item.questions?.length || 0} questions
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          style={styles.quizList}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionsCard}>
          <MaterialIcons name="info" size={24} color={theme.colors.primary} />
          <View style={styles.instructionsContent}>
            <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
              Create Learning Sequences
            </Text>
            <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
              Associate quizzes with videos to create sequential learning. Students will watch videos first, then take the associated quiz.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createQuizMainButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCreateQuiz(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.createQuizMainButtonText}>Create New Quiz</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading content...
            </Text>
          </View>
        ) : (
          <View style={styles.sequenceContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Learning Sequence
            </Text>
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {renderQuizSelector()}

      {/* Create Quiz Modal */}
      <Modal
        visible={showCreateQuiz}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateQuiz(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Create New Quiz
            </Text>
            <TouchableOpacity onPress={() => setShowCreateQuiz(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.createQuizContainer}>
            <View style={[styles.inputGroup, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Quiz Title</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.outline
                }]}
                value={newQuizTitle}
                onChangeText={setNewQuizTitle}
                placeholder="Enter quiz title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {newQuizQuestions.map((question, questionIndex) => (
              <View key={questionIndex} style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.questionHeader}>
                  <Text style={[styles.questionNumber, { color: theme.colors.text }]}>
                    Question {questionIndex + 1}
                  </Text>
                  {newQuizQuestions.length > 1 && (
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => removeQuestion(questionIndex)}
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Question</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.outline
                    }]}
                    value={question.question}
                    onChangeText={(text) => updateQuestion(questionIndex, 'question', text)}
                    placeholder="Enter your question"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Options</Text>
                  {question.options.map((option, optionIndex) => (
                    <View key={optionIndex} style={styles.optionRow}>
                      <TouchableOpacity
                        style={[styles.radioButton, { 
                          backgroundColor: question.correctAnswer === optionIndex ? theme.colors.primary : 'transparent',
                          borderColor: theme.colors.outline
                        }]}
                        onPress={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                      >
                        {question.correctAnswer === optionIndex && (
                          <MaterialIcons name="check" size={16} color="white" />
                        )}
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.optionInput, { 
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          borderColor: theme.colors.outline
                        }]}
                        value={option}
                        onChangeText={(text) => updateOption(questionIndex, optionIndex, text)}
                        placeholder={`Option ${optionIndex + 1}`}
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addQuestionButton, { backgroundColor: theme.colors.primary }]}
              onPress={addQuestion}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addQuestionButtonText}>Add Question</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={createNewQuiz}
            >
              <Text style={styles.createButtonText}>Create Quiz</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  instructionsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  instructionsContent: {
    flex: 1,
    marginLeft: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sequenceContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sequenceCard: {
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sequenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sequenceNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sequenceNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sequenceInfo: {
    flex: 1,
  },
  sequenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sequenceMeta: {
    fontSize: 14,
  },
  sequenceIcon: {
    marginLeft: 10,
  },
  associatedQuiz: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(76, 205, 196, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  associateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  associateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  quizList: {
    flex: 1,
    padding: 20,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quizOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quizOptionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  quizOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quizOptionMeta: {
    fontSize: 14,
  },
  createQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 12,
  },
  createQuizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  createQuizContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
  },
  questionCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  addQuestionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  createButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createQuizMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  createQuizMainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default VideoQuizSequenceScreen;
