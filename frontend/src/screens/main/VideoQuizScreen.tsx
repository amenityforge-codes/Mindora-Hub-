import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute, StackNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VideoQuizScreenProps {
  route: {
    params: {
      videoId: string;
      videoTitle: string;
      videoUrl: string;
      quizId?: string;
      quizTitle?: string;
      moduleId: string;
      topicTitle: string;
    };
  };
}

type VideoQuizScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoQuiz'>;

const { width, height } = Dimensions.get('window');

const VideoQuizScreen: React.FC<VideoQuizScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<VideoQuizScreenNavigationProp>();
  const { videoId, videoTitle, videoUrl, quizId, quizTitle, moduleId, topicTitle } = route.params;
  
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef(null);

  // Load video progress on component mount
  useEffect(() => {
    const loadVideoProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem(`videoProgress_${moduleId}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          if (progress[videoId]) {
            setIsVideoWatched(true);
            setShowQuiz(true);
          }
        }
      } catch (error) {
        console.error('Error loading video progress:', error);
      }
    };
    
    loadVideoProgress();
  }, [moduleId, videoId]);


  const handleVideoEnd = async () => {
    setIsVideoWatched(true);
    setShowQuiz(true);
    
    // Save video progress to AsyncStorage
    try {
      const savedProgress = await AsyncStorage.getItem(`videoProgress_${moduleId}`);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      progress[videoId] = true; // Mark video as watched
      await AsyncStorage.setItem(`videoProgress_${moduleId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  const handleTakeQuiz = () => {
    if (quizId) {
      navigation.navigate('Quiz' as any, {
        quizId: quizId,
        moduleId: moduleId,
        quizTitle: quizTitle
      });
    } else {
      Alert.alert('No Quiz', 'No quiz available for this video.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={theme.gradients.header}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{videoTitle}</Text>
            <Text style={styles.headerSubtitle}>{topicTitle}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderVideoSection = () => (
    <View style={[styles.videoSection, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        📹 Video Lesson
      </Text>
      
      <View style={styles.videoContainer}>
        {videoUrl ? (
          <Video
            ref={videoRef}
            style={styles.videoPlayer}
            source={{ 
              uri: videoUrl.startsWith('http') 
                ? videoUrl 
                : `http://192.168.200.129:5000${videoUrl}`
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setVideoProgress(status.positionMillis / status.durationMillis);
                if (status.didJustFinish) {
                  handleVideoEnd();
                }
              }
            }}
            onError={(error) => {
              console.error('Video playback error:', error);
              Alert.alert('Video Error', 'Failed to load video. Please check your connection.');
            }}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <MaterialIcons name="error" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.noVideoText, { color: theme.colors.text }]}>
              No video available
            </Text>
            <Text style={[styles.noVideoSubtext, { color: theme.colors.textSecondary }]}>
              Video URL: {videoUrl || 'Not provided'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.videoInfo}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Progress: {Math.round(videoProgress * 100)}%
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.background }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${videoProgress * 100}%`
                }
              ]} 
            />
          </View>
        </View>

        {isVideoWatched && (
          <View style={[styles.watchedBadge, { backgroundColor: '#4CAF50' }]}>
            <MaterialIcons name="check-circle" size={20} color="white" />
            <Text style={styles.watchedText}>Video Completed!</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderQuizSection = () => {
    if (!quizId) {
      return (
        <View style={[styles.quizSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📝 Quiz
          </Text>
          <View style={styles.noQuizContainer}>
            <MaterialIcons name="quiz" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.noQuizText, { color: theme.colors.text }]}>
              No quiz available
            </Text>
            <Text style={[styles.noQuizSubtext, { color: theme.colors.textSecondary }]}>
              This video doesn't have an associated quiz.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.quizSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📝 Quiz
        </Text>
        
        <View style={[styles.quizCard, { backgroundColor: theme.colors.background }]}>
          <View style={styles.quizInfo}>
            <MaterialIcons name="quiz" size={24} color="#4ECDC4" />
            <View style={styles.quizDetails}>
              <Text style={[styles.quizTitle, { color: theme.colors.text }]}>
                {quizTitle || 'Quiz'}
              </Text>
              <Text style={[styles.quizDescription, { color: theme.colors.textSecondary }]}>
                Test your knowledge after watching the video
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.quizButton,
              {
                backgroundColor: isVideoWatched ? theme.colors.primary : '#ccc',
                opacity: isVideoWatched ? 1 : 0.6
              }
            ]}
            onPress={handleTakeQuiz}
            disabled={!isVideoWatched}
          >
            <MaterialIcons 
              name={isVideoWatched ? "quiz" : "lock"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.quizButtonText}>
              {isVideoWatched ? 'Take Quiz' : 'Watch Video First'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isVideoWatched && (
          <View style={styles.lockMessage}>
            <MaterialIcons name="info" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.lockText, { color: theme.colors.textSecondary }]}>
              Complete the video to unlock the quiz
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderVideoSection()}
        {renderQuizSection()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  videoSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  videoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 15,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
  },
  noVideoContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noVideoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  noVideoSubtext: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  videoInfo: {
    gap: 10,
  },
  progressContainer: {
    gap: 5,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  watchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  watchedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  quizSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  quizCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quizDetails: {
    flex: 1,
    marginLeft: 10,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  quizDescription: {
    fontSize: 12,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  quizButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  noQuizContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noQuizText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  noQuizSubtext: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  lockMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  lockText: {
    fontSize: 12,
    marginLeft: 5,
  },
});

export default VideoQuizScreen;
