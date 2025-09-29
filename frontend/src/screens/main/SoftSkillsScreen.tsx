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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Surface,
} from 'react-native-paper';

import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function SoftSkillsScreen() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const softSkillsTopics = [
    {
      id: 'time-management',
      title: 'Time Management',
      description: 'Learn to prioritize tasks and manage your time effectively',
      icon: 'schedule',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#45a049'],
      difficulty: 'beginner',
      duration: '2-3 hours',
      topics: [
        'Setting Priorities',
        'Creating Schedules',
        'Avoiding Procrastination',
        'Work-Life Balance',
        'Goal Setting'
      ],
      skills: ['Planning', 'Organization', 'Focus', 'Discipline']
    },
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
      description: 'Master the art of job interviews and professional communication',
      icon: 'person',
      color: '#2196F3',
      gradient: ['#2196F3', '#1976D2'],
      difficulty: 'intermediate',
      duration: '3-4 hours',
      topics: [
        'Common Interview Questions',
        'STAR Method',
        'Body Language',
        'Follow-up Strategies',
        'Salary Negotiation'
      ],
      skills: ['Communication', 'Confidence', 'Preparation', 'Professionalism']
    },
    {
      id: 'email-etiquette',
      title: 'Email Etiquette',
      description: 'Professional email writing and business communication',
      icon: 'email',
      color: '#FF9800',
      gradient: ['#FF9800', '#F57C00'],
      difficulty: 'beginner',
      duration: '1-2 hours',
      topics: [
        'Professional Email Structure',
        'Subject Line Best Practices',
        'Tone and Formality',
        'Follow-up Emails',
        'Email Templates'
      ],
      skills: ['Writing', 'Professionalism', 'Clarity', 'Courtesy']
    },
    {
      id: 'teamwork',
      title: 'Teamwork & Collaboration',
      description: 'Working effectively with others in professional settings',
      icon: 'group',
      color: '#9C27B0',
      gradient: ['#9C27B0', '#7B1FA2'],
      difficulty: 'intermediate',
      duration: '2-3 hours',
      topics: [
        'Active Listening',
        'Conflict Resolution',
        'Giving Feedback',
        'Team Dynamics',
        'Virtual Collaboration'
      ],
      skills: ['Communication', 'Empathy', 'Leadership', 'Adaptability']
    },
    {
      id: 'presentation-skills',
      title: 'Presentation Skills',
      description: 'Deliver compelling presentations with confidence',
      icon: 'mic',
      color: '#E91E63',
      gradient: ['#E91E63', '#C2185B'],
      difficulty: 'intermediate',
      duration: '3-4 hours',
      topics: [
        'Presentation Structure',
        'Visual Design',
        'Public Speaking',
        'Handling Q&A',
        'Virtual Presentations'
      ],
      skills: ['Public Speaking', 'Visual Design', 'Confidence', 'Engagement']
    },
    {
      id: 'leadership',
      title: 'Leadership Skills',
      description: 'Develop leadership qualities and management abilities',
      icon: 'star',
      color: '#FF5722',
      gradient: ['#FF5722', '#D84315'],
      difficulty: 'advanced',
      duration: '4-5 hours',
      topics: [
        'Leadership Styles',
        'Motivating Teams',
        'Decision Making',
        'Change Management',
        'Mentoring Others'
      ],
      skills: ['Vision', 'Motivation', 'Decision Making', 'Influence']
    },
    {
      id: 'problem-solving',
      title: 'Problem Solving',
      description: 'Systematic approach to identifying and solving problems',
      icon: 'lightbulb',
      color: '#607D8B',
      gradient: ['#607D8B', '#455A64'],
      difficulty: 'intermediate',
      duration: '2-3 hours',
      topics: [
        'Problem Identification',
        'Root Cause Analysis',
        'Solution Generation',
        'Implementation Planning',
        'Evaluation Methods'
      ],
      skills: ['Analytical Thinking', 'Creativity', 'Planning', 'Execution']
    },
    {
      id: 'emotional-intelligence',
      title: 'Emotional Intelligence',
      description: 'Understanding and managing emotions in professional settings',
      icon: 'favorite',
      color: '#795548',
      gradient: ['#795548', '#5D4037'],
      difficulty: 'intermediate',
      duration: '3-4 hours',
      topics: [
        'Self-Awareness',
        'Self-Regulation',
        'Empathy',
        'Social Skills',
        'Motivation'
      ],
      skills: ['Self-Awareness', 'Empathy', 'Social Skills', 'Resilience']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Skills', icon: 'apps' },
    { id: 'beginner', label: 'Beginner', icon: 'school' },
    { id: 'intermediate', label: 'Intermediate', icon: 'trending-up' },
    { id: 'advanced', label: 'Advanced', icon: 'star' }
  ];

  useEffect(() => {
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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredTopics = selectedCategory === 'all' 
    ? softSkillsTopics 
    : softSkillsTopics.filter(topic => topic.difficulty === selectedCategory);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="more-vert" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Soft Skills</Text>
          <Text style={styles.headerSubtitle}>
            Develop essential professional skills for career success
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <Animated.View 
      style={[
        styles.categoryContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: selectedCategory === category.id 
                  ? theme.colors.primary 
                  : theme.colors.outline,
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialIcons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? 'white' : theme.colors.onSurface} 
            />
            <Text 
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id 
                    ? 'white' 
                    : theme.colors.onSurface
                }
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderSkillCard = (skill: any, index: number) => (
    <Animated.View
      key={skill.id}
      style={[
        styles.skillCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim }
          ]
        }
      ]}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <TouchableOpacity
          onPress={() => {
            // Navigate to skill detail or start learning
            console.log('Starting skill:', skill.title);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={skill.gradient}
            style={styles.cardHeader}
          >
            <View style={styles.cardHeaderContent}>
              <View style={styles.skillIconContainer}>
                <MaterialIcons name={skill.icon as any} size={32} color="white" />
              </View>
              <View style={styles.skillInfo}>
                <Text style={styles.skillTitle}>{skill.title}</Text>
                <Text style={styles.skillDescription}>{skill.description}</Text>
              </View>
            </View>
          </LinearGradient>
          
          <Card.Content style={styles.cardContent}>
            <View style={styles.skillMeta}>
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.difficultyChip, { borderColor: skill.color }]}
                textStyle={{ color: skill.color, fontSize: 12 }}
              >
                {skill.difficulty}
              </Chip>
              <Text style={[styles.durationText, { color: theme.colors.onSurfaceVariant }]}>
                {skill.duration}
              </Text>
            </View>
            
            <View style={styles.topicsContainer}>
              <Text style={[styles.topicsTitle, { color: theme.colors.onSurface }]}>
                Key Topics:
              </Text>
              <View style={styles.topicsList}>
                {Array.isArray(skill.topics) ? skill.topics.slice(0, 3).map((topic: string, idx: number) => (
                  <Chip
                    key={idx}
                    mode="outlined"
                    compact
                    style={styles.topicChip}
                    textStyle={{ fontSize: 10 }}
                  >
                    {topic}
                  </Chip>
                )) : null}
                {Array.isArray(skill.topics) && skill.topics.length > 3 && (
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.topicChip}
                    textStyle={{ fontSize: 10 }}
                  >
                    +{Array.isArray(skill.topics) ? skill.topics.length - 3 : 0} more
                  </Chip>
                )}
              </View>
            </View>
            
            <View style={styles.skillsContainer}>
              <Text style={[styles.skillsTitle, { color: theme.colors.onSurface }]}>
                Skills You'll Develop:
              </Text>
              <View style={styles.skillsList}>
                {skill.skills.map((skillName: string, idx: number) => (
                  <Chip
                    key={idx}
                    mode="flat"
                    compact
                    style={[styles.skillChip, { backgroundColor: skill.color + '20' }]}
                    textStyle={{ color: skill.color, fontSize: 10 }}
                  >
                    {skillName}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {renderHeader()}
      {renderCategoryFilter()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Professional Development
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Master essential soft skills for career advancement
          </Text>
          
          {filteredTopics.map((skill, index) => renderSkillCard(skill, index))}
          
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryScroll: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
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
  skillCard: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  skillInfo: {
    flex: 1,
  },
  skillTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  cardContent: {
    padding: 20,
  },
  skillMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyChip: {
    borderWidth: 1,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  topicsContainer: {
    marginBottom: 16,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    marginBottom: 4,
  },
  skillsContainer: {
    marginBottom: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});



