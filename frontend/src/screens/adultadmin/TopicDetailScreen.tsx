import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';

interface TopicDetailScreenProps {
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

const TopicDetailScreen: React.FC<TopicDetailScreenProps> = ({ navigation, route }) => {
  const { topicId, topicTitle, moduleId } = route.params;
  const theme = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  
  // Modal states
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  
  // Form states
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState<any>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [questionText, setQuestionText] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [questionType, setQuestionType] = useState<'basic' | 'scenario'>('basic');
  const [scenario, setScenario] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(3);
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFile, setNoteFile] = useState<any>(null);
  const [uploadingNote, setUploadingNote] = useState(false);
  
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkType, setLinkType] = useState<'resource' | 'reference' | 'external'>('resource');

  useEffect(() => {
    loadTopicContent();
  }, []);

  const loadTopicContent = async () => {
    try {
      setLoading(true);
      console.log('=== TOPIC DETAIL: Loading content for topic ===', topicId);
      // Load videos, questions, notes, and links for this topic
      const [videosRes, questionsRes, notesRes, linksRes] = await Promise.all([
        fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/videos`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/questions`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/notes`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/links`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        console.log('=== TOPIC DETAIL: Videos Data ===', videosData);
        setVideos(videosData);
      }
      
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        console.log('=== TOPIC DETAIL: Questions Data ===', questionsData);
        setQuestions(questionsData);
      }
      
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        console.log('=== TOPIC DETAIL: Notes Data ===', notesData);
        setNotes(notesData);
      }
      
      if (linksRes.ok) {
        const linksData = await linksRes.json();
        console.log('=== TOPIC DETAIL: Links Data ===', linksData);
        setLinks(linksData);
      }
    } catch (error) {
      console.error('Error loading topic content:', error);
    } finally {
      setLoading(false);
      console.log('=== TOPIC DETAIL: Final state ===', { videos: videos.length, questions: questions.length, notes: notes.length, links: links.length });
    }
  };

  const uploadVideo = async () => {
    if (!videoTitle.trim() || !videoFile) {
      Alert.alert('Error', 'Please provide video title and select a video file');
      return;
    }

    try {
      setUploadingVideo(true);
      
      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('topicId', topicId);
      
      // Create proper file object for upload
      const file = {
        uri: videoFile.uri,
        type: videoFile.mimeType || 'video/mp4',
        name: videoFile.fileName || videoFile.name || 'video.mp4',
      };
      
      formData.append('video', file as any);

      console.log('Uploading video:', {
        title: videoTitle,
        description: videoDescription,
        topicId: topicId,
        file: file
      });

      const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/videos`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let fetch set it automatically for multipart/form-data
      });

      const responseData = await response.text();
      console.log('Upload response:', response.status, responseData);

      if (response.ok) {
        Alert.alert('Success', 'Video uploaded successfully!');
        setShowAddVideo(false);
        setVideoTitle('');
        setVideoDescription('');
        setVideoFile(null);
        loadTopicContent();
      } else {
        Alert.alert('Error', `Failed to upload video: ${responseData}`);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', `Failed to upload video: ${error.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const addQuestion = async () => {
    if (!questionText.trim() || questionOptions.some(opt => !opt.trim())) {
      Alert.alert('Error', 'Please fill in all question fields');
      return;
    }

    try {
      const questionData = {
        question: questionText,
        options: questionOptions,
        correctAnswer,
        explanation,
        type: questionType,
        scenario: questionType === 'scenario' ? scenario : undefined,
        maxAttempts,
        topicId,
      };

      const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Question added successfully!');
        setShowAddQuestion(false);
        resetQuestionForm();
        loadTopicContent();
      } else {
        Alert.alert('Error', 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      Alert.alert('Error', 'Failed to add question');
    }
  };

  const uploadNote = async () => {
    if (!noteTitle.trim() || !noteFile) {
      Alert.alert('Error', 'Please provide note title and select a file');
      return;
    }

    try {
      setUploadingNote(true);
      
      const formData = new FormData();
      formData.append('title', noteTitle);
      formData.append('topicId', topicId);
      
      // Create proper file object for upload
      const file = {
        uri: noteFile.uri,
        type: noteFile.mimeType,
        name: noteFile.name,
      };
      
      formData.append('file', file as any);

      console.log('Uploading note:', {
        title: noteTitle,
        topicId: topicId,
        file: file
      });

      const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/notes`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let fetch set it automatically for multipart/form-data
      });

      const responseData = await response.text();
      console.log('Upload response:', response.status, responseData);

      if (response.ok) {
        Alert.alert('Success', 'Note uploaded successfully!');
        setShowAddNote(false);
        setNoteTitle('');
        setNoteFile(null);
        loadTopicContent();
      } else {
        Alert.alert('Error', `Failed to upload note: ${responseData}`);
      }
    } catch (error) {
      console.error('Error uploading note:', error);
      Alert.alert('Error', `Failed to upload note: ${error.message}`);
    } finally {
      setUploadingNote(false);
    }
  };

  const addLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      Alert.alert('Error', 'Please provide link title and URL');
      return;
    }

    try {
      const linkData = {
        title: linkTitle,
        url: linkUrl,
        description: linkDescription,
        type: linkType,
        topicId,
      };

      const response = await fetch(`http://192.168.1.18:5000/api/adult-modules/${moduleId}/topics/${topicId}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Link added successfully!');
        setShowAddLink(false);
        resetLinkForm();
        loadTopicContent();
      } else {
        Alert.alert('Error', 'Failed to add link');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      Alert.alert('Error', 'Failed to add link');
    }
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
    setQuestionType('basic');
    setScenario('');
    setMaxAttempts(3);
  };

  const resetLinkForm = () => {
    setLinkTitle('');
    setLinkUrl('');
    setLinkDescription('');
    setLinkType('resource');
  };

  const pickVideoAlternative = async () => {
    try {
      // Use DocumentPicker as an alternative for video files
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        console.log('Selected video file:', selectedFile);
        
        // Create a video-like object for consistency
        const videoFile = {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'video/mp4',
          name: selectedFile.name,
          fileName: selectedFile.name,
          size: selectedFile.size,
        };
        
        setVideoFile(videoFile);
        Alert.alert('Success', 'Video file selected successfully!');
      }
    } catch (error) {
      console.error('Error picking video file:', error);
      Alert.alert('Error', 'Failed to select video file. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNoteFile(result.assets[0]);
        Alert.alert('Success', 'Document selected successfully!');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const renderVideoItem = ({ item }: { item: Video }) => (
    <View style={styles.contentItem}>
      <View style={styles.contentHeader}>
        <MaterialIcons name="video-library" size={20} color="#4CAF50" />
        <Text style={[styles.contentTitle, { color: theme.colors.text }]}>{item.title}</Text>
      </View>
      <Text style={[styles.contentDescription, { color: theme.colors.textSecondary }]}>
        {item.description}
      </Text>
      <Text style={[styles.contentMeta, { color: theme.colors.textSecondary }]}>
        Duration: {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
      </Text>
    </View>
  );

  const renderQuestionItem = ({ item }: { item: Question }) => (
    <View style={styles.contentItem}>
      <View style={styles.contentHeader}>
        <MaterialIcons 
          name={item.type === 'scenario' ? 'psychology' : 'quiz'} 
          size={20} 
          color={item.type === 'scenario' ? '#FF9800' : '#2196F3'} 
        />
        <Text style={[styles.contentTitle, { color: theme.colors.text }]}>{item.question}</Text>
      </View>
      {item.type === 'scenario' && item.scenario && (
        <Text style={[styles.scenarioText, { color: theme.colors.textSecondary }]}>
          Scenario: {item.scenario}
        </Text>
      )}
      <Text style={[styles.contentMeta, { color: theme.colors.textSecondary }]}>
        Max Attempts: {item.maxAttempts} | Type: {item.type}
      </Text>
    </View>
  );

  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={styles.contentItem}>
      <View style={styles.contentHeader}>
        <MaterialIcons name="description" size={20} color="#9C27B0" />
        <Text style={[styles.contentTitle, { color: theme.colors.text }]}>{item.title}</Text>
      </View>
      <Text style={[styles.contentMeta, { color: theme.colors.textSecondary }]}>
        Type: {item.fileType} | Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderLinkItem = ({ item }: { item: Link }) => (
    <View style={styles.contentItem}>
      <View style={styles.contentHeader}>
        <MaterialIcons name="link" size={20} color="#607D8B" />
        <Text style={[styles.contentTitle, { color: theme.colors.text }]}>{item.title}</Text>
      </View>
      <Text style={[styles.contentDescription, { color: theme.colors.textSecondary }]}>
        {item.description}
      </Text>
      <Text style={[styles.contentMeta, { color: theme.colors.textSecondary }]}>
        Type: {item.type} | URL: {item.url}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading topic content...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topicTitle}</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => setShowAddVideo(true)}
          >
            <MaterialIcons name="video-library" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => setShowAddQuestion(true)}
          >
            <MaterialIcons name="quiz" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Question</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => setShowCreateQuiz(true)}
          >
            <MaterialIcons name="assignment" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
            onPress={() => setShowAddNote(true)}
          >
            <MaterialIcons name="description" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Note</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#607D8B' }]}
            onPress={() => setShowAddLink(true)}
          >
            <MaterialIcons name="link" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Link</Text>
          </TouchableOpacity>
        </View>

        {/* Videos Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Videos ({videos.length})
          </Text>
          {videos.length > 0 ? (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No videos added yet
            </Text>
          )}
        </View>

        {/* Questions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Questions ({questions.length})
          </Text>
          {questions.length > 0 ? (
            <FlatList
              data={questions}
              renderItem={renderQuestionItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No questions added yet
            </Text>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notes ({notes.length})
          </Text>
          {notes.length > 0 ? (
            <FlatList
              data={notes}
              renderItem={renderNoteItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No notes uploaded yet
            </Text>
          )}
        </View>

        {/* Links Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Links ({links.length})
          </Text>
          {links.length > 0 ? (
            <FlatList
              data={links}
              renderItem={renderLinkItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No links added yet
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Add Video Modal */}
      <Modal visible={showAddVideo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Video</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Video Title"
              value={videoTitle}
              onChangeText={setVideoTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Video Description"
              value={videoDescription}
              onChangeText={setVideoDescription}
              multiline
            />
            
            <TouchableOpacity style={styles.pickButton} onPress={pickVideoAlternative}>
              <MaterialIcons name="folder-open" size={20} color="#4CAF50" />
              <Text style={styles.pickButtonText}>
                {videoFile ? 'Change Video File' : 'Select Video File'}
              </Text>
            </TouchableOpacity>
            
            {videoFile && (
              <Text style={styles.fileInfo}>Selected: {videoFile.fileName || 'Video file'}</Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddVideo(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={uploadVideo}
                disabled={uploadingVideo}
              >
                {uploadingVideo ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Upload Video</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Question Modal */}
      <Modal visible={showAddQuestion} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Question</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddQuestion(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.questionTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  questionType === 'basic' && styles.typeButtonActive
                ]}
                onPress={() => setQuestionType('basic')}
              >
                <MaterialIcons 
                  name="quiz" 
                  size={16} 
                  color={questionType === 'basic' ? 'white' : '#666'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  questionType === 'basic' && styles.typeButtonTextActive
                ]}>Basic Question</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  questionType === 'scenario' && styles.typeButtonActive
                ]}
                onPress={() => setQuestionType('scenario')}
              >
                <MaterialIcons 
                  name="psychology" 
                  size={16} 
                  color={questionType === 'scenario' ? 'white' : '#666'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  questionType === 'scenario' && styles.typeButtonTextActive
                ]}>Scenario Question</Text>
              </TouchableOpacity>
            </View>
            
            {questionType === 'scenario' && (
              <View style={styles.scenarioSection}>
                <Text style={styles.sectionLabel}>Scenario Context</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the scenario or situation..."
                  value={scenario}
                  onChangeText={setScenario}
                  multiline
                />
              </View>
            )}
            
            <View style={styles.questionSection}>
              <Text style={styles.sectionLabel}>Question</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your question here..."
                value={questionText}
                onChangeText={setQuestionText}
                multiline
              />
            </View>
            
            <View style={styles.optionsSection}>
              <Text style={styles.sectionLabel}>Answer Options</Text>
              {questionOptions.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <View style={styles.optionNumber}>
                    <Text style={styles.optionNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.optionInput]}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...questionOptions];
                      newOptions[index] = text;
                      setQuestionOptions(newOptions);
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.correctButton,
                      correctAnswer === index && styles.correctButtonActive
                    ]}
                    onPress={() => setCorrectAnswer(index)}
                  >
                    <MaterialIcons 
                      name="check" 
                      size={16} 
                      color={correctAnswer === index ? 'white' : '#4CAF50'} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <View style={styles.explanationSection}>
              <Text style={styles.sectionLabel}>Explanation (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Explain why this is the correct answer..."
                value={explanation}
                onChangeText={setExplanation}
                multiline
              />
            </View>
            
            <View style={styles.settingsSection}>
              <Text style={styles.sectionLabel}>Question Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Attempts:</Text>
                <TextInput
                  style={[styles.input, styles.numberInput]}
                  placeholder="3"
                  value={maxAttempts.toString()}
                  onChangeText={(text) => setMaxAttempts(parseInt(text) || 3)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddQuestion(false);
                  resetQuestionForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addQuestion}
              >
                <MaterialIcons name="add" size={16} color="white" />
                <Text style={styles.saveButtonText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Create Quiz Modal */}
      <Modal visible={showCreateQuiz} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Quiz</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateQuiz(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.questionSection}>
              <Text style={styles.sectionLabel}>Quiz Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quiz title..."
                value={questionText}
                onChangeText={setQuestionText}
              />
            </View>
            
            <View style={styles.questionSection}>
              <Text style={styles.sectionLabel}>Question</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your question here..."
                value={questionText}
                onChangeText={setQuestionText}
                multiline
              />
            </View>
            
            <View style={styles.optionsSection}>
              <Text style={styles.sectionLabel}>Answer Options</Text>
              {questionOptions.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <View style={styles.optionNumber}>
                    <Text style={styles.optionNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.optionInput]}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...questionOptions];
                      newOptions[index] = text;
                      setQuestionOptions(newOptions);
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.correctButton,
                      correctAnswer === index && styles.correctButtonActive
                    ]}
                    onPress={() => setCorrectAnswer(index)}
                  >
                    <MaterialIcons 
                      name="check" 
                      size={16} 
                      color={correctAnswer === index ? 'white' : '#4CAF50'} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <View style={styles.explanationSection}>
              <Text style={styles.sectionLabel}>Explanation (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Explain why this is the correct answer..."
                value={explanation}
                onChangeText={setExplanation}
                multiline
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateQuiz(false);
                  resetQuestionForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addQuestion}
              >
                <MaterialIcons name="assignment" size={16} color="white" />
                <Text style={styles.saveButtonText}>Create Quiz</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Note Modal */}
      <Modal visible={showAddNote} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Note Title"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            
            <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
              <MaterialIcons name="description" size={20} color="#9C27B0" />
              <Text style={styles.pickButtonText}>
                {noteFile ? 'Change Document' : 'Pick Document'}
              </Text>
            </TouchableOpacity>
            
            {noteFile && (
              <Text style={styles.fileInfo}>Selected: {noteFile.name}</Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddNote(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={uploadNote}
                disabled={uploadingNote}
              >
                {uploadingNote ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Upload Note</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Link Modal */}
      <Modal visible={showAddLink} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Link</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Link Title"
              value={linkTitle}
              onChangeText={setLinkTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="URL"
              value={linkUrl}
              onChangeText={setLinkUrl}
              keyboardType="url"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={linkDescription}
              onChangeText={setLinkDescription}
              multiline
            />
            
            <View style={styles.linkTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  linkType === 'resource' && styles.typeButtonActive
                ]}
                onPress={() => setLinkType('resource')}
              >
                <Text style={[
                  styles.typeButtonText,
                  linkType === 'resource' && styles.typeButtonTextActive
                ]}>Resource</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  linkType === 'reference' && styles.typeButtonActive
                ]}
                onPress={() => setLinkType('reference')}
              >
                <Text style={[
                  styles.typeButtonText,
                  linkType === 'reference' && styles.typeButtonTextActive
                ]}>Reference</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  linkType === 'external' && styles.typeButtonActive
                ]}
                onPress={() => setLinkType('external')}
              >
                <Text style={[
                  styles.typeButtonText,
                  linkType === 'external' && styles.typeButtonTextActive
                ]}>External</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddLink(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addLink}
              >
                <Text style={styles.saveButtonText}>Add Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  contentDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  scenarioText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff3e0',
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  scenarioSection: {
    marginBottom: 16,
  },
  questionSection: {
    marginBottom: 16,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  correctButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctButtonActive: {
    backgroundColor: '#4CAF50',
  },
  explanationSection: {
    marginBottom: 16,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  numberInput: {
    width: 80,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  pickButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  fileInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  linkTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
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
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TopicDetailScreen;
