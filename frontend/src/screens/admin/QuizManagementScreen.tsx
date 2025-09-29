import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  level: string;
  moduleId: string;
  questions: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
}

const QuizManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    level: '1',
    moduleId: '1',
    timeLimit: 10,
    passingScore: 70,
  });

  const [questionData, setQuestionData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  const modules = [
    { id: '1', title: 'Alphabet & Phonics' },
    { id: '2', title: 'Basic Vocabulary' },
    { id: '3', title: 'Numbers & Counting' },
    { id: '4', title: 'Colors & Shapes' },
    { id: '5', title: 'Family & Relationships' },
    { id: '6', title: 'Animals & Nature' },
    { id: '7', title: 'Food & Drinks' },
    { id: '8', title: 'Clothing & Accessories' },
    { id: '9', title: 'Home & Furniture' },
    { id: '10', title: 'School & Education' },
    { id: '11', title: 'Body Parts & Health' },
    { id: '12', title: 'Transportation' },
    { id: '13', title: 'Weather & Seasons' },
    { id: '14', title: 'Time & Calendar' },
    { id: '15', title: 'Basic Grammar' },
    { id: '16', title: 'Common Verbs' },
    { id: '17', title: 'Adjectives & Descriptions' },
    { id: '18', title: 'Prepositions & Directions' },
    { id: '19', title: 'Questions & Answers' },
    { id: '20', title: 'Conversation Practice' },
  ];

  const levels = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, using sample quizzes');
        loadSampleQuizzes();
        return;
      }

      // Load quizzes from backend
      const response = await fetch('http://192.168.200.129:5000/api/quiz/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const backendQuizzes: Quiz[] = result.data.quizzes.map((quiz: any) => ({
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          level: quiz.level.toString(),
          moduleId: quiz.moduleId,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          questions: quiz.questions.map((q: any) => ({
            id: q._id || Date.now().toString(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          }))
        }));
        setQuizzes(backendQuizzes);
      } else {
        console.log('Failed to load quizzes from backend, using sample quizzes');
        loadSampleQuizzes();
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      loadSampleQuizzes();
    }
  };

  const loadSampleQuizzes = () => {
    const sampleQuizzes: Quiz[] = [
      {
        id: '1',
        title: 'Alphabet Recognition Quiz',
        description: 'Test knowledge of alphabet letters',
        level: '1',
        moduleId: '1',
        timeLimit: 5,
        passingScore: 80,
        questions: [
          {
            id: '1',
            question: 'What letter comes after A?',
            options: ['B', 'C', 'D', 'E'],
            correctAnswer: 0,
            explanation: 'B comes after A in the alphabet.',
          },
        ],
      },
    ];
    setQuizzes(sampleQuizzes);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={theme.gradients.header}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Quiz Management</Text>
          <Text style={styles.headerSubtitle}>Create and manage quizzes</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreatingQuiz(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const handleCreateQuiz = async () => {
    if (!quizData.title) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    try {
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // Save quiz to backend
      const response = await fetch('http://192.168.200.129:5000/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizData.title,
          description: quizData.description,
          level: parseInt(quizData.level),
          moduleId: quizData.moduleId,
          timeLimit: quizData.timeLimit,
          passingScore: quizData.passingScore,
          questions: []
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newQuiz: Quiz = {
          id: result.data._id,
          title: result.data.title,
          description: result.data.description,
          level: result.data.level.toString(),
          moduleId: result.data.moduleId,
          timeLimit: result.data.timeLimit,
          passingScore: result.data.passingScore,
          questions: [],
        };

        setQuizzes([...quizzes, newQuiz]);
        setSelectedQuiz(newQuiz);
        setIsCreatingQuiz(false);
        setQuizData({
          title: '',
          description: '',
          level: '1',
          moduleId: '1',
          timeLimit: 10,
          passingScore: 70,
        });
        
        Alert.alert('Success', 'Quiz created successfully!');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      Alert.alert('Error', 'Failed to create quiz. Please try again.');
    }
  };

  const handleAddQuestion = async () => {
    if (!questionData.question || questionData.options.some(opt => !opt.trim())) {
      Alert.alert('Error', 'Please fill in all question fields');
      return;
    }

    if (!selectedQuiz) {
      Alert.alert('Error', 'Please select a quiz first');
      return;
    }

    try {
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // Add question to backend
      const response = await fetch(`http://192.168.200.129:5000/api/quiz/${selectedQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questions: [
            ...selectedQuiz.questions.map(q => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            })),
            {
              question: questionData.question,
              options: questionData.options,
              correctAnswer: questionData.correctAnswer,
              explanation: questionData.explanation
            }
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newQuestion: QuizQuestion = {
          id: Date.now().toString(),
          ...questionData,
        };

        const updatedQuiz = {
          ...selectedQuiz,
          questions: [...selectedQuiz.questions, newQuestion],
        };
        setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
        setSelectedQuiz(updatedQuiz);

        setQuestionData({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
        });
        setShowQuestionModal(false);
        
        Alert.alert('Success', 'Question added successfully!');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      Alert.alert('Error', 'Failed to add question. Please try again.');
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });
    setShowQuestionModal(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !selectedQuiz) return;

    const updatedQuestion = {
      ...editingQuestion,
      ...questionData,
    };

    const updatedQuiz = {
      ...selectedQuiz,
      questions: selectedQuiz.questions.map(q => 
        q.id === editingQuestion.id ? updatedQuestion : q
      ),
    };

    setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
    setSelectedQuiz(updatedQuiz);
    setEditingQuestion(null);
    setQuestionData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedQuiz) return;

    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedQuiz = {
              ...selectedQuiz,
              questions: selectedQuiz.questions.filter(q => q.id !== questionId),
            };
            setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
            setSelectedQuiz(updatedQuiz);
          },
        },
      ]
    );
  };

  const handleDeleteQuiz = (quizId: string) => {
    Alert.alert(
      'Delete Quiz',
      'Are you sure you want to delete this quiz?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setQuizzes(quizzes.filter(q => q.id !== quizId));
            if (selectedQuiz?.id === quizId) {
              setSelectedQuiz(null);
            }
          },
        },
      ]
    );
  };

  const renderQuizList = () => (
    <View style={styles.quizListContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        All Quizzes ({quizzes.length})
      </Text>
      <ScrollView style={styles.quizList} showsVerticalScrollIndicator={false}>
        {quizzes.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            style={[
              styles.quizCard,
              { backgroundColor: theme.colors.surface },
              selectedQuiz?.id === quiz.id && styles.selectedQuizCard,
            ]}
            onPress={() => setSelectedQuiz(quiz)}
          >
            <View style={styles.quizCardHeader}>
              <View style={styles.quizInfo}>
                <Text style={[styles.quizTitle, { color: theme.colors.text }]}>
                  {quiz.title}
                </Text>
                <Text style={[styles.quizDescription, { color: theme.colors.textSecondary }]}>
                  {quiz.description}
                </Text>
                <View style={styles.quizMeta}>
                  <Text style={[styles.quizMetaText, { color: theme.colors.textSecondary }]}>
                    Level {quiz.level} • {modules.find(m => m.id === quiz.moduleId)?.title}
                  </Text>
                  <Text style={[styles.quizMetaText, { color: theme.colors.textSecondary }]}>
                    {quiz.questions.length} questions • {quiz.timeLimit} min
                  </Text>
                </View>
              </View>
              <View style={styles.quizActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditingQuiz(true)}
                >
                  <Icon name="edit" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteQuiz(quiz.id)}
                >
                  <Icon name="delete" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuizDetails = () => {
    if (!selectedQuiz) {
      return (
        <View style={styles.noSelectionContainer}>
          <Icon name="quiz" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.noSelectionText, { color: theme.colors.textSecondary }]}>
            Select a quiz to view details
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.quizDetailsContainer}>
        <View style={styles.quizDetailsHeader}>
          <Text style={[styles.quizDetailsTitle, { color: theme.colors.text }]}>
            {selectedQuiz.title}
          </Text>
          <Text style={[styles.quizDetailsDescription, { color: theme.colors.textSecondary }]}>
            {selectedQuiz.description}
          </Text>
          <View style={styles.quizDetailsMeta}>
            <Text style={[styles.quizDetailsMetaText, { color: theme.colors.textSecondary }]}>
              Level {selectedQuiz.level} • {selectedQuiz.timeLimit} minutes • {selectedQuiz.passingScore}% passing score
            </Text>
          </View>
        </View>

        <View style={styles.questionsSection}>
          <View style={styles.questionsHeader}>
            <Text style={[styles.questionsTitle, { color: theme.colors.text }]}>
              Questions ({selectedQuiz.questions.length})
            </Text>
            <TouchableOpacity
              style={[styles.addQuestionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowQuestionModal(true)}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={styles.addQuestionText}>Add Question</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.questionsList} showsVerticalScrollIndicator={false}>
            {selectedQuiz.questions.map((question, index) => (
              <View
                key={question.id}
                style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.questionHeader}>
                  <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                    Q{index + 1}
                  </Text>
                  <View style={styles.questionActions}>
                    <TouchableOpacity
                      style={styles.questionActionButton}
                      onPress={() => handleEditQuestion(question)}
                    >
                      <Icon name="edit" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.questionActionButton}
                      onPress={() => handleDeleteQuestion(question.id)}
                    >
                      <Icon name="delete" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.questionText, { color: theme.colors.text }]}>
                  {question.question}
                </Text>
                <View style={styles.optionsList}>
                  {question.options.map((option, optionIndex) => (
                    <View
                      key={optionIndex}
                      style={[
                        styles.optionItem,
                        optionIndex === question.correctAnswer && styles.correctOption,
                      ]}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        optionIndex === question.correctAnswer && styles.correctOptionText,
                      ]}>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </Text>
                      {optionIndex === question.correctAnswer && (
                        <Icon name="check-circle" size={16} color="#4CAF50" />
                      )}
                    </View>
                  ))}
                </View>
                {question.explanation && (
                  <Text style={[styles.explanation, { color: theme.colors.textSecondary }]}>
                    Explanation: {question.explanation}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCreateQuizModal = () => (
    <Modal
      visible={isCreatingQuiz}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setIsCreatingQuiz(false)}>
            <Text style={[styles.modalCancel, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create Quiz</Text>
          <TouchableOpacity onPress={handleCreateQuiz}>
            <Text style={[styles.modalSave, { color: theme.colors.primary }]}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Quiz Title *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={quizData.title}
              onChangeText={(text) => setQuizData({ ...quizData, title: text })}
              placeholder="Enter quiz title"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={quizData.description}
              onChangeText={(text) => setQuizData({ ...quizData, description: text })}
              placeholder="Enter quiz description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Module</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.moduleSelector}>
                  {modules.map((module) => (
                    <TouchableOpacity
                      key={module.id}
                      style={[
                        styles.moduleOption,
                        { backgroundColor: theme.colors.surface },
                        quizData.moduleId === module.id && styles.selectedModule,
                      ]}
                      onPress={() => setQuizData({ ...quizData, moduleId: module.id })}
                    >
                      <Text style={[
                        styles.moduleText,
                        { color: theme.colors.text },
                        quizData.moduleId === module.id && styles.selectedModuleText,
                      ]}>
                        {module.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.levelSelector}>
                  {levels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        { backgroundColor: theme.colors.surface },
                        quizData.level === level && styles.selectedLevel,
                      ]}
                      onPress={() => setQuizData({ ...quizData, level })}
                    >
                      <Text style={[
                        styles.levelText,
                        { color: theme.colors.text },
                        quizData.level === level && styles.selectedLevelText,
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Time Limit (minutes)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={quizData.timeLimit.toString()}
                onChangeText={(text) => setQuizData({ ...quizData, timeLimit: parseInt(text) || 10 })}
                placeholder="10"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Passing Score (%)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={quizData.passingScore.toString()}
                onChangeText={(text) => setQuizData({ ...quizData, passingScore: parseInt(text) || 70 })}
                placeholder="70"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderQuestionModal = () => (
    <Modal
      visible={showQuestionModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setShowQuestionModal(false);
            setEditingQuestion(null);
            setQuestionData({
              question: '',
              options: ['', '', '', ''],
              correctAnswer: 0,
              explanation: '',
            });
          }}>
            <Text style={[styles.modalCancel, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {editingQuestion ? 'Edit Question' : 'Add Question'}
          </Text>
          <TouchableOpacity onPress={editingQuestion ? handleUpdateQuestion : handleAddQuestion}>
            <Text style={[styles.modalSave, { color: theme.colors.primary }]}>
              {editingQuestion ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Question *</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={questionData.question}
              onChangeText={(text) => setQuestionData({ ...questionData, question: text })}
              placeholder="Enter your question"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Options *</Text>
            {questionData.options.map((option, index) => (
              <View key={index} style={styles.optionInputContainer}>
                <TextInput
                  style={[styles.optionInput, { 
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...questionData.options];
                    newOptions[index] = text;
                    setQuestionData({ ...questionData, options: newOptions });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={[
                    styles.correctButton,
                    { backgroundColor: questionData.correctAnswer === index ? '#4CAF50' : theme.colors.surface },
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() => setQuestionData({ ...questionData, correctAnswer: index })}
                >
                  <Icon 
                    name="check" 
                    size={16} 
                    color={questionData.correctAnswer === index ? 'white' : theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Explanation</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={questionData.explanation}
              onChangeText={(text) => setQuestionData({ ...questionData, explanation: text })}
              placeholder="Explain why this is the correct answer"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          {renderQuizList()}
        </View>
        <View style={styles.rightPanel}>
          {renderQuizDetails()}
        </View>
      </View>
      {renderCreateQuizModal()}
      {renderQuestionModal()}
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
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#e1e8ed',
  },
  rightPanel: {
    flex: 2,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
  },
  quizListContainer: {
    flex: 1,
  },
  quizList: {
    flex: 1,
  },
  quizCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedQuizCard: {
    borderColor: '#4169e1',
    backgroundColor: '#4169e110',
  },
  quizCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizMetaText: {
    fontSize: 12,
  },
  quizActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 16,
    marginTop: 16,
  },
  quizDetailsContainer: {
    flex: 1,
  },
  quizDetailsHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    marginBottom: 20,
  },
  quizDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizDetailsDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  quizDetailsMeta: {
    flexDirection: 'row',
  },
  quizDetailsMetaText: {
    fontSize: 14,
  },
  questionsSection: {
    flex: 1,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addQuestionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  questionsList: {
    flex: 1,
  },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionActions: {
    flexDirection: 'row',
  },
  questionActionButton: {
    padding: 4,
    marginLeft: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  optionsList: {
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  correctOption: {
    backgroundColor: '#E8F5E8',
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  explanation: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  moduleSelector: {
    flexDirection: 'row',
  },
  moduleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedModule: {
    borderColor: '#4169e1',
    backgroundColor: '#4169e120',
  },
  moduleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedModuleText: {
    color: '#4169e1',
    fontWeight: 'bold',
  },
  levelSelector: {
    flexDirection: 'row',
  },
  levelOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedLevel: {
    borderColor: '#4169e1',
    backgroundColor: '#4169e120',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLevelText: {
    color: '#4169e1',
    fontWeight: 'bold',
  },
  optionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default QuizManagementScreen;



