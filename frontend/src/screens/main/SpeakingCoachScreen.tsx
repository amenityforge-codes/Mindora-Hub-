import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Text as RNText,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  ProgressBar,
  Avatar,
  Chip,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { speechService, SpeechRecognitionResult, SpeechAnalysisResult } from '../../services/speechService';
import { aiAnalysisService } from '../../services/aiAnalysisService';

import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function SpeakingCoachScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [feedback, setFeedback] = useState<SpeechAnalysisResult | null>(null);
  const [speechScore, setSpeechScore] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const speakingExercises = [
    {
      id: 1,
      title: 'Pronunciation: "TH" Sounds',
      description: 'Practice the challenging "th" sounds in English',
      text: 'Think about the three things that make you happy.',
      difficulty: 'Medium',
      focus: 'Pronunciation',
      targetSounds: ['th', 'thr', 'th'],
      color: '#10b981',
      gradient: ['#10b981', '#059669']
    },
    {
      id: 2,
      title: 'Fluency: Business Presentation',
      description: 'Practice speaking fluently in business context',
      text: 'Our quarterly results show significant growth in all key metrics.',
      difficulty: 'Hard',
      focus: 'Fluency',
      targetSounds: ['qu', 'gr', 'me'],
      color: '#f59e0b',
      gradient: ['#f59e0b', '#d97706']
    },
    {
      id: 3,
      title: 'Intonation: Questions',
      description: 'Master the rising intonation in questions',
      text: 'Could you please help me understand this concept better?',
      difficulty: 'Easy',
      focus: 'Intonation',
      targetSounds: ['co', 'he', 'be'],
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed']
    },
    {
      id: 4,
      title: 'Conversation: Daily Life',
      description: 'Practice natural conversation flow',
      text: 'I would like to order a coffee and a sandwich, please.',
      difficulty: 'Easy',
      focus: 'Conversation',
      targetSounds: ['or', 'co', 'sa'],
      color: '#06b6d4',
      gradient: ['#06b6d4', '#0891b2']
    }
  ];

  useEffect(() => {
    // Set up speech recognition callback
    const handleRecognitionResult = (result: SpeechRecognitionResult) => {
      setRecognizedText(result.text);
      setIsListening(!result.isFinal);
    };

    speechService.onRecognitionResult(handleRecognitionResult);

    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      speechService.removeRecognitionCallback(handleRecognitionResult);
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsListening(true);
      setRecognizedText('');
      setFeedback(null);
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start wave animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      await speechService.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsListening(false);
      pulseAnim.stopAnimation();
      waveAnim.stopAnimation();
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
      
      const transcribedText = await speechService.stopRecording();
      if (transcribedText) {
        setRecognizedText(transcribedText);
        await analyzeSpeech(transcribedText);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const analyzeSpeech = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await speechService.analyzeSpeech(text, speakingExercises[currentExercise]?.text);
      setFeedback(analysis);
      setSpeechScore(analysis.overall.score);
    } catch (error) {
      console.error('Speech analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze speech. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playExample = () => {
    const exercise = speakingExercises[currentExercise];
    speechService.speak(exercise.text, { rate: 0.7 });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#10b981', '#059669', '#047857']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Speaking Coach</Text>
          <Text style={styles.headerSubtitle}>Real-time pronunciation & fluency training</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme}>
          <MaterialIcons 
            name={isDarkMode ? "wb-sunny" : "nightlight-round"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderCoachProfile = () => (
    <Animated.View 
      style={[
        styles.animatedCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={8}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.coachCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Card.Content style={styles.coachCardContent}>
            <View style={styles.coachProfile}>
              <Avatar.Icon 
                size={64} 
                icon="mic" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              />
              <View style={styles.coachInfo}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: 'white' }}>
                  AI Speaking Coach
                </Text>
                <Text variant="bodyMedium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Real-time pronunciation & fluency analysis
                </Text>
                <View style={styles.coachStats}>
                  <Chip mode="outlined" compact style={styles.statChip}>
                    <MaterialIcons name="trending-up" size={16} color="white" />
                    <Text style={{ marginLeft: 4, color: 'white', fontSize: 12 }}>85% Accuracy</Text>
                  </Chip>
                  <Chip mode="outlined" compact style={styles.statChip}>
                    <MaterialIcons name="speed" size={16} color="white" />
                    <Text style={{ marginLeft: 4, color: 'white', fontSize: 12 }}>Real-time</Text>
                  </Chip>
                </View>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderCurrentExercise = () => {
    const exercise = speakingExercises[currentExercise];
    
    return (
      <Animated.View 
        style={[
          styles.animatedCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={6}>
          <Card.Content>
            <View style={styles.exerciseHeader}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                Current Exercise
              </Text>
              <Chip mode="outlined" compact style={[styles.difficultyChip, { backgroundColor: exercise.color + '20' }]}>
                <Text style={{ color: exercise.color, fontSize: 12, fontWeight: '600' }}>{exercise.difficulty}</Text>
              </Chip>
            </View>
            
            <View style={styles.exerciseContent}>
              <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8, color: theme.colors.onSurface }}>
                {exercise.title}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                {exercise.description}
              </Text>
              
              <Surface style={[styles.practiceTextContainer, { backgroundColor: theme.colors.background }]} elevation={2}>
                <Text style={styles.practiceText}>{exercise.text}</Text>
              </Surface>
              
              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.listenButton]}
                  onPress={playExample}
                >
                  <MaterialIcons name="play-arrow" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Listen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: isRecording ? '#ef4444' : exercise.color }
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isAnalyzing}
                >
                  <MaterialIcons name={isRecording ? "stop" : "mic"} size={20} color="white" />
                  <Text style={styles.actionButtonText}>
                    {isRecording ? 'Stop' : 'Record'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderRecordingVisualizer = () => {
    if (!isRecording) return null;

    return (
      <Animated.View 
        style={[
          styles.animatedCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={8}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.recordingCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Card.Content style={styles.recordingCardContent}>
              <View style={styles.recordingContainer}>
                <Animated.View style={[
                  styles.recordingCircle,
                  { 
                    transform: [{ scale: pulseAnim }],
                  }
                ]}>
                  <MaterialIcons name="mic" size={32} color="white" />
                </Animated.View>
                
                <View style={styles.waveContainer}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.waveBar,
                        {
                          height: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 30 + index * 5],
                          }),
                        }
                      ]}
                    />
                  ))}
                </View>
                
                <Text variant="titleMedium" style={{ marginTop: 16, textAlign: 'center', fontWeight: '600', color: 'white' }}>
                  {isListening ? 'Listening...' : 'Recording...'}
                </Text>
                <Text variant="bodySmall" style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textAlign: 'center',
                  marginTop: 8 
                }}>
                  {isListening ? 'AI is processing your speech' : 'Speak clearly into the microphone'}
                </Text>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  const renderRecognizedText = () => {
    if (!recognizedText) return null;

    return (
      <Animated.View 
        style={[
          styles.animatedCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16, color: theme.colors.onSurface }}>
              Recognized Speech
            </Text>
            <Surface style={[styles.recognizedTextContainer, { backgroundColor: theme.colors.background }]} elevation={1}>
              <Text style={styles.recognizedText}>{recognizedText}</Text>
            </Surface>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderFeedback = () => {
    if (!feedback) return null;

    return (
      <Animated.View 
        style={[
          styles.animatedCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={6}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16, color: theme.colors.onSurface }}>
              AI Analysis Results
            </Text>
            
            <View style={styles.overallScore}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#10b981' }}>
                {feedback.overall.score}%
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Overall Score
              </Text>
            </View>

            <View style={styles.feedbackSections}>
              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <MaterialIcons name="record-voice-over" size={20} color="#6366f1" />
                  <Text variant="titleSmall" style={{ fontWeight: '600', marginLeft: 8, color: theme.colors.onSurface }}>
                    Pronunciation
                  </Text>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#6366f1' }}>
                    {feedback.pronunciation.score}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={feedback.pronunciation.score / 100} 
                  color="#6366f1"
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {feedback.pronunciation.feedback}
                </Text>
              </View>

              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <MaterialIcons name="speed" size={20} color="#f59e0b" />
                  <Text variant="titleSmall" style={{ fontWeight: '600', marginLeft: 8, color: theme.colors.onSurface }}>
                    Fluency
                  </Text>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                    {feedback.fluency.score}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={feedback.fluency.score / 100} 
                  color="#f59e0b"
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {feedback.fluency.feedback}
                </Text>
              </View>

              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <MaterialIcons name="trending-up" size={20} color="#8b5cf6" />
                  <Text variant="titleSmall" style={{ fontWeight: '600', marginLeft: 8, color: theme.colors.onSurface }}>
                    Intonation
                  </Text>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#8b5cf6' }}>
                    {feedback.intonation.score}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={feedback.intonation.score / 100} 
                  color="#8b5cf6"
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {feedback.intonation.feedback}
                </Text>
              </View>
            </View>

            <View style={styles.nextSteps}>
              <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8, color: theme.colors.onSurface }}>
                Next Steps:
              </Text>
              {feedback.overall.nextSteps.map((step: string, index: number) => (
                <View key={index} style={styles.nextStepItem}>
                  <MaterialIcons name="arrow-forward" size={16} color="#10b981" />
                  <Text variant="bodySmall" style={{ marginLeft: 8, flex: 1, color: theme.colors.onSurface }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderExerciseSelector = () => (
    <Animated.View 
      style={[
        styles.animatedCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16, color: theme.colors.onSurface }}>
            Choose Exercise
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.exerciseSelector}>
              {speakingExercises.map((exercise, index) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseOption,
                    { backgroundColor: theme.colors.background },
                    currentExercise === index && { borderColor: exercise.color, borderWidth: 2 }
                  ]}
                  onPress={() => setCurrentExercise(index)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={currentExercise === index ? exercise.gradient : ['transparent', 'transparent']}
                    style={styles.exerciseOptionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={[styles.exerciseOptionIcon, { backgroundColor: exercise.color }]}>
                      <MaterialIcons 
                        name="mic" 
                        size={24} 
                        color="white" 
                      />
                    </View>
                    <View style={styles.exerciseOptionInfo}>
                      <Text variant="titleSmall" style={{ fontWeight: '600', color: currentExercise === index ? 'white' : theme.colors.onSurface }}>
                        {exercise.title}
                      </Text>
                      <Text variant="bodySmall" style={{ color: currentExercise === index ? 'rgba(255, 255, 255, 0.8)' : theme.colors.onSurfaceVariant }}>
                        {exercise.focus} • {exercise.difficulty}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderCoachProfile()}
        {renderCurrentExercise()}
        {renderRecordingVisualizer()}
        {renderRecognizedText()}
        {renderFeedback()}
        {renderExerciseSelector()}
        
        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
              AI is analyzing your speech...
            </Text>
          </View>
        )}
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  animatedCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  coachCardGradient: {
    borderRadius: 20,
  },
  coachCardContent: {
    padding: 20,
  },
  coachProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
    marginLeft: 16,
  },
  coachStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseContent: {
    marginBottom: 16,
  },
  practiceTextContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  practiceText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listenButton: {
    backgroundColor: '#6366f1',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingCardGradient: {
    borderRadius: 20,
  },
  recordingCardContent: {
    padding: 20,
  },
  recordingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  recordingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  waveBar: {
    width: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  recognizedTextContainer: {
    padding: 16,
    borderRadius: 12,
  },
  recognizedText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  overallScore: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
  },
  feedbackSections: {
    marginBottom: 16,
  },
  feedbackSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  nextSteps: {
    marginTop: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  exerciseOption: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  exerciseOptionGradient: {
    padding: 16,
    minHeight: 120,
  },
  exerciseOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
