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

interface GrammarGuruManagementScreenProps {
  navigation: any;
  route?: {
    params: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

interface GrammarRule {
  id: string;
  title: string;
  description: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'tenses' | 'parts-of-speech' | 'sentence-structure' | 'punctuation';
  notes: string;
  videos: Video[];
  quizzes: Quiz[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
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

const GrammarGuruManagementScreen: React.FC<GrammarGuruManagementScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [newRule, setNewRule] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: 'tenses' as 'tenses' | 'parts-of-speech' | 'sentence-structure' | 'punctuation',
    notes: ''
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: 0
  });
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    questions: 0,
    duration: 0
  });

  // Sample data
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([
    {
      id: '1',
      title: 'Present Simple Tense',
      description: 'Learn when and how to use present simple tense',
      examples: ['I play football', 'She works in an office', 'They live in London'],
      difficulty: 'beginner',
      category: 'tenses',
      notes: 'Use for habits, routines, and general truths',
      videos: [
        { id: '1', title: 'Present Simple Basics', url: '', duration: 300, thumbnail: '' }
      ],
      quizzes: [
        { id: '1', title: 'Present Simple Quiz', questions: 15, duration: 20 }
      ],
      createdAt: '2024-01-10',
      status: 'published'
    },
    {
      id: '2',
      title: 'Past Perfect Tense',
      description: 'Understanding past perfect tense usage',
      examples: ['I had finished my homework', 'She had already left'],
      difficulty: 'intermediate',
      category: 'tenses',
      notes: 'Use to show an action completed before another past action',
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
        title: 'Grammar Guru - Kids',
        subtitle: 'Manage grammar rules for children',
        color: ['#ff6b6b', '#ee5a52'],
        icon: 'child-care'
      },
      teens: {
        title: 'Grammar Guru - Teens',
        subtitle: 'Manage grammar rules for teenagers',
        color: ['#4ecdc4', '#45b7d1'],
        icon: 'teenager'
      },
      adults: {
        title: 'Grammar Guru - Adults',
        subtitle: 'Manage grammar rules for adults',
        color: ['#667eea', '#764ba2'],
        icon: 'person'
      },
      business: {
        title: 'Grammar Guru - Business',
        subtitle: 'Manage business grammar rules',
        color: ['#2c3e50', '#34495e'],
        icon: 'business-center'
      }
    };
    
    return configs[dashboardType as keyof typeof configs] || configs.children;
  };

  const config = getDashboardConfig();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tenses': return '#4ecdc4';
      case 'parts-of-speech': return '#45b7d1';
      case 'sentence-structure': return '#9b59b6';
      case 'punctuation': return '#f39c12';
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

  const renderRuleCard = ({ item }: { item: GrammarRule }) => {
    return (
      <TouchableOpacity
        style={[styles.ruleCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          setSelectedRule(item);
          // Navigate to rule detail screen
          navigation.navigate('GrammarRuleDetail', {
            ruleId: item.id,
            dashboardType,
            ageRange
          });
        }}
      >
        <View style={styles.ruleHeader}>
          <View style={styles.ruleInfo}>
            <Text style={[styles.ruleTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.ruleDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.ruleBadges}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.badgeText}>{item.difficulty}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.ruleExamples}>
          <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>Examples:</Text>
          {Array.isArray(item.examples) ? item.examples.slice(0, 2).map((example, index) => (
            <Text key={index} style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
              • {example}
            </Text>
          )) : null}
          {Array.isArray(item.examples) && item.examples.length > 2 && (
            <Text style={[styles.moreExamples, { color: theme.colors.primary }]}>
              +{Array.isArray(item.examples) ? item.examples.length - 2 : 0} more examples
            </Text>
          )}
        </View>
        
        <View style={styles.ruleStats}>
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
          <View style={styles.statItem}>
            <MaterialIcons name="notes" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {item.notes ? 'Has Notes' : 'No Notes'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRulesList = () => {
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
          Grammar Rules ({grammarRules.length})
        </Text>
        <FlatList
          data={grammarRules}
          renderItem={renderRuleCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.rulesList}
        />
      </Animated.View>
    );
  };

  const renderAddRuleModal = () => {
    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Grammar Rule</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Rule title (e.g., Present Simple Tense)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newRule.title}
              onChangeText={(text) => setNewRule({...newRule, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Rule description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newRule.description}
              onChangeText={(text) => setNewRule({...newRule, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.selectorRow}>
              <View style={styles.selector}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>Category:</Text>
                <View style={styles.selectorOptions}>
                  {['tenses', 'parts-of-speech', 'sentence-structure', 'punctuation'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.selectorOption,
                        { 
                          backgroundColor: newRule.category === category ? config.color[0] : theme.colors.background,
                          borderColor: config.color[0]
                        }
                      ]}
                      onPress={() => setNewRule({...newRule, category: category as any})}
                    >
                      <Text style={[
                        styles.selectorOptionText,
                        { 
                          color: newRule.category === category ? 'white' : theme.colors.text 
                        }
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
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
                          backgroundColor: newRule.difficulty === level ? config.color[0] : theme.colors.background,
                          borderColor: config.color[0]
                        }
                      ]}
                      onPress={() => setNewRule({...newRule, difficulty: level as any})}
                    >
                      <Text style={[
                        styles.selectorOptionText,
                        { 
                          color: newRule.difficulty === level ? 'white' : theme.colors.text 
                        }
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Additional notes (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newRule.notes}
              onChangeText={(text) => setNewRule({...newRule, notes: text})}
              multiline
              numberOfLines={2}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: config.color[0] }]}
                onPress={handleSaveRule}
              >
                <Text style={styles.saveButtonText}>Create Rule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSaveRule = () => {
    if (!newRule.title.trim()) {
      Alert.alert('Error', 'Please enter a rule title');
      return;
    }

    const rule: GrammarRule = {
      id: Date.now().toString(),
      title: newRule.title,
      description: newRule.description,
      examples: [],
      difficulty: newRule.difficulty,
      category: newRule.category,
      notes: newRule.notes,
      videos: [],
      quizzes: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft'
    };

    setGrammarRules([...grammarRules, rule]);
    setNewRule({ title: '', description: '', difficulty: 'beginner', category: 'tenses', notes: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'Grammar rule created successfully!');
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
        {renderRulesList()}
      </ScrollView>
      {renderAddRuleModal()}
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
  rulesList: {
    paddingBottom: 20,
  },
  ruleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
    marginRight: 12,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ruleBadges: {
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
  ruleExamples: {
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 2,
  },
  moreExamples: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
  },
  ruleStats: {
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
});

export default GrammarGuruManagementScreen;

