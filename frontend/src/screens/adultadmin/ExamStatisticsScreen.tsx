import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';

interface ExamStats {
  exam: {
    title: string;
    totalMarks: number;
    passingMarks: number;
    duration: number;
  };
  statistics: {
    totalAttempts: number;
    averageScore: number;
    averagePercentage: number;
    passedAttempts: number;
    failedAttempts: number;
    highestScore: number;
    lowestScore: number;
  };
  topPerformers: Array<{
    _id: string;
    student: {
      name: string;
      email: string;
    };
    score: number;
    percentage: number;
    submittedAt: string;
  }>;
}

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

const { width } = Dimensions.get('window');

const ExamStatisticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      console.log('Loading exams for statistics...');
      const data = await apiService.get('/exams');
      
      if (data.success) {
        const examsList = data.data.exams;
        setExams(examsList);
        console.log('Exams loaded successfully:', examsList.length);
      } else {
        throw new Error(data.message || 'Failed to load exams');
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      Alert.alert('Error', 'Failed to load exams. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadExamStatistics = async (examId: string) => {
    try {
      console.log('Loading statistics for exam:', examId);
      const data = await apiService.get(`/exams/${examId}/statistics`);
      
      if (data.success) {
        setExamStats(data.data);
        setShowStatsModal(true);
        console.log('Exam statistics loaded successfully');
      } else {
        throw new Error(data.message || 'Failed to load exam statistics');
      }
    } catch (error) {
      console.error('Error loading exam statistics:', error);
      Alert.alert('Error', 'Failed to load exam statistics. Please check your connection.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExams();
    setRefreshing(false);
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);
    
    if (now < startDate) return { status: 'upcoming', color: '#3B82F6' };
    if (now > endDate) return { status: 'ended', color: '#6B7280' };
    return { status: 'active', color: '#10B981' };
  };

  const renderExamCard = ({ item }: { item: Exam }) => {
    const status = getExamStatus(item);
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    return (
      <View style={[styles.examCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
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
          
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.examDetails}>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Start: {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
          </Text>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            End: {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}
          </Text>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Category: {item.category} • Difficulty: {item.difficulty}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.statsButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => loadExamStatistics(item._id)}
        >
          <MaterialIcons name="analytics" size={16} color="white" />
          <Text style={styles.statsButtonText}>View Statistics</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatisticsModal = () => {
    if (!examStats) return null;

    const { statistics, topPerformers } = examStats;
    const passRate = statistics.totalAttempts > 0 
      ? Math.round((statistics.passedAttempts / statistics.totalAttempts) * 100) 
      : 0;

    return (
      <Modal
        visible={showStatsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.statsModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Exam Statistics
              </Text>
              <TouchableOpacity
                onPress={() => setShowStatsModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContent}>
              {/* Overview Cards */}
              <View style={styles.overviewCards}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
                  <MaterialIcons name="people" size={24} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {statistics.totalAttempts}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Total Attempts
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
                  <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {statistics.passedAttempts}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Passed
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
                  <MaterialIcons name="cancel" size={24} color="#EF4444" />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {statistics.failedAttempts}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Failed
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
                  <MaterialIcons name="trending-up" size={24} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {passRate}%
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Pass Rate
                  </Text>
                </View>
              </View>

              {/* Performance Metrics */}
              <View style={[styles.metricsCard, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Performance Metrics
                </Text>
                
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Average Score:
                  </Text>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {statistics.averageScore.toFixed(1)} / {examStats.exam.totalMarks}
                  </Text>
                </View>
                
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Average Percentage:
                  </Text>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {statistics.averagePercentage.toFixed(1)}%
                  </Text>
                </View>
                
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Highest Score:
                  </Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>
                    {statistics.highestScore} / {examStats.exam.totalMarks}
                  </Text>
                </View>
                
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Lowest Score:
                  </Text>
                  <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                    {statistics.lowestScore} / {examStats.exam.totalMarks}
                  </Text>
                </View>
              </View>

              {/* Top Performers */}
              {topPerformers.length > 0 && (
                <View style={[styles.topPerformersCard, { backgroundColor: theme.colors.background }]}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    Top Performers
                  </Text>
                  
                  {topPerformers.map((performer, index) => (
                    <View key={performer._id} style={styles.performerRow}>
                      <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.rankText}>{index + 1}</Text>
                      </View>
                      
                      <View style={styles.performerInfo}>
                        <Text style={[styles.performerName, { color: theme.colors.text }]}>
                          {performer.student.name}
                        </Text>
                        <Text style={[styles.performerEmail, { color: theme.colors.textSecondary }]}>
                          {performer.student.email}
                        </Text>
                      </View>
                      
                      <View style={styles.performerScore}>
                        <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                          {performer.score}
                        </Text>
                        <Text style={[styles.percentageText, { color: theme.colors.textSecondary }]}>
                          {performer.percentage}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
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
          Exam Statistics
        </Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={exams}
        renderItem={renderExamCard}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="analytics" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No exams found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Create exams to view statistics
            </Text>
          </View>
        )}
      />

      {renderStatisticsModal()}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  statsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModal: {
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
  statsContent: {
    padding: 16,
  },
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  metricsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  topPerformersCard: {
    padding: 16,
    borderRadius: 12,
  },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  performerEmail: {
    fontSize: 12,
  },
  performerScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ExamStatisticsScreen;

