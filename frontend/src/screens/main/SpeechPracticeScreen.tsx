import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  ActivityIndicator,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch } from '../../hooks/redux';
import apiService from '../../services/api';
import { SpeechFeedbackResponse } from '../../types';

export default function SpeechPracticeScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [targetText, setTargetText] = useState('');
  const [result, setResult] = useState<SpeechFeedbackResponse | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    console.log('Stopping recording..');
    setIsRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recordingRef.current.getURI();
    setAudioUri(uri);
    setRecording(null);
    recordingRef.current = null;
    console.log('Recording stopped and stored at', uri);
  };

  const analyzeSpeech = async () => {
    if (!audioUri) {
      Alert.alert('Error', 'Please record some audio first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiService.analyzeSpeech(audioUri, targetText);
      if (response.success) {
        setResult(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to analyze speech');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze speech. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setAudioUri(null);
    setTargetText('');
  };

  const renderTargetTextInput = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Target Text (Optional)
        </Text>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={4}
          value={targetText}
          onChangeText={setTargetText}
          placeholder="Enter the text you want to practice speaking (optional)..."
          style={styles.textInput}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          If provided, the AI will compare your speech with this target text for better feedback.
        </Text>
      </Card.Content>
    </Card>
  );

  const renderRecordingSection = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Record Your Speech
        </Text>
        
        <View style={styles.recordingContainer}>
          <View style={styles.recordingButtonContainer}>
            <Button
              mode={isRecording ? 'contained' : 'outlined'}
              onPress={isRecording ? stopRecording : startRecording}
              icon={isRecording ? 'stop' : 'mic'}
              style={[
                styles.recordingButton,
                isRecording && { backgroundColor: theme.colors.error }
              ]}
              contentStyle={styles.recordingButtonContent}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </View>
          
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={[styles.recordingDot, { backgroundColor: theme.colors.error }]} />
              <Text variant="bodyMedium" style={{ color: theme.colors.error, marginLeft: 8 }}>
                Recording...
              </Text>
            </View>
          )}
          
          {audioUri && !isRecording && (
            <View style={styles.audioInfo}>
              <Icon name="audiotrack" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={{ marginLeft: 8, color: theme.colors.primary }}>
                Audio recorded successfully
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.recordingActions}>
          <Button
            mode="outlined"
            onPress={clearResults}
            icon="clear"
            style={styles.actionButton}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={analyzeSpeech}
            disabled={!audioUri || isAnalyzing}
            icon="analytics"
            style={styles.actionButton}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Speech'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              Speech Analysis Results
            </Text>
            <View style={styles.overallScoreContainer}>
              <Text variant="headlineSmall" style={{ 
                fontWeight: 'bold', 
                color: result.overallScore >= 80 ? theme.colors.tertiary : 
                       result.overallScore >= 60 ? theme.colors.secondary : theme.colors.error 
              }}>
                {result.overallScore}%
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Overall Score
              </Text>
            </View>
          </View>

          {/* Transcript */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              What You Said:
            </Text>
            <Text variant="bodyMedium" style={styles.transcriptText}>
              {result.transcript}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Accuracy: {Math.round(result.accuracy * 100)}%
            </Text>
          </View>

          {/* Fluency */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              Fluency Score: {result.fluency.score}/100
            </Text>
            <ProgressBar
              progress={result.fluency.score / 100}
              color={result.fluency.score >= 70 ? theme.colors.tertiary : 
                     result.fluency.score >= 50 ? theme.colors.secondary : theme.colors.error}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {result.fluency.feedback}
            </Text>
          </View>

          {/* Pronunciation */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              Pronunciation Score: {result.pronunciation.score}/100
            </Text>
            <ProgressBar
              progress={result.pronunciation.score / 100}
              color={result.pronunciation.score >= 70 ? theme.colors.tertiary : 
                     result.pronunciation.score >= 50 ? theme.colors.secondary : theme.colors.error}
              style={styles.progressBar}
            />
            
            {result.pronunciation.issues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text variant="bodySmall" style={{ fontWeight: '600', marginBottom: 8 }}>
                  Pronunciation Issues:
                </Text>
                {result.pronunciation.issues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.issueChip, { borderColor: theme.colors.error }]}
                      textStyle={{ color: theme.colors.error, fontSize: 10 }}
                    >
                      {issue.word}
                    </Chip>
                    <Text variant="bodySmall" style={styles.issueText}>
                      {issue.issue}
                    </Text>
                    <Text variant="bodySmall" style={[styles.suggestionText, { color: theme.colors.tertiary }]}>
                      Suggestion: {issue.suggestion}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Grammar */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              Grammar Score: {result.grammar.score}/100
            </Text>
            <ProgressBar
              progress={result.grammar.score / 100}
              color={result.grammar.score >= 70 ? theme.colors.tertiary : 
                     result.grammar.score >= 50 ? theme.colors.secondary : theme.colors.error}
              style={styles.progressBar}
            />
          </View>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 12 }}>
                Improvement Suggestions:
              </Text>
              {result.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Icon name="lightbulb" size={16} color={theme.colors.secondary} />
                  <Text variant="bodySmall" style={styles.suggestionText}>
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderTips = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Speech Practice Tips
        </Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Icon name="mic" size={20} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Speak clearly and at a moderate pace
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="volume-up" size={20} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Practice pronunciation of difficult words
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="timer" size={20} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Take pauses between sentences
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="repeat" size={20} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Practice regularly for better results
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Speech Practice
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Practice your pronunciation and get AI feedback
          </Text>
        </View>

        {/* Target Text Input */}
        {renderTargetTextInput()}

        {/* Recording Section */}
        {renderRecordingSection()}

        {/* Results */}
        {renderResults()}

        {/* Tips */}
        {renderTips()}

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
              Analyzing your speech...
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
    padding: 16,
    paddingBottom: 8,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  textInput: {
    marginBottom: 8,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingButtonContainer: {
    marginBottom: 16,
  },
  recordingButton: {
    minWidth: 200,
  },
  recordingButtonContent: {
    paddingVertical: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    animation: 'pulse',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallScoreContainer: {
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  transcriptText: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  issuesContainer: {
    marginTop: 12,
  },
  issueItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  issueChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  issueText: {
    marginBottom: 4,
  },
  suggestionText: {
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});



