import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SentenceData {
  id: string;
  sentence: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
}

const SentenceBuilderManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [newSentence, setNewSentence] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newCategory, setNewCategory] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  useEffect(() => {
    loadSentences();
  }, []);

  const loadSentences = async () => {
    try {
      const stored = await AsyncStorage.getItem('sentenceBuilderData');
      if (stored) {
        setSentences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading sentences:', error);
    }
  };

  const saveSentences = async (updatedSentences: SentenceData[]) => {
    try {
      await AsyncStorage.setItem('sentenceBuilderData', JSON.stringify(updatedSentences));
      setSentences(updatedSentences);
    } catch (error) {
      console.error('Error saving sentences:', error);
    }
  };

  const handleAddSentence = () => {
    if (!newSentence.trim()) {
      Alert.alert('Error', 'Please enter a sentence');
      return;
    }

    const sentence: SentenceData = {
      id: Date.now().toString(),
      sentence: newSentence.trim(),
      difficulty: newDifficulty,
      category: newCategory.trim() || 'General',
      createdAt: new Date().toISOString(),
    };

    const updatedSentences = [...sentences, sentence];
    saveSentences(updatedSentences);
    
    setNewSentence('');
    setNewCategory('');
    setNewDifficulty('easy');
    
    Alert.alert('Success', 'Sentence added successfully!');
  };

  const handleDeleteSentence = (id: string) => {
    Alert.alert(
      'Delete Sentence',
      'Are you sure you want to delete this sentence?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedSentences = sentences.filter(s => s.id !== id);
            saveSentences(updatedSentences);
          }
        }
      ]
    );
  };

  const pickCsvFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        
        // Read file content
        const response = await fetch(file.uri);
        const text = await response.text();
        
        parseCsvFromText(text);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const parseCsvFromText = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      const newSentences: SentenceData[] = [];
      
      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('sentence') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle commas within quotes)
        const parts = parseCsvLine(line);
        if (parts.length >= 2) {
          const sentence: SentenceData = {
            id: `csv_${Date.now()}_${i}`,
            sentence: parts[0].replace(/"/g, '').trim(),
            difficulty: (parts[1].replace(/"/g, '').trim() as 'easy' | 'medium' | 'hard') || 'easy',
            category: parts[2] ? parts[2].replace(/"/g, '').trim() : 'General',
            createdAt: new Date().toISOString(),
          };
          newSentences.push(sentence);
        }
      }

      if (newSentences.length > 0) {
        const updatedSentences = [...sentences, ...newSentences];
        saveSentences(updatedSentences);
        Alert.alert('Success', `${newSentences.length} sentences imported successfully from file!`);
      } else {
        Alert.alert('Error', 'No valid sentences found in the CSV file');
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      Alert.alert('Error', 'Invalid CSV format. Please check your file.');
    }
  };

  const parseCsvLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const parseCsvContent = () => {
    if (!csvContent.trim()) {
      Alert.alert('Error', 'Please enter CSV content');
      return;
    }

    parseCsvFromText(csvContent);
    setCsvContent('');
    setShowCsvUpload(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderSentenceItem = (sentence: SentenceData) => (
    <View key={sentence.id} style={[styles.sentenceItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sentenceContent}>
        <Text style={[styles.sentenceText, { color: theme.colors.text }]}>
          {sentence.sentence}
        </Text>
        <View style={styles.sentenceMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(sentence.difficulty) }]}>
            <Text style={styles.difficultyText}>{sentence.difficulty}</Text>
          </View>
          <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
            {sentence.category}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSentence(sentence.id)}
      >
        <Icon name="delete" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  const renderCsvUploadModal = () => (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            📁 Upload CSV File
          </Text>
          <TouchableOpacity
            onPress={() => setShowCsvUpload(false)}
            style={styles.closeButton}
          >
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.csvInstructions}>
          <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
            CSV Format Instructions:
          </Text>
          <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
            • Column 1: Sentence text{'\n'}
            • Column 2: Difficulty (easy/medium/hard){'\n'}
            • Column 3: Category (optional){'\n\n'}
            Example:{'\n'}
            "The cat is sleeping on the mat",easy,Animals{'\n'}
            "She will be studying tomorrow",medium,Grammar{'\n'}
            "Complex sentences require careful analysis",hard,Advanced
          </Text>
        </View>
        
        <TextInput
          style={[styles.csvInput, { 
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border
          }]}
          placeholder="Paste your CSV content here..."
          placeholderTextColor={theme.colors.textSecondary}
          value={csvContent}
          onChangeText={setCsvContent}
          multiline
          numberOfLines={10}
        />
        
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
            onPress={() => setShowCsvUpload(false)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
            onPress={parseCsvContent}
          >
            <Text style={styles.buttonText}>Upload CSV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sentence Builder Management</Text>
            <Text style={styles.headerSubtitle}>Manage sentences for the Sentence Builder game</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Add New Sentence */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ➕ Add New Sentence
          </Text>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            placeholder="Enter a sentence..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newSentence}
            onChangeText={setNewSentence}
            multiline
          />
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Difficulty:</Text>
              <View style={styles.difficultyButtons}>
                {['easy', 'medium', 'hard'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      { 
                        backgroundColor: newDifficulty === level ? getDifficultyColor(level) : theme.colors.border
                      }
                    ]}
                    onPress={() => setNewDifficulty(level as any)}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      { color: newDifficulty === level ? 'white' : theme.colors.text }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            placeholder="Category (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newCategory}
            onChangeText={setNewCategory}
          />
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddSentence}
          >
            <Text style={styles.addButtonText}>Add Sentence</Text>
          </TouchableOpacity>
        </View>

        {/* CSV Upload */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📁 Bulk Upload (CSV)
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Upload multiple sentences at once using CSV format
          </Text>
          
          <View style={styles.csvButtons}>
            <TouchableOpacity
              style={[styles.csvButton, { backgroundColor: '#4CAF50' }]}
              onPress={pickCsvFile}
            >
              <Icon name="folder-open" size={20} color="white" />
              <Text style={styles.csvButtonText}>Select CSV File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.csvButton, { backgroundColor: '#2196F3' }]}
              onPress={() => setShowCsvUpload(true)}
            >
              <Icon name="text-fields" size={20} color="white" />
              <Text style={styles.csvButtonText}>Paste CSV Text</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sentences List */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📝 Sentences ({sentences.length})
            </Text>
            <Text style={[styles.listSubtitle, { color: theme.colors.textSecondary }]}>
              These sentences will be used in the Sentence Builder game
            </Text>
          </View>
          
          {sentences.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="sentiment-dissatisfied" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No sentences added yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Add sentences manually or upload a CSV file
              </Text>
            </View>
          ) : (
            sentences.map(renderSentenceItem)
          )}
        </View>
      </ScrollView>

      {/* CSV Upload Modal */}
      {showCsvUpload && renderCsvUploadModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  csvButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  csvButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  csvButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listHeader: {
    marginBottom: 16,
  },
  listSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  sentenceItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  sentenceContent: {
    flex: 1,
  },
  sentenceText: {
    fontSize: 16,
    marginBottom: 8,
  },
  sentenceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  csvInstructions: {
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  csvInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SentenceBuilderManagementScreen;
