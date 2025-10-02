import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface Answer {
  question: string;
  answer: any;
  isCorrect: boolean;
  marksObtained: number;
  timeSpent: number;
}

interface ExamAttempt {
  _id: string;
  exam: {
    _id: string;
    title: string;
    totalMarks: number;
    passingMarks: number;
    questions: Question[];
  };
  answers: Answer[];
  score: number;
  percentage: number;
  isPassed: boolean;
  submittedAt: string;
  timeSpent: number;
}

const { width } = Dimensions.get('window');

const ExamResultsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { examId, attemptId, score, percentage, isPassed, certificate } = route.params as {
    examId: string;
    attemptId: string;
    score: number;
    percentage: number;
    isPassed: boolean;
    certificate?: any;
  };

  const [examAttempt, setExamAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  useEffect(() => {
    loadExamAttempt();
  }, []);

  const loadExamAttempt = async () => {
    try {
      // In a real implementation, you would fetch the detailed attempt data
      // For now, we'll use the data passed from the previous screen
      setExamAttempt({
        _id: attemptId,
        exam: {
          _id: examId,
          title: 'Sample Exam',
          totalMarks: 100,
          passingMarks: 50,
          questions: []
        },
        answers: [],
        score,
        percentage,
        isPassed,
        submittedAt: new Date().toISOString(),
        timeSpent: 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading exam attempt:', error);
      Alert.alert('Error', 'Failed to load exam results');
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (certificate) {
      Alert.alert(
        'Certificate Available!',
        `Your certificate number is: ${certificate.certificateNumber}\n\nYou can download your certificate from the certificates section.`,
        [
          {
            text: 'View Certificates',
            onPress: () => {
              navigation.navigate('Certificates');
            }
          }
        ]
      );
    }
  };

  const handleRetakeExam = () => {
    Alert.alert(
      'Retake Exam',
      'Are you sure you want to retake this exam?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake',
          onPress: () => {
            navigation.navigate('ExamTaking', { examId, attemptId: 'new' });
          }
        }
      ]
    );
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const renderQuestionReview = (question: Question, answer: Answer, index: number) => {
    const isCorrect = answer.isCorrect;
    const marksObtained = answer.marksObtained;

    return (
      <View key={question._id} style={styles.questionReview}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
            Question {index + 1}
          </Text>
          <View style={[
            styles.marksBadge,
            { backgroundColor: isCorrect ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.marksText}>
              {marksObtained}/{question.marks}
            </Text>
          </View>
        </View>

        <Text style={[styles.questionText, { color: theme.colors.text }]}>
          {question.questionText}
        </Text>

        {renderAnswerReview(question, answer)}

        {question.explanation && (
          <View style={[styles.explanation, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
              Explanation:
            </Text>
            <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
              {question.explanation}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAnswerReview = (question: Question, answer: Answer) => {
    const userAnswer = answer.answer;
    const isCorrect = answer.isCorrect;

    return (
      <View style={styles.answerReview}>
        <View style={styles.answerSection}>
          <Text style={[styles.answerLabel, { color: theme.colors.text }]}>
            Your Answer:
          </Text>
          <View style={[
            styles.answerBox,
            { backgroundColor: isCorrect ? '#D1FAE5' : '#FEE2E2' }
          ]}>
            {renderUserAnswer(question, userAnswer)}
          </View>
        </View>

        {!isCorrect && (
          <View style={styles.answerSection}>
            <Text style={[styles.answerLabel, { color: theme.colors.text }]}>
              Correct Answer:
            </Text>
            <View style={[styles.answerBox, { backgroundColor: '#D1FAE5' }]}>
              {renderCorrectAnswer(question)}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderUserAnswer = (question: Question, userAnswer: any) => {
    switch (question.questionType) {
      case 'multiple_choice':
        const selectedOption = question.options?.[userAnswer];
        return (
          <Text style={[styles.answerText, { color: '#1F2937' }]}>
            {selectedOption?.text || 'No answer selected'}
          </Text>
        );

      case 'multiple_select':
        const selectedOptions = question.options?.filter((_, index) => 
          userAnswer.includes(index)
        );
        return (
          <Text style={[styles.answerText, { color: '#1F2937' }]}>
            {selectedOptions?.map(opt => opt.text).join(', ') || 'No answers selected'}
          </Text>
        );

      case 'integer':
      case 'text':
        return (
          <Text style={[styles.answerText, { color: '#1F2937' }]}>
            {userAnswer?.toString() || 'No answer provided'}
          </Text>
        );

      default:
        return null;
    }
  };

  const renderCorrectAnswer = (question: Question) => {
    switch (question.questionType) {
      case 'multiple_choice':
        const correctOption = question.options?.find(opt => opt.isCorrect);
        return (
          <Text style={[styles.answerText, { color: '#1F2937' }]}>
            {correctOption?.text || 'No correct answer defined'}
          </Text>
        );

      case 'multiple_select':
        const correctOptions = question.options?.filter(opt => opt.isCorrect);
        return (
          <Text style={[styles.answerText, { color: '#1F2937' }]}>
            {correctOptions?.map(opt => opt.text).join(', ') || 'No correct answers defined'}
          </Text>
        );

      case 'integer':
      case 'text':
        return (
          <Text style={[styles.answerText, { color: '#1F2937' }]}>
            {question.correctAnswer?.toString() || 'No correct answer defined'}
          </Text>
        );

      default:
        return null;
    }
  };

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowReviewModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.reviewModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Question Review
            </Text>
            <TouchableOpacity
              onPress={() => setShowReviewModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.reviewContent}>
            {examAttempt?.exam.questions.map((question, index) => {
              const answer = examAttempt.answers[index];
              return renderQuestionReview(question, answer, index);
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading results...
          </Text>
        </View>
      </View>
    );
  }

  const grade = getGrade(percentage);
  const gradeColor = getGradeColor(percentage);

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
          Exam Results
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Results Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryHeader}>
            <MaterialIcons 
              name={isPassed ? "check-circle" : "cancel"} 
              size={48} 
              color={isPassed ? "#10B981" : "#EF4444"} 
            />
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              {isPassed ? 'Congratulations!' : 'Better luck next time!'}
            </Text>
            <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
              {isPassed ? 'You have passed the exam!' : 'You did not pass this time.'}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                Score
              </Text>
              <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
                {score}/{examAttempt?.exam.totalMarks || 100}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                Percentage
              </Text>
              <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
                {percentage}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                Grade
              </Text>
              <Text style={[styles.gradeValue, { color: gradeColor }]}>
                {grade}
              </Text>
            </View>
          </View>

          <View style={styles.passingMarks}>
            <Text style={[styles.passingMarksText, { color: theme.colors.textSecondary }]}>
              Passing Marks: {examAttempt?.exam.passingMarks || 50}%
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowReviewModal(true)}
          >
            <MaterialIcons name="visibility" size={20} color="white" />
            <Text style={styles.actionButtonText}>Review Answers</Text>
          </TouchableOpacity>

          {isPassed && certificate && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={handleDownloadCertificate}
            >
              <MaterialIcons name="download" size={20} color="white" />
              <Text style={styles.actionButtonText}>Download Certificate</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
            onPress={handleRetakeExam}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={styles.actionButtonText}>Retake Exam</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Insights */}
        <View style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>
            Performance Insights
          </Text>
          
          <View style={styles.insightItem}>
            <MaterialIcons name="schedule" size={20} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              Time taken: {Math.floor((examAttempt?.timeSpent || 0) / 60)} minutes
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <MaterialIcons name="quiz" size={20} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              Questions answered: {examAttempt?.answers.length || 0} / {examAttempt?.exam.questions.length || 0}
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              Correct answers: {examAttempt?.answers.filter(a => a.isCorrect).length || 0}
            </Text>
          </View>
        </View>
      </ScrollView>

      {renderReviewModal()}
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gradeValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  passingMarks: {
    alignItems: 'center',
  },
  passingMarksText: {
    fontSize: 14,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsCard: {
    padding: 16,
    borderRadius: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  insightText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModal: {
    width: width * 0.95,
    maxHeight: '90%',
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  reviewContent: {
    flex: 1,
    padding: 16,
  },
  questionReview: {
    marginBottom: 24,
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
  marksBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  marksText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  answerReview: {
    gap: 12,
  },
  answerSection: {
    gap: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  answerBox: {
    padding: 12,
    borderRadius: 8,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 22,
  },
  explanation: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ExamResultsScreen;

