import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SentenceData {
  id: string;
  sentence: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
}

interface GameState {
  currentSentence: SentenceData | null;
  jumbledWords: string[];
  selectedWords: string[];
  correctOrder: string[];
  score: number;
  level: number;
  streak: number;
  timeLeft: number;
  isCompleted: boolean;
}

const SentenceBuilderGameScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentSentence: null,
    jumbledWords: [],
    selectedWords: [],
    correctOrder: [],
    score: 0,
    level: 1,
    streak: 0,
    timeLeft: 0, // No time limit
    isCompleted: false,
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [grammarAnalysis, setGrammarAnalysis] = useState<any>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSentences();
    animateIn();
  }, []);

  // No timer logic needed - removed time limit

  const animateIn = () => {
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
  };

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

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    const filteredSentences = selectedDifficulty === 'all' 
      ? sentences 
      : sentences.filter(s => s.difficulty === selectedDifficulty);
    
    if (filteredSentences.length === 0) {
      Alert.alert('No Sentences', 'No sentences available for the selected difficulty. Please add some sentences first.');
      return;
    }

    const randomSentence = filteredSentences[Math.floor(Math.random() * filteredSentences.length)];
    const words = randomSentence.sentence.split(' ').filter(word => word.trim() !== '');
    const jumbledWords = shuffleArray(words);

    setGameState({
      currentSentence: randomSentence,
      jumbledWords,
      selectedWords: [],
      correctOrder: words,
      score: 0,
      level: 1,
      streak: 0,
      timeLeft: 0, // No time limit
      isCompleted: false,
    });
    
    setShowDifficultySelect(false);
    setGameStarted(true);
    
    // Hide any existing feedback
    setShowFeedback(false);
    setFeedbackType(null);
    setFeedbackMessage('');
  };

  const selectWord = (word: string, index: number) => {
    if (gameState.isCompleted) return;

    setGameState(prev => ({
      ...prev,
      selectedWords: [...prev.selectedWords, word],
      jumbledWords: prev.jumbledWords.filter((_, i) => i !== index)
    }));
  };

  const removeWord = (index: number) => {
    if (gameState.isCompleted) return;

    const word = gameState.selectedWords[index];
    setGameState(prev => ({
      ...prev,
      selectedWords: prev.selectedWords.filter((_, i) => i !== index),
      jumbledWords: [...prev.jumbledWords, word]
    }));
  };

  const checkSentence = () => {
    const currentSentence = gameState.selectedWords.join(' ');
    const correctSentence = gameState.correctOrder.join(' ');
    
    // Analyze grammar for the correct sentence
    const analysis = analyzeGrammar(correctSentence);
    setGrammarAnalysis(analysis);
    
    if (currentSentence.toLowerCase() === correctSentence.toLowerCase()) {
      // Correct!
      const points = calculatePoints();
      const newScore = gameState.score + points;
      const newStreak = gameState.streak + 1;
      const newLevel = Math.floor(newScore / 100) + 1;

      setGameState(prev => ({
        ...prev,
        score: newScore,
        streak: newStreak,
        level: newLevel,
        isCompleted: true,
      }));

      // Show feedback
      setFeedbackType('correct');
      setFeedbackMessage(`🎉 Perfect! You earned ${points} points!\n\nScore: ${newScore}\nStreak: ${newStreak}\nLevel: ${newLevel}`);
      setShowFeedback(true);

      // Animate success
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Incorrect - show the correct answer
      const correctAnswer = gameState.correctOrder.join(' ');
      setFeedbackType('incorrect');
      setFeedbackMessage(`❌ Not Correct\n\nYour answer: "${currentSentence}"\n\nCorrect answer: "${correctAnswer}"\n\nTry again with the correct order!`);
      setShowFeedback(true);
    }
  };

  const calculatePoints = () => {
    const basePoints = gameState.currentSentence?.difficulty === 'easy' ? 10 : 
                      gameState.currentSentence?.difficulty === 'medium' ? 15 : 20;
    const streakBonus = gameState.streak * 2;
    return basePoints + streakBonus;
  };

  const nextLevel = () => {
    const filteredSentences = selectedDifficulty === 'all' 
      ? sentences 
      : sentences.filter(s => s.difficulty === selectedDifficulty);
    
    if (filteredSentences.length === 0) {
      Alert.alert('No More Sentences', 'No more sentences available. Great job!');
      return;
    }

    const randomSentence = filteredSentences[Math.floor(Math.random() * filteredSentences.length)];
    const words = randomSentence.sentence.split(' ').filter(word => word.trim() !== '');
    const jumbledWords = shuffleArray(words);

    setGameState(prev => ({
      ...prev,
      currentSentence: randomSentence,
      jumbledWords,
      selectedWords: [],
      correctOrder: words,
      timeLeft: 0, // No time limit
      isCompleted: false,
    }));
    
    // Hide feedback
    setShowFeedback(false);
    setFeedbackType(null);
    setFeedbackMessage('');
    setGrammarAnalysis(null);
  };

  const tryAgain = () => {
    // Hide feedback
    setShowFeedback(false);
    setFeedbackType(null);
    setFeedbackMessage('');
    setGrammarAnalysis(null);
  };

  const playAgain = () => {
    startGame();
    // Hide feedback
    setShowFeedback(false);
    setFeedbackType(null);
    setFeedbackMessage('');
    setGrammarAnalysis(null);
  };

  // Grammar Analysis Functions
  const analyzeGrammar = (sentence: string) => {
    const words = sentence.toLowerCase().split(' ').filter(word => word.trim() !== '');
    
    return {
      partsOfSpeech: analyzePartsOfSpeech(words),
      tense: analyzeTense(words),
      sentenceStructure: analyzeSentenceStructure(sentence),
      wordCount: words.length,
      complexity: analyzeComplexity(sentence)
    };
  };

  const analyzePartsOfSpeech = (words: string[]) => {
    const analysis: { [key: string]: string[] } = {
      nouns: [],
      verbs: [],
      adjectives: [],
      adverbs: [],
      pronouns: [],
      prepositions: [],
      conjunctions: [],
      articles: []
    };

    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      
      // Common word lists for basic analysis
      if (['the', 'a', 'an'].includes(cleanWord)) {
        analysis.articles.push(cleanWord);
      } else if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'].includes(cleanWord)) {
        analysis.pronouns.push(cleanWord);
      } else if (['and', 'but', 'or', 'nor', 'for', 'yet', 'so'].includes(cleanWord)) {
        analysis.conjunctions.push(cleanWord);
      } else if (['in', 'on', 'at', 'by', 'for', 'with', 'to', 'from', 'up', 'down', 'over', 'under', 'through', 'between', 'among'].includes(cleanWord)) {
        analysis.prepositions.push(cleanWord);
      } else if (cleanWord.endsWith('ly') || ['very', 'quite', 'really', 'well', 'fast', 'hard', 'late', 'early'].includes(cleanWord)) {
        analysis.adverbs.push(cleanWord);
      } else if (['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must'].includes(cleanWord) || 
                 cleanWord.endsWith('ing') || cleanWord.endsWith('ed') || cleanWord.endsWith('s')) {
        analysis.verbs.push(cleanWord);
      } else if (['big', 'small', 'good', 'bad', 'beautiful', 'ugly', 'happy', 'sad', 'fast', 'slow', 'hot', 'cold', 'new', 'old', 'young', 'tall', 'short'].includes(cleanWord) || 
                 cleanWord.endsWith('ful') || cleanWord.endsWith('less') || cleanWord.endsWith('ous')) {
        analysis.adjectives.push(cleanWord);
      } else {
        // Default to noun for unknown words
        analysis.nouns.push(cleanWord);
      }
    });

    return analysis;
  };

  const analyzeTense = (words: string[]) => {
    const hasWill = words.includes('will') || words.includes('shall');
    const hasWould = words.includes('would') || words.includes('could') || words.includes('should');
    const hasHave = words.includes('have') || words.includes('has') || words.includes('had');
    const hasBeen = words.includes('been') || words.includes('being');
    const hasIng = words.some(word => word.endsWith('ing'));
    const hasEd = words.some(word => word.endsWith('ed'));
    const hasWas = words.includes('was') || words.includes('were');
    const hasAm = words.includes('am') || words.includes('is') || words.includes('are');

    if (hasWill && hasIng) return 'Future Continuous';
    if (hasWill && hasHave && hasBeen) return 'Future Perfect Continuous';
    if (hasWill && hasHave) return 'Future Perfect';
    if (hasWill) return 'Future Simple';
    
    if (hasWould && hasIng) return 'Past Future Continuous';
    if (hasWould && hasHave && hasBeen) return 'Past Future Perfect Continuous';
    if (hasWould && hasHave) return 'Past Future Perfect';
    if (hasWould) return 'Past Future Simple';
    
    if (hasHave && hasBeen && hasIng) return 'Present Perfect Continuous';
    if (hasHave && hasBeen) return 'Present Perfect';
    if (hasHave && hasEd) return 'Present Perfect';
    if (hasAm && hasIng) return 'Present Continuous';
    if (hasAm) return 'Present Simple';
    
    if (hasWas && hasIng) return 'Past Continuous';
    if (hasWas && hasBeen && hasIng) return 'Past Perfect Continuous';
    if (hasWas && hasBeen) return 'Past Perfect';
    if (hasEd) return 'Past Simple';
    if (hasWas) return 'Past Simple';
    
    return 'Present Simple'; // Default
  };

  const analyzeSentenceStructure = (sentence: string) => {
    const words = sentence.toLowerCase().split(' ');
    const hasQuestion = sentence.includes('?') || words[0] === 'what' || words[0] === 'where' || words[0] === 'when' || words[0] === 'why' || words[0] === 'how' || words[0] === 'who';
    const hasExclamation = sentence.includes('!');
    const hasCommand = words[0] === 'please' || words[0] === 'don\'t' || words[0] === 'do' || words[0] === 'let\'s';
    
    return {
      type: hasQuestion ? 'Question' : hasExclamation ? 'Exclamation' : hasCommand ? 'Command' : 'Statement',
      hasSubject: words.some(word => ['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(word)),
      hasObject: words.some(word => ['me', 'him', 'her', 'us', 'them'].includes(word)),
      hasAdjective: words.some(word => word.endsWith('ful') || word.endsWith('less') || word.endsWith('ous')),
      hasAdverb: words.some(word => word.endsWith('ly'))
    };
  };

  const analyzeComplexity = (sentence: string) => {
    const words = sentence.split(' ');
    const hasComma = sentence.includes(',');
    const hasSemicolon = sentence.includes(';');
    const hasConjunction = ['and', 'but', 'or', 'so', 'yet', 'for', 'nor'].some(conj => sentence.toLowerCase().includes(conj));
    const hasSubordinate = ['because', 'although', 'while', 'if', 'when', 'where', 'since'].some(sub => sentence.toLowerCase().includes(sub));
    
    let complexity = 'Simple';
    if (hasConjunction || hasComma) complexity = 'Compound';
    if (hasSubordinate || hasSemicolon) complexity = 'Complex';
    if ((hasConjunction || hasComma) && hasSubordinate) complexity = 'Compound-Complex';
    
    return {
      level: complexity,
      wordCount: words.length,
      hasPunctuation: hasComma || hasSemicolon,
      hasConjunctions: hasConjunction,
      hasSubordinateClauses: hasSubordinate
    };
  };

  const endGame = () => {
    setGameStarted(false);
    Alert.alert(
      '🏁 Game Over!',
      `Final Score: ${gameState.score}\nLevel Reached: ${gameState.level}\nBest Streak: ${gameState.streak}`,
      [
        { text: 'Play Again', onPress: () => setShowDifficultySelect(true) },
        { text: 'Back to Menu', onPress: () => navigation.goBack() }
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderDifficultySelect = () => (
    <Animated.View style={[styles.difficultyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🏗️ Sentence Builder
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Rearrange the jumbled words to form a correct sentence!
      </Text>
      
      <View style={styles.difficultyOptions}>
        <Text style={[styles.difficultyLabel, { color: theme.colors.text }]}>
          Choose Difficulty:
        </Text>
        {['easy', 'medium', 'hard', 'all'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyButton,
              { 
                backgroundColor: selectedDifficulty === level ? getDifficultyColor(level) : theme.colors.surface,
                borderColor: getDifficultyColor(level)
              }
            ]}
            onPress={() => setSelectedDifficulty(level as any)}
          >
            <Text style={[
              styles.difficultyButtonText,
              { color: selectedDifficulty === level ? 'white' : theme.colors.text }
            ]}>
              {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
        onPress={startGame}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      {/* Game Header */}
      <View style={[styles.gameHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.gameStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{gameState.score}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{gameState.level}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{gameState.streak}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Current Sentence Info */}
      {gameState.currentSentence && (
        <View style={[styles.sentenceInfo, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sentenceMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(gameState.currentSentence.difficulty) }]}>
              <Text style={styles.difficultyText}>{gameState.currentSentence.difficulty}</Text>
            </View>
            <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
              {gameState.currentSentence.category}
            </Text>
          </View>
        </View>
      )}

      {/* Selected Words (Building Sentence) */}
      <View style={[styles.sentenceBuilder, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.builderTitle, { color: theme.colors.text }]}>
          Your Sentence:
        </Text>
        <View style={styles.selectedWordsContainer}>
          {gameState.selectedWords.length === 0 ? (
            <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
              Tap words below to build your sentence
            </Text>
          ) : (
            gameState.selectedWords.map((word, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.selectedWord, { backgroundColor: theme.colors.primary }]}
                onPress={() => removeWord(index)}
              >
                <Text style={styles.selectedWordText}>{word}</Text>
                <Icon name="close" size={16} color="white" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Jumbled Words */}
      <View style={[styles.jumbledWordsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.jumbledTitle, { color: theme.colors.text }]}>
          Available Words:
        </Text>
        <View style={styles.jumbledWords}>
          {gameState.jumbledWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.jumbledWord, { backgroundColor: theme.colors.background }]}
              onPress={() => selectWord(word, index)}
            >
              <Text style={[styles.jumbledWordText, { color: theme.colors.text }]}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Game Actions */}
      <View style={styles.gameActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={checkSentence}
          disabled={gameState.selectedWords.length === 0}
        >
          <Icon name="check" size={20} color="white" />
          <Text style={styles.actionButtonText}>Check Answer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => setGameState(prev => ({ ...prev, selectedWords: [], jumbledWords: prev.correctOrder }))}
        >
          <Icon name="refresh" size={20} color="white" />
          <Text style={styles.actionButtonText}>Shuffle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={endGame}
        >
          <Icon name="stop" size={20} color="white" />
          <Text style={styles.actionButtonText}>End Game</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Section */}
      {showFeedback && (
        <Animated.View 
          style={[
            styles.feedbackContainer,
            { 
              backgroundColor: feedbackType === 'correct' ? '#E8F5E8' : '#FFEBEE',
              borderColor: feedbackType === 'correct' ? '#4CAF50' : '#F44336'
            }
          ]}
        >
          <View style={styles.feedbackHeader}>
            <Icon 
              name={feedbackType === 'correct' ? 'check-circle' : 'error'} 
              size={24} 
              color={feedbackType === 'correct' ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[
              styles.feedbackTitle,
              { color: feedbackType === 'correct' ? '#4CAF50' : '#F44336' }
            ]}>
              {feedbackType === 'correct' ? 'Correct!' : 'Not Correct'}
            </Text>
          </View>
          
          <Text style={[styles.feedbackMessage, { color: theme.colors.text }]}>
            {feedbackMessage}
          </Text>
          
          {/* Grammar Analysis */}
          {grammarAnalysis && (
            <View style={styles.grammarAnalysisContainer}>
              <Text style={[styles.grammarAnalysisTitle, { color: theme.colors.primary }]}>
                📚 Grammar Analysis
              </Text>
              
              {/* Tense */}
              <View style={styles.grammarSection}>
                <Text style={[styles.grammarLabel, { color: theme.colors.text }]}>
                  🕐 Tense: <Text style={[styles.grammarValue, { color: theme.colors.primary }]}>{grammarAnalysis.tense}</Text>
                </Text>
              </View>
              
              {/* Parts of Speech */}
              <View style={styles.grammarSection}>
                <Text style={[styles.grammarLabel, { color: theme.colors.text }]}>🔤 Parts of Speech:</Text>
                <View style={styles.partsOfSpeechContainer}>
                  {grammarAnalysis.partsOfSpeech.nouns.length > 0 && (
                    <View style={styles.partOfSpeechItem}>
                      <Text style={[styles.partOfSpeechLabel, { color: '#4CAF50' }]}>Nouns:</Text>
                      <Text style={[styles.partOfSpeechWords, { color: theme.colors.text }]}>
                        {grammarAnalysis.partsOfSpeech.nouns.join(', ')}
                      </Text>
                    </View>
                  )}
                  {grammarAnalysis.partsOfSpeech.verbs.length > 0 && (
                    <View style={styles.partOfSpeechItem}>
                      <Text style={[styles.partOfSpeechLabel, { color: '#FF9800' }]}>Verbs:</Text>
                      <Text style={[styles.partOfSpeechWords, { color: theme.colors.text }]}>
                        {grammarAnalysis.partsOfSpeech.verbs.join(', ')}
                      </Text>
                    </View>
                  )}
                  {grammarAnalysis.partsOfSpeech.adjectives.length > 0 && (
                    <View style={styles.partOfSpeechItem}>
                      <Text style={[styles.partOfSpeechLabel, { color: '#9C27B0' }]}>Adjectives:</Text>
                      <Text style={[styles.partOfSpeechWords, { color: theme.colors.text }]}>
                        {grammarAnalysis.partsOfSpeech.adjectives.join(', ')}
                      </Text>
                    </View>
                  )}
                  {grammarAnalysis.partsOfSpeech.adverbs.length > 0 && (
                    <View style={styles.partOfSpeechItem}>
                      <Text style={[styles.partOfSpeechLabel, { color: '#2196F3' }]}>Adverbs:</Text>
                      <Text style={[styles.partOfSpeechWords, { color: theme.colors.text }]}>
                        {grammarAnalysis.partsOfSpeech.adverbs.join(', ')}
                      </Text>
                    </View>
                  )}
                  {grammarAnalysis.partsOfSpeech.pronouns.length > 0 && (
                    <View style={styles.partOfSpeechItem}>
                      <Text style={[styles.partOfSpeechLabel, { color: '#F44336' }]}>Pronouns:</Text>
                      <Text style={[styles.partOfSpeechWords, { color: theme.colors.text }]}>
                        {grammarAnalysis.partsOfSpeech.pronouns.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Sentence Structure */}
              <View style={styles.grammarSection}>
                <Text style={[styles.grammarLabel, { color: theme.colors.text }]}>
                  📝 Type: <Text style={[styles.grammarValue, { color: theme.colors.primary }]}>{grammarAnalysis.sentenceStructure.type}</Text>
                </Text>
                <Text style={[styles.grammarLabel, { color: theme.colors.text }]}>
                  🏗️ Complexity: <Text style={[styles.grammarValue, { color: theme.colors.primary }]}>{grammarAnalysis.complexity.level}</Text>
                </Text>
                <Text style={[styles.grammarLabel, { color: theme.colors.text }]}>
                  📊 Words: <Text style={[styles.grammarValue, { color: theme.colors.primary }]}>{grammarAnalysis.wordCount}</Text>
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.feedbackActions}>
            {feedbackType === 'correct' ? (
              <>
                <TouchableOpacity
                  style={[styles.feedbackButton, { backgroundColor: '#4CAF50' }]}
                  onPress={nextLevel}
                >
                  <Text style={styles.feedbackButtonText}>Next Level</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackButton, { backgroundColor: '#2196F3' }]}
                  onPress={playAgain}
                >
                  <Text style={styles.feedbackButtonText}>Play Again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.feedbackButton, { backgroundColor: '#FF9800' }]}
                onPress={tryAgain}
              >
                <Text style={styles.feedbackButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
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
          <Text style={styles.headerTitle}>Sentence Builder</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showDifficultySelect ? renderDifficultySelect() : renderGame()}
      </ScrollView>
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  difficultyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  difficultyOptions: {
    width: '100%',
    marginBottom: 40,
  },
  difficultyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  difficultyButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    padding: 20,
  },
  gameHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sentenceInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sentenceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
  },
  sentenceBuilder: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 120,
  },
  builderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  selectedWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  selectedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  selectedWordText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  jumbledWordsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  jumbledTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  jumbledWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  jumbledWord: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jumbledWordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  gameActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  feedbackMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  grammarAnalysisContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  grammarAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  grammarSection: {
    marginBottom: 8,
  },
  grammarLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  grammarValue: {
    fontWeight: 'bold',
  },
  partsOfSpeechContainer: {
    marginTop: 4,
  },
  partOfSpeechItem: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  partOfSpeechLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 80,
  },
  partOfSpeechWords: {
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
  },
});

export default SentenceBuilderGameScreen;
