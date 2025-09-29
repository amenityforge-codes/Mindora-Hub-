import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { simpleSpeechService } from '../../services/simpleSpeechService';
import { aiAnalysisService } from '../../services/aiAnalysisService';

export default function SimpleTestScreen() {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string>('');

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setResult('Recording... (Mock)');
      await simpleSpeechService.startRecording();
    } catch (error) {
      console.error('Recording failed:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsAnalyzing(true);
      setResult('Analyzing...');
      
      const transcribedText = await simpleSpeechService.stopRecording();
      if (transcribedText) {
        setResult(`Transcribed: ${transcribedText}`);
        
        // Test AI analysis
        const analysis = await aiAnalysisService.analyzeText({
          text: transcribedText,
          type: 'speaking'
        });
        
        setResult(`Analysis Score: ${analysis.score}%\nFeedback: ${analysis.feedback}`);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze speech');
      setResult('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testSpeech = () => {
    simpleSpeechService.speak('Hello, this is a test of the simple speech service');
  };

  const testAPI = async () => {
    try {
      setIsAnalyzing(true);
      setResult('Testing API...');
      
      const analysis = await aiAnalysisService.analyzeText({
        text: 'Hello, this is a test of the AI analysis service',
        type: 'speaking'
      });
      
      setResult(`API Test Successful!\nScore: ${analysis.score}%\nFeedback: ${analysis.feedback}`);
    } catch (error) {
      console.error('API test failed:', error);
      setResult(`API Test Failed: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Simple Test Screen
        </Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Speech & AI Test
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                style={styles.button}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording (Mock)'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={testSpeech}
                style={styles.button}
              >
                Test Speech
              </Button>
              
              <Button
                mode="outlined"
                onPress={testAPI}
                disabled={isAnalyzing}
                style={styles.button}
              >
                Test AI API
              </Button>
            </View>
            
            {isAnalyzing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}
            
            {result ? (
              <View style={styles.resultContainer}>
                <Text variant="bodyMedium" style={styles.resultText}>
                  {result}
                </Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  resultText: {
    lineHeight: 20,
  },
  backButton: {
    marginTop: 'auto',
  },
});






