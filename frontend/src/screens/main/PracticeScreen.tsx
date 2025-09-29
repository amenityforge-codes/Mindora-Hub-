import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPracticeQuiz } from '../../store/slices/contentSlice';
import { ModuleType } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

export default function PracticeScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { currentQuiz, isLoading } = useAppSelector((state) => state.content);
  const { user } = useAppSelector((state) => state.auth);
  
  const [selectedModuleType, setSelectedModuleType] = useState<ModuleType>('grammar');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [refreshing, setRefreshing] = useState(false);

  const moduleTypes: { type: ModuleType; label: string; icon: string }[] = [
    { type: 'grammar', label: 'Grammar', icon: 'edit' },
    { type: 'vocabulary', label: 'Vocabulary', icon: 'book' },
    { type: 'reading', label: 'Reading', icon: 'visibility' },
    { type: 'writing', label: 'Writing', icon: 'create' },
    { type: 'speaking', label: 'Speaking', icon: 'mic' },
    { type: 'listening', label: 'Listening', icon: 'hearing' },
    { type: 'communication', label: 'Communication', icon: 'chat' },
    { type: 'finance', label: 'Finance', icon: 'account-balance' },
    { type: 'soft-skills', label: 'Soft Skills', icon: 'people' },
    { type: 'brainstorming', label: 'Brainstorming', icon: 'lightbulb' },
    { type: 'math', label: 'Math', icon: 'calculate' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: theme.colors.tertiary },
    { value: 'medium', label: 'Medium', color: theme.colors.primary },
    { value: 'hard', label: 'Hard', color: theme.colors.error },
  ];

  const handleStartPractice = async () => {
    try {
      await dispatch(fetchPracticeQuiz({
        moduleType: selectedModuleType,
        difficulty: selectedDifficulty,
        limit: 10,
      })).unwrap();
      
      if (currentQuiz) {
        navigation.navigate('Quiz' as never, { 
          quizId: currentQuiz._id,
          isPractice: true 
        } as never);
      }
    } catch (error) {
      console.error('Error starting practice:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh practice options
    setRefreshing(false);
  };

  const renderModuleTypeSelector = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Choose Practice Type
        </Text>
        <View style={styles.moduleTypesGrid}>
          {moduleTypes.map((module) => (
            <Button
              key={module.type}
              mode={selectedModuleType === module.type ? 'contained' : 'outlined'}
              onPress={() => setSelectedModuleType(module.type)}
              icon={module.icon}
              style={styles.moduleTypeButton}
              contentStyle={styles.moduleTypeButtonContent}
            >
              {module.label}
            </Button>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDifficultySelector = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Select Difficulty
        </Text>
        <View style={styles.difficultyContainer}>
          {difficulties.map((difficulty) => (
            <Chip
              key={difficulty.value}
              mode={selectedDifficulty === difficulty.value ? 'flat' : 'outlined'}
              selected={selectedDifficulty === difficulty.value}
              onPress={() => setSelectedDifficulty(difficulty.value)}
              style={[
                styles.difficultyChip,
                selectedDifficulty === difficulty.value && {
                  backgroundColor: difficulty.color,
                },
              ]}
              textStyle={{
                color: selectedDifficulty === difficulty.value 
                  ? 'white' 
                  : difficulty.color,
              }}
            >
              {difficulty.label}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Quick Practice
        </Text>
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedModuleType('grammar');
              setSelectedDifficulty('medium');
              handleStartPractice();
            }}
            icon="edit"
            style={styles.quickActionButton}
          >
            Grammar Quiz
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedModuleType('vocabulary');
              setSelectedDifficulty('medium');
              handleStartPractice();
            }}
            icon="book"
            style={styles.quickActionButton}
          >
            Vocabulary Test
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedModuleType('communication');
              setSelectedDifficulty('medium');
              handleStartPractice();
            }}
            icon="chat"
            style={styles.quickActionButton}
          >
            Communication
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedModuleType('finance');
              setSelectedDifficulty('medium');
              handleStartPractice();
            }}
            icon="account-balance"
            style={styles.quickActionButton}
          >
            Finance Quiz
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('LiveTranslation' as never)}
            icon="translate"
            style={styles.quickActionButton}
          >
            Live Translation
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAIFeatures = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          AI-Powered Practice
        </Text>
        <View style={styles.aiFeatures}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('GrammarCheck' as never)}
            icon="spell-check"
            style={styles.aiFeatureButton}
          >
            Grammar Check
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('SpeechPractice' as never)}
            icon="mic"
            style={styles.aiFeatureButton}
          >
            Speech Practice
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('TextRewrite' as never)}
            icon="refresh"
            style={styles.aiFeatureButton}
          >
            Text Rewrite
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('LiveTranslation' as never)}
            icon="translate"
            style={styles.aiFeatureButton}
          >
            Live Translation
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPracticeStats = () => {
    const stats = user?.progress || {};
    
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Your Practice Stats
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={24} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {stats.currentStreak || 0}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Day Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="timer" size={24} color={theme.colors.secondary} />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                {Math.floor((stats.totalTimeSpent || 0) / 60)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Hours Practiced
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={24} color={theme.colors.tertiary} />
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.tertiary }}>
                {stats.points || 0}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Points Earned
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={theme.gradients.header}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Practice Mode</Text>
              <Text style={styles.headerSubtitle}>Improve your English skills with targeted practice</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={styles.themeToggle}
              >
                <MaterialIcons 
                  name={isDarkMode ? "wb-sunny" : "nightlight-round"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Daily Challenge Section */}
        <View style={styles.dailyChallengeContainer}>
          <LinearGradient
            colors={['#ff6b6b', '#ee5a52']}
            style={styles.dailyChallengeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dailyChallengeContent}>
              <View style={styles.dailyChallengeLeft}>
                <MaterialIcons name="emoji-events" size={32} color="white" />
                <View style={styles.dailyChallengeText}>
                  <Text style={styles.dailyChallengeTitle}>Daily Challenge</Text>
                  <Text style={styles.dailyChallengeSubtitle}>Complete today's special task</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.dailyChallengeButton}
                onPress={() => {
                  setSelectedModuleType('grammar');
                  setSelectedDifficulty('medium');
                  handleStartPractice();
                }}
              >
                <MaterialIcons name="play-arrow" size={20} color="#ff6b6b" />
                <Text style={styles.dailyChallengeButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Practice Stats */}
        {renderPracticeStats()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Module Type Selector */}
        {renderModuleTypeSelector()}

        {/* Difficulty Selector */}
        {renderDifficultySelector()}

        {/* AI Features */}
        {renderAIFeatures()}

        {/* Start Practice Button */}
        <View style={styles.startPracticeContainer}>
          <Button
            mode="contained"
            onPress={handleStartPractice}
            disabled={isLoading}
            icon="play-arrow"
            style={styles.startPracticeButton}
            contentStyle={styles.startPracticeButtonContent}
          >
            {isLoading ? 'Loading...' : 'Start Practice Quiz'}
          </Button>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dailyChallengeContainer: {
    margin: 16,
    marginTop: 0,
  },
  dailyChallengeCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dailyChallengeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyChallengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyChallengeText: {
    marginLeft: 16,
    flex: 1,
  },
  dailyChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  dailyChallengeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dailyChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dailyChallengeButtonText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
  },
  moduleTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleTypeButton: {
    flex: 1,
    minWidth: '30%',
  },
  moduleTypeButtonContent: {
    paddingVertical: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyChip: {
    flex: 1,
  },
  aiFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  aiFeatureButton: {
    flex: 1,
    minWidth: '45%',
  },
  startPracticeContainer: {
    padding: 16,
    paddingTop: 0,
  },
  startPracticeButton: {
    width: '100%',
  },
  startPracticeButtonContent: {
    paddingVertical: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});



