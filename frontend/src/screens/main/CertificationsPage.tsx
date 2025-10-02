import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../hooks/redux';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

interface Exam {
  _id: string;
  title: string;
  description: string;
  duration: number;
  passingMarks: number;
  totalMarks: number;
  category: string;
  difficulty: string;
  questions: any[];
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface ExamAttempt {
  _id: string;
  exam: {
    _id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
  };
  student: string;
  score: number;
  percentage: number;
  isPassed: boolean;
  status: string;
  startTime: string;
  endTime?: string;
  submittedAt?: string;
}

const CertificationsPage: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPoints, setUserPoints] = useState(0);

  const categories = [
    { value: 'all', label: 'All', icon: 'apps' },
    { value: 'certification', label: 'Certification', icon: 'school' },
    { value: 'assessment', label: 'Assessment', icon: 'quiz' },
    { value: 'skill-test', label: 'Skill Test', icon: 'psychology' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'hard', label: 'Hard', color: '#F44336' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadExams(),
        loadAttempts(),
        loadUserPoints()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load certifications data');
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      console.log('Loading exams...');
      const data = await apiService.get('/exams');
      console.log('Exams API response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        const examsList = data.data.exams || [];
        console.log('Exams loaded successfully:', examsList.length);
        setExams(examsList);
      } else {
        console.error('Failed to load exams:', data.message);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadAttempts = async () => {
    try {
      if (user?.id) {
        console.log('Loading attempts for user:', user.id);
        const data = await apiService.get(`/exams/attempts/user/${user.id}`);
        console.log('Attempts API response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          const attemptsList = data.data.attempts || [];
          console.log('Attempts loaded successfully:', attemptsList.length);
          setAttempts(attemptsList);
        } else {
          console.error('Failed to load attempts:', data.message);
        }
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const loadUserPoints = async () => {
    try {
      if (user?.id) {
        console.log('Loading user points for user:', user.id);
        const data = await apiService.get(`/achievements/user/${user.id}/stats`);
        console.log('User points API response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          const points = data.data.userPoints || 0;
          console.log('User points loaded successfully:', points);
          setUserPoints(points);
        } else {
          console.error('Failed to load user points:', data.message);
        }
      }
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty);
    return diff?.color || '#666';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty);
    return diff?.label || difficulty;
  };

  const hasAttempted = (examId: string) => {
    return attempts.some(attempt => attempt.exam._id === examId);
  };

  const getAttemptResult = (examId: string) => {
    const attempt = attempts.find(attempt => attempt.exam._id === examId);
    return attempt;
  };

  const handleStartExam = async (exam: Exam) => {
    try {
      console.log('Starting exam:', exam._id, 'for user:', user?.id);
      
      // Check if user has already attempted this exam
      const existingAttempt = attempts.find(attempt => attempt.exam._id === exam._id);
      
      if (existingAttempt) {
        Alert.alert(
          'Already Attempted',
          'You have already taken this exam. Would you like to view your results?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Results', 
              onPress: () => navigation.navigate('ExamResults', {
                examId: exam._id,
                attemptId: existingAttempt._id,
                score: existingAttempt.score,
                percentage: existingAttempt.percentage,
                isPassed: existingAttempt.isPassed
              })
            }
          ]
        );
        return;
      }

      // Start new exam attempt
      console.log('Sending start exam request to:', `/exams/${exam._id}/start`);
      const data = await apiService.post(`/exams/${exam._id}/start`, {
        studentId: user?.id
      });
      
      console.log('Start exam response:', data);
      
      if (data.success) {
        navigation.navigate('ExamTaking', {
          examId: exam._id,
          attemptId: data.data.attemptId
        });
      } else {
        console.error('Start exam failed:', data.message);
        Alert.alert('Error', data.message || 'Failed to start exam');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      Alert.alert('Error', 'Failed to start exam. Please try again.');
    }
  };

  const filteredExams = exams.filter(exam => {
    if (selectedCategory === 'all') return true;
    return exam.category === selectedCategory;
  });

  const renderStatsCard = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primary + '80']}
      style={styles.statsCard}
    >
      <View style={styles.statsHeader}>
        <MaterialIcons name="school" size={24} color="white" />
        <Text style={styles.statsTitle}>Certifications</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{exams.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{attempts.length}</Text>
          <Text style={styles.statLabel}>Attempted</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {attempts.filter(a => a.isPassed).length}
          </Text>
          <Text style={styles.statLabel}>Passed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryButton,
            {
              backgroundColor: selectedCategory === category.value 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: selectedCategory === category.value 
                ? theme.colors.primary 
                : theme.colors.border
            }
          ]}
          onPress={() => setSelectedCategory(category.value)}
        >
          <MaterialIcons 
            name={category.icon as any} 
            size={16} 
            color={selectedCategory === category.value ? 'white' : theme.colors.text} 
          />
          <Text style={[
            styles.categoryButtonText,
            { color: selectedCategory === category.value ? 'white' : theme.colors.text }
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderExam = (exam: Exam) => {
    const hasAttemptedExam = hasAttempted(exam._id);
    const attemptResult = getAttemptResult(exam._id);
    const difficultyColor = getDifficultyColor(exam.difficulty);

    return (
      <TouchableOpacity
        key={exam._id}
        style={[
          styles.examCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: hasAttemptedExam 
              ? (attemptResult?.isPassed ? '#4CAF50' : '#F44336')
              : theme.colors.border
          }
        ]}
        onPress={() => handleStartExam(exam)}
      >
        <View style={styles.examHeader}>
          <View style={styles.examInfo}>
            <Text style={[styles.examTitle, { color: theme.colors.text }]}>
              {exam.title}
            </Text>
            <Text style={[styles.examDescription, { color: theme.colors.textSecondary }]}>
              {exam.description}
            </Text>
            
            <View style={styles.examMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {exam.duration} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="quiz" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {exam.questions.length} questions
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="trending-up" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {exam.passingMarks}% to pass
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.examActions}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyText}>
                {getDifficultyLabel(exam.difficulty)}
              </Text>
            </View>
            
            {hasAttemptedExam ? (
              <View style={styles.resultContainer}>
                {attemptResult?.isPassed ? (
                  <View style={styles.passedContainer}>
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                    <Text style={[styles.resultText, { color: '#4CAF50' }]}>
                      Passed ({attemptResult.percentage}%)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.failedContainer}>
                    <MaterialIcons name="cancel" size={20} color="#F44336" />
                    <Text style={[styles.resultText, { color: '#F44336' }]}>
                      Failed ({attemptResult?.percentage}%)
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleStartExam(exam)}
              >
                <MaterialIcons name="play-arrow" size={20} color="white" />
                <Text style={styles.startButtonText}>Start Exam</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {hasAttemptedExam && attemptResult?.isPassed && (
          <View style={styles.pointsContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={[styles.pointsText, { color: '#FFD700' }]}>
              +1000 points earned!
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="school" size={48} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading certifications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCard()}
        {renderCategoryFilter()}
        
        <View style={styles.examsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Available Exams ({filteredExams.length})
          </Text>
          
          {filteredExams.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="school" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No exams available
              </Text>
            </View>
          ) : (
            filteredExams.map(renderExam)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  categoryFilter: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  examsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  examCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examInfo: {
    flex: 1,
    marginRight: 12,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
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
  examActions: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    alignItems: 'center',
  },
  passedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  failedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
});

export default CertificationsPage;
