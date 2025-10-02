import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

interface Exam {
  _id: string;
  title: string;
  description: string;
  duration: number;
  passingMarks: number;
  totalMarks: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublished: boolean;
  category: string;
  difficulty: string;
  questions: any[];
  createdAt: string;
}

const ExamManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingMarks: 50,
    totalMarks: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    instructions: '',
    allowMultipleAttempts: false,
    maxAttempts: 1,
    category: 'certification',
    difficulty: 'medium'
  });

  // Question form state
  const [questionData, setQuestionData] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    marks: 1,
    difficulty: 'medium',
    options: ['', '', '', ''],
    correctAnswer: '',
    correctAnswers: [],
    explanation: ''
  });

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);

  const categories = [
    { value: 'certification', label: 'Certification' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'final', label: 'Final Exam' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      console.log('Loading adult exams with API service...');
      const data = await apiService.get('/adult-admin-content/exams');
      
      console.log('Adult Exams API response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.data && data.data.exams) {
        const examsList = data.data.exams;
        setExams(examsList);
        console.log('Adult exams loaded successfully:', examsList.length);
      } else {
        throw new Error(data.message || 'Failed to load adult exams');
      }
    } catch (error) {
      console.error('Error loading adult exams:', error);
      Alert.alert('Error', 'Failed to load adult exams. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExams();
    setRefreshing(false);
  };

  const handleCreateExam = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        Alert.alert('Error', 'Please enter an exam title');
        return;
      }
      if (!formData.description.trim()) {
        Alert.alert('Error', 'Please enter an exam description');
        return;
      }

      const examData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration.toString()),
        passingMarks: parseInt(formData.passingMarks.toString()),
        totalMarks: parseInt(formData.totalMarks.toString()),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Complete the exam within the given time limit.',
        allowMultipleAttempts: false,
        maxAttempts: 1,
        category: 'certification',
        difficulty: 'medium',
        questions: [] // Will be added later
      };

      console.log('Creating exam with data:', examData);
      const data = await apiService.post('/adult-exams', examData);

      if (data.success) {
        Alert.alert('Success', 'Exam created successfully!');
        setShowCreateModal(false);
        resetForm();
        console.log('Exam created successfully, refreshing exam list...');
        await loadExams();
        console.log('Exam list refreshed');
      } else {
        Alert.alert('Error', data.message || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      Alert.alert('Error', 'Failed to create exam. Please check your connection.');
    }
  };

  const handleCreateQuestion = async () => {
    try {
      if (!questionData.questionText.trim()) {
        Alert.alert('Error', 'Please enter a question');
        return;
      }

      if (!editingExam) {
        Alert.alert('Error', 'No exam selected');
        return;
      }

      const questionPayload = {
        questionText: questionData.questionText.trim(),
        questionType: questionData.questionType,
        marks: parseInt(questionData.marks.toString()),
        difficulty: questionData.difficulty,
        explanation: questionData.explanation.trim()
      };

      // Add options for multiple choice questions
      if (questionData.questionType === 'multiple_choice') {
        const validOptions = questionData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          Alert.alert('Error', 'Please provide at least 2 options for multiple choice questions');
          return;
        }
        if (!questionData.correctAnswer.trim()) {
          Alert.alert('Error', 'Please select a correct answer');
          return;
        }
        questionPayload.options = validOptions.map(opt => ({
          text: opt,
          isCorrect: opt === questionData.correctAnswer
        }));
        questionPayload.correctAnswer = questionData.correctAnswer;
      } else if (questionData.questionType === 'multiple_select') {
        const validOptions = questionData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          Alert.alert('Error', 'Please provide at least 2 options for multiple select questions');
          return;
        }
        if (questionData.correctAnswers.length === 0) {
          Alert.alert('Error', 'Please select at least one correct answer');
          return;
        }
        questionPayload.options = validOptions.map(opt => ({
          text: opt,
          isCorrect: questionData.correctAnswers.includes(opt)
        }));
        questionPayload.correctAnswer = questionData.correctAnswers.join(',');
      }

      // Additional validation for different question types
      if (questionData.questionType === 'multiple_choice' && questionPayload.options) {
        const correctOptions = questionPayload.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          Alert.alert('Error', 'Multiple choice questions must have exactly one correct answer');
          return;
        }
      }
      
      // Validation for integer and text questions
      if ((questionData.questionType === 'integer' || questionData.questionType === 'text')) {
        console.log('Validating integer/text question:', {
          questionType: questionData.questionType,
          correctAnswer: questionData.correctAnswer,
          correctAnswerTrimmed: questionData.correctAnswer?.trim(),
          isEmpty: !questionData.correctAnswer?.trim()
        });
        
        if (!questionData.correctAnswer || !questionData.correctAnswer.trim()) {
          Alert.alert('Error', `${questionData.questionType === 'integer' ? 'Integer' : 'Text'} questions must have a correct answer`);
          return;
        }
        
        // Ensure correctAnswer is set in the payload
        questionPayload.correctAnswer = questionData.correctAnswer.trim();
      }
      
      console.log('Creating question with data:', questionPayload);
      const data = await apiService.post('/questions', questionPayload);

      if (data.success) {
        // Associate the question with the exam
        try {
          const questionId = data.data.question._id;
          const examUpdateData = {
            questions: [...(editingExam.questions || []), questionId]
          };
          
          await apiService.put(`/adult-exams/${editingExam._id}`, examUpdateData);
          console.log('Question associated with exam successfully');
        } catch (updateError) {
          console.error('Error associating question with exam:', updateError);
          // Don't show error to user as question was created successfully
        }
        
        Alert.alert('Success', 'Question created successfully!');
        setShowQuestionModal(false);
        resetQuestionForm();
        
        // Update the editingExam state to show the new question immediately
        if (editingExam) {
          const updatedExam = {
            ...editingExam,
            questions: [...(editingExam.questions || []), data.data.question._id]
          };
          console.log('Updating editingExam with new question:', updatedExam);
          setEditingExam(updatedExam);
        }
        
        // Also refresh the exam list
        await loadExams();
      } else {
        Alert.alert('Error', data.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      Alert.alert('Error', 'Failed to create question. Please check your connection.');
    }
  };

  const resetQuestionForm = () => {
    setQuestionData({
      questionText: '',
      questionType: 'multiple_choice',
      marks: 1,
      difficulty: 'medium',
      options: ['', '', '', ''],
      correctAnswer: '',
      correctAnswers: [],
      explanation: ''
    });
  };

  const handleDeleteExam = async (id: string) => {
    Alert.alert(
      'Delete Exam',
      'Are you sure you want to delete this exam?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting exam with API service...');
              const data = await apiService.delete(`/adult-exams/${id}`);

              if (data.success) {
                Alert.alert('Success', 'Exam deleted successfully!');
                loadExams();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete exam');
              }
            } catch (error) {
              console.error('Error deleting exam:', error);
              Alert.alert('Error', 'Failed to delete exam. Please check your connection.');
            }
          }
        }
      ]
    );
  };

  const handleEditQuestion = async (question: any, index: number) => {
    console.log('Editing question:', question);
    
    try {
      // If question is just an ID, fetch the full question data
      let fullQuestion = question;
      if (typeof question === 'string' || !question.questionText) {
        console.log('Fetching full question data for ID:', question);
        const response = await apiService.get(`/questions/${question}`);
        if (response.success) {
          fullQuestion = response.data.question;
        } else {
          Alert.alert('Error', 'Failed to load question data');
          return;
        }
      }
      
      console.log('Full question data:', fullQuestion);
      
      // Handle different question data structures
      let options = ['', ''];
      let correctAnswer = '';
      let correctAnswers = [];
      
      if (fullQuestion.options && Array.isArray(fullQuestion.options)) {
        if (fullQuestion.options[0] && typeof fullQuestion.options[0] === 'object') {
          // Options are objects with text property
          options = fullQuestion.options.map((opt: any) => opt.text || '');
          correctAnswer = fullQuestion.correctAnswer || '';
          correctAnswers = fullQuestion.correctAnswers || [];
        } else {
          // Options are strings
          options = fullQuestion.options;
          correctAnswer = fullQuestion.correctAnswer || '';
          correctAnswers = fullQuestion.correctAnswers || [];
        }
      }
      
      // Ensure we have at least 2 options
      while (options.length < 2) {
        options.push('');
      }
      
      // Set the question data for editing
      setQuestionData({
        questionText: fullQuestion.questionText || '',
        questionType: fullQuestion.questionType || 'multiple_choice',
        options: options,
        correctAnswer: correctAnswer,
        correctAnswers: correctAnswers,
        marks: fullQuestion.marks || 1,
        difficulty: fullQuestion.difficulty || 'medium',
        explanation: fullQuestion.explanation || ''
      });
      
      console.log('Set question data:', {
        questionText: fullQuestion.questionText || '',
        questionType: fullQuestion.questionType || 'multiple_choice',
        options: options,
        correctAnswer: correctAnswer,
        correctAnswers: correctAnswers,
        marks: fullQuestion.marks || 1,
        difficulty: fullQuestion.difficulty || 'medium',
        explanation: fullQuestion.explanation || ''
      });
      
      // Set editing state
      setEditingQuestion(fullQuestion);
      setEditingQuestionIndex(index);
      setShowQuestionModal(true);
    } catch (error) {
      console.error('Error loading question for editing:', error);
      Alert.alert('Error', 'Failed to load question data');
    }
  };

  const handleDeleteQuestion = async (question: any, index: number) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the question from the backend
              await apiService.delete(`/questions/${question._id}`);
              
              // Update the editingExam state to remove the question
              if (editingExam) {
                const updatedQuestions = editingExam.questions.filter((_, i) => i !== index);
                const updatedExam = {
                  ...editingExam,
                  questions: updatedQuestions
                };
                setEditingExam(updatedExam);
                
                // Also update the exam in the backend
                await apiService.put(`/adult-exams/${editingExam._id}`, {
                  questions: updatedQuestions
                });
              }
              
              Alert.alert('Success', 'Question deleted successfully');
            } catch (error) {
              console.error('Error deleting question:', error);
              Alert.alert('Error', 'Failed to delete question');
            }
          },
        },
      ]
    );
  };

  const handleUpdateQuestion = async () => {
    try {
      if (!questionData.questionText.trim()) {
        Alert.alert('Error', 'Please enter a question');
        return;
      }

      if (!editingQuestion) {
        Alert.alert('Error', 'No question selected for editing');
        return;
      }

      const questionPayload = {
        questionText: questionData.questionText.trim(),
        questionType: questionData.questionType,
        marks: parseInt(questionData.marks.toString()),
        difficulty: questionData.difficulty,
        explanation: questionData.explanation.trim()
      };

      // Add options for multiple choice questions
      if (questionData.questionType === 'multiple_choice') {
        const validOptions = questionData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          Alert.alert('Error', 'Please provide at least 2 options for multiple choice questions');
          return;
        }
        if (!questionData.correctAnswer.trim()) {
          Alert.alert('Error', 'Please select a correct answer');
          return;
        }
        questionPayload.options = validOptions.map(opt => ({
          text: opt,
          isCorrect: opt === questionData.correctAnswer
        }));
        questionPayload.correctAnswer = questionData.correctAnswer;
      } else if (questionData.questionType === 'multiple_select') {
        const validOptions = questionData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          Alert.alert('Error', 'Please provide at least 2 options for multiple select questions');
          return;
        }
        if (questionData.correctAnswers.length === 0) {
          Alert.alert('Error', 'Please select at least one correct answer');
          return;
        }
        questionPayload.options = validOptions.map(opt => ({
          text: opt,
          isCorrect: questionData.correctAnswers.includes(opt)
        }));
        questionPayload.correctAnswer = questionData.correctAnswers.join(',');
      }

      console.log('Updating question with data:', questionPayload);
      const data = await apiService.put(`/questions/${editingQuestion._id}`, questionPayload);

      if (data.success) {
        Alert.alert('Success', 'Question updated successfully!');
        setShowQuestionModal(false);
        setEditingQuestion(null);
        setEditingQuestionIndex(-1);
        resetQuestionForm();
        
        // Refresh the exam to show the updated question
        await loadExams();
      } else {
        Alert.alert('Error', data.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      Alert.alert('Error', 'Failed to update question. Please check your connection.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 60,
      passingMarks: 50,
      totalMarks: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      instructions: '',
      allowMultipleAttempts: false,
      maxAttempts: 1,
      category: 'certification',
      difficulty: 'medium'
    });
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exam.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || exam.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const renderExamCard = ({ item }: { item: Exam }) => {
    const startDate = item.startDate ? (() => {
      try {
        const date = new Date(item.startDate);
        return isNaN(date.getTime()) ? new Date() : date;
      } catch {
        return new Date();
      }
    })() : new Date();
    
    const endDate = item.endDate ? (() => {
      try {
        const date = new Date(item.endDate);
        return isNaN(date.getTime()) ? new Date() : date;
      } catch {
        return new Date();
      }
    })() : new Date();
    const now = new Date();
    
    let status = 'upcoming';
    let statusColor = theme.colors.primary;
    
    if (now > endDate) {
      status = 'ended';
      statusColor = '#EF4444';
    } else if (now >= startDate) {
      status = 'active';
      statusColor = '#10B981';
    }

    return (
      <View style={[styles.examCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.examHeader}>
          <View style={styles.examInfo}>
            <Text style={[styles.examTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.examDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            <View style={styles.examMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.duration} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="quiz" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.questions.length} questions
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="grade" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.passingMarks}% to pass
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.examDetails}>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Start: {startDate && startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate.toLocaleDateString() : 'Not set'} {startDate && startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate.toLocaleTimeString() : ''}
          </Text>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            End: {endDate && endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate.toLocaleDateString() : 'Not set'} {endDate && endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate.toLocaleTimeString() : ''}
          </Text>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Category: {item.category} • Difficulty: {item.difficulty}
          </Text>
        </View>

        <View style={styles.examActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setEditingExam(item);
              setShowEditModal(true);
            }}
          >
            <MaterialIcons name="edit" size={16} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => {
              // Navigate to exam statistics
              Alert.alert('Info', 'Exam statistics feature coming soon!');
            }}
          >
            <MaterialIcons name="analytics" size={16} color="white" />
            <Text style={styles.actionButtonText}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => handleDeleteExam(item._id)}
          >
            <MaterialIcons name="delete" size={16} color="white" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.createModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Create New Exam
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            
            {/* Basic Information */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Exam Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc' }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter exam title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc' }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe what this exam covers"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc' }]}
                value={formData.duration.toString()}
                onChangeText={(text) => setFormData({ ...formData, duration: parseInt(text) || 60 })}
                placeholder="60"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Total Marks</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={formData.totalMarks.toString()}
                onChangeText={(text) => setFormData({ ...formData, totalMarks: parseInt(text) || 100 })}
                placeholder="100"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Passing Marks (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc' }]}
                value={formData.passingMarks.toString()}
                onChangeText={(text) => setFormData({ ...formData, passingMarks: parseInt(text) || 50 })}
                placeholder="50"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Questions Section */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Questions</Text>
                <TouchableOpacity
                  style={[styles.addQuestionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    // For now, just show a message - we'll implement question creation later
                    Alert.alert('Info', 'Question creation will be implemented in the next step. This exam will be created without questions for now.');
                  }}
                >
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.addQuestionButtonText}>Add Question</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                Questions can be added after creating the exam. This exam will be created without questions initially.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateExam}
              >
                <Text style={styles.createButtonText}>Create Exam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.createModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit Exam: {editingExam?.title}
            </Text>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Questions Management Section */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Questions ({editingExam?.questions?.length || 0})
                </Text>
                <TouchableOpacity
                  style={[styles.addQuestionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    console.log('Add Question button pressed');
                    setShowQuestionModal(true);
                  }}
                >
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.addQuestionButtonText}>Add Question</Text>
                </TouchableOpacity>
              </View>
              
              {/* Question Form - Show inline when adding */}
              {showQuestionModal && (
                <View style={[styles.questionForm, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginTop: 10 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <Text style={[styles.label, { color: theme.colors.text, fontSize: 18 }]}>
                      {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowQuestionModal(false);
                        setEditingQuestion(null);
                        setEditingQuestionIndex(-1);
                        resetQuestionForm();
                      }}
                      style={{ padding: 5 }}
                    >
                      <Text style={{ color: 'red', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView 
                    style={{ maxHeight: 400 }}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                  >
                    {/* Question Text */}
                  <View style={{ marginBottom: 15 }}>
                    <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Question Text *</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12 }]}
                      value={questionData.questionText}
                      onChangeText={(text) => setQuestionData({ ...questionData, questionText: text })}
                      placeholder="Enter your question here..."
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Question Type */}
                  <View style={{ marginBottom: 15 }}>
                    <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Question Type *</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { value: 'multiple_choice', label: 'Multiple Choice' },
                        { value: 'multiple_select', label: 'Multiple Select' },
                        { value: 'integer', label: 'Integer' },
                        { value: 'text', label: 'Text' }
                      ].map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={[
                            { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', backgroundColor: theme.colors.surface },
                            questionData.questionType === type.value && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                          ]}
                          onPress={() => setQuestionData({ ...questionData, questionType: type.value })}
                        >
                          <Text style={[
                            { color: theme.colors.text, fontSize: 12 },
                            questionData.questionType === type.value && { color: 'white' }
                          ]}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Options for Multiple Choice/Select */}
                  {(questionData.questionType === 'multiple_choice' || questionData.questionType === 'multiple_select') && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Options *</Text>
                      {questionData.options.map((option, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginRight: 8 }]}
                            value={option}
                            onChangeText={(text) => {
                              const newOptions = [...questionData.options];
                              newOptions[index] = text;
                              setQuestionData({ ...questionData, options: newOptions });
                            }}
                            placeholder={`Option ${index + 1}`}
                            placeholderTextColor={theme.colors.textSecondary}
                          />
                          {questionData.questionType === 'multiple_choice' && (
                            <TouchableOpacity
                              style={[
                                { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', marginRight: 8 },
                                questionData.correctAnswer === option && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                              ]}
                              onPress={() => setQuestionData({ ...questionData, correctAnswer: option })}
                            />
                          )}
                          {questionData.questionType === 'multiple_select' && (
                            <TouchableOpacity
                              style={[
                                { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#ccc', marginRight: 8 },
                                questionData.correctAnswers.includes(option) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                              ]}
                              onPress={() => {
                                const newCorrectAnswers = questionData.correctAnswers.includes(option)
                                  ? questionData.correctAnswers.filter(ans => ans !== option)
                                  : [...questionData.correctAnswers, option];
                                setQuestionData({ ...questionData, correctAnswers: newCorrectAnswers });
                              }}
                            >
                              {questionData.correctAnswers.includes(option) && (
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>✓</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Correct Answer for Integer and Text Questions */}
                  {(questionData.questionType === 'integer' || questionData.questionType === 'text') && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Correct Answer *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }]}
                        value={questionData.correctAnswer}
                        onChangeText={(text) => setQuestionData({ ...questionData, correctAnswer: text })}
                        placeholder={questionData.questionType === 'integer' ? 'Enter the correct number' : 'Enter the correct answer'}
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType={questionData.questionType === 'integer' ? 'numeric' : 'default'}
                      />
                    </View>
                  )}

                  {/* Marks and Difficulty */}
                  <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Marks</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 }]}
                        value={questionData.marks.toString()}
                        onChangeText={(text) => setQuestionData({ ...questionData, marks: parseInt(text) || 1 })}
                        placeholder="1"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Difficulty</Text>
                      <View style={{ flexDirection: 'row', gap: 5 }}>
                        {['easy', 'medium', 'hard'].map((diff) => (
                          <TouchableOpacity
                            key={diff}
                            style={[
                              { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', backgroundColor: theme.colors.surface },
                              questionData.difficulty === diff && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => setQuestionData({ ...questionData, difficulty: diff })}
                          >
                            <Text style={[
                              { color: theme.colors.text, fontSize: 12 },
                              questionData.difficulty === diff && { color: 'white' }
                            ]}>
                              {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 20 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowQuestionModal(false);
                          setEditingQuestion(null);
                          setEditingQuestionIndex(-1);
                          resetQuestionForm();
                        }}
                        style={{ flex: 1, backgroundColor: '#ccc', padding: 12, borderRadius: 6, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'black' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                        style={{ flex: 1, backgroundColor: theme.colors.primary, padding: 12, borderRadius: 6, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white' }}>
                          {editingQuestion ? 'Update Question' : 'Create Question'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              )}
              
              {editingExam?.questions && editingExam.questions.length > 0 ? (
                <View style={styles.questionsList}>
                  {editingExam.questions.map((question, index) => (
                    <View key={index} style={[styles.questionItem, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.questionText, { color: theme.colors.text }]}>
                        Q{index + 1}: {question.questionText || question.text || 'Question text not available'}
                      </Text>
                      <Text style={{ color: 'gray', fontSize: 12, marginTop: 4 }}>
                        Type: {question.questionType || 'unknown'} | Options: {question.options ? question.options.length : 0}
                      </Text>
                      <View style={styles.questionActions}>
                        <TouchableOpacity 
                          style={styles.questionActionButton}
                          onPress={() => handleEditQuestion(question, index)}
                        >
                          <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.questionActionButton}
                          onPress={() => handleDeleteQuestion(question, index)}
                        >
                          <MaterialIcons name="delete" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyQuestions, { backgroundColor: theme.colors.background }]}>
                  <MaterialIcons name="quiz" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyQuestionsText, { color: theme.colors.textSecondary }]}>
                    No questions added yet
                  </Text>
                  <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                    Click "Add Question" to start adding questions to this exam
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderQuestionModal = () => {
    console.log('🔍 Debug - renderQuestionModal called, showQuestionModal:', showQuestionModal);
    
    if (!showQuestionModal) {
      console.log('🔍 Modal not visible, returning null');
      return null;
    }
    
    console.log('🔍 Modal should be visible, rendering...');
    return (
    <Modal
      visible={showQuestionModal}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowQuestionModal(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
            Add Question
          </Text>
          <TouchableOpacity
            onPress={() => setShowQuestionModal(false)}
            style={{ padding: 10 }}
          >
            <Text style={{ fontSize: 18, color: 'red' }}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 20 }}>
          DEBUG: Modal is working! This is a simple test modal.
        </Text>
        
        <TouchableOpacity
          onPress={() => setShowQuestionModal(false)}
          style={{ backgroundColor: 'blue', padding: 15, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Close Modal</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Exam Management
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filters}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exams..."
          placeholderTextColor={theme.colors.textSecondary}
        />
        
        <View style={styles.filterRow}>
          <View style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.filterText, { color: theme.colors.text }]}>
              Category: {filterCategory}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color={theme.colors.text} />
          </View>
          
          <View style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.filterText, { color: theme.colors.text }]}>
              Difficulty: {filterDifficulty}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color={theme.colors.text} />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredExams}
        renderItem={renderExamCard}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No exams found. Create your first exam!
            </Text>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingAddButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {renderCreateModal()}
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filters: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  examCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  examMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  examDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  examActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  createModal: {
    width: '95%',
    height: '85%',
    borderRadius: 12,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // New improved modal styles
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#374151',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    width: width * 0.8,
    maxWidth: 300,
    borderRadius: 12,
    padding: 20,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPickerOption: {
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  pickerOptionText: {
    fontSize: 16,
    flex: 1,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addQuestionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  questionsList: {
    marginTop: 10,
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  questionActionButton: {
    padding: 4,
  },
  emptyQuestions: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyQuestionsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  questionTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  questionTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionInput: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ExamManagementScreen;
