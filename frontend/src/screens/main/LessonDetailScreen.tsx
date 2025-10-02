import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

interface LessonDetailScreenProps {
  route: {
    params: {
      lessonId: string;
      lessonTitle: string;
      lessonDescription: string;
      topics?: any[];
    };
  };
}

const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({ route }) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { lessonId, lessonTitle, lessonDescription, topics: passedTopics } = route.params;

  const [topics, setTopics] = useState(passedTopics || []);
  const [loading, setLoading] = useState(!passedTopics || passedTopics.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!passedTopics || passedTopics.length === 0) {
      loadLessonDetails();
    }
  }, [lessonId]);

  const loadLessonDetails = async () => {
    try {
      console.log('=== LOADING LESSON DETAILS ===');
      console.log('Lesson ID:', lessonId);

      const response = await fetch(`http://192.168.1.18:5000/api/lessons/${lessonId}`);
      const data = await response.json();

      console.log('Lesson API response:', data);

      if (data.success && data.data && data.data.lesson) {
        setTopics(data.data.lesson.topics || []);
      } else {
        Alert.alert('Error', 'Failed to load lesson details');
      }
    } catch (error) {
      console.error('Error loading lesson details:', error);
      Alert.alert('Error', 'Failed to load lesson details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLessonDetails();
  };

  const handleTopicPress = (topic: any) => {
    console.log('=== TOPIC CLICKED ===');
    console.log('Topic:', topic);
    console.log('Videos count:', topic.videos?.length || 0);
    console.log('Quizzes count:', topic.quizzes?.length || 0);

    // Navigate to TopicContentScreen with the topic's data
    navigation.navigate('TopicContent' as never, {
      moduleId: lessonId,
      topicTitle: topic.title,
      topicDescription: topic.description || '',
      moduleTitle: lessonTitle,
      // Pass the videos and quizzes directly
      topicVideos: topic.videos || [],
      topicQuizzes: topic.quizzes || [],
      isFromLesson: true,
    } as never);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return '#4CAF50';
      case 'medium':
      case 'intermediate':
        return '#FF9800';
      case 'hard':
      case 'advanced':
        return '#F44336';
      default:
        return theme.colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading lesson details...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Lesson Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary + '80']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="school" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          {lessonDescription && (
            <Text style={styles.headerDescription}>{lessonDescription}</Text>
          )}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="topic" size={20} color="#fff" />
              <Text style={styles.statText}>{topics.length} Topics</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="play-circle-outline" size={20} color="#fff" />
              <Text style={styles.statText}>
                {topics.reduce((sum, t) => sum + (t.videos?.length || 0), 0)} Videos
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="quiz" size={20} color="#fff" />
              <Text style={styles.statText}>
                {topics.reduce((sum, t) => sum + (t.quizzes?.length || 0), 0)} Quizzes
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Topics List */}
        <View style={styles.topicsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📚 Topics in this Lesson
          </Text>

          {topics.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <MaterialIcons name="topic" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No topics available yet
              </Text>
            </View>
          ) : (
            topics.map((topic, index) => (
              <TouchableOpacity
                key={topic._id || index}
                style={[styles.topicCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleTopicPress(topic)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.primary + '20', theme.colors.primary + '10']}
                  style={styles.topicCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.topicHeader}>
                    <View style={styles.topicTitleRow}>
                      <View style={[styles.topicNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.topicNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.topicInfo}>
                        <Text style={[styles.topicTitle, { color: theme.colors.text }]}>
                          {topic.title}
                        </Text>
                        {topic.description && (
                          <Text
                            style={[styles.topicDescription, { color: theme.colors.textSecondary }]}
                            numberOfLines={2}
                          >
                            {topic.description}
                          </Text>
                        )}
                      </View>
                    </View>

                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </View>

                  {/* Topic Stats */}
                  <View style={styles.topicStats}>
                    <View style={styles.topicStatItem}>
                      <MaterialIcons
                        name="play-circle-outline"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text style={[styles.topicStatText, { color: theme.colors.textSecondary }]}>
                        {topic.videos?.length || 0} {topic.videos?.length === 1 ? 'Video' : 'Videos'}
                      </Text>
                    </View>
                    <View style={styles.topicStatItem}>
                      <MaterialIcons name="quiz" size={18} color={theme.colors.primary} />
                      <Text style={[styles.topicStatText, { color: theme.colors.textSecondary }]}>
                        {topic.quizzes?.length || 0} {topic.quizzes?.length === 1 ? 'Quiz' : 'Quizzes'}
                      </Text>
                    </View>
                  </View>

                  {/* Topic Progress */}
                  {topic.isActive !== undefined && (
                    <View style={styles.topicStatus}>
                      <MaterialIcons
                        name={topic.isActive ? 'check-circle' : 'radio-button-unchecked'}
                        size={16}
                        color={topic.isActive ? '#4CAF50' : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.topicStatusText,
                          { color: topic.isActive ? '#4CAF50' : theme.colors.textSecondary },
                        ]}
                      >
                        {topic.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  topicsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  topicCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topicCardGradient: {
    padding: 16,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  topicNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
  },
  topicStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  topicStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicStatText: {
    fontSize: 14,
  },
  topicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  topicStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LessonDetailScreen;