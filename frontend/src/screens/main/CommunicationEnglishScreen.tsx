import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GameChallenge {
  id: string;
  type: 'word-guess' | 'sentence-builder' | 'pronunciation' | 'grammar-quiz' | 'vocabulary' | 'listening';
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  color: string[];
}


const CommunicationEnglishScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get career context from navigation params
  const careerContext = (route.params as any)?.careerContext;
  
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [showGames, setShowGames] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const gameChallenges: GameChallenge[] = [
    {
      id: '1',
      type: 'word-guess',
      title: '🎯 Word Master',
      description: 'Guess the word from clues and expand your vocabulary!',
      points: 50,
      difficulty: 'easy',
      icon: 'lightbulb',
      color: ['#667eea', '#764ba2']
    },
    {
      id: '2',
      type: 'sentence-builder',
      title: '🏗️ Sentence Builder',
      description: 'Build perfect sentences and master grammar!',
      points: 75,
      difficulty: 'medium',
      icon: 'construction',
      color: ['#f093fb', '#f5576c']
    },
    {
      id: '3',
      type: 'pronunciation',
      title: '🗣️ Pronunciation Pro',
      description: 'Master tricky pronunciations and speak like a native!',
      points: 100,
      difficulty: 'hard',
      icon: 'mic',
      color: ['#4ecdc4', '#44a08d']
    },
    {
      id: '4',
      type: 'grammar-quiz',
      title: '📚 Grammar Guru',
      description: 'Become a grammar expert with fun challenges!',
      points: 80,
      difficulty: 'medium',
      icon: 'school',
      color: ['#ffecd2', '#fcb69f']
    },
    {
      id: '5',
      type: 'vocabulary',
      title: '📖 Vocabulary Vault',
      description: 'Discover new words and boost your word power!',
      points: 60,
      difficulty: 'easy',
      icon: 'book',
      color: ['#a8edea', '#fed6e3']
    },
    {
      id: '6',
      type: 'listening',
      title: '👂 Listening Legend',
      description: 'Sharpen your listening skills with audio challenges!',
      points: 90,
      difficulty: 'hard',
      icon: 'headphones',
      color: ['#ff9a9e', '#fecfef']
    }
  ];


  useEffect(() => {
    // Animate in
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const startVoiceChat = () => {
    setShowVoiceChat(true);
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      Alert.alert(
        "🎤 Great Job!",
        "Your pronunciation was excellent! You earned 15 points!",
        [{ text: 'Awesome!', onPress: () => setUserPoints(prev => prev + 15) }]
      );
    }, 3000);
  };

  const playGame = (game: GameChallenge) => {
    if (game.type === 'sentence-builder') {
      // Navigate to actual Sentence Builder game
      navigation.navigate('SentenceBuilderGame' as never);
    } else {
      Alert.alert(
        `🎮 ${game.title}`,
        `Ready to play ${game.title}? You can earn ${game.points} points!\n\nDifficulty: ${game.difficulty.toUpperCase()}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Play!', 
            onPress: () => {
              // Simulate game completion
              setTimeout(() => {
                setUserPoints(prev => prev + game.points);
                setCurrentStreak(prev => prev + 1);
                
                // Check for level up
                if (userPoints > 0 && (userPoints + game.points) % 200 === 0) {
                  setUserLevel(prev => prev + 1);
                  Alert.alert(
                    "🎉 LEVEL UP!",
                    `Congratulations! You've reached Level ${userLevel + 1}! You're becoming an English superstar! 🌟`,
                    [{ text: 'Awesome!', style: 'default' }]
                  );
                } else {
                  Alert.alert(
                    "🎉 Great Job!",
                    `You completed ${game.title} and earned ${game.points} points! Your total is now ${userPoints + game.points} points!`,
                    [{ text: 'Continue!', style: 'default' }]
                  );
                }
              }, 2000);
            }
          }
        ]
      );
    }
  };


  const renderGameCard = (game: GameChallenge) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameCard}
      onPress={() => playGame(game)}
    >
      <LinearGradient
        colors={game.color}
        style={styles.gameGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.gameHeader}>
          <MaterialIcons name={game.icon} size={32} color="white" />
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDifficulty}>{game.difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.gameDescription}>{game.description}</Text>
        <View style={styles.gameFooter}>
          <Text style={styles.gamePoints}>+{game.points} pts</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{game.difficulty}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );


  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        🚀 Quick Actions
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#667eea' }]}
          onPress={() => setShowGames(true)}
        >
          <MaterialIcons name="videogame-asset" size={24} color="white" />
          <Text style={styles.quickActionText}>Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#f093fb' }]}
          onPress={startVoiceChat}
        >
          <MaterialIcons name="mic" size={24} color="white" />
          <Text style={styles.quickActionText}>Voice Practice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#4ecdc4' }]}
          onPress={() => setSelectedModule('grammar')}
        >
          <MaterialIcons name="school" size={24} color="white" />
          <Text style={styles.quickActionText}>Grammar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#45b7d1' }]}
          onPress={() => setSelectedModule('careers')}
        >
          <MaterialIcons name="work" size={24} color="white" />
          <Text style={styles.quickActionText}>Careers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGamesModal = () => (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            🎮 English Games
          </Text>
          <TouchableOpacity
            onPress={() => setShowGames(false)}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
          {gameChallenges.map(renderGameCard)}
        </ScrollView>
      </View>
    </View>
  );

  const renderVoiceChatModal = () => (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            🗣️ Voice Practice
          </Text>
          <TouchableOpacity
            onPress={() => setShowVoiceChat(false)}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.voiceContent}>
          <Animated.View
            style={[
              styles.voiceCircle,
              {
                backgroundColor: isListening ? '#f093fb' : '#667eea',
                transform: [{ scale: isListening ? 1.2 : 1 }]
              }
            ]}
          >
            <MaterialIcons name="mic" size={40} color="white" />
          </Animated.View>
          
          <Text style={[styles.voiceStatus, { color: theme.colors.text }]}>
            {isListening ? 'Listening... Speak now!' : 'Tap to start speaking'}
          </Text>
          
          <Text style={[styles.voiceInstruction, { color: theme.colors.textSecondary }]}>
            Try saying: "I want to improve my English skills"
          </Text>
          
          <TouchableOpacity
            style={[styles.voiceButton, { backgroundColor: theme.colors.primary }]}
            onPress={startVoiceChat}
          >
            <Text style={styles.voiceButtonText}>
              {isListening ? 'Stop Recording' : 'Start Speaking'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="record-voice-over" size={32} color="white" style={styles.headerMaterialIcons} />
          <Text style={styles.headerTitle}>Communication English</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <MaterialIcons
            name={isDarkMode ? "wb-sunny" : "nightlight-round"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSubtitle}>Master English communication skills with AI-powered guidance</Text>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Interactive Games
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Fun and engaging games to practice your English skills
          </Text>

          {gameChallenges.map(renderGameCard)}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      {showGames && renderGamesModal()}
      {showVoiceChat && renderVoiceChatModal()}
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
  header: {
    padding: 20,
    paddingBottom: 16,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginLeft: -24, // Adjust for back button
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal styles (keeping for voice chat and games modals)
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
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  gamesList: {
    flex: 1,
  },
  voiceContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  voiceStatus: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  voiceInstruction: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
  },
  voiceButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  voiceButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Missing styles for games
  gameCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameGradient: {
    padding: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameInfo: {
    marginLeft: 12,
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  gameDifficulty: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  gameDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gamePoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  // Missing styles for quick actions
  quickActionsContainer: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 14,
  },
  // Missing styles for header
  headerMaterialIcons: {
    marginRight: 8,
  },
});

export default CommunicationEnglishScreen;
