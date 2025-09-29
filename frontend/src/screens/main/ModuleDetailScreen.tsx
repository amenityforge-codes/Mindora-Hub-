import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchModule } from '../../store/slices/contentSlice';
import { Module } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type ModuleDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ModuleDetail'>;

export default function ModuleDetailScreen() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<ModuleDetailScreenNavigationProp>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { moduleId } = route.params as { moduleId: string };
  
  const { currentModule, isLoading } = useAppSelector((state) => state.content);
  const { user } = useAppSelector((state) => state.auth);
  
  const [topics, setTopics] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    console.log('=== MODULE DETAIL SCREEN USEEFFECT ===');
    console.log('moduleId received:', moduleId);
    console.log('moduleId type:', typeof moduleId);
    
    if (moduleId) {
      console.log('Fetching real module from API for ID:', moduleId);
      dispatch(fetchModule(moduleId));
      loadModuleContent();
    }
    
    // Entrance animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [moduleId]);

  const loadModuleContent = async () => {
    setLoadingContent(true);
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Fetch videos and quizzes for this module
      const [videosResponse, quizzesResponse] = await Promise.all([
        fetch(`http://192.168.200.129:5000/api/video/module/${moduleId}`, { headers }),
        fetch(`http://192.168.200.129:5000/api/quiz/module/${moduleId}`, { headers })
      ]);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        const moduleVideos = videosData.data?.videos || [];
        setVideos(moduleVideos);
        
        // Group videos by topic and create topics
        const topicsMap: any = {};
        moduleVideos.forEach((video: any) => {
          if (video.topic) {
            if (!topicsMap[video.topic]) {
              topicsMap[video.topic] = {
                title: video.topic,
                description: video.topicDescription || `Learn about ${video.topic}`,
                videos: [],
                quizzes: []
              };
            }
            topicsMap[video.topic].videos.push(video);
          }
        });

        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          const moduleQuizzes = quizzesData.data?.quizzes || [];
          setQuizzes(moduleQuizzes);
          
          // Add quizzes to topics
          moduleQuizzes.forEach((quiz: any) => {
            if (quiz.topic && topicsMap[quiz.topic]) {
              topicsMap[quiz.topic].quizzes.push(quiz);
            }
          });
        }

        // Convert topics map to array
        const topicsArray = Object.values(topicsMap) as any[];
        console.log('=== LOAD MODULE CONTENT DEBUG ===');
        console.log('moduleVideos:', moduleVideos);
        console.log('moduleVideos.length:', moduleVideos.length);
        console.log('topicsMap:', topicsMap);
        console.log('Created topics array:', topicsArray);
        console.log('topicsArray.length:', topicsArray.length);
        
        // If no topics found from videos, create topics based on module data
        if (topicsArray.length === 0) {
          console.log('No videos found, creating topics from module data');
          let fallbackTopics = [];
          
          // Try to get module data from currentModule or use fallback
          const moduleData = currentModule || getModuleData();
          console.log('Using module data for topics:', moduleData);
          
          if (moduleData && moduleData.title) {
            // Create topics based on the actual module data
            const moduleTitle = moduleData.title;
            const moduleType = moduleData.moduleType || 'vocabulary';
            
            // Create 3-4 topics based on the module title and type
            fallbackTopics = [
              {
                title: `${moduleTitle} - Introduction`,
                description: `Learn the basics of ${moduleTitle.toLowerCase()}`,
                videos: [],
                quizzes: []
              },
              {
                title: `${moduleTitle} - Practice`,
                description: `Practice what you've learned about ${moduleTitle.toLowerCase()}`,
                videos: [],
                quizzes: []
              },
              {
                title: `${moduleTitle} - Advanced`,
                description: `Master advanced concepts in ${moduleTitle.toLowerCase()}`,
                videos: [],
                quizzes: []
              },
              {
                title: `${moduleTitle} - Review`,
                description: `Review and test your knowledge of ${moduleTitle.toLowerCase()}`,
                videos: [],
                quizzes: []
              }
            ];
          } else if (moduleId === '1' || moduleId === '68cfdd9ae3bc97188711e040') {
            // Alphabet & Phonics - 6 topics
            fallbackTopics = [
              {
                title: 'Letter Hunt',
                description: 'Go on an exciting hunt to find and identify letters all around you',
                videos: [],
                quizzes: []
              },
              {
                title: 'Magic Write',
                description: 'Learn the magical art of writing letters with fun and engaging activities',
                videos: [],
                quizzes: []
              },
              {
                title: 'Sound Detective',
                description: 'Become a detective and discover the sounds that letters make',
                videos: [],
                quizzes: []
              },
              {
                title: 'Word Building',
                description: 'Build amazing words by combining letters and sounds together',
                videos: [],
                quizzes: []
              },
              {
                title: 'Magic Phonics',
                description: 'Master the magic of phonics with interactive sound games',
                videos: [],
                quizzes: []
              },
              {
                title: 'Phonics Adventure',
                description: 'Embark on an exciting adventure through the world of phonics',
                videos: [],
                quizzes: []
              }
            ];
          } else if (moduleId === '2' || moduleId === '68cfdd9ae3bc97188711e041') {
            // Basic Vocabulary - 4 topics
            fallbackTopics = [
              {
                title: 'Common Objects',
                description: 'Learn names of everyday objects around you',
                videos: [],
                quizzes: []
              },
              {
                title: 'Animals',
                description: 'Discover names of different animals',
                videos: [],
                quizzes: []
              },
              {
                title: 'Colors',
                description: 'Learn all the colors of the rainbow',
                videos: [],
                quizzes: []
              },
              {
                title: 'Numbers',
                description: 'Count from 1 to 20',
                videos: [],
                quizzes: []
              }
            ];
          } else if (moduleId === '3' || moduleId === '68cfdd9ae3bc97188711e042') {
            // Numbers & Counting - 5 topics
            fallbackTopics = [
              {
                title: 'Numbers 1-10',
                description: 'Learn to count from 1 to 10',
                videos: [],
                quizzes: []
              },
              {
                title: 'Numbers 11-20',
                description: 'Master counting from 11 to 20',
                videos: [],
                quizzes: []
              },
              {
                title: 'Addition Basics',
                description: 'Learn simple addition with numbers',
                videos: [],
                quizzes: []
              },
              {
                title: 'Subtraction Basics',
                description: 'Practice simple subtraction',
                videos: [],
                quizzes: []
              },
              {
                title: 'Number Patterns',
                description: 'Recognize and create number patterns',
                videos: [],
                quizzes: []
              }
            ];
          } else {
            // Default topics for other modules
            fallbackTopics = [
              {
                title: 'Introduction',
                description: 'Get started with this module',
                videos: [],
                quizzes: []
              },
              {
                title: 'Practice',
                description: 'Practice what you learned',
                videos: [],
                quizzes: []
              },
              {
                title: 'Review',
                description: 'Review and test your knowledge',
                videos: [],
                quizzes: []
              }
            ];
          }
          
          console.log('Using fallback topics for module:', moduleId, fallbackTopics);
          setTopics(fallbackTopics);
        } else {
          console.log('Using real topics from API:', topicsArray);
          setTopics(topicsArray);
        }
      }
    } catch (error) {
      console.error('Error loading module content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleStartLesson = (topic?: any) => {
    // Use module data (which includes fallback data) instead of just currentModule
    const activeModule = currentModule || module;
    
    if (activeModule) {
      if (topic) {
        // Navigate to topic-specific content screen
        const params = { 
          moduleId: activeModule._id,
          moduleTitle: activeModule.title,
          topicTitle: topic.title,
          topicDescription: topic.description
        };
        
        navigation.navigate('TopicContent', params);
      } else {
        // Default lesson player navigation
        navigation.navigate('LessonPlayer', { 
          moduleId: activeModule._id,
          step: 0 
        });
      }
    } else {
      Alert.alert('Error', 'Module data not available');
    }
  };

  const handleTakeQuiz = () => {
    if (currentModule?.quiz) {
      navigation.navigate('Quiz', { 
        quizId: currentModule.quiz,
        moduleId: currentModule._id 
      });
    }
  };

  // Get module data or use fallback based on moduleId
  const getModuleData = () => {
    console.log('=== GET MODULE DATA ===');
    console.log('moduleId from route:', moduleId);
    console.log('currentModule from API:', currentModule);
    
    // For modules 4-20, always use fallback data even if currentModule exists
    if (moduleId && !['1', '2', '3', '68cfdd9ae3bc97188711e040', '68cfdd9ae3bc97188711e041', '68cfdd9ae3bc97188711e042'].includes(moduleId)) {
      console.log('Forcing fallback data for module:', moduleId);
      // Skip currentModule and use fallback
    } else if (currentModule) {
      console.log('Using currentModule from API');
      return currentModule;
    }
    
    // Fallback data based on moduleId - All 20 lessons
    const fallbackModules = {
      '1': {
        _id: '1',
        title: 'Alphabet & Phonics',
        description: 'Learn A–Z sounds, recognition, and basic blending. Activities: tracing, sound matching, phonics games.',
        moduleType: 'phonics',
        difficulty: 'Easy',
        estimatedDuration: 20,
        isFeatured: true,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '2': {
        _id: '2',
        title: 'Basic Vocabulary',
        description: 'Words for objects, animals, people, and daily life. Flashcards, image–word associations.',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 15,
        isFeatured: true,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '3': {
        _id: '3',
        title: 'Numbers & Counting',
        description: 'Numbers 1–100, basic addition/subtraction terms. Songs, rhymes, visual exercises.',
        moduleType: 'math',
        difficulty: 'Easy',
        estimatedDuration: 18,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '4': {
        _id: '4',
        title: 'Colors & Shapes',
        description: 'Color names, shape recognition, comparisons. Interactive drawing/coloring.',
        moduleType: 'visual',
        difficulty: 'Easy',
        estimatedDuration: 12,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '5': {
        _id: '5',
        title: 'Family & Relationships',
        description: 'Vocabulary for family members, friends, greetings. Roleplay: "My Family," "Introducing a Friend."',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 16,
        isFeatured: true,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '6': {
        _id: '6',
        title: 'Animals & Nature',
        description: 'Wild vs domestic animals, natural elements (tree, river, sky). Story-based learning, nature quizzes.',
        moduleType: 'vocabulary',
        difficulty: 'Medium',
        estimatedDuration: 20,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '7': {
        _id: '7',
        title: 'Food & Drinks',
        description: 'Common foods, meals, asking for food. Interactive "menu game."',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 14,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '8': {
        _id: '8',
        title: 'Clothing & Accessories',
        description: 'Clothes, shoes, accessories, describing outfits. Dress-up vocabulary activities.',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 13,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '9': {
        _id: '9',
        title: 'Home & Furniture',
        description: 'Rooms, furniture names, household items. Label-your-home activity.',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 15,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '10': {
        _id: '10',
        title: 'School & Education',
        description: 'Subjects, school supplies, classroom expressions. "In the classroom" roleplay.',
        moduleType: 'vocabulary',
        difficulty: 'Medium',
        estimatedDuration: 17,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '11': {
        _id: '11',
        title: 'Body Parts & Health',
        description: 'Human body parts, basic health vocabulary. "Doctor & patient" conversation practice.',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 16,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '12': {
        _id: '12',
        title: 'Transportation',
        description: 'Vehicles, travel words, asking directions. Map activities & travel dialogues.',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 18,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '13': {
        _id: '13',
        title: 'Weather & Seasons',
        description: 'Weather words, seasonal changes. Daily weather reports practice.',
        moduleType: 'vocabulary',
        difficulty: 'Easy',
        estimatedDuration: 14,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '14': {
        _id: '14',
        title: 'Time & Calendar',
        description: 'Days, months, telling time. Scheduling activities.',
        moduleType: 'vocabulary',
        difficulty: 'Medium',
        estimatedDuration: 19,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '15': {
        _id: '15',
        title: 'Basic Grammar',
        description: 'Sentence structure, nouns, verbs, simple tenses. Fill-in-the-blanks, rearrange words game.',
        moduleType: 'grammar',
        difficulty: 'Medium',
        estimatedDuration: 22,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '16': {
        _id: '16',
        title: 'Common Verbs',
        description: 'Action words (run, eat, play), verb forms. "Verb charades" game.',
        moduleType: 'grammar',
        difficulty: 'Easy',
        estimatedDuration: 17,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '17': {
        _id: '17',
        title: 'Adjectives & Descriptions',
        description: 'Describing objects, people, comparisons. Picture description tasks.',
        moduleType: 'grammar',
        difficulty: 'Easy',
        estimatedDuration: 16,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '18': {
        _id: '18',
        title: 'Prepositions & Directions',
        description: 'In, on, under, near, giving directions. Treasure hunt with prepositions.',
        moduleType: 'grammar',
        difficulty: 'Easy',
        estimatedDuration: 18,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '19': {
        _id: '19',
        title: 'Questions & Answers',
        description: 'Forming WH-questions, yes/no questions. Quiz-style practice.',
        moduleType: 'grammar',
        difficulty: 'Medium',
        estimatedDuration: 20,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      },
      '20': {
        _id: '20',
        title: 'Conversation Practice',
        description: 'Real-world dialogues: shopping, school, friends. Roleplay and storytelling.',
        moduleType: 'speaking',
        difficulty: 'Hard',
        estimatedDuration: 25,
        isFeatured: false,
        userProgress: { percentage: 0, status: 'not-started', timeSpent: 0 }
      }
    };
    
    console.log('Available fallback module IDs:', Object.keys(fallbackModules));
    console.log('Looking for moduleId:', moduleId);
    console.log('ModuleId type:', typeof moduleId);
    
    const selectedModule = fallbackModules[moduleId as keyof typeof fallbackModules] || fallbackModules['1'];
    console.log('Selected fallback module:', selectedModule.title);
    console.log('Selected module ID:', selectedModule._id);
    return selectedModule;
  };

  const module = getModuleData();

  const renderHeader = () => {
    return (
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradients.header}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{module.title} 📚</Text>
              <Text style={styles.headerSubtitle}>Explore lesson topics</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')} 
              style={styles.profileButton}
            >
              <MaterialIcons name="account-circle" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderCategoryHeader = (title: string, icon: string) => (
    <Animated.View
      style={[
        styles.categoryHeader,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.categoryHeaderContent}>
        <MaterialIcons name={icon as any} size={24} color={theme.colors.primary} />
        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
    </Animated.View>
  );

  const renderTopicItem = ({ item, index }: { item: any; index: number }) => {
    const colors = ['#4169e1', '#4ecdc4', '#2ed573', '#667eea', '#f093fb'];
    const cardColor = colors[index % colors.length];

    return (
      <Animated.View
        style={[
          styles.topicCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.topicCardContent, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleStartLesson(item)}
        >
          <LinearGradient
            colors={[cardColor, cardColor + '80']}
            style={styles.topicHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.topicHeaderContent}>
              <View style={styles.topicIcon}>
                <MaterialIcons name={item.icon} size={24} color="white" />
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.topicType}>{item.type}</Text>
              </View>
              <View style={styles.topicActions}>
                {item.isCompleted && (
                  <View style={styles.completedBadge}>
                    <MaterialIcons name="check-circle" size={20} color="#2ed573" />
                  </View>
                )}
                <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.topicBody}>
            <Text style={[styles.topicDescription, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {item.description}
            </Text>
            <Text style={[styles.clickHint, { color: theme.colors.primary }]}>
              Tap to view videos and quizzes →
            </Text>
            
            <View style={styles.topicMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.duration} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="trending-up" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.difficulty}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Define topic categories based on specific module ID and content
  const getTopicCategories = () => {
    console.log('=== GET TOPIC CATEGORIES DEBUG ===');
    console.log('topics:', topics);
    console.log('topics.length:', Array.isArray(topics) ? topics.length : 0);
    console.log('currentModule:', currentModule);
    
    // First, try to get topics from the fetched content
    if (Array.isArray(topics) && topics.length > 0) {
      return [{
        title: 'Topics',
        icon: 'school',
        topics: topics.map((topic: any) => ({
          title: topic.title,
          description: topic.description,
          icon: 'play-circle-filled',
          type: 'Lesson',
          duration: topic.videos?.length || 0,
          difficulty: 'Medium',
          isCompleted: false,
          videos: topic.videos,
          quizzes: topic.quizzes
        }))
      }];
    }
    
    // Fallback to module topics if available
    if ((module as any).topics && Array.isArray((module as any).topics) && (module as any).topics.length > 0) {
      // Group topics by category if they have category information
      const groupedTopics = (module as any).topics.reduce((acc: any, topic: any) => {
        const category = topic.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          title: topic.title,
          description: topic.description || 'Learn and practice this topic.',
          icon: topic.icon || 'school',
          type: topic.type || 'Lesson',
          duration: topic.duration || 10,
          difficulty: topic.difficulty || 'Medium',
          isCompleted: topic.isCompleted || false
        });
        return acc;
      }, {});

      // Convert to array format
      return Object.entries(groupedTopics).map(([categoryName, topics]: [string, any]) => ({
        title: categoryName,
        icon: getCategoryIcon(categoryName),
        topics: topics
      }));
    }

    // Specific topics for each of the 20 lessons
    const specificLessons = {
      '1': [ // Alphabet & Phonics
        {
          title: 'Letter Learning',
          icon: 'text-fields',
          topics: [
            {
              title: 'ABC Song Fun',
              description: 'Learn A–Z sounds with fun animations and examples.',
              icon: 'volume-up',
              type: 'Audio',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Letter Hunt Game',
              description: 'Practice recognizing letters A through Z.',
              icon: 'visibility',
              type: 'Visual',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Magic Writing',
              description: 'Practice writing letters with guided tracing exercises.',
              icon: 'edit',
              type: 'Writing',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Sound Games',
          icon: 'games',
          topics: [
            {
              title: 'Sound Detective',
              description: 'Match letters with their sounds in interactive games.',
              icon: 'games',
              type: 'Game',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Word Building Magic',
              description: 'Learn to blend sounds to make simple words.',
              icon: 'spellcheck',
              type: 'Reading',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Phonics Adventure',
              description: 'Play fun phonics games to practice sounds.',
              icon: 'games',
              type: 'Game',
              duration: 6,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ],
      '2': [ // Basic Vocabulary
        {
          title: 'Word Discovery',
          icon: 'category',
          topics: [
            {
              title: 'Around Me Words',
              description: 'Words for objects, animals, people, and daily life.',
              icon: 'home',
              type: 'Vocabulary',
              duration: 7,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Picture Cards',
              description: 'Learn vocabulary using flashcards with pictures.',
              icon: 'style',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Match & Learn',
              description: 'Match pictures with their correct words.',
              icon: 'image',
              type: 'Activity',
              duration: 6,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ],
      '3': [ // Numbers & Counting
        {
          title: 'Number Fun',
          icon: 'looks-one',
          topics: [
            {
              title: 'Counting to 100',
              description: 'Numbers 1–100, basic addition/subtraction terms.',
              icon: 'calculate',
              type: 'Math',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Number Songs',
              description: 'Learn numbers through fun songs and rhymes.',
              icon: 'music-note',
              type: 'Audio',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Counting Games',
              description: 'Practice counting with visual aids and exercises.',
              icon: 'visibility',
              type: 'Visual',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ],
      '4': [ // Colors & Shapes
        {
          title: 'Art & Colors',
          icon: 'palette',
          topics: [
            {
              title: 'Rainbow Colors',
              description: 'Color names, shape recognition, comparisons.',
              icon: 'color-lens',
              type: 'Visual',
              duration: 6,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Drawing Fun',
              description: 'Interactive drawing/coloring activities.',
              icon: 'edit',
              type: 'Activity',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ],
      '5': [ // Family & Relationships
        {
          title: 'My Family',
          icon: 'family-restroom',
          topics: [
            {
              title: 'Family Tree',
              description: 'Vocabulary for family members, friends, greetings.',
              icon: 'person',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Meet My Family',
              description: 'Roleplay: "My Family," "Introducing a Friend."',
              icon: 'group',
              type: 'Speaking',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ],
      '6': [ // Animals & Nature
        {
          title: 'Animal World',
          icon: 'park',
          topics: [
            {
              title: 'Zoo & Farm Animals',
              description: 'Wild vs domestic animals, natural elements (tree, river, sky).',
              icon: 'pets',
              type: 'Vocabulary',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Nature Stories',
              description: 'Story-based learning, nature quizzes.',
              icon: 'auto-stories',
              type: 'Reading',
              duration: 9,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '7': [ // Food & Drinks
        {
          title: 'Yummy Food',
          icon: 'restaurant',
          topics: [
            {
              title: 'Food Around Me',
              description: 'Common foods, meals, asking for food.',
              icon: 'eco',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Restaurant Game',
              description: 'Interactive "menu game."',
              icon: 'games',
              type: 'Game',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '8': [ // Clothing & Accessories
        {
          title: 'Fashion Fun',
          icon: 'checkroom',
          topics: [
            {
              title: 'My Clothes',
              description: 'Clothes, shoes, accessories, describing outfits.',
              icon: 'person',
              type: 'Vocabulary',
              duration: 7,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Fashion Show',
              description: 'Dress-up vocabulary activities.',
              icon: 'games',
              type: 'Game',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '9': [ // Home & Furniture
        {
          title: 'My House',
          icon: 'home',
          topics: [
            {
              title: 'House Tour',
              description: 'Rooms, furniture names, household items.',
              icon: 'living',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Label My Home',
              description: 'Label-your-home activity.',
              icon: 'label',
              type: 'Activity',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '10': [ // School & Education
        {
          title: 'School Time',
          icon: 'school',
          topics: [
            {
              title: 'My School Bag',
              description: 'Subjects, school supplies, classroom expressions.',
              icon: 'calculate',
              type: 'Vocabulary',
              duration: 9,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Classroom Fun',
              description: '"In the classroom" roleplay.',
              icon: 'chat',
              type: 'Speaking',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '11': [ // Body Parts & Health
        {
          title: 'My Body',
          icon: 'person',
          topics: [
            {
              title: 'Body Explorer',
              description: 'Human body parts, basic health vocabulary.',
              icon: 'face',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Doctor Visit',
              description: '"Doctor & patient" conversation practice.',
              icon: 'medical-services',
              type: 'Speaking',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '12': [ // Transportation
        {
          title: 'Travel Time',
          icon: 'directions-car',
          topics: [
            {
              title: 'Wheels & Wings',
              description: 'Vehicles, travel words, asking directions.',
              icon: 'local-taxi',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Adventure Map',
              description: 'Map activities & travel dialogues.',
              icon: 'map',
              type: 'Activity',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '13': [ // Weather & Seasons
        {
          title: 'Sky Watch',
          icon: 'wb-sunny',
          topics: [
            {
              title: 'Sunny & Rainy',
              description: 'Weather words, seasonal changes.',
              icon: 'wb-sunny',
              type: 'Vocabulary',
              duration: 6,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Weather News',
              description: 'Daily weather reports practice.',
              icon: 'mic',
              type: 'Speaking',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '14': [ // Time & Calendar
        {
          title: 'Time Keeper',
          icon: 'calendar-today',
          topics: [
            {
              title: 'Calendar Magic',
              description: 'Days, months, telling time.',
              icon: 'calendar-month',
              type: 'Vocabulary',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'My Schedule',
              description: 'Scheduling activities.',
              icon: 'event',
              type: 'Activity',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '15': [ // Basic Grammar
        {
          title: 'Grammar Fun',
          icon: 'school',
          topics: [
            {
              title: 'Sentence Builder',
              description: 'Sentence structure, nouns, verbs, simple tenses.',
              icon: 'format-align-left',
              type: 'Grammar',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Word Puzzle',
              description: 'Fill-in-the-blanks, rearrange words game.',
              icon: 'quiz',
              type: 'Game',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '16': [ // Common Verbs
        {
          title: 'Action Time',
          icon: 'directions-run',
          topics: [
            {
              title: 'Move & Play',
              description: 'Action words (run, eat, play), verb forms.',
              icon: 'directions-run',
              type: 'Vocabulary',
              duration: 9,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Action Charades',
              description: '"Verb charades" game.',
              icon: 'games',
              type: 'Game',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '17': [ // Adjectives & Descriptions
        {
          title: 'Describe It',
          icon: 'palette',
          topics: [
            {
              title: 'Big & Small',
              description: 'Describing objects, people, comparisons.',
              icon: 'straighten',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Picture Story',
              description: 'Picture description tasks.',
              icon: 'image',
              type: 'Speaking',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '18': [ // Prepositions & Directions
        {
          title: 'Where Is It?',
          icon: 'place',
          topics: [
            {
              title: 'Position Words',
              description: 'In, on, under, near, giving directions.',
              icon: 'layers',
              type: 'Grammar',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Treasure Hunt',
              description: 'Treasure hunt with prepositions.',
              icon: 'games',
              type: 'Game',
              duration: 15,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '19': [ // Questions & Answers
        {
          title: 'Ask & Answer',
          icon: 'help',
          topics: [
            {
              title: 'Question Time',
              description: 'Forming WH-questions, yes/no questions.',
              icon: 'quiz',
              type: 'Grammar',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Quick Quiz',
              description: 'Quiz-style practice.',
              icon: 'quiz',
              type: 'Activity',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      '20': [ // Conversation Practice
        {
          title: 'Chat Time',
          icon: 'shopping-cart',
          topics: [
            {
              title: 'Real Talk',
              description: 'Real-world dialogues: shopping, school, friends.',
              icon: 'store',
              type: 'Speaking',
              duration: 12,
              difficulty: 'Hard',
              isCompleted: false
            },
            {
              title: 'Story Adventure',
              description: 'Roleplay and storytelling.',
              icon: 'auto-stories',
              type: 'Speaking',
              duration: 15,
              difficulty: 'Hard',
              isCompleted: false
            }
          ]
        }
      ]
    };

    // Return specific topics for the current module, or fallback to module type
    const moduleId = module._id || (module as any).id;
    if (specificLessons[moduleId as keyof typeof specificLessons]) {
      return specificLessons[moduleId as keyof typeof specificLessons];
    }

    // Fallback to hardcoded categories based on module type
    const baseCategories = {
      'phonics': [
        {
          title: 'Letter Recognition',
          icon: 'text-fields',
          topics: [
            {
              title: 'A-Z Letter Sounds',
              description: 'Learn the sounds of each letter with fun animations and examples.',
              icon: 'volume-up',
              type: 'Audio',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Letter Tracing',
              description: 'Practice writing letters with guided tracing exercises.',
              icon: 'edit',
              type: 'Writing',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Sound Matching',
              description: 'Match letters with their sounds in interactive games.',
              icon: 'games',
              type: 'Game',
              duration: 6,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Blending & Reading',
          icon: 'menu-book',
          topics: [
            {
              title: 'CVC Words',
              description: 'Learn to read simple consonant-vowel-consonant words.',
              icon: 'spellcheck',
              type: 'Reading',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Word Building',
              description: 'Build words by combining letters and sounds.',
              icon: 'extension',
              type: 'Activity',
              duration: 9,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      'vocabulary': [
        {
          title: 'Basic Words',
          icon: 'book',
          topics: [
            {
              title: 'Object Names',
              description: 'Learn names of common objects around you.',
              icon: 'category',
              type: 'Vocabulary',
              duration: 7,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Animal Names',
              description: 'Discover names of different animals with pictures.',
              icon: 'pets',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Color Words',
              description: 'Learn colors and how to describe them.',
              icon: 'palette',
              type: 'Vocabulary',
              duration: 5,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Daily Life',
          icon: 'home',
          topics: [
            {
              title: 'Family Members',
              description: 'Learn to name and describe family relationships.',
              icon: 'family-restroom',
              type: 'Vocabulary',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Food & Drinks',
              description: 'Explore names of different foods and beverages.',
              icon: 'restaurant',
              type: 'Vocabulary',
              duration: 9,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ],
      'grammar': [
        {
          title: 'Basic Grammar',
          icon: 'school',
          topics: [
            {
              title: 'Nouns & Pronouns',
              description: 'Learn about people, places, things and how to replace them.',
              icon: 'person',
              type: 'Grammar',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Verbs & Tenses',
              description: 'Master action words and when things happen.',
              icon: 'directions-run',
              type: 'Grammar',
              duration: 15,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Adjectives',
              description: 'Learn to describe things with colorful words.',
              icon: 'palette',
              type: 'Grammar',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Sentence Structure',
          icon: 'format-align-left',
          topics: [
            {
              title: 'Simple Sentences',
              description: 'Build basic sentences with subject and verb.',
              icon: 'text-fields',
              type: 'Writing',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Questions & Answers',
              description: 'Learn to ask and answer questions properly.',
              icon: 'help',
              type: 'Speaking',
              duration: 11,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      'speaking': [
        {
          title: 'Conversation Skills',
          icon: 'mic',
          topics: [
            {
              title: 'Greetings & Introductions',
              description: 'Learn how to say hello and introduce yourself.',
              icon: 'wave',
              type: 'Speaking',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Daily Conversations',
              description: 'Practice talking about your day and activities.',
              icon: 'chat',
              type: 'Speaking',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Asking for Help',
              description: 'Learn polite ways to ask for assistance.',
              icon: 'help-outline',
              type: 'Speaking',
              duration: 9,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Pronunciation',
          icon: 'record-voice-over',
          topics: [
            {
              title: 'Word Stress',
              description: 'Learn which syllables to emphasize in words.',
              icon: 'volume-up',
              type: 'Audio',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Common Sounds',
              description: 'Practice difficult English sounds and combinations.',
              icon: 'hearing',
              type: 'Audio',
              duration: 13,
              difficulty: 'Hard',
              isCompleted: false
            }
          ]
        }
      ],
      'math': [
        {
          title: 'Numbers & Counting',
          icon: 'calculate',
          topics: [
            {
              title: 'Numbers 1-100',
              description: 'Learn to count and recognize numbers up to 100.',
              icon: 'looks-one',
              type: 'Math',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Addition Basics',
              description: 'Learn to add numbers with fun examples.',
              icon: 'add',
              type: 'Math',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Subtraction Basics',
              description: 'Learn to subtract numbers step by step.',
              icon: 'remove',
              type: 'Math',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Math in English',
          icon: 'functions',
          topics: [
            {
              title: 'Math Vocabulary',
              description: 'Learn English words for math operations and concepts.',
              icon: 'translate',
              type: 'Vocabulary',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Word Problems',
              description: 'Solve math problems written in English.',
              icon: 'quiz',
              type: 'Problem Solving',
              duration: 15,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      'reading': [
        {
          title: 'Reading Skills',
          icon: 'menu-book',
          topics: [
            {
              title: 'Sight Words',
              description: 'Learn common words you should recognize instantly.',
              icon: 'visibility',
              type: 'Reading',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Reading Comprehension',
              description: 'Practice understanding what you read.',
              icon: 'psychology',
              type: 'Reading',
              duration: 15,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Story Elements',
              description: 'Learn about characters, setting, and plot.',
              icon: 'theater-comedy',
              type: 'Reading',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Reading Practice',
          icon: 'auto-stories',
          topics: [
            {
              title: 'Short Stories',
              description: 'Read and understand simple stories.',
              icon: 'book',
              type: 'Reading',
              duration: 18,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Reading Aloud',
              description: 'Practice reading stories out loud with expression.',
              icon: 'mic',
              type: 'Speaking',
              duration: 14,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      'writing': [
        {
          title: 'Writing Basics',
          icon: 'edit',
          topics: [
            {
              title: 'Letter Formation',
              description: 'Practice writing letters correctly and neatly.',
              icon: 'text-fields',
              type: 'Writing',
              duration: 12,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Simple Sentences',
              description: 'Learn to write complete sentences.',
              icon: 'format-align-left',
              type: 'Writing',
              duration: 10,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Punctuation',
              description: 'Learn to use periods, commas, and question marks.',
              icon: 'more-horiz',
              type: 'Writing',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Creative Writing',
          icon: 'create',
          topics: [
            {
              title: 'Story Writing',
              description: 'Create your own short stories with characters.',
              icon: 'auto-stories',
              type: 'Writing',
              duration: 20,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Descriptive Writing',
              description: 'Learn to describe people, places, and things.',
              icon: 'palette',
              type: 'Writing',
              duration: 15,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        }
      ],
      'listening': [
        {
          title: 'Listening Skills',
          icon: 'hearing',
          topics: [
            {
              title: 'Following Instructions',
              description: 'Learn to listen and follow simple directions.',
              icon: 'directions',
              type: 'Listening',
              duration: 8,
              difficulty: 'Easy',
              isCompleted: false
            },
            {
              title: 'Understanding Stories',
              description: 'Listen to stories and answer questions about them.',
              icon: 'headphones',
              type: 'Listening',
              duration: 12,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Audio Comprehension',
              description: 'Practice understanding spoken English.',
              icon: 'volume-up',
              type: 'Listening',
              duration: 10,
              difficulty: 'Medium',
              isCompleted: false
            }
          ]
        },
        {
          title: 'Listening Practice',
          icon: 'audiotrack',
          topics: [
            {
              title: 'Conversation Practice',
              description: 'Listen to conversations and understand the context.',
              icon: 'chat',
              type: 'Listening',
              duration: 14,
              difficulty: 'Medium',
              isCompleted: false
            },
            {
              title: 'Music & Songs',
              description: 'Learn English through songs and music.',
              icon: 'music-note',
              type: 'Listening',
              duration: 16,
              difficulty: 'Easy',
              isCompleted: false
            }
          ]
        }
      ]
    };

    const result = baseCategories[module.moduleType as keyof typeof baseCategories] || baseCategories['vocabulary'];
    console.log('=== GET TOPIC CATEGORIES RESULT ===');
    console.log('module.moduleType:', module.moduleType);
    console.log('result:', result);
    console.log('result.length:', Array.isArray(result) ? result.length : 0);
    return result;
  };

  // Helper function to get appropriate icon for category names
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'General': 'school',
      'Basic': 'school',
      'Advanced': 'trending-up',
      'Practice': 'fitness-center',
      'Theory': 'book',
      'Skills': 'psychology',
      'Fundamentals': 'text-fields',
      'Application': 'extension',
      'Review': 'refresh',
      'Assessment': 'quiz',
      'Interactive': 'games',
      'Audio': 'volume-up',
      'Visual': 'visibility',
      'Reading': 'menu-book',
      'Writing': 'edit',
      'Speaking': 'mic',
      'Listening': 'hearing',
      'Grammar': 'school',
      'Vocabulary': 'book',
      'Math': 'calculate',
      'Phonics': 'text-fields'
    };
    
    return iconMap[categoryName] || 'school';
  };

  const topicCategories = getTopicCategories();
  
  console.log('=== RENDER DEBUG ===');
  console.log('topicCategories:', topicCategories);
  console.log('topicCategories.length:', Array.isArray(topicCategories) ? topicCategories.length : 0);
  console.log('loadingContent:', loadingContent);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >

        {loadingContent ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading topics...
            </Text>
          </View>
        ) : Array.isArray(topicCategories) && topicCategories.length > 0 ? (
          topicCategories.map((category, categoryIndex) => (
            <View key={category.title}>
              {renderCategoryHeader(category.title, category.icon)}
              {Array.isArray(category.topics) ? category.topics.map((topic: any, topicIndex: number) => 
                <View key={topic.title}>
                  {renderTopicItem({ item: topic, index: categoryIndex * 10 + topicIndex })}
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="video-library" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Content Available
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              No videos or quizzes have been added to this module yet.
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  categoryHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  topicCard: {
    marginBottom: 16,
  },
  topicCardContent: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  topicHeader: {
    padding: 16,
  },
  topicHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  topicType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicBody: {
    padding: 16,
  },
  topicDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  clickHint: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  topicMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
  },
});

