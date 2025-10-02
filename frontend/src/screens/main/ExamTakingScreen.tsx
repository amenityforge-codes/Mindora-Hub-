import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiService from '../../services/api';

interface Question {
  _id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'multiple_select' | 'integer' | 'text';
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: any;
  marks: number;
  negativeMarks: number;
  explanation?: string;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
}

const { width } = Dimensions.get('window');

const ExamTakingScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { examId, attemptId } = route.params as { examId: string; attemptId: string };

  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExam();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (exam) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [exam]);

  const loadExam = async () => {
    try {
      const data = await apiService.get(`/exams/${examId}`);
      if (data.success) {
        setExam(data.data.exam);
        setTimeRemaining(data.data.exam.duration * 60); // Convert minutes to seconds
      } else {
        Alert.alert('Error', 'Failed to load exam');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      Alert.alert('Error', 'Failed to load exam');
      navigation.goBack();
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (exam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        timeSpent: Math.floor((Date.now() - questionStartTime) / 1000)
      }));

      const data = await apiService.post(`/exams/${examId}/submit`, {
        attemptId,
        answers: answersArray
      });

      if (data.success) {
        Alert.alert(
          'Exam Submitted!',
          `Your score: ${data.data.score}/${exam?.totalMarks}\nPercentage: ${data.data.percentage}%\n${data.data.isPassed ? 'Congratulations! You passed!' : 'You did not pass this time.'}`,
          [
            {
              text: 'View Results',
              onPress: () => {
                navigation.navigate('ExamResults', {
                  examId,
                  attemptId,
                  score: data.data.score,
                  percentage: data.data.percentage,
                  isPassed: data.data.isPassed,
                  certificate: data.data.certificate
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      Alert.alert('Error', 'Failed to submit exam');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const handleAutoSubmit = () => {
    Alert.alert(
      'Time Up!',
      'Your exam time has ended. The exam will be submitted automatically.',
      [
        {
          text: 'Submit Now',
          onPress: handleSubmitExam
        }
      ]
    );
  };

  const renderQuestion = (question: Question, index: number) => {
    const isAnswered = answers[question._id] !== undefined;
    const isCurrentQuestion = index === currentQuestionIndex;

    if (!isCurrentQuestion) return null;

    return (
      <View key={question._id} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
            Question {index + 1} of {exam?.questions.length}
          </Text>
          <Text style={[styles.questionMarks, { color: theme.colors.textSecondary }]}>
            {question.marks} marks
          </Text>
        </View>

        <Text style={[styles.questionText, { color: theme.colors.text }]}>
          {question.questionText}
        </Text>

        {question.imageUrl && (
          <View style={styles.questionImage}>
            {/* Image component would go here */}
            <Text style={[styles.imagePlaceholder, { color: theme.colors.textSecondary }]}>
              [Image: {question.imageUrl}]
            </Text>
          </View>
        )}

        {question.codeSnippet && (
          <View style={[styles.codeSnippet, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.codeText, { color: theme.colors.text }]}>
              {question.codeSnippet}
            </Text>
          </View>
        )}

        {renderQuestionInput(question)}
      </View>
    );
  };

  const renderQuestionInput = (question: Question) => {
    const currentAnswer = answers[question._id];

    switch (question.questionType) {
      case 'multiple_choice':
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.surface },
                  currentAnswer === index && styles.selectedOption
                ]}
                onPress={() => handleAnswerChange(question._id, index)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.radioButton,
                    { borderColor: theme.colors.border },
                    currentAnswer === index && { backgroundColor: theme.colors.primary }
                  ]}>
                    {currentAnswer === index && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiple_select':
        const selectedIndices = currentAnswer || [];
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.surface },
                  selectedIndices.includes(index) && styles.selectedOption
                ]}
                onPress={() => {
                  const newSelection = selectedIndices.includes(index)
                    ? selectedIndices.filter(i => i !== index)
                    : [...selectedIndices, index];
                  handleAnswerChange(question._id, newSelection);
                }}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.checkbox,
                    { borderColor: theme.colors.border },
                    selectedIndices.includes(index) && { backgroundColor: theme.colors.primary }
                  ]}>
                    {selectedIndices.includes(index) && (
                      <MaterialIcons name="check" size={16} color="white" />
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'integer':
        return (
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            value={currentAnswer?.toString() || ''}
            onChangeText={(text) => handleAnswerChange(question._id, parseInt(text) || 0)}
            placeholder="Enter your answer"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        );

      case 'text':
        return (
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            value={currentAnswer || ''}
            onChangeText={(text) => handleAnswerChange(question._id, text)}
            placeholder="Enter your answer"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        );

      default:
        return null;
    }
  };

  const renderSubmitModal = () => (
    <Modal
      visible={showSubmitModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSubmitModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.submitModal, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Submit Exam
          </Text>
          <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
            Are you sure you want to submit your exam? This action cannot be undone.
          </Text>
          
          <View style={styles.answerSummary}>
            <Text style={[styles.summaryText, { color: theme.colors.text }]}>
              Questions answered: {Object.keys(answers).length} / {exam?.questions.length}
            </Text>
            <Text style={[styles.summaryText, { color: theme.colors.text }]}>
              Time remaining: {formatTime(timeRemaining)}
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.border }]}
              onPress={() => setShowSubmitModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmitExam}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!exam) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading exam...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Timer */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.examTitle, { color: theme.colors.text }]}>
            {exam.title}
          </Text>
          <Text style={[styles.examDescription, { color: theme.colors.textSecondary }]}>
            {exam.description}
          </Text>
        </View>

        <View style={[styles.timerContainer, { backgroundColor: timeRemaining < 300 ? '#EF4444' : theme.colors.primary }]}>
          <MaterialIcons name="schedule" size={20} color="white" />
          <Text style={styles.timerText}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Question Navigation */}
      <View style={[styles.navigation, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {exam.questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.background },
                index === currentQuestionIndex && styles.activeNavButton,
                answers[exam.questions[index]._id] !== undefined && styles.answeredNavButton
              ]}
              onPress={() => {
                setCurrentQuestionIndex(index);
                setQuestionStartTime(Date.now());
              }}
            >
              <Text style={[
                styles.navButtonText,
                { color: theme.colors.text },
                index === currentQuestionIndex && { color: 'white' },
                answers[exam.questions[index]._id] !== undefined && { color: theme.colors.primary }
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.questionScrollView}>
        {exam.questions.map((question, index) => renderQuestion(question, index))}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.bottomNavigation, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, { backgroundColor: theme.colors.background }]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <MaterialIcons name="chevron-left" size={20} color={theme.colors.text} />
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowSubmitModal(true)}
        >
          <MaterialIcons name="send" size={20} color="white" />
          <Text style={styles.submitButtonText}>
            Submit Exam
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, { backgroundColor: theme.colors.background }]}
          onPress={handleNextQuestion}
          disabled={currentQuestionIndex === exam.questions.length - 1}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>
            Next
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {renderSubmitModal()}
    </View>
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
    fontSize: 16,
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
  headerCenter: {
    flex: 1,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  examDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: '#3B82F6',
  },
  answeredNavButton: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionScrollView: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 20,
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
  questionMarks: {
    fontSize: 14,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  questionImage: {
    marginBottom: 16,
  },
  imagePlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  codeSnippet: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
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
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 100,
    textAlignVertical: 'top',
  },
  bottomNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitModal: {
    width: width * 0.9,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  answerSummary: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor set dynamically
  },
  submitButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExamTakingScreen;

