import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute, StackNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TopicContentScreenProps {
  route: {
    params: {
      moduleId: string;
      moduleTitle?: string;
      topicTitle: string;
      topicDescription: string;
    };
  };
}

type TopicContentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TopicContent'>;

const TopicContentScreen: React.FC<TopicContentScreenProps> = ({ route }) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<TopicContentScreenNavigationProp>();
  const { moduleId, topicTitle, topicDescription, isLesson, lessonData, topics, topicVideos, topicQuizzes, isFromLesson } = route.params;
  

  const [videos, setVideos] = useState(topicVideos || []);
  const [quizzes, setQuizzes] = useState(topicQuizzes || []);
  const [loading, setLoading] = useState(!isFromLesson);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [topicCompletionStatus, setTopicCompletionStatus] = useState({});
  const [hasNewContent, setHasNewContent] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Only load if we don't already have the data
    if (!isFromLesson || !topicVideos || !topicQuizzes) {
      loadTopicContent();
    } else {
      // We have the data, just initialize progress
      loadTopicContent();
    }
  }, [moduleId, topicTitle]);

  // Check if topic is completed (all videos watched and quiz completed)
  const checkTopicCompletion = async () => {
    try {
      const topicKey = `topicCompletion_${moduleId}_${topicTitle}`;
      const savedStatus = await AsyncStorage.getItem(topicKey);
      
      if (savedStatus) {
        const status = JSON.parse(savedStatus);
        setTopicCompletionStatus(status);
        
        // Check if there's new content (more videos than when last completed)
        if (status.completedAt && Array.isArray(videos) && videos.length > status.videoCount) {
          setHasNewContent(true);
          // Update the status to show new content
          const updatedStatus = {
            ...status,
            hasNewContent: true,
            newVideoCount: Array.isArray(videos) ? videos.length - status.videoCount : 0
          };
          setTopicCompletionStatus(updatedStatus);
        }
      } else {
        // Check if topic should be marked as completed based on current progress
        const allVideosWatched = videos.every(video => videoProgress[video._id] === true);
        if (allVideosWatched && quizzes.length > 0) {
          // Check if quiz is completed
          const quizKey = `quizCompletion_${moduleId}_${topicTitle}`;
          const quizStatus = await AsyncStorage.getItem(quizKey);
          if (quizStatus) {
            const quizCompleted = JSON.parse(quizStatus).completed;
            if (quizCompleted) {
              await saveTopicCompletion(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking topic completion:', error);
    }
  };

  // Save topic completion status
  const saveTopicCompletion = async (isCompleted: boolean) => {
    try {
      const topicKey = `topicCompletion_${moduleId}_${topicTitle}`;
      const status = {
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null,
        videoCount: Array.isArray(videos) ? videos.length : 0,
        quizCompleted: isCompleted
      };
      
      await AsyncStorage.setItem(topicKey, JSON.stringify(status));
      setTopicCompletionStatus(status);
      
      // If new content was added, mark as new
      if (isCompleted && Array.isArray(videos) && videos.length > status.videoCount) {
        setHasNewContent(true);
      }
    } catch (error) {
      console.error('Error saving topic completion:', error);
    }
  };

  const loadTopicContent = async () => {
    setLoading(true);
    try {
      // If we already have videos and quizzes from lesson (passed via navigation), use them
      if (isFromLesson && topicVideos && topicQuizzes) {
        console.log('=== USING LESSON DATA ===');
        console.log('Videos:', topicVideos.length);
        console.log('Quizzes:', topicQuizzes.length);
        
        setVideos(topicVideos);
        setQuizzes(topicQuizzes);
        
        // Load video progress from AsyncStorage
        const savedProgress = await AsyncStorage.getItem(`videoProgress_${moduleId}`);
        const progress = savedProgress ? JSON.parse(savedProgress) : {};
        
        // Initialize progress for new videos
        topicVideos.forEach((video: any) => {
          if (progress[video._id] === undefined) {
            progress[video._id] = false;
          }
        });
        
        setVideoProgress(progress);
        await AsyncStorage.setItem(`videoProgress_${moduleId}`, JSON.stringify(progress));
        await checkTopicCompletion();
        
        setLoading(false);
        return;
      }
      
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Fetch videos and quizzes for this specific topic
      const [videosResponse, quizzesResponse] = await Promise.all([
        fetch(`http://192.168.1.18:5000/api/video/module/${moduleId}`, { headers }),
        fetch(`http://192.168.1.18:5000/api/quiz/module/${moduleId}`, { headers })
      ]);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        
        // More flexible topic matching
        const topicVideos = videosData.data?.videos?.filter((video: any) => {
          const videoTopic = video.topic?.toLowerCase().trim();
          const searchTopic = topicTitle?.toLowerCase().trim();
          
          // Exact match
          const exactMatch = videoTopic === searchTopic;
          
          // Partial match (contains)
          const partialMatch = videoTopic?.includes(searchTopic) || searchTopic?.includes(videoTopic);
          
          // Word match (any word in common)
          const videoWords = videoTopic?.split(/\s+/) || [];
          const searchWords = searchTopic?.split(/\s+/) || [];
          const wordMatch = videoWords.some(word => searchWords.includes(word)) || 
                           searchWords.some(word => videoWords.includes(word));
          
          const matches = exactMatch || partialMatch || wordMatch;
          return matches;
        }) || [];
        
        const sortedVideos = topicVideos.sort((a: any, b: any) => a.sequenceOrder - b.sequenceOrder);
        setVideos(sortedVideos);
        
        // Load video progress from AsyncStorage
        const savedProgress = await AsyncStorage.getItem(`videoProgress_${moduleId}`);
        const progress = savedProgress ? JSON.parse(savedProgress) : {};
        
        // Initialize progress for new videos
        sortedVideos.forEach((video: any) => {
          if (progress[video._id] === undefined) {
            progress[video._id] = false; // false = not watched, true = watched
          }
        });
        
        setVideoProgress(progress);
        
        // Save updated progress
        await AsyncStorage.setItem(`videoProgress_${moduleId}`, JSON.stringify(progress));
        
        // Check topic completion status after loading videos
        await checkTopicCompletion();
      } else {
        console.error('Failed to fetch videos:', videosResponse.status, videosResponse.statusText);
      }

      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        
        // More flexible topic matching
        const topicQuizzes = quizzesData.data?.quizzes?.filter((quiz: any) => {
          const quizTopic = quiz.topic?.toLowerCase().trim();
          const searchTopic = topicTitle?.toLowerCase().trim();
          
          // Exact match
          const exactMatch = quizTopic === searchTopic;
          
          // Partial match (contains)
          const partialMatch = quizTopic?.includes(searchTopic) || searchTopic?.includes(quizTopic);
          
          // Word match (any word in common)
          const quizWords = quizTopic?.split(/\s+/) || [];
          const searchWords = searchTopic?.split(/\s+/) || [];
          const wordMatch = quizWords.some(word => searchWords.includes(word)) || 
                           searchWords.some(word => quizWords.includes(word));
          
          const matches = exactMatch || partialMatch || wordMatch;
          return matches;
        }) || [];
        
        setQuizzes(topicQuizzes);
      } else {
        console.error('Failed to fetch quizzes:', quizzesResponse.status, quizzesResponse.statusText);
      }
    } catch (error) {
      console.error('Error loading topic content:', error);
    } finally {
      setLoading(false);
    }
  };


  const renderHeader = () => {
    const isCompleted = topicCompletionStatus.isCompleted;
    const showNewBadge = hasNewContent;
    
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{topicTitle}</Text>
          <Text style={styles.headerSubtitle}>{topicDescription}</Text>
          
          {/* Completion Status Button */}
          <View style={styles.completionStatusContainer}>
            {showNewBadge ? (
              <View style={[styles.statusButton, styles.newButton]}>
                <MaterialIcons name="fiber-new" size={16} color="white" />
                <Text style={styles.statusButtonText}>NEW!</Text>
              </View>
            ) : isCompleted ? (
              <View style={[styles.statusButton, styles.completedButton]}>
                <MaterialIcons name="check-circle" size={16} color="white" />
                <Text style={styles.statusButtonText}>Completed</Text>
              </View>
            ) : (
              <View style={[styles.statusButton, styles.inProgressButton]}>
                <MaterialIcons name="play-circle" size={16} color="white" />
                <Text style={styles.statusButtonText}>In Progress</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderSequentialVideoItem = ({ item }: { item: any }) => {
    return renderVideoItem({ item });
  };

  const renderVideoItem = ({ item }: { item: any }) => {
    if (!item) return null;
    
    const isWatched = videoProgress[item._id];
    const associatedQuiz = quizzes.find(quiz => quiz.associatedVideo === item._id);
    const canTakeQuiz = isWatched && associatedQuiz;
    
    return (
      <View style={[styles.sequenceCard, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => {
            try {
              // For now, just play the video in the modal instead of navigating
              setCurrentVideo(item);
              setShowVideoPlayer(true);
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', `Failed to navigate to video screen: ${error.message}`);
            }
          }}
        >
          <View style={styles.contentCardLeft}>
            <View style={[styles.sequenceNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.sequenceNumberText}>{item.sequenceOrder || '?'}</Text>
            </View>
            <View style={[styles.contentIcon, { backgroundColor: isWatched ? '#4CAF50' : theme.colors.primary }]}>
              <MaterialIcons 
                name={isWatched ? "check-circle" : "play-arrow"} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.contentInfo}>
              <Text style={[styles.contentTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.contentMeta, { color: theme.colors.textSecondary }]}>
                {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : 'Video'} • {isWatched ? 'Watched' : 'Click to Start'}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {associatedQuiz && (
          <View style={styles.quizSection}>
            <View style={[styles.quizCard, { 
              backgroundColor: canTakeQuiz ? 'rgba(76, 205, 196, 0.1)' : 'rgba(0,0,0,0.05)',
              opacity: canTakeQuiz ? 1 : 0.5
            }]}>
              <View style={styles.quizInfo}>
                <MaterialIcons 
                  name="quiz" 
                  size={20} 
                  color={canTakeQuiz ? "#4ECDC4" : theme.colors.textSecondary} 
                />
                <Text style={[styles.quizTitle, { 
                  color: canTakeQuiz ? theme.colors.text : theme.colors.textSecondary 
                }]}>
                  {associatedQuiz.title}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.quizButton, { 
                  backgroundColor: canTakeQuiz ? theme.colors.primary : theme.colors.textSecondary 
                }]}
                onPress={() => {
                  if (canTakeQuiz) {
                    navigation.navigate('Quiz' as any, { 
                      quizId: associatedQuiz._id,
                      moduleId: moduleId,
                      quizTitle: associatedQuiz.title
                    });
                  } else {
                    Alert.alert(
                      'Quiz Locked', 
                      'Please watch the video first to unlock this quiz.',
                      [{ text: 'OK' }]
                    );
                  }
                }}
                disabled={!canTakeQuiz}
              >
                <Text style={styles.quizButtonText}>
                  {canTakeQuiz ? 'Take Quiz' : 'Completed (85/100)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };


  const renderQuizItem = ({ item }: { item: any }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity
        style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          // Navigate to quiz screen
          navigation.navigate('Quiz' as any, { 
            quizId: item._id,
            moduleId: moduleId,
            quizTitle: item.title
          });
        }}
      >
      <View style={styles.contentCardLeft}>
        <View style={[styles.contentIcon, { backgroundColor: '#4ECDC4' }]}>
          <MaterialIcons name="quiz" size={24} color="white" />
        </View>
        <View style={styles.contentInfo}>
          <Text style={[styles.contentTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.contentMeta, { color: theme.colors.textSecondary }]}>
            {item?.questions?.length || 0} questions • {item?.timeLimit || 10} min
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading content...
            </Text>
          </View>
        ) : (
          <>
            {/* Videos Section */}
            {Array.isArray(videos) && videos.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  📹 Videos ({videos.length})
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  Watch these videos to learn the content
                </Text>
                <FlatList
                  data={videos}
                  renderItem={renderSequentialVideoItem}
                  keyExtractor={(item) => item._id || item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            {/* Quizzes Section */}
            {Array.isArray(quizzes) && quizzes.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  📝 Quizzes ({quizzes.length})
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  Test your knowledge with these quizzes
                </Text>
                <FlatList
                  data={quizzes}
                  renderItem={renderQuizItem}
                  keyExtractor={(item) => item._id || item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            {/* Empty State */}
            {(!Array.isArray(videos) || videos.length === 0) && (!Array.isArray(quizzes) || quizzes.length === 0) && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="school" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No Content Available
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  No videos or quizzes have been added for this topic yet.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={showVideoPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowVideoPlayer(false)}
      >
        <View style={styles.videoPlayerContainer}>
          <View style={styles.videoPlayerHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVideoPlayer(false)}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.videoPlayerTitle}>
              {currentVideo?.title || 'Video Player'}
            </Text>
          </View>
          
          {currentVideo && (
            <View style={styles.videoPlayer}>
              {(() => {
                // Check if video URL is a valid HTTP URL
                const videoUrl = currentVideo.videoUrl;
                
                const isValidHttpUrl = videoUrl && (
                  videoUrl.startsWith('http://') || 
                  videoUrl.startsWith('https://')
                );
                
                const isLocalFile = videoUrl && videoUrl.startsWith('file://');
                
                if (isValidHttpUrl) {
                  // Valid HTTP/HTTPS URL - play the video
                  return (
                    <Video
                      ref={videoRef}
                      style={styles.videoPlayer}
                      source={{ uri: videoUrl }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      onError={(error) => {
                        console.error('Video playback error:', error);
                        Alert.alert('Video Error', 'Failed to load video. Please check the video URL.');
                      }}
                      onLoad={(status) => {
                        console.log('Video loaded:', status);
                      }}
                      onPlaybackStatusUpdate={async (status) => {
                        if (status.isLoaded && status.didJustFinish) {
                          // Mark video as watched when it finishes
                          const newProgress = {
                            ...videoProgress,
                            [currentVideo._id]: true
                          };
                          setVideoProgress(newProgress);
                          
                          // Save to AsyncStorage
                          await AsyncStorage.setItem(`videoProgress_${moduleId}`, JSON.stringify(newProgress));
                          
                          // Check if all videos are watched
                          const allVideosWatched = videos.every(video => newProgress[video._id] === true);
                          if (allVideosWatched && quizzes.length > 0) {
                            // Check if quiz is also completed
                            const quizKey = `quizCompletion_${moduleId}_${topicTitle}`;
                            const quizStatus = await AsyncStorage.getItem(quizKey);
                            if (quizStatus) {
                              const quizCompleted = JSON.parse(quizStatus).completed;
                              if (quizCompleted) {
                                // Mark topic as completed
                                await saveTopicCompletion(true);
                              }
                            }
                          }
                        }
                      }}
                    />
                  );
                } else if (isLocalFile) {
                  // Local file URL - try to stream through backend
                  const streamUrl = `http://192.168.1.18:5000/api/video/stream/${currentVideo._id}`;
                  
                  return (
                    <Video
                      ref={videoRef}
                      style={styles.videoPlayer}
                      source={{ uri: streamUrl }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      onError={(error) => {
                        Alert.alert('Video Error', 'Failed to load video. The video file may not be available on the server.');
                      }}
                      onLoad={(status) => {
                        // Video loaded successfully
                      }}
                      onPlaybackStatusUpdate={async (status) => {
                        if (status.isLoaded && status.didJustFinish) {
                          // Mark video as watched when it finishes
                          const newProgress = {
                            ...videoProgress,
                            [currentVideo._id]: true
                          };
                          setVideoProgress(newProgress);
                          
                          // Save to AsyncStorage
                          await AsyncStorage.setItem(`videoProgress_${moduleId}`, JSON.stringify(newProgress));
                          
                          // Check if all videos are watched
                          const allVideosWatched = videos.every(video => newProgress[video._id] === true);
                          if (allVideosWatched && quizzes.length > 0) {
                            // Check if quiz is also completed
                            const quizKey = `quizCompletion_${moduleId}_${topicTitle}`;
                            const quizStatus = await AsyncStorage.getItem(quizKey);
                            if (quizStatus) {
                              const quizCompleted = JSON.parse(quizStatus).completed;
                              if (quizCompleted) {
                                // Mark topic as completed
                                await saveTopicCompletion(true);
                              }
                            }
                          }
                        }
                      }}
                    />
                  );
                } else {
                  // Invalid or no URL - show message
                  return (
                    <View style={styles.noVideoContainer}>
                      <MaterialIcons name="play-circle-outline" size={80} color="#4CAF50" />
                      <Text style={styles.noVideoText}>📹 Video Content</Text>
                      <Text style={styles.videoTitleText}>
                        {currentVideo.title}
                      </Text>
                      <Text style={styles.noVideoSubtext}>
                        Duration: {currentVideo.duration ? `${Math.floor(currentVideo.duration / 60)}:${(currentVideo.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                      </Text>
                      <Text style={styles.noVideoSubtext}>
                        📱 This video is available in the mobile app version.
                      </Text>
                      <Text style={styles.noVideoSubtext}>
                        You can mark it as watched to continue your progress.
                      </Text>
                      <TouchableOpacity
                        style={styles.markWatchedButton}
                        onPress={async () => {
                          // Mark video as watched manually
                          const newProgress = {
                            ...videoProgress,
                            [currentVideo._id]: true
                          };
                          setVideoProgress(newProgress);
                          await AsyncStorage.setItem(`videoProgress_${moduleId}`, JSON.stringify(newProgress));
                          setShowVideoPlayer(false);
                          Alert.alert('Success', 'Video marked as watched!');
                        }}
                      >
                        <MaterialIcons name="check-circle" size={20} color="white" />
                        <Text style={styles.markWatchedButtonText}> Mark as Watched</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }
              })()}
            </View>
          )}
          
          <View style={styles.videoPlayerInfo}>
            <Text style={styles.videoInfoText}>
              Topic: {currentVideo?.topic || 'Unknown'}
            </Text>
            <Text style={styles.videoInfoText}>
              Duration: {currentVideo?.duration ? `${Math.floor(currentVideo.duration / 60)}:${(currentVideo.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
            </Text>
            {currentVideo?.tags && currentVideo.tags.length > 0 && (
              <Text style={styles.videoInfoText}>
                Tags: {currentVideo.tags.join(', ')}
              </Text>
            )}
          </View>
        </View>
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
  completionStatusContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  newButton: {
    backgroundColor: '#FF5722',
  },
  inProgressButton: {
    backgroundColor: '#2196F3',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 14,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    marginRight: 15,
  },
  videoPlayerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayerInfo: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  videoInfoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noVideoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  noVideoSubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  sequenceCard: {
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sequenceNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sequenceNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quizSection: {
    marginTop: 10,
    paddingLeft: 40,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
  quizButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quizButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  markWatchedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  markWatchedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  videoTitleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  noVideoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  noVideoSubtext: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  sampleVideoContainer: {
    marginVertical: 20,
    width: '100%',
    maxWidth: 300,
  },
  sampleVideoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  sampleVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
  },
});

export default TopicContentScreen;
