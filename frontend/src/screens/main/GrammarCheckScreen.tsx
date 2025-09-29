import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch } from '../../hooks/redux';
import apiService from '../../services/api';
import { GrammarCheckResponse } from '../../types';

export default function GrammarCheckScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<GrammarCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('');

  const handleGrammarCheck = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to check');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.checkGrammar(inputText, context);
      if (response.success) {
        setResult(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to check grammar');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check grammar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setContext('');
  };

  const handleUseCorrected = () => {
    if (result) {
      setInputText(result.correctedText);
      setResult(null);
    }
  };

  const renderInputSection = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Enter Text to Check
        </Text>
        
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={6}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type or paste your text here for grammar checking..."
          style={styles.textInput}
        />
        
        <TextInput
          mode="outlined"
          value={context}
          onChangeText={setContext}
          placeholder="Context (optional) - e.g., 'formal email', 'academic essay'"
          style={styles.contextInput}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleClear}
            icon="clear"
            style={styles.button}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={handleGrammarCheck}
            disabled={isLoading || !inputText.trim()}
            icon="spell-check"
            style={styles.button}
          >
            {isLoading ? 'Checking...' : 'Check Grammar'}
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
              Grammar Check Results
            </Text>
            <View style={styles.scoreContainer}>
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

          <Divider style={styles.divider} />

          {/* Corrected Text */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              Corrected Text:
            </Text>
            <Text variant="bodyMedium" style={styles.correctedText}>
              {result.correctedText}
            </Text>
            <Button
              mode="text"
              onPress={handleUseCorrected}
              icon="content-copy"
              style={styles.useButton}
            >
              Use This Text
            </Button>
          </View>

          {/* Corrections */}
          {result.corrections.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 12 }}>
                Corrections ({result.corrections.length}):
              </Text>
              {result.corrections.map((correction, index) => (
                <View key={index} style={styles.correctionItem}>
                  <View style={styles.correctionHeader}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.correctionType, { borderColor: theme.colors.error }]}
                      textStyle={{ color: theme.colors.error, fontSize: 10 }}
                    >
                      {correction.type}
                    </Chip>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {Math.round(correction.confidence * 100)}% confidence
                    </Text>
                  </View>
                  <View style={styles.correctionContent}>
                    <Text variant="bodySmall" style={styles.correctionText}>
                      <Text style={{ color: theme.colors.error, textDecorationLine: 'line-through' }}>
                        {correction.original}
                      </Text>
                      {' → '}
                      <Text style={{ color: theme.colors.tertiary, fontWeight: '600' }}>
                        {correction.suggestion}
                      </Text>
                    </Text>
                    {correction.explanation && (
                      <Text variant="bodySmall" style={[styles.explanation, { color: theme.colors.onSurfaceVariant }]}>
                        {correction.explanation}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 12 }}>
                Suggestions:
              </Text>
              {result.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <View style={styles.suggestionHeader}>
                    <Icon name="lightbulb" size={16} color={theme.colors.secondary} />
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.suggestionType, { borderColor: theme.colors.secondary }]}
                      textStyle={{ color: theme.colors.secondary, fontSize: 10 }}
                    >
                      {suggestion.type}
                    </Chip>
                  </View>
                  <Text variant="bodySmall" style={styles.suggestionText}>
                    {suggestion.suggestion}
                  </Text>
                  {suggestion.explanation && (
                    <Text variant="bodySmall" style={[styles.explanation, { color: theme.colors.onSurfaceVariant }]}>
                      {suggestion.explanation}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Readability Score */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              Readability Analysis:
            </Text>
            <View style={styles.readabilityContainer}>
              <View style={styles.readabilityItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Readability Score:
                </Text>
                <Text variant="bodyMedium" style={{ 
                  fontWeight: '600',
                  color: result.readabilityScore >= 70 ? theme.colors.tertiary : 
                         result.readabilityScore >= 50 ? theme.colors.secondary : theme.colors.error
                }}>
                  {result.readabilityScore}/100
                </Text>
              </View>
              <Text variant="bodySmall" style={[styles.readabilityNote, { color: theme.colors.onSurfaceVariant }]}>
                {result.readabilityScore >= 70 ? 'Easy to read' : 
                 result.readabilityScore >= 50 ? 'Moderately readable' : 'Difficult to read'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTips = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Grammar Check Tips
        </Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color={theme.colors.tertiary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Check for subject-verb agreement
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color={theme.colors.tertiary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Verify proper punctuation usage
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color={theme.colors.tertiary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Ensure correct tense consistency
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color={theme.colors.tertiary} />
            <Text variant="bodySmall" style={styles.tipText}>
              Review sentence structure
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
            Grammar Check
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Get instant grammar corrections and suggestions
          </Text>
        </View>

        {/* Input Section */}
        {renderInputSection()}

        {/* Results */}
        {renderResults()}

        {/* Tips */}
        {renderTips()}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
              Analyzing your text...
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
    marginBottom: 12,
  },
  contextInput: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  divider: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  correctedText: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    lineHeight: 20,
  },
  useButton: {
    alignSelf: 'flex-start',
  },
  correctionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  correctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  correctionType: {
    alignSelf: 'flex-start',
  },
  correctionContent: {
    marginTop: 4,
  },
  correctionText: {
    lineHeight: 18,
  },
  explanation: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  suggestionItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionType: {
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    lineHeight: 18,
  },
  readabilityContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  readabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  readabilityNote: {
    fontStyle: 'italic',
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



