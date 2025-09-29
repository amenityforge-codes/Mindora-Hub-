import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ProgressBar,
  IconButton,
  Chip,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import * as Speech from 'expo-speech';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchModule } from '../../store/slices/contentSlice';
import { updateProgress, addBookmark, addNote } from '../../store/slices/progressSlice';
import { Module } from '../../types';

const { width, height } = Dimensions.get('window');

export default function LessonPlayerScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { moduleId, step = 0 } = route.params as { moduleId: string; step?: number };
  
  const { currentModule, isLoading } = useAppSelector((state) => state.content);
  const { user } = useAppSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(step);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRef = useRef<Video>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (moduleId) {
      dispatch(fetchModule(moduleId));
    }
  }, [moduleId]);

  useEffect(() => {
    // Track time spent when component mounts
    startTime.current = Date.now();
    
    return () => {
      // Update progress when component unmounts
      const timeSpent = (Date.now() - startTime.current) / 60000; // Convert to minutes
      if (timeSpent > 0.5) { // Only update if spent more than 30 seconds
        updateLessonProgress(timeSpent);
      }
    };
  }, []);

  const updateLessonProgress = async (timeSpent: number) => {
    if (!currentModule) return;
    
    const totalSteps = currentModule.content?.objectives?.length || 1;
    const newProgress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);
    
    try {
      await dispatch(updateProgress({
        moduleId: currentModule._id,
        step: currentStep,
        percentage: newProgress,
        timeSpent,
      })).unwrap();
      
      setProgress(newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Update progress based on video position
      if (status.durationMillis > 0) {
        const videoProgress = (status.positionMillis / status.durationMillis) * 100;
        setProgress(Math.max(progress, videoProgress));
      }
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleSeek = async (position: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(position);
    }
  };

  const handleStepChange = (newStep: number) => {
    if (currentModule?.content?.objectives && newStep >= 0 && newStep < currentModule.content.objectives.length) {
      setCurrentStep(newStep);
      updateLessonProgress(0);
    }
  };

  const handleAddBookmark = async () => {
    if (!currentModule) return;
    
    try {
      await dispatch(addBookmark({
        moduleId: currentModule._id,
        step: currentStep,
        timestamp: currentTime,
        note: `Bookmark at step ${currentStep + 1}`,
      })).unwrap();
      
      Alert.alert('Success', 'Bookmark added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add bookmark');
    }
  };

  const handleAddNote = async () => {
    if (!currentModule || !noteText.trim()) return;
    
    try {
      await dispatch(addNote({
        moduleId: currentModule._id,
        step: currentStep,
        content: noteText.trim(),
      })).unwrap();
      
      setNoteText('');
      setShowNoteInput(false);
      Alert.alert('Success', 'Note added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const handleSpeakText = async (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderVideoPlayer = () => {
    if (!currentModule?.media?.video) return null;

    return (
      <Card style={[styles.videoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: currentModule.media.video.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
          />
          
          {/* Video Controls Overlay */}
          <View style={styles.videoControls}>
            <IconButton
              icon={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              iconColor="white"
              onPress={handlePlayPause}
              style={styles.playButton}
            />
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={duration > 0 ? currentTime / duration : 0}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <View style={styles.timeContainer}>
              <Text variant="bodySmall" style={{ color: 'white' }}>
                {formatTime(currentTime)}
              </Text>
              <Text variant="bodySmall" style={{ color: 'white' }}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderAudioPlayer = () => {
    if (!currentModule?.media?.audio) return null;

    return (
      <Card style={[styles.audioCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.audioControls}>
            <IconButton
              icon={isSpeaking ? 'stop' : 'play-arrow'}
              size={48}
              iconColor={theme.colors.primary}
              onPress={() => handleSpeakText(currentModule.media.audio.transcript || '')}
            />
            <View style={styles.audioInfo}>
              <Text variant="titleMedium">Audio Lesson</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Duration: {Math.floor((currentModule.media.audio.duration || 0) / 60)} minutes
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStepNavigation = () => {
    if (!currentModule?.content?.objectives) return null;

    const objectives = currentModule.content.objectives;
    const totalSteps = objectives.length;

    return (
      <Card style={[styles.navigationCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Lesson Steps ({currentStep + 1} of {totalSteps})
          </Text>
          
          <View style={styles.stepNavigation}>
            <Button
              mode="outlined"
              onPress={() => handleStepChange(currentStep - 1)}
              disabled={currentStep === 0}
              icon="chevron-left"
            >
              Previous
            </Button>
            
            <Text variant="bodyMedium" style={{ textAlign: 'center', flex: 1 }}>
              {objectives[currentStep]}
            </Text>
            
            <Button
              mode="contained"
              onPress={() => handleStepChange(currentStep + 1)}
              disabled={currentStep === totalSteps - 1}
              icon="chevron-right"
            >
              Next
            </Button>
          </View>
          
          <ProgressBar
            progress={(currentStep + 1) / totalSteps}
            color={theme.colors.primary}
            style={styles.stepProgressBar}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderContent = () => {
    if (!currentModule) return null;

    return (
      <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.contentHeader}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              {currentModule.title}
            </Text>
            <View style={styles.contentMeta}>
              <Chip mode="outlined" compact style={styles.chip}>
                {currentModule.moduleType}
              </Chip>
              <Chip mode="outlined" compact style={styles.chip}>
                {currentModule.difficulty}
              </Chip>
              <Chip mode="outlined" compact style={styles.chip}>
                {currentModule.estimatedDuration} min
              </Chip>
            </View>
          </View>
          
          {currentModule.content.text && (
            <View style={styles.textContent}>
              <View style={styles.textHeader}>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  Lesson Content
                </Text>
                <IconButton
                  icon="volume-up"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => handleSpeakText(currentModule.content.text || '')}
                />
              </View>
              <Text variant="bodyMedium" style={styles.lessonText}>
                {currentModule.content.text}
              </Text>
            </View>
          )}
          
          {currentModule.media.video?.transcript && (
            <View style={styles.transcriptSection}>
              <Button
                mode="text"
                onPress={() => setShowTranscript(!showTranscript)}
                icon={showTranscript ? 'expand-less' : 'expand-more'}
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
              
              {showTranscript && (
                <Text variant="bodyMedium" style={styles.transcriptText}>
                  {currentModule.media.video.transcript}
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        mode="outlined"
        onPress={handleAddBookmark}
        icon="bookmark"
        style={styles.actionButton}
      >
        Bookmark
      </Button>
      
      <Button
        mode="outlined"
        onPress={() => setShowNoteInput(!showNoteInput)}
        icon="note"
        style={styles.actionButton}
      >
        Add Note
      </Button>
      
      {currentModule?.quiz && (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Quiz' as never, { 
            quizId: currentModule.quiz, 
            moduleId: currentModule._id 
          } as never)}
          icon="quiz"
          style={styles.actionButton}
        >
          Take Quiz
        </Button>
      )}
    </View>
  );

  const renderNoteInput = () => {
    if (!showNoteInput) return null;

    return (
      <Card style={[styles.noteCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 12 }}>
            Add Note
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={3}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Write your note here..."
            style={styles.noteInput}
          />
          <View style={styles.noteActions}>
            <Button
              mode="text"
              onPress={() => {
                setShowNoteInput(false);
                setNoteText('');
              }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddNote}
              disabled={!noteText.trim()}
            >
              Save Note
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading lesson...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentModule) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={theme.colors.error} />
          <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 16 }}>
            Module not found
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        {renderVideoPlayer()}
        
        {/* Audio Player */}
        {renderAudioPlayer()}
        
        {/* Step Navigation */}
        {renderStepNavigation()}
        
        {/* Content */}
        {renderContent()}
        
        {/* Action Buttons */}
        {renderActionButtons()}
        
        {/* Note Input */}
        {renderNoteInput()}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  videoCard: {
    margin: 16,
    elevation: 4,
  },
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: height * 0.3,
  },
  videoControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  progressBar: {
    height: 4,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  audioCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioInfo: {
    marginLeft: 16,
    flex: 1,
  },
  navigationCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  stepNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  contentCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  contentHeader: {
    marginBottom: 16,
  },
  contentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  textContent: {
    marginBottom: 16,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonText: {
    lineHeight: 24,
  },
  transcriptSection: {
    marginTop: 16,
  },
  transcriptText: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  noteCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  noteInput: {
    marginBottom: 16,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});



