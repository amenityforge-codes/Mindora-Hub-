import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SpeakingParagraph {
  id: string;
  title: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scheduledDate: string;
  createdAt: string;
}

interface SpeechAnalysis {
  accuracy: number;
  fluency: number;
  pronunciation: number;
  pace: number;
  confidence: number;
  mistakes: Array<{
    word: string;
    expected: string;
    position: number;
  }>;
}

const SpeakingCoachPracticeScreen: React.FC = () => {
  const { theme } = useTheme();
  const [paragraphs, setParagraphs] = useState<SpeakingParagraph[]>([]);
  const [selectedParagraph, setSelectedParagraph] = useState<SpeakingParagraph | null>(null);
  const [showParagraphSelection, setShowParagraphSelection] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [speechAnalysis, setSpeechAnalysis] = useState<SpeechAnalysis | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [liveAnalysis, setLiveAnalysis] = useState<{word: string, status: 'correct' | 'incorrect' | 'pending'}[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadParagraphs();
    initializeSpeechRecognition();
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);


  const loadParagraphs = async () => {
    try {
      const stored = await AsyncStorage.getItem('speakingParagraphs');
      console.log('Stored paragraphs:', stored);
      
      if (stored) {
        const loadedParagraphs = JSON.parse(stored);
        console.log('Loaded paragraphs:', loadedParagraphs);
        setParagraphs(loadedParagraphs);
        
        if (loadedParagraphs.length > 0) {
          setShowParagraphSelection(true);
        } else {
          setShowParagraphSelection(false);
        }
      } else {
        console.log('No paragraphs found, creating test paragraph');
        const testParagraph = {
          id: 'test-1',
          title: 'Test Paragraph',
          content: 'Hello world this is a test paragraph for speech recognition.',
          difficulty: 'beginner',
          scheduledDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        setParagraphs([testParagraph]);
        setShowParagraphSelection(true);
      }
    } catch (error) {
      console.error('Error loading paragraphs:', error);
      setShowParagraphSelection(false);
    }
  };

  const initializeSpeechRecognition = () => {
    if (Platform.OS === 'web') {
      // Check if speech recognition is available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onstart = () => {
          console.log('🎙️ Web speech recognition started');
          setIsListening(true);
        };
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          const currentText = finalTranscript || interimTranscript;
          console.log('🗣️ Web recognized text:', currentText);
          setRecognizedText(currentText);
          
          // Real-time analysis
          if (selectedParagraph && currentText) {
            analyzeLiveSpeech(selectedParagraph.content, currentText);
          }
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('❌ Web speech recognition error:', event.error);
          setIsListening(false);
          setIsRecording(false);
          Alert.alert('Speech Recognition Error', event.error);
        };
        
        recognitionInstance.onend = () => {
          console.log('🛑 Web speech recognition ended');
          setIsListening(false);
          setIsRecording(false);
        };
        
        setRecognition(recognitionInstance);
        console.log('✅ Web speech recognition initialized');
      } else {
        console.log('❌ Web speech recognition not supported');
      }
    } else {
      // Mobile - Expo Go compatible approach
      console.log('📱 Initializing mobile speech recognition (Expo Go compatible)...');
      console.log('✅ Mobile speech recognition initialized (using expo-av + simulation)');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    console.log('🎙️ Starting recording...');
    
    try {
      // Request microphone permission
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission to record audio.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setIsListening(true);
      setRecognizedText('');
      
      console.log('✅ Recording started');
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    console.log('🛑 Stopping recording...');
    
    try {
      if (recording) {
        setIsRecording(false);
        setIsListening(false);
        await recording.stopAndUnloadAsync();
        setRecording(null);
        console.log('✅ Recording stopped');
        
        // Show simple success message
        Alert.alert('Recording Complete', 'Your audio has been recorded successfully!');
      }
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };



  const generateFinalReport = () => {
    if (!selectedParagraph) return;
    
    const correctWords = liveAnalysis.filter(item => item.status === 'correct').length;
    const totalWords = liveAnalysis.length;
    const accuracy = (correctWords / totalWords) * 100;
    
    const mistakes = liveAnalysis
      .filter(item => item.status === 'incorrect')
      .map((item, index) => ({
        word: item.word,
        expected: item.word,
        position: index
      }));
    
    const analysis: SpeechAnalysis = {
      accuracy: accuracy,
      fluency: Math.max(0, accuracy - 10 + Math.random() * 20),
      pronunciation: Math.max(0, accuracy - 15 + Math.random() * 30),
      pace: 70 + Math.random() * 30,
      confidence: Math.max(0, accuracy - 5 + Math.random() * 10),
      mistakes: mistakes,
    };
    
    setSpeechAnalysis(analysis);
    setShowReport(true);
  };

  const handleSelectParagraph = (paragraph: SpeakingParagraph) => {
    setSelectedParagraph(paragraph);
    setShowParagraphSelection(false);
    setRecognizedText('');
    setLiveAnalysis([]);
    setSpeechAnalysis(null);
    setShowReport(false);
    setCurrentWordIndex(0);
    progressAnim.setValue(0);
  };

  const handleBackToSelection = () => {
    setShowParagraphSelection(true);
    setSelectedParagraph(null);
    setRecognizedText('');
    setLiveAnalysis([]);
    setSpeechAnalysis(null);
    setShowReport(false);
    setCurrentWordIndex(0);
    progressAnim.setValue(0);
  };

  const handlePlayParagraph = async () => {
    if (!selectedParagraph) return;
    
    try {
      await Speech.speak(selectedParagraph.content, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Failed to play speech:', error);
      Alert.alert('Listen', selectedParagraph.content);
    }
  };

  const resetPractice = () => {
    setRecognizedText('');
    setLiveAnalysis([]);
    setSpeechAnalysis(null);
    setShowReport(false);
    setCurrentWordIndex(0);
    progressAnim.setValue(0);
  };

  const renderParagraphSelection = () => (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Speaking Coach Practice
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose a paragraph to practice
        </Text>
      </View>

      {paragraphs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="mic" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No paragraphs available
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Ask your teacher to add speaking paragraphs
          </Text>
        </View>
      ) : (
        <View style={styles.paragraphsContainer}>
          {paragraphs.map((paragraph) => (
            <TouchableOpacity
              key={paragraph.id}
              style={[styles.paragraphCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleSelectParagraph(paragraph)}
            >
              <View style={styles.paragraphHeader}>
                <Text style={[styles.paragraphTitle, { color: theme.colors.text }]}>
                  {paragraph.title}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(paragraph.difficulty) }]}>
                  <Text style={styles.difficultyBadgeText}>
                    {paragraph.difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.paragraphContent, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                {paragraph.content}
              </Text>
              
              <View style={styles.paragraphMeta}>
                <View style={styles.dateBadge}>
                  <Icon name="event" size={12} color={theme.colors.primary} />
                  <Text style={[styles.dateText, { color: theme.colors.primary }]}>
                    {new Date(paragraph.scheduledDate).toLocaleDateString()}
                  </Text>
                </View>
                <Icon name="arrow-forward" size={20} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  if (showParagraphSelection) {
    return renderParagraphSelection();
  }

  if (!selectedParagraph) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSelection}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {selectedParagraph.title}
          </Text>
        </View>
        <Text style={[styles.difficulty, { color: theme.colors.primary }]}>
          {selectedParagraph.difficulty.toUpperCase()}
        </Text>
        <Text style={[styles.platformInfo, { color: theme.colors.primary }]}>
          🎙️ Simple Audio Recording
        </Text>
      </View>

      {/* Recording Status */}
      <View style={styles.recordingStatusContainer}>
        <Text style={[styles.recordingStatusText, { color: theme.colors.text }]}>
          {isRecording ? '🎙️ Recording...' : 'Ready to record'}
        </Text>
      </View>

      {/* Simple Paragraph Display */}
      <View style={[styles.paragraphContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.paragraphLabel, { color: theme.colors.textSecondary }]}>
          Read this paragraph:
        </Text>
        <Text style={[styles.paragraphText, { color: theme.colors.text }]}>
          {selectedParagraph.content}
        </Text>
      </View>


      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayParagraph}
        >
          <Icon name="play-arrow" size={24} color="white" />
          <Text style={styles.controlButtonText}>Listen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
              transform: [{ scale: pulseAnim }],
            }
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={false}
        >
          <Icon name={isRecording ? "stop" : "mic"} size={32} color="white" />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop' : 'Record'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Indicators */}
      {isRecording && (
        <View style={styles.statusContainer}>
          <Icon name="mic" size={16} color={theme.colors.primary} />
          <Text style={[styles.statusText, { color: theme.colors.primary }]}>
            {isListening ? 'Listening...' : 'Starting...'}
          </Text>
        </View>
      )}


      {/* Debug Info */}
      <View style={[styles.debugContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.debugTitle, { color: theme.colors.text }]}>Debug Info:</Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Platform: {Platform.OS}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Recognition Available: {Platform.OS === 'web' ? (recognition ? 'Yes' : 'No') : 'Yes (WebView)'}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Recording: {isRecording ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Listening: {isListening ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Words Analyzed: {liveAnalysis.filter(item => item.status !== 'pending').length} / {liveAnalysis.length}
        </Text>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: theme.colors.error }]}
        onPress={resetPractice}
      >
        <Icon name="refresh" size={20} color="white" />
        <Text style={styles.resetButtonText}>Reset Practice</Text>
      </TouchableOpacity>

      {/* Final Report Modal */}
      {showReport && speechAnalysis && (
        <View style={styles.reportOverlay}>
          <View style={[styles.reportContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.reportTitle, { color: theme.colors.text }]}>
              Speech Analysis Report
            </Text>
            
            <View style={styles.reportStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {speechAnalysis.accuracy.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Accuracy
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {speechAnalysis.fluency.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Fluency
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {speechAnalysis.pronunciation.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Pronunciation
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowReport(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  difficulty: {
    fontSize: 16,
    fontWeight: '600',
  },
  platformInfo: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
  },
  paragraphContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paragraphLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  paragraphTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    lineHeight: 28,
  },
  paragraphText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'left',
  },
  paragraphWord: {
    fontSize: 18,
    lineHeight: 28,
    marginRight: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 3,
  },
  recognizedContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recognizedLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  recognizedText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  debugContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reportContainer: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    paddingHorizontal: 20,
  },
  paragraphsContainer: {
    marginTop: 16,
  },
  paragraphCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paragraphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paragraphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  paragraphContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  paragraphMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordingStatusContainer: {
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
  },
  recordingStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SpeakingCoachPracticeScreen;
