import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface VocabularyVaultManagementScreenProps {
  navigation: any;
  route?: {
    params: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

interface VocabularySet {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'intermediate' | 'advanced' | 'business' | 'academic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  words: VocabularyWord[];
  videos: Video[];
  quizzes: Quiz[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  pronunciation: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  image?: string;
  audio?: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnail: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  duration: number;
}

const VocabularyVaultManagementScreen: React.FC<VocabularyVaultManagementScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [newSet, setNewSet] = useState({
    title: '',
    description: '',
    category: 'basic' as 'basic' | 'intermediate' | 'advanced' | 'business' | 'academic',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [newWord, setNewWord] = useState({
    word: '',
    definition: '',
    pronunciation: '',
    example: '',
    synonyms: '',
    antonyms: ''
  });

  // Sample data
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([
    {
      id: '1',
      title: 'Basic Colors',
      description: 'Learn basic color vocabulary',
      category: 'basic',
      difficulty: 'beginner',
      words: [
        {
          id: '1',
          word: 'Red',
          definition: 'A color like that of blood',
          pronunciation: '/red/',
          example: 'The apple is red',
          synonyms: ['crimson', 'scarlet'],
          antonyms: ['blue', 'green']
        },
        {
          id: '2',
          word: 'Blue',
          definition: 'A color like that of the sky',
          pronunciation: '/bluː/',
          example: 'The sky is blue',
          synonyms: ['azure', 'navy'],
          antonyms: ['red', 'orange']
        }
      ],
      videos: [
        { id: '1', title: 'Colors Song', url: '', duration: 180, thumbnail: '' }
      ],
      quizzes: [
        { id: '1', title: 'Colors Quiz', questions: 10, duration: 15 }
      ],
      createdAt: '2024-01-10',
      status: 'published'
    },
    {
      id: '2',
      title: 'Business Terms',
      description: 'Essential business vocabulary',
      category: 'business',
      difficulty: 'intermediate',
      words: [],
      videos: [],
      quizzes: [],
      createdAt: '2024-01-12',
      status: 'draft'
    }
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDashboardConfig = () => {
    const configs = {
      children: {
        title: 'Vocabulary Vault - Kids',
        subtitle: 'Manage vocabulary for children',
        color: ['#ff6b6b', '#ee5a52'],
        icon: 'child-care'
      },
      teens: {
        title: 'Vocabulary Vault - Teens',
        subtitle: 'Manage vocabulary for teenagers',
        color: ['#4ecdc4', '#45b7d1'],
        icon: 'teenager'
      },
      adults: {
        title: 'Vocabulary Vault - Adults',
        subtitle: 'Manage vocabulary for adults',
        color: ['#667eea', '#764ba2'],
        icon: 'person'
      },
      business: {
        title: 'Vocabulary Vault - Business',
        subtitle: 'Manage business vocabulary',
        color: ['#2c3e50', '#34495e'],
        icon: 'business-center'
      }
    };
    
    return configs[dashboardType as keyof typeof configs] || configs.children;
  };

  const config = getDashboardConfig();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return '#4ecdc4';
      case 'intermediate': return '#45b7d1';
      case 'advanced': return '#9b59b6';
      case 'business': return '#f39c12';
      case 'academic': return '#e74c3c';
      default: return '#4ecdc4';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4ecdc4';
      case 'intermediate': return '#f39c12';
      case 'advanced': return '#e74c3c';
      default: return '#4ecdc4';
    }
  };

  const renderHeader = () => {
    return (
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={config.color}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{config.title}</Text>
                <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSetCard = ({ item }: { item: VocabularySet }) => {
    return (
      <TouchableOpacity
        style={[styles.setCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          setSelectedSet(item);
          setShowWordModal(true);
        }}
      >
        <View style={styles.setHeader}>
          <View style={styles.setInfo}>
            <Text style={[styles.setTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.setDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.setBadges}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.badgeText}>{item.difficulty}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.setWords}>
          <Text style={[styles.wordsTitle, { color: theme.colors.text }]}>Words ({Array.isArray(item.words) ? item.words.length : 0}):</Text>
          {Array.isArray(item.words) ? item.words.slice(0, 3).map((word, index) => (
            <Text key={index} style={[styles.wordText, { color: theme.colors.textSecondary }]}>
              • {word.word} - {word.definition}
            </Text>
          )) : null}
          {Array.isArray(item.words) && item.words.length > 3 && (
            <Text style={[styles.moreWords, { color: theme.colors.primary }]}>
              +{Array.isArray(item.words) ? item.words.length - 3 : 0} more words
            </Text>
          )}
        </View>
        
        <View style={styles.setStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="book" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {item.words.length} Words
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="video-library" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {item.videos.length} Videos
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="quiz" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {item.quizzes.length} Quizzes
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSetsList = () => {
    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Vocabulary Sets ({vocabularySets.length})
        </Text>
        <FlatList
          data={vocabularySets}
          renderItem={renderSetCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.setsList}
        />
      </Animated.View>
    );
  };

  const renderAddSetModal = () => {
    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Vocabulary Set</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Set title (e.g., Basic Colors)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newSet.title}
              onChangeText={(text) => setNewSet({...newSet, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Set description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newSet.description}
              onChangeText={(text) => setNewSet({...newSet, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.selectorRow}>
              <View style={styles.selector}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Category:</Text>
                <View style={styles.selectorOptions}>
                  {['basic', 'intermediate', 'advanced', 'business', 'academic'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.selectorOption,
                        { 
                          backgroundColor: newSet.category === category ? config.color[0] : theme.colors.background,
                          borderColor: config.color[0]
                        }
                      ]}
                      onPress={() => setNewSet({...newSet, category: category as any})}
                    >
                      <Text style={[
                        styles.selectorOptionText,
                        { 
                          color: newSet.category === category ? 'white' : theme.colors.text 
                        }
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.selector}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Difficulty:</Text>
                <View style={styles.selectorOptions}>
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.selectorOption,
                        { 
                          backgroundColor: newSet.difficulty === level ? config.color[0] : theme.colors.background,
                          borderColor: config.color[0]
                        }
                      ]}
                      onPress={() => setNewSet({...newSet, difficulty: level as any})}
                    >
                      <Text style={[
                        styles.selectorOptionText,
                        { 
                          color: newSet.difficulty === level ? 'white' : theme.colors.text 
                        }
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: config.color[0] }]}
                onPress={handleSaveSet}
              >
                <Text style={styles.saveButtonText}>Create Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderWordModal = () => {
    if (!selectedSet) return null;

    return (
      <Modal
        visible={showWordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedSet.title} - Words
            </Text>
            
            <ScrollView style={styles.wordsList}>
              {selectedSet.words.map((word) => (
                <TouchableOpacity
                  key={word.id}
                  style={[styles.wordCard, { backgroundColor: theme.colors.background }]}
                  onPress={() => {
                    // Navigate to word detail screen
                    navigation.navigate('WordDetail', {
                      wordId: word.id,
                      setId: selectedSet.id,
                      dashboardType,
                      ageRange
                    });
                  }}
                >
                  <View style={styles.wordInfo}>
                    <Text style={[styles.wordTitle, { color: theme.colors.text }]}>{word.word}</Text>
                    <Text style={[styles.wordDefinition, { color: theme.colors.textSecondary }]}>
                      {word.definition}
                    </Text>
                    <Text style={[styles.wordExample, { color: theme.colors.textSecondary }]}>
                      Example: {word.example}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.addWordButton, { backgroundColor: config.color[0] }]}
              onPress={() => {
                setShowWordModal(false);
                // Navigate to add word screen
                navigation.navigate('AddWord', {
                  setId: selectedSet.id,
                  dashboardType,
                  ageRange
                });
              }}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addWordText}>Add Word</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowWordModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSaveSet = () => {
    if (!newSet.title.trim()) {
      Alert.alert('Error', 'Please enter a set title');
      return;
    }

    const set: VocabularySet = {
      id: Date.now().toString(),
      title: newSet.title,
      description: newSet.description,
      category: newSet.category,
      difficulty: newSet.difficulty,
      words: [],
      videos: [],
      quizzes: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft'
    };

    setVocabularySets([...vocabularySets, set]);
    setNewSet({ title: '', description: '', category: 'basic', difficulty: 'beginner' });
    setShowAddModal(false);
    Alert.alert('Success', 'Vocabulary set created successfully!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={config.color[0]} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderSetsList()}
      </ScrollView>
      {renderAddSetModal()}
      {renderWordModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  setsList: {
    paddingBottom: 20,
  },
  setCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  setInfo: {
    flex: 1,
    marginRight: 12,
  },
  setTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  setDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  setBadges: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  setWords: {
    marginBottom: 12,
  },
  wordsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  wordText: {
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 2,
  },
  moreWords: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
  },
  setStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selector: {
    flex: 1,
    marginHorizontal: 4,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectorOption: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    margin: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  selectorOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  wordsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  wordInfo: {
    flex: 1,
  },
  wordTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  wordDefinition: {
    fontSize: 14,
    marginBottom: 2,
  },
  wordExample: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addWordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addWordText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VocabularyVaultManagementScreen;

