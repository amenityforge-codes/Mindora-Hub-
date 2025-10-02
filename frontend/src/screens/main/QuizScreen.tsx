import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  RadioButton,
  Checkbox,
  TextInput,
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchQuiz } from '../../store/slices/contentSlice';
import { updateProgress, updateLocalProgress } from '../../store/slices/progressSlice';
import { Quiz, Question } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function QuizScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { quizId, moduleId } = route.params as { quizId: string; moduleId?: string };
  
  const { currentQuiz, quizCompletionStatus, isLoading } = useAppSelector((state) => state.content);
  const { isLoading: isSubmitting } = useAppSelector((state) => state.progress);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (quizId) {
      console.log('Loading quiz with ID:', quizId);
      dispatch(fetchQuiz({ quizId, mode: 'take' }));
    }
  }, [quizId]);

  // Check if quiz is completed and show completion screen
  useEffect(() => {
    if (quizCompletionStatus.isCompleted) {
      console.log('Quiz is completed with score:', quizCompletionStatus.userScore);
    }
  }, [quizCompletionStatus]);

  // Use currentQuiz from Redux store
  const activeQuiz = currentQuiz;

  useEffect(() => {
    console.log('Current quiz updated:', currentQuiz);
    console.log('Active quiz:', activeQuiz);
    if (activeQuiz && !quizStarted) {
      setTimeRemaining((activeQuiz.settings?.timeLimit || 10) * 60); // Convert minutes to seconds
      setAnswers(new Array(activeQuiz.questions?.length || 0).fill(null));
    }
  }, [activeQuiz, quizStarted]);

  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStarted, timeRemaining]);

  const startQuiz = () => {
    setQuizStarted(true);
    startTimeRef.current = Date.now();
  };

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (activeQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) {
      Alert.alert('Error', 'No quiz data available');
      return;
    }

    const timeSpent = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds

    try {
      // Get auth token for quiz submission
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      // Use the correct API endpoint for quiz submission
      const response = await fetch(`http://192.168.1.18:5000/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers,
          timeSpent
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log('🎯 Frontend Debug - Full Response:', result);
        console.log('🎯 Frontend Debug - Quiz Result:', result.data || result);
        
        const quizResult = result.data || result;
        
        // Transform the result to match expected format
        const transformedResult = {
          score: quizResult.correctAnswers || 0,
          totalMarks: quizResult.totalQuestions || 0,
          percentage: quizResult.adjustedScore || quizResult.score || 0,
          pointsEarned: quizResult.pointsEarned || 0,
          timeSpent: quizResult.timeSpent || 0,
          passed: quizResult.passed || false,
          passingScore: quizResult.passingScore || 60,
          attemptNumber: quizResult.attemptNumber || 1,
          canReAttempt: quizResult.canReAttempt || false,
          status: quizResult.status || 'completed',
          results: quizResult.results || []
        };
        
        console.log('🎯 Frontend Debug - Points Earned from backend:', quizResult.pointsEarned);
        console.log('🎯 Frontend Debug - Transformed Result:', transformedResult);
        
        setResults(transformedResult);
        setQuizCompleted(true);
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        const score = quizResult.adjustedScore || quizResult.score || 0;
        const status = quizResult.status || 'completed';
        const canReAttempt = quizResult.canReAttempt || false;
        
        let message = `Quiz completed!\nScore: ${score}%`;
        if (status === 'completed' && score === 100) {
          message += '\n🎉 Perfect! You completed this quiz!';
        } else if (canReAttempt) {
          message += '\nYou can re-attempt this quiz to improve your score.';
        }
        
        Alert.alert('Success!', message);
        
        // Update progress after quiz completion
        if (moduleId) {
          const progressPercentage = Math.min(quizResult.adjustedScore || quizResult.score || 0, 100);
          const pointsEarned = quizResult.pointsEarned || 0; // Use points from backend
          
          // Update progress with quiz results
          dispatch(updateProgress({
            moduleId: moduleId,
            step: 1, // Quiz completion step
            percentage: progressPercentage,
            timeSpent: timeSpent || 0
          }));
          
          // Also update local progress state
          dispatch(updateLocalProgress({
            moduleId: moduleId,
            progress: {
              percentage: progressPercentage,
              points: pointsEarned,
              timeSpent: timeSpent || 0,
              status: status === 'completed' ? 'completed' : 'in-progress',
              lastActivity: new Date().toISOString()
            }
          }));
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || `Failed to submit quiz. Status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to submit quiz: ${error.message}`);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question, index: number) => {
    const currentAnswer = answers[index];
    
    // Debug: Log question structure
    console.log('=== RENDERING QUESTION ===');
    console.log('Question index:', index);
    console.log('Question object:', question);
    console.log('Question type:', question?.type);
    console.log('Question properties:', Object.keys(question || {}));

    switch (question?.type) {
      case 'mcq':
        return (
          <View style={styles.questionContainer}>
            <Text variant="titleMedium" style={styles.questionText}>
              {question.prompt}
            </Text>
            <RadioButton.Group
              onValueChange={(value) => handleAnswerChange(index, parseInt(value))}
              value={currentAnswer?.toString() || ''}
            >
              {question.options?.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                  <RadioButton value={optionIndex.toString()} />
                  <Text variant="bodyMedium" style={styles.optionText}>
                    {option.text}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </View>
        );

      case 'true-false':
        return (
          <View style={styles.questionContainer}>
            <Text variant="titleMedium" style={styles.questionText}>
              {question.prompt}
            </Text>
            <RadioButton.Group
              onValueChange={(value) => handleAnswerChange(index, value === 'true')}
              value={currentAnswer?.toString() || ''}
            >
              <View style={styles.optionContainer}>
                <RadioButton value="true" />
                <Text variant="bodyMedium" style={styles.optionText}>
                  True
                </Text>
              </View>
              <View style={styles.optionContainer}>
                <RadioButton value="false" />
                <Text variant="bodyMedium" style={styles.optionText}>
                  False
                </Text>
              </View>
            </RadioButton.Group>
          </View>
        );

      case 'fill-blank':
        return (
          <View style={styles.questionContainer}>
            <Text variant="titleMedium" style={styles.questionText}>
              {question.prompt}
            </Text>
            <TextInput
              mode="outlined"
              value={currentAnswer || ''}
              onChangeText={(text) => handleAnswerChange(index, text)}
              placeholder="Enter your answer..."
              style={styles.textInput}
            />
          </View>
        );

      case 'short-answer':
        return (
          <View style={styles.questionContainer}>
            <Text variant="titleMedium" style={styles.questionText}>
              {question.prompt}
            </Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={3}
              value={currentAnswer || ''}
              onChangeText={(text) => handleAnswerChange(index, text)}
              placeholder="Enter your answer..."
              style={styles.textInput}
            />
          </View>
        );

      default:
        // Fallback: Try to render as MCQ if no type is specified
        // Handle both old format (question) and new format (prompt)
        const questionText = question.prompt || question.question;
        const questionOptions = question.options;
        
        if (!question.type && questionText && questionOptions) {
          return (
            <View style={styles.questionContainer}>
              <Text variant="headlineSmall" style={[styles.questionText, { color: theme.colors.primary, marginBottom: 20 }]}>
                {questionText}
              </Text>
              <View style={styles.optionsContainer}>
                {questionOptions?.map((option, optionIndex) => {
                  const isSelected = currentAnswer === optionIndex;
                  return (
                    <TouchableOpacity
                      key={optionIndex}
                      style={[
                        styles.optionButton,
                        { 
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                          borderWidth: 2
                        }
                      ]}
                      onPress={() => handleAnswerChange(index, optionIndex)}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          styles.optionIndicator,
                          { 
                            backgroundColor: isSelected ? 'white' : 'transparent',
                            borderColor: isSelected ? theme.colors.primary : theme.colors.outline
                          }
                        ]}>
                          {isSelected && <Text style={[styles.optionIndicatorText, { color: theme.colors.primary }]}>✓</Text>}
                        </View>
                        <Text style={[
                          styles.optionText,
                          { 
                            color: isSelected ? 'white' : theme.colors.onSurface,
                            fontWeight: isSelected ? 'bold' : 'normal'
                          }
                        ]}>
                          {typeof option === 'string' ? option : option.text}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }
        
        return (
          <View style={styles.questionContainer}>
            <Text variant="titleMedium" style={styles.questionText}>
              {question.prompt || 'Question'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              Unsupported question type: {question.type || 'undefined'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
              Question structure: {JSON.stringify(question, null, 2)}
            </Text>
          </View>
        );
    }
  };

  const renderQuizStart = () => {
    if (!activeQuiz) return null;

    return (
      <View style={styles.startContainer}>
        <Card style={[styles.startCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.startContent}>
            <Icon name="quiz" size={64} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={[styles.quizTitle, { color: theme.colors.primary }]}>
              {activeQuiz?.title || 'Quiz'}
            </Text>
            <Text variant="bodyLarge" style={styles.quizDescription}>
              {activeQuiz?.description || 'Test your knowledge'}
            </Text>
            
            <View style={styles.quizInfo}>
              <View style={styles.infoItem}>
                <Icon name="help" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {activeQuiz?.questions?.length || 0} Questions
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="timer" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {activeQuiz.settings?.timeLimit || 10} Minutes
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="star" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {activeQuiz.settings?.passingScore || 70}% to Pass
                </Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={startQuiz}
              style={styles.startButton}
              contentStyle={styles.startButtonContent}
            >
              Start Quiz
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderQuizContent = () => {
    if (!activeQuiz || !quizStarted) return null;

    const currentQuestion = activeQuiz?.questions?.[currentQuestionIndex];
    if (!currentQuestion) return null; // Safety check for current question
    
    const progress = (currentQuestionIndex + 1) / (activeQuiz?.questions?.length || 1);

    return (
      <View style={styles.quizContainer}>
        {/* Header */}
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                Question {currentQuestionIndex + 1} of {activeQuiz?.questions?.length || 0}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Question */}
        <Card style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {renderQuestion(currentQuestion, currentQuestionIndex)}
          </Card.Content>
        </Card>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              { 
                backgroundColor: currentQuestionIndex === 0 ? theme.colors.surface : theme.colors.primary,
                borderColor: theme.colors.primary,
                opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={[
              styles.navButtonText,
              { color: currentQuestionIndex === 0 ? theme.colors.onSurface : 'white' }
            ]}>
              ← Previous
            </Text>
          </TouchableOpacity>
          
          {currentQuestionIndex === (activeQuiz?.questions?.length || 0) - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.submitButton,
                { 
                  backgroundColor: isSubmitting ? theme.colors.surface : '#4CAF50',
                  opacity: isSubmitting ? 0.7 : 1
                }
              ]}
              onPress={handleSubmitQuiz}
              disabled={isSubmitting}
            >
              <Text style={[styles.navButtonText, { color: 'white' }]}>
                {isSubmitting ? 'Submitting...' : '✓ Submit Quiz'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNextQuestion}
            >
              <Text style={[styles.navButtonText, { color: 'white' }]}>
                Next →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    const passingScore = results.passingScore || activeQuiz?.settings?.passingScore || 60;
    const passed = results.passed !== undefined ? results.passed : results.percentage >= passingScore;
    const resultColor = passed ? theme.colors.tertiary : theme.colors.error;

    return (
      <View style={styles.resultsContainer}>
        <Card style={[styles.resultsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.resultsContent}>
            <Icon 
              name={passed ? 'check-circle' : 'cancel'} 
              size={64} 
              color={resultColor} 
            />
            <Text variant="headlineSmall" style={[styles.resultTitle, { color: resultColor }]}>
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </Text>
            <Text variant="bodyLarge" style={styles.resultSubtitle}>
              {passed ? 'You passed the quiz!' : 'You need more practice.'}
            </Text>
            
            <View style={styles.scoreContainer}>
              <Text variant="headlineLarge" style={[styles.score, { color: resultColor }]}>
                {(results.percentage || 0).toFixed(1)}%
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Score: {results.score} / {results.totalMarks}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Points Earned: {results.pointsEarned || 0}
              </Text>
            </View>
            
            <View style={styles.resultsInfo}>
              <View style={styles.resultItem}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  Time Spent:
                </Text>
                <Text variant="bodyMedium">
                  {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  Passing Score:
                </Text>
                <Text variant="bodyMedium">
                  {passingScore}%
                </Text>
              </View>
            </View>
            
            <View style={styles.resultsActions}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.resultButton}
              >
                Back to Lesson
              </Button>
              {results.canReAttempt && (
                <Button
                  mode="contained"
                  onPress={() => {
                    setQuizCompleted(false);
                    setQuizStarted(false);
                    setCurrentQuestionIndex(0);
                    setAnswers(new Array(activeQuiz?.questions.length || 0).fill(null));
                    setResults(null);
                  }}
                  style={styles.resultButton}
                >
                  Retake Quiz
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderCompletionScreen = () => {
    return (
      <View style={styles.completionContainer}>
        <Card style={[styles.completionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.completionContent}>
            <Icon name="check-circle" size={80} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={[styles.completionTitle, { color: theme.colors.primary }]}>
              Quiz Completed!
            </Text>
            <Text variant="titleLarge" style={[styles.completionScore, { color: theme.colors.text }]}>
              Perfect Score: {quizCompletionStatus.userScore}/100
            </Text>
            <Text variant="bodyLarge" style={[styles.completionMessage, { color: theme.colors.textSecondary }]}>
              Congratulations! You've mastered this quiz with a perfect score. 
              This quiz is now locked as you've achieved the maximum points.
            </Text>
            
            <View style={styles.completionActions}>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.completionButton}
              >
                Go Back to Module
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading quiz...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeQuiz) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={theme.colors.error} />
          <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16 }}>
            Quiz not found
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {quizCompletionStatus.isCompleted && renderCompletionScreen()}
      {!quizCompletionStatus.isCompleted && !quizStarted && !quizCompleted && renderQuizStart()}
      {!quizCompletionStatus.isCompleted && quizStarted && !quizCompleted && renderQuizContent()}
      {!quizCompletionStatus.isCompleted && quizCompleted && renderResults()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  startCard: {
    elevation: 4,
  },
  startContent: {
    alignItems: 'center',
    padding: 32,
  },
  quizTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quizDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  quizInfo: {
    width: '100%',
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  startButton: {
    width: '100%',
  },
  startButtonContent: {
    paddingVertical: 8,
  },
  quizContainer: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  questionCard: {
    flex: 1,
    marginBottom: 16,
    elevation: 2,
  },
  questionContainer: {
    padding: 16,
  },
  questionText: {
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 8,
    flex: 1,
  },
  textInput: {
    marginTop: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  resultsCard: {
    elevation: 4,
  },
  resultsContent: {
    alignItems: 'center',
    padding: 32,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  score: {
    fontWeight: 'bold',
    fontSize: 48,
  },
  resultsInfo: {
    width: '100%',
    marginBottom: 32,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  resultButton: {
    flex: 1,
  },
  // New improved quiz UI styles
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Navigation button styles
  navButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previousButton: {
    borderWidth: 2,
    marginRight: 8,
  },
  nextButton: {
    marginLeft: 8,
  },
  submitButton: {
    marginLeft: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Completion screen styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  completionCard: {
    elevation: 8,
    borderRadius: 16,
  },
  completionContent: {
    alignItems: 'center',
    padding: 32,
  },
  completionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  completionScore: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  completionMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  completionActions: {
    width: '100%',
  },
  completionButton: {
    paddingVertical: 8,
  },
});



