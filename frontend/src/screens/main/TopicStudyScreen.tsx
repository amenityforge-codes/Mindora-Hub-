import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Chip, Button, RadioButton } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface TopicStudyScreenProps {
  navigation: any;
  route: {
    params: {
      topicId: string;
      topicTitle: string;
      moduleId: string;
    };
  };
}

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  isLocalFile: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'basic' | 'scenario';
  scenario?: string;
  maxAttempts: number;
}

interface Note {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

interface Link {
  _id: string;
  title: string;
  url: string;
  description: string;
  type: 'resource' | 'reference' | 'external';
}

const TopicStudyScreen: React.FC<TopicStudyScreenProps> = ({ navigation, route }) => {
  const { topicId, topicTitle, moduleId } = route.params;
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  
  // Video playback state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Quiz state
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // PDF viewer state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<Note | null>(null);

  useEffect(() => {
    loadTopicContent();
  }, []);

  const loadTopicContent = async () => {
    try {
      setLoading(true);
      console.log('=== TOPIC STUDY: Loading content for topic ===', topicId);
      
      // Load videos, questions, notes, and links for this topic
      const [videosRes, questionsRes, notesRes, linksRes] = await Promise.all([
        fetch(`http://192.168.1.18:5000/api/modules/${moduleId}/topics/${topicId}/videos`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`http://192.168.1.18:5000/api/modules/${moduleId}/topics/${topicId}/questions`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`http://192.168.1.18:5000/api/modules/${moduleId}/topics/${topicId}/notes`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`http://192.168.1.18:5000/api/modules/${moduleId}/topics/${topicId}/links`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        console.log('=== TOPIC STUDY: Videos Data ===', videosData);
        setVideos(videosData);
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        console.log('=== TOPIC STUDY: Questions Data ===', questionsData);
        setQuestions(questionsData);
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        console.log('=== TOPIC STUDY: Notes Data ===', notesData);
        setNotes(notesData);
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        console.log('=== TOPIC STUDY: Links Data ===', linksData);
        setLinks(linksData);
      }
    } catch (error) {
      console.error('Error loading topic content:', error);
    } finally {
      setLoading(false);
      console.log('=== TOPIC STUDY: Final state ===', { videos: videos.length, questions: questions.length, notes: notes.length, links: links.length });
    }
  };

  const handleVideoPress = (video: Video) => {
    console.log('Video pressed:', video.title);
    console.log('Video URL:', video.videoUrl);
    
    // Check if it's a placeholder URL
    if (video.videoUrl.includes('example.com')) {
      Alert.alert(
        'Video Not Available', 
        'This video is not yet uploaded. Please contact your administrator.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // For testing purposes, let's try to use a real video file
    const testVideo = {
      ...video,
      videoUrl: video.videoUrl.startsWith('/uploads/') 
        ? `http://192.168.1.18:5000${video.videoUrl}`
        : video.videoUrl
    };
    
    setSelectedVideo(testVideo);
    setShowVideoModal(true);
  };

  const handleQuestionPress = (question: Question) => {
    console.log('Question pressed:', question.question);
    setSelectedQuestion(question);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setShowQuizModal(true);
  };

  const handleNotePress = async (note: Note) => {
    console.log('Note pressed:', note.title);
    console.log('Note fileUrl:', note.fileUrl);
    
    try {
      // Check if it's a placeholder URL or actual file
      if (note.fileUrl.includes('example.com')) {
        Alert.alert(
          'Document Not Available', 
          'This document is not yet uploaded. Please contact your administrator.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Construct the full URL for local files
      let fullUrl = note.fileUrl;
      if (note.fileUrl.startsWith('/uploads/')) {
        // For local files, construct the full URL
        fullUrl = `http://192.168.1.18:5000${note.fileUrl}`;
      }
      
      console.log('Opening PDF in-app:', fullUrl);
      
      // Open PDF in in-app viewer
      setSelectedPdf(note);
      setShowPdfModal(true);
      
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Could not open document. Please try again.');
    }
  };

  const handleLinkPress = async (link: Link) => {
    console.log('Link pressed:', link.title);
    try {
      const supported = await Linking.canOpenURL(link.url);
      if (supported) {
        await Linking.openURL(link.url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open link');
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer');
      return;
    }
    
    const isCorrect = selectedAnswer === selectedQuestion?.correctAnswer;
    setShowQuizResult(true);
    setQuizScore(isCorrect ? 1 : 0);
  };

  const handleQuizNext = () => {
    setShowQuizModal(false);
    setSelectedQuestion(null);
    setSelectedAnswer(null);
    setShowQuizResult(false);
  };

  const renderVideos = () => {
    if (videos.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="play-circle-filled" size={24} color="#ef4444" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Videos ({videos.length})
          </Text>
        </View>
        {videos.map((video, index) => (
          <Card key={video._id || index} style={[styles.videoCardContainer, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderWidth: 1
          }]}>
            <TouchableOpacity onPress={() => handleVideoPress(video)} style={styles.videoTouchable}>
              <View style={[styles.videoThumbnail, { backgroundColor: theme.colors.background }]}>
                <MaterialIcons 
                  name="play-circle-filled" 
                  size={50} 
                  color={video.videoUrl.includes('example.com') ? '#ef4444' : theme.colors.primary} 
                />
                <View style={[styles.videoOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                  <MaterialIcons name="play-arrow" size={24} color="white" />
                </View>
              </View>
              <View style={styles.videoContent}>
                <Text style={[styles.videoTitle, { color: theme.colors.text }]}>
                  {video.title}
                </Text>
                <Text style={[styles.videoDescription, { color: theme.colors.textSecondary }]}>
                  {video.description}
                </Text>
                <View style={styles.videoMeta}>
                  <View style={styles.videoMetaItem}>
                    <MaterialIcons name="timer" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.videoMetaText, { color: theme.colors.textSecondary }]}>
                      {video.duration || 'Unknown'} min
                    </Text>
                  </View>
                  <View style={styles.videoMetaItem}>
                    <MaterialIcons 
                      name={video.videoUrl.includes('example.com') ? 'warning' : 'check-circle'} 
                      size={16} 
                      color={video.videoUrl.includes('example.com') ? '#ef4444' : theme.colors.primary} 
                    />
                    <Text style={[
                      styles.videoMetaText, 
                      { 
                        color: video.videoUrl.includes('example.com') ? '#ef4444' : theme.colors.primary 
                      }
                    ]}>
                      {video.videoUrl.includes('example.com') ? 'Not Available' : 'Available'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
        
        {/* Test Video Section */}
        {videos.length === 0 && (
          <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => {
              const testVideo = {
                _id: 'test-video',
                title: 'Test Video (Sample)',
                description: 'This is a sample video for testing',
                videoUrl: 'http://192.168.1.18:5000/uploads/modules/module-video-1.mp4',
                duration: 30,
                isLocalFile: true
              };
              setSelectedVideo(testVideo);
              setShowVideoModal(true);
            }}>
              <View style={styles.videoCard}>
                <MaterialIcons name="play-circle-filled" size={40} color="#4CAF50" />
                <View style={styles.videoInfo}>
                  <Text style={[styles.videoTitle, { color: theme.colors.text }]}>
                    Test Video (Sample)
                  </Text>
                  <Text style={[styles.videoDescription, { color: theme.colors.textSecondary }]}>
                    Click to test video playback functionality
                  </Text>
                  <View style={styles.videoMeta}>
                    <Chip mode="outlined" compact style={{ backgroundColor: '#e8f5e8' }}>
                      <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                      <Text style={{ marginLeft: 4, fontSize: 12, color: '#4CAF50' }}>
                        Available
                      </Text>
                    </Chip>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        )}
      </View>
    );
  };

  const renderQuestions = () => {
    if (questions.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="quiz" size={24} color="#8b5cf6" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Practice Questions ({questions.length})
          </Text>
        </View>
        {questions.map((question, index) => (
          <Card key={question._id || index} style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => handleQuestionPress(question)}>
              <View style={styles.questionCard}>
                <MaterialIcons name="quiz" size={40} color="#8b5cf6" />
                <View style={styles.questionInfo}>
                  <Text style={[styles.questionTitle, { color: theme.colors.text }]}>
                    {question.question}
                  </Text>
                  <View style={styles.questionMeta}>
                    <Chip mode="outlined" compact>
                      <Text style={{ fontSize: 12 }}>
                        {question.type === 'basic' ? 'Basic' : 'Scenario'}
                      </Text>
                    </Chip>
                    <Chip mode="outlined" compact>
                      <Text style={{ fontSize: 12 }}>
                        {question.options.length} options
                      </Text>
                    </Chip>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    );
  };

  const renderNotes = () => {
    if (notes.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="description" size={24} color="#10b981" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Study Notes ({notes.length})
          </Text>
        </View>
        {notes.map((note, index) => (
          <Card key={note._id || index} style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => handleNotePress(note)}>
              <View style={styles.noteCard}>
                <MaterialIcons name="description" size={40} color="#10b981" />
                <View style={styles.noteInfo}>
                  <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
                    {note.title}
                  </Text>
                  <View style={styles.noteMeta}>
                    <Chip mode="outlined" compact>
                      <Text style={{ fontSize: 12 }}>
                        {note.fileType.toUpperCase()}
                      </Text>
                    </Chip>
                    <Text style={[styles.noteUrl, { color: theme.colors.textSecondary }]}>
                      {note.fileUrl}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    );
  };

  const renderLinks = () => {
    if (links.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="link" size={24} color="#f59e0b" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Additional Resources ({links.length})
          </Text>
        </View>
        {links.map((link, index) => (
          <Card key={link._id || index} style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => handleLinkPress(link)}>
              <View style={styles.linkCard}>
                <MaterialIcons name="link" size={40} color="#f59e0b" />
                <View style={styles.linkInfo}>
                  <Text style={[styles.linkTitle, { color: theme.colors.text }]}>
                    {link.title}
                  </Text>
                  <Text style={[styles.linkDescription, { color: theme.colors.textSecondary }]}>
                    {link.description}
                  </Text>
                  <View style={styles.linkMeta}>
                    <Chip mode="outlined" compact>
                      <Text style={{ fontSize: 12 }}>
                        {link.type}
                      </Text>
                    </Chip>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading study materials...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {topicTitle}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <MaterialIcons 
            name={isDarkMode ? "light-mode" : "dark-mode"} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            📚 Study Materials
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.colors.textSecondary }]}>
            Everything you need to learn about {topicTitle}
          </Text>
        </View>

        {renderVideos()}
        {renderQuestions()}
        {renderNotes()}
        {renderLinks()}

        {videos.length === 0 && questions.length === 0 && notes.length === 0 && links.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="info" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No study materials available yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Check back later for videos, quizzes, notes, and resources
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowVideoModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedVideo?.title}
            </Text>
          </View>
          
          {selectedVideo && (
            <View style={styles.videoContainer}>
              <Video
                style={styles.videoPlayer}
                source={{ 
                  uri: selectedVideo.videoUrl.startsWith('/uploads/') 
                    ? `http://192.168.1.18:5000${selectedVideo.videoUrl}`
                    : selectedVideo.videoUrl 
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                isLooping={false}
                isMuted={false}
                onError={(error) => {
                  console.log('Video error:', error);
                  Alert.alert('Video Error', `Could not load video: ${error.message || 'Unknown error'}`);
                }}
                onLoadStart={() => console.log('Video loading started')}
                onLoad={() => console.log('Video loaded successfully')}
              />
              <View style={styles.videoInfoContainer}>
                <Text style={[styles.videoDescription, { color: theme.colors.text }]}>
                  {selectedVideo.description}
                </Text>
                <Text style={[styles.videoUrl, { color: theme.colors.textSecondary }]}>
                  URL: {selectedVideo.videoUrl}
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPdfModal}
        animationType="slide"
        onRequestClose={() => setShowPdfModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPdfModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedPdf?.title || 'Document'}
            </Text>
          </View>
          
          {selectedPdf && (
            <View style={styles.pdfContainer}>
              <View style={[styles.pdfInfoContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.pdfHeader}>
                  <MaterialIcons name="picture-as-pdf" size={32} color="#ef4444" />
                  <Text style={[styles.pdfTitle, { color: theme.colors.text }]}>
                    {selectedPdf.title || 'Document'}
                  </Text>
                </View>
                
                <View style={styles.pdfMeta}>
                  <View style={styles.pdfMetaItem}>
                    <MaterialIcons name="description" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.pdfMetaText, { color: theme.colors.textSecondary }]}>
                      {selectedPdf.fileType || 'PDF'}
                    </Text>
                  </View>
                  <View style={styles.pdfMetaItem}>
                    <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.pdfMetaText, { color: theme.colors.textSecondary }]}>
                      {new Date(selectedPdf.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.pdfActions}>
                  <Button
                    mode="contained"
                    onPress={async () => {
                      try {
                        const fullUrl = selectedPdf.fileUrl.startsWith('/uploads/') 
                          ? `http://192.168.1.18:5000${selectedPdf.fileUrl}`
                          : selectedPdf.fileUrl;
                        
                        const supported = await Linking.canOpenURL(fullUrl);
                        if (supported) {
                          await Linking.openURL(fullUrl);
                        } else {
                          Alert.alert('Error', 'Cannot open this document');
                        }
                      } catch (error) {
                        Alert.alert('Error', 'Could not open document');
                      }
                    }}
                    style={[styles.openButton, { backgroundColor: theme.colors.primary }]}
                    labelStyle={styles.openButtonText}
                    icon="open-in-new"
                  >
                    Open PDF
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={async () => {
                      try {
                        const fullUrl = selectedPdf.fileUrl.startsWith('/uploads/') 
                          ? `http://192.168.1.18:5000${selectedPdf.fileUrl}`
                          : selectedPdf.fileUrl;
                        
                        const supported = await Linking.canOpenURL(fullUrl);
                        if (supported) {
                          await Linking.openURL(fullUrl);
                        } else {
                          Alert.alert('Error', 'Cannot download this document');
                        }
                      } catch (error) {
                        Alert.alert('Error', 'Could not download document');
                      }
                    }}
                    style={[styles.downloadButton, { borderColor: theme.colors.outline }]}
                    labelStyle={[styles.downloadButtonText, { color: theme.colors.text }]}
                    icon="download"
                  >
                    Download
                  </Button>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        visible={showQuizModal}
        animationType="slide"
        onRequestClose={() => setShowQuizModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowQuizModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Practice Quiz
            </Text>
          </View>
          
          {selectedQuestion && (
            <ScrollView style={styles.quizContainer}>
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                {selectedQuestion.question}
              </Text>
              
              {selectedQuestion.scenario && (
                <Text style={[styles.scenarioText, { color: theme.colors.textSecondary }]}>
                  {selectedQuestion.scenario}
                </Text>
              )}
              
              <View style={styles.optionsContainer}>
                {selectedQuestion.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: selectedAnswer === index 
                          ? theme.colors.primary 
                          : theme.colors.surface,
                        borderColor: selectedAnswer === index 
                          ? theme.colors.primary 
                          : theme.colors.border
                      }
                    ]}
                    onPress={() => setSelectedAnswer(index)}
                  >
                    <RadioButton
                      value={index.toString()}
                      status={selectedAnswer === index ? 'checked' : 'unchecked'}
                      onPress={() => setSelectedAnswer(index)}
                    />
                    <Text style={[
                      styles.optionText,
                      { 
                        color: selectedAnswer === index 
                          ? '#fff' 
                          : theme.colors.text 
                      }
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {!showQuizResult ? (
                <Button
                  mode="contained"
                  onPress={handleQuizSubmit}
                  style={styles.submitButton}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <View style={styles.resultContainer}>
                  <Text style={[
                    styles.resultText,
                    { color: quizScore > 0 ? '#10b981' : '#ef4444' }
                  ]}>
                    {quizScore > 0 ? '🎉 Correct!' : '❌ Incorrect'}
                  </Text>
                  <Text style={[styles.explanationText, { color: theme.colors.text }]}>
                    {selectedQuestion.explanation}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={handleQuizNext}
                    style={styles.nextButton}
                  >
                    Next Question
                  </Button>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  themeToggle: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  welcomeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  videoCardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoTouchable: {
    flexDirection: 'row',
    padding: 16,
  },
  videoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 16,
  },
  videoOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  videoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pdfContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  pdfInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdfTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  pdfDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  pdfActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  openButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
  },
  pdfMeta: {
    alignItems: 'center',
    gap: 8,
  },
  pdfMetaText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  noteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteMeta: {
    flexDirection: 'column',
    gap: 8,
  },
  noteUrl: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkInfo: {
    flex: 1,
    marginLeft: 16,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  linkMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  videoContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  videoInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  videoDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  quizContainer: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 24,
  },
  scenarioText: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  nextButton: {
    marginTop: 16,
  },
});

export default TopicStudyScreen;
