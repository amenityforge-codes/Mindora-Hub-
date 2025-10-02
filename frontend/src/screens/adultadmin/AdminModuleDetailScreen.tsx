import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface AdminModuleDetailScreenProps {
  route: {
    params: {
      moduleId: string;
      moduleTitle: string;
      moduleType: string;
    };
  };
}

const AdminModuleDetailScreen: React.FC<AdminModuleDetailScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { moduleId, moduleTitle, moduleType } = route.params;

  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [uploadedVideos, setUploadedVideos] = useState<{[key: string]: any[]}>({});
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});
  const videoRef = useRef(null);

  useEffect(() => {
    loadTopics();
    loadUploadedVideos();
  }, [moduleId]);

  // Get topic categories (same as ModuleDetailScreen)
  const getTopicCategories = () => {
    const specificLessons = {
      'Alphabet & Phonics': [
        {
          title: 'Letter Learning',
          icon: 'text-fields',
          topics: [
            {
              title: 'ABC Song Fun',
              description: 'Learn A–Z sounds with fun animations and examples.',
              icon: 'volume-up',
              type: 'Audio',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Letter Hunt Game',
              description: 'Practice recognizing letters A through Z.',
              icon: 'visibility',
              type: 'Visual',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Magic Writing',
              description: 'Practice writing letters with guided tracing exercises.',
              icon: 'edit',
              type: 'Writing',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Sound Games',
          icon: 'games',
          topics: [
            {
              title: 'Sound Detective',
              description: 'Match letters with their sounds in interactive games.',
              icon: 'hearing',
              type: 'Game',
              duration: 15,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Word Building Magic',
              description: 'Learn to blend sounds to make simple words.',
              icon: 'spellcheck',
              type: 'Interactive',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Phonics Adventure',
              description: 'Play fun phonics games to practice sounds.',
              icon: 'explore',
              type: 'Game',
              duration: 18,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      'Basic Vocabulary': [
        {
          title: 'Word Discovery',
          icon: 'category',
          topics: [
            {
              title: 'Around Me Words',
              description: 'Words for objects, animals, people, and daily life.',
              icon: 'home',
              type: 'Vocabulary',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Picture Cards',
              description: 'Learn vocabulary using flashcards with pictures.',
              icon: 'image',
              type: 'Visual',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Match & Learn',
              description: 'Match pictures with their correct words.',
              icon: 'compare',
              type: 'Game',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Daily Words',
          icon: 'home',
          topics: [
            {
              title: 'Family & Friends',
              description: 'Learn words for family members and relationships.',
              icon: 'people',
              type: 'Vocabulary',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'My Home',
              description: 'Vocabulary for rooms, furniture, and household items.',
              icon: 'home',
              type: 'Vocabulary',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'School Time',
              description: 'Words related to school, classroom, and learning.',
              icon: 'school',
              type: 'Vocabulary',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ]
      // Add more modules as needed
    };

    return (specificLessons as any)[moduleTitle] || [
      {
        title: 'General Topics',
        icon: 'school',
        topics: [
          {
            title: 'Introduction',
            description: 'Basic introduction to the topic.',
            icon: 'info',
            type: 'Lesson',
            duration: 10,
            difficulty: 'Easy',
            isCompleted: false
          },
          {
            title: 'Practice',
            description: 'Practice exercises and activities.',
            icon: 'fitness-center',
            type: 'Exercise',
            duration: 15,
            difficulty: 'Medium',
            isCompleted: false
          },
          {
            title: 'Assessment',
            description: 'Test your knowledge with quizzes.',
            icon: 'quiz',
            type: 'Quiz',
            duration: 20,
            difficulty: 'Hard',
            isCompleted: false
          }
        ]
      }
    ];
  };

  const loadTopics = async () => {
    setLoading(true);
    try {
      // For now, we'll use the hardcoded topics
      // Later this can be fetched from the backend
      const topicCategories = getTopicCategories();
      setTopics(topicCategories);
    } catch (error) {
      console.error('Error loading topics:', error);
      Alert.alert('Error', 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const loadUploadedVideos = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`http://192.168.1.18:5000/api/video/module/${moduleId}`, { 
        headers,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const videos = data.data?.videos || [];
        
        // Group videos by topic
        const videosByTopic: {[key: string]: any[]} = {};
        videos.forEach((video: any) => {
          if (video.topic) {
            if (!videosByTopic[video.topic]) {
              videosByTopic[video.topic] = [];
            }
            videosByTopic[video.topic].push(video);
          }
        });
        
        setUploadedVideos(videosByTopic);
        console.log('Loaded videos by topic:', videosByTopic);
        console.log('Sample video data:', Array.isArray(videos) && videos.length > 0 ? videos[0] : 'No videos found');
      } else {
        console.error('Failed to fetch videos:', response.status);
        Alert.alert(
          'Network Error', 
          `Failed to load videos. Server returned status ${response.status}. Please check your connection and try again.`
        );
      }
    } catch (error: any) {
      console.error('Error loading uploaded videos:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert(
          'Request Timeout', 
          'The request took too long to complete. Please check your internet connection and try again.'
        );
      } else if (error.message?.includes('Network request failed')) {
        Alert.alert(
          'Network Error', 
          'Unable to connect to the server. Please check your internet connection and ensure the server is running.'
        );
      } else {
        Alert.alert(
          'Error', 
          `Failed to load videos: ${error.message || 'Unknown error'}. Please try again.`
        );
      }
    }
  };

  const handleSelectThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedThumbnail(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting thumbnail:', error);
      Alert.alert('Error', 'Failed to select thumbnail');
    }
  };

  const handleSelectVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  const uploadVideo = async () => {
    if (!selectedTopic) {
      Alert.alert('Error', 'Please select a topic for this video');
      return;
    }

    if (!videoTitle.trim()) {
      Alert.alert('Error', 'Please enter a video title');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video file');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();

      console.log('=== UPLOADING VIDEO ===');
      console.log('Video Title:', videoTitle);
      console.log('Module ID:', moduleId);
      console.log('Selected Topic:', selectedTopic);
      console.log('Topic Title:', selectedTopic.title);
      console.log('Topic Description:', selectedTopic.description);
      
      formData.append('title', videoTitle);
      formData.append('moduleId', moduleId);
      formData.append('level', '1');
      formData.append('tags', videoTags);
      formData.append('topic', selectedTopic.title);
      formData.append('topicDescription', selectedTopic.description);

      if (selectedVideo) {
        formData.append('video', {
          uri: selectedVideo.uri,
          type: selectedVideo.mimeType || 'video/mp4',
          name: selectedVideo.name || 'video.mp4',
        } as any);
      }

      if (selectedThumbnail) {
        formData.append('thumbnail', {
          uri: selectedThumbnail.uri,
          type: 'image/jpeg',
          name: 'thumbnail.jpg',
        } as any);
      }

      // Add timeout for video upload
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for uploads

      const response = await fetch('http://192.168.1.18:5000/api/video/upload', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Reset form
        setVideoTitle('');
        setVideoTags('');
        setSelectedThumbnail(null);
        setSelectedVideo(null);
        setSelectedTopic(null);
        setShowVideoForm(false);
        
        // Reload videos to show the new upload
        await loadUploadedVideos();
        
        Alert.alert('Success', 'Video uploaded successfully!');
      } else {
        const errorData = await response.json();
        Alert.alert('Upload Error', errorData.message || `Failed to upload video. Server returned status ${response.status}.`);
      }
    } catch (error: any) {
      console.error('Video upload error:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert(
          'Upload Timeout', 
          'The video upload took too long to complete. Please check your internet connection and try again with a smaller file.'
        );
      } else if (error.message?.includes('Network request failed')) {
        Alert.alert(
          'Network Error', 
          'Unable to connect to the server. Please check your internet connection and ensure the server is running.'
        );
      } else {
        Alert.alert('Upload Error', `Failed to upload video: ${error.message || 'Unknown error'}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTopicItem = ({ item }: { item: any }) => {
    const topicVideos = uploadedVideos[item.title] || [];
    const isExpanded = expandedTopics[item.title];
    
    return (
      <View style={[styles.topicCard, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.topicHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity 
            style={styles.topicHeaderContent}
            onPress={() => {
              setExpandedTopics(prev => ({
                ...prev,
                [item.title]: !prev[item.title]
              }));
            }}
          >
            <View style={styles.topicIconContainer}>
              <MaterialIcons name={item.icon} size={24} color="white" />
            </View>
            <View style={styles.topicInfo}>
              <Text style={styles.topicTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.topicType}>{item.type}</Text>
            </View>
            <View style={styles.topicActions}>
              <View style={styles.videoCount}>
                <MaterialIcons name="video-library" size={16} color="white" />
                <Text style={styles.videoCountText}>{Array.isArray(topicVideos) ? topicVideos.length : 0}</Text>
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedTopic(item);
                  setShowVideoForm(true);
                }}
              >
                <MaterialIcons name="video-call" size={20} color="white" />
              </TouchableOpacity>
              <MaterialIcons 
                name={isExpanded ? "expand-less" : "expand-more"} 
                size={24} 
                color="white" 
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {isExpanded && (
          <View style={styles.topicBody}>
            <Text style={[styles.topicDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            
            <View style={styles.topicMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.duration} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="trending-up" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.difficulty}
                </Text>
              </View>
            </View>

            {/* Show uploaded videos */}
            {Array.isArray(topicVideos) && topicVideos.length > 0 ? (
              <View style={styles.uploadedVideosSection}>
                <Text style={[styles.uploadedVideosTitle, { color: theme.colors.text }]}>
                  Videos ({Array.isArray(topicVideos) ? topicVideos.length : 0})
                </Text>
                {topicVideos.map((video: any, index: number) => (
                  <View key={video._id || index} style={[styles.videoItem, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.videoInfo}>
                      <MaterialIcons name="play-circle-filled" size={20} color={theme.colors.primary} />
                      <View style={styles.videoDetails}>
                        <Text style={[styles.videoTitle, { color: theme.colors.text }]} numberOfLines={1}>
                          {video.title}
                        </Text>
                        <Text style={[styles.videoMeta, { color: theme.colors.textSecondary }]}>
                          {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Video'} • {video.tags?.join(', ') || 'No tags'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        console.log('Video data:', video);
                        console.log('Video URL:', video.videoUrl);
                        console.log('Thumbnail URL:', video.thumbnail);
                        setCurrentVideo(video);
                        setShowVideoPlayer(true);
                      }}
                    >
                      <MaterialIcons name="play-arrow" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noVideosSection}>
                <MaterialIcons name="video-library" size={32} color={theme.colors.textSecondary} />
                <Text style={[styles.noVideosText, { color: theme.colors.textSecondary }]}>
                  No videos uploaded yet
                </Text>
                <Text style={[styles.noVideosSubtext, { color: theme.colors.textSecondary }]}>
                  Click the video icon above or "Add Video" button to upload videos
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderVideoForm = () => (
    <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>Add Video to: {selectedTopic?.title}</Text>
      
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Video Title"
        placeholderTextColor={theme.colors.textSecondary}
        value={videoTitle}
        onChangeText={setVideoTitle}
      />
      
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Tags (comma separated)"
        placeholderTextColor={theme.colors.textSecondary}
        value={videoTags}
        onChangeText={setVideoTags}
      />
      
      <TouchableOpacity
        style={[styles.fileButton, { borderColor: theme.colors.border }]}
        onPress={handleSelectThumbnail}
      >
        <MaterialIcons name="image" size={24} color={theme.colors.primary} />
        <Text style={[styles.fileButtonText, { color: theme.colors.text }]}>
          {selectedThumbnail ? 'Thumbnail Selected' : 'Select Thumbnail'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fileButton, { borderColor: theme.colors.border }]}
        onPress={handleSelectVideo}
      >
        <MaterialIcons name="video-library" size={24} color={theme.colors.primary} />
        <Text style={[styles.fileButtonText, { color: theme.colors.text }]}>
          {selectedVideo ? 'Video Selected' : 'Select Video'}
        </Text>
      </TouchableOpacity>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
          onPress={() => {
            setShowVideoForm(false);
            setSelectedTopic(null);
            setVideoTitle('');
            setVideoTags('');
            setSelectedThumbnail(null);
            setSelectedVideo(null);
          }}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
          onPress={uploadVideo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Upload Video</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategorySection = ({ item }: { item: any }) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <MaterialIcons name={item.icon} size={24} color={theme.colors.primary} />
        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{item.title}</Text>
      </View>
      
      <FlatList
        data={item.topics}
        renderItem={renderTopicItem}
        keyExtractor={(topic) => topic.title}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  if (loading && (!Array.isArray(topics) || topics.length === 0)) {
    return (
      <LinearGradient
        colors={theme.gradients.header}
        style={styles.fullScreen}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.header}
      style={styles.fullScreen}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{moduleTitle}</Text>
        <Text style={styles.headerSubtitle}>Add videos to topics</Text>
        
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <MaterialIcons name="info" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.instructionsText}>
            Click "Add Video" above or the video icon on each topic to upload videos
          </Text>
        </View>
        
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
            onPress={() => {
              if (!Array.isArray(topics) || topics.length === 0) {
                Alert.alert('No Topics', 'No topics available. Please check your module setup.');
                return;
              }
              
              Alert.alert(
                'Add Video to Topic',
                'Select a topic to add a video:',
                topics.map((category: any) => 
                  category.topics?.map((topic: any) => ({
                    text: `${category.title} - ${topic.title}`,
                    onPress: () => {
                      setSelectedTopic(topic);
                      setShowVideoForm(true);
                    }
                  }))
                ).flat().concat([{ text: 'Cancel', style: 'cancel' }])
              );
            }}
          >
            <MaterialIcons name="video-call" size={20} color="#333" />
            <Text style={[styles.quickActionButtonText, { color: '#333' }]}>Add Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => {
              const firstTopic = Array.isArray(topics) && topics.length > 0 && Array.isArray(topics[0].topics) && topics[0].topics.length > 0 ? topics[0].topics[0] : null;
              if (firstTopic) {
                (navigation as any).navigate('VideoQuizSequence', {
                  moduleId,
                  moduleTitle,
                  topicTitle: firstTopic.title
                });
              } else {
                Alert.alert('No Topics', 'Please add topics first before managing sequences');
              }
            }}
          >
            <MaterialIcons name="quiz" size={20} color="white" />
            <Text style={styles.quickActionButtonText}>Manage Quizzes</Text>
          </TouchableOpacity>
        </View>

        {showVideoForm ? (
          renderVideoForm()
        ) : (
          <FlatList
            data={topics}
            renderItem={renderCategorySection}
            keyExtractor={(item) => item.title}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={showVideoPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.videoPlayerContainer}>
          <View style={styles.videoPlayerHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowVideoPlayer(false);
                setCurrentVideo(null);
              }}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.videoPlayerTitle}>
              {currentVideo?.title || 'Video Player'}
            </Text>
          </View>
          
          {currentVideo && (
            <View style={styles.videoPlayer}>
              {currentVideo.videoUrl || currentVideo.thumbnail ? (
                <Video
                  ref={videoRef}
                  style={styles.videoPlayer}
                  source={{ 
                    uri: currentVideo.videoUrl 
                      ? (currentVideo.videoUrl.startsWith('http') 
                          ? currentVideo.videoUrl 
                          : `http://192.168.1.18:5000${currentVideo.videoUrl}`)
                      : (currentVideo.thumbnail?.startsWith('http') 
                          ? currentVideo.thumbnail 
                          : `http://192.168.1.18:5000${currentVideo.thumbnail}`)
                  }}
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
                />
              ) : (
                <View style={styles.noVideoContainer}>
                  <MaterialIcons name="error" size={64} color="white" />
                  <Text style={styles.noVideoText}>No video URL available</Text>
                  <Text style={styles.noVideoSubtext}>
                    Video URL: {currentVideo.videoUrl || 'Not set'}
                  </Text>
                  <Text style={styles.noVideoSubtext}>
                    Thumbnail URL: {currentVideo.thumbnail || 'Not set'}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.videoPlayerInfo}>
            <Text style={styles.videoInfoText}>
              Topic: {currentVideo?.topic || 'Unknown'}
            </Text>
            <Text style={styles.videoInfoText}>
              Uploaded: {currentVideo?.uploadDate ? new Date(currentVideo.uploadDate).toLocaleDateString() : 'Unknown'}
            </Text>
            {currentVideo?.tags && currentVideo.tags.length > 0 && (
              <Text style={styles.videoInfoText}>
                Tags: {Array.isArray(currentVideo.tags) ? currentVideo.tags.join(', ') : currentVideo.tags}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  topicCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topicHeader: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  topicHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  topicType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicBody: {
    padding: 15,
  },
  topicDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  topicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 5,
  },
  formContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  fileButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  uploadButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadedVideosSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  uploadedVideosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
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
    width: Dimensions.get('window').width,
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
  sequenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sequenceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  quickActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  topicActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  videoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  videoDetails: {
    flex: 1,
    marginLeft: 10,
  },
  videoMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  noVideosSection: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  noVideosText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  noVideosSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AdminModuleDetailScreen;
