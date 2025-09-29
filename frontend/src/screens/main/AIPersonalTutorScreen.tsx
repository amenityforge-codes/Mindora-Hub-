import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  ProgressBar,
  Avatar,
  Chip,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AIPersonalTutorScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [weakAreas, setWeakAreas] = useState([
    { area: 'Pronunciation', progress: 60, priority: 'high' },
    { area: 'Grammar', progress: 75, priority: 'medium' },
    { area: 'Vocabulary', progress: 85, priority: 'low' },
  ]);

  const personalizedLessons = [
    {
      id: 1,
      title: 'Pronunciation Focus: "TH" Sounds',
      description: 'Practice the challenging "th" sounds in English',
      difficulty: 'Medium',
      estimatedTime: '15 min',
      type: 'pronunciation',
      exercises: [
        'Practice "think" vs "sink"',
        'Practice "three" vs "free"',
        'Practice "bath" vs "bass"'
      ]
    },
    {
      id: 2,
      title: 'Grammar: Present Perfect Tense',
      description: 'Master the present perfect tense usage',
      difficulty: 'Hard',
      estimatedTime: '20 min',
      type: 'grammar',
      exercises: [
        'Complete sentences with have/has',
        'Choose correct past participle',
        'Create your own sentences'
      ]
    },
    {
      id: 3,
      title: 'Vocabulary: Business Terms',
      description: 'Learn essential business vocabulary',
      difficulty: 'Easy',
      estimatedTime: '10 min',
      type: 'vocabulary',
      exercises: [
        'Match terms with definitions',
        'Use in context sentences',
        'Role-play business scenarios'
      ]
    }
  ];

  const handleStartLesson = async (lesson: any) => {
    setIsLoading(true);
    setCurrentLesson(lesson.id);
    
    // Simulate AI tutor preparing lesson
    setTimeout(() => {
      setAiResponse(`Great choice! Let's work on ${lesson.title}. I've prepared some personalized exercises based on your learning patterns. Ready to begin?`);
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmitAnswer = async () => {
    if (!userInput.trim()) return;
    
    setIsTyping(true);
    
    // Simulate AI analyzing response
    setTimeout(() => {
      setAiResponse(`Excellent work! Your answer shows improvement in this area. Let me give you some feedback and the next exercise...`);
      setUserInput('');
      setIsTyping(false);
    }, 1500);
  };

  const renderAIHeader = () => (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Personal Tutor</Text>
          <Text style={styles.headerSubtitle}>Your personalized learning companion</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme}>
          <MaterialIcons 
            name={isDarkMode ? "wb-sunny" : "nightlight-round"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderTutorProfile = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.tutorProfile}>
          <Avatar.Icon 
            size={64} 
            icon="psychology" 
            style={{ backgroundColor: '#6366f1' }}
          />
          <View style={styles.tutorInfo}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              Dr. AI Tutor
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Your Personal English Learning Assistant
            </Text>
            <View style={styles.tutorStats}>
              <Chip mode="outlined" compact style={styles.statChip}>
                <MaterialIcons name="trending-up" size={16} color="#10b981" />
                <Text style={{ marginLeft: 4, color: '#10b981' }}>75% Progress</Text>
              </Chip>
              <Chip mode="outlined" compact style={styles.statChip}>
                <MaterialIcons name="local-fire-department" size={16} color="#f59e0b" />
                <Text style={{ marginLeft: 4, color: '#f59e0b' }}>12 Day Streak</Text>
              </Chip>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderWeakAreas = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Focus Areas
        </Text>
        {weakAreas.map((area, index) => (
          <View key={index} style={styles.weakAreaItem}>
            <View style={styles.weakAreaHeader}>
              <Text variant="bodyLarge" style={{ fontWeight: '500' }}>
                {area.area}
              </Text>
              <Chip 
                mode="outlined" 
                compact 
                style={[
                  styles.priorityChip,
                  { 
                    backgroundColor: area.priority === 'high' ? '#fef2f2' : 
                                   area.priority === 'medium' ? '#fef3c7' : '#f0fdf4',
                    borderColor: area.priority === 'high' ? '#ef4444' : 
                                area.priority === 'medium' ? '#f59e0b' : '#10b981'
                  }
                ]}
              >
                <Text style={{ 
                  color: area.priority === 'high' ? '#ef4444' : 
                         area.priority === 'medium' ? '#f59e0b' : '#10b981',
                  fontSize: 12 
                }}>
                  {area.priority.toUpperCase()}
                </Text>
              </Chip>
            </View>
            <ProgressBar 
              progress={area.progress / 100} 
              color={area.priority === 'high' ? '#ef4444' : 
                     area.priority === 'medium' ? '#f59e0b' : '#10b981'}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {area.progress}% Mastery
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderPersonalizedLessons = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Personalized Lessons
        </Text>
        {personalizedLessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              { backgroundColor: theme.colors.background },
              currentLesson === lesson.id && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => handleStartLesson(lesson)}
          >
            <View style={styles.lessonHeader}>
              <View style={styles.lessonIcon}>
                <MaterialIcons 
                  name={
                    lesson.type === 'pronunciation' ? 'mic' :
                    lesson.type === 'grammar' ? 'edit' : 'book'
                  } 
                  size={24} 
                  color="white" 
                />
              </View>
              <View style={styles.lessonInfo}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                  {lesson.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {lesson.description}
                </Text>
              </View>
            </View>
            
            <View style={styles.lessonMeta}>
              <Chip mode="outlined" compact style={styles.metaChip}>
                <Text style={{ fontSize: 12 }}>{lesson.difficulty}</Text>
              </Chip>
              <Chip mode="outlined" compact style={styles.metaChip}>
                <MaterialIcons name="timer" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={{ marginLeft: 4, fontSize: 12 }}>{lesson.estimatedTime}</Text>
              </Chip>
            </View>

            <View style={styles.exercisesList}>
              {lesson.exercises.map((exercise, idx) => (
                <View key={idx} style={styles.exerciseItem}>
                  <MaterialIcons name="check-circle-outline" size={16} color="#10b981" />
                  <Text variant="bodySmall" style={{ marginLeft: 8, flex: 1 }}>
                    {exercise}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAIChat = () => {
    if (!currentLesson) return null;

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            AI Tutor Chat
          </Text>
          
          {aiResponse ? (
            <View style={styles.aiResponseContainer}>
              <Avatar.Icon 
                size={32} 
                icon="psychology" 
                style={{ backgroundColor: '#6366f1' }}
              />
              <View style={styles.aiResponseBubble}>
                <Text style={styles.aiResponseText}>{aiResponse}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.background }]}
              placeholder="Type your answer or question..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={userInput}
              onChangeText={setUserInput}
              multiline
              mode="outlined"
            />
            <Button
              mode="contained"
              onPress={handleSubmitAnswer}
              disabled={!userInput.trim() || isTyping}
              style={styles.submitButton}
            >
              {isTyping ? 'Analyzing...' : 'Submit'}
            </Button>
          </View>

          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
                AI is analyzing your response...
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {renderAIHeader()}
        {renderTutorProfile()}
        {renderWeakAreas()}
        {renderPersonalizedLessons()}
        {renderAIChat()}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
              AI Tutor is preparing your lesson...
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
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  tutorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  tutorStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weakAreaItem: {
    marginBottom: 16,
  },
  weakAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  lessonCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiResponseContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  aiResponseBubble: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  aiResponseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    marginTop: 16,
  },
  textInput: {
    marginBottom: 12,
  },
  submitButton: {
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});






