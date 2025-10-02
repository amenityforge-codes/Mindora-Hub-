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
  ActivityIndicator,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface EnhancedLessonManagementScreenProps {
  navigation: any;
  route?: {
    params: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: Topic[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
  ageRange: string;
  estimatedDuration: number;
  tags: string[];
}

interface Topic {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  videos: Video[];
  quizzes: Quiz[];
  createdAt: string;
  order: number;
}

interface Video {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  duration: number;
  thumbnail: string;
  description: string;
  assignedQuiz?: string | null;
}

interface Quiz {
  _id?: string;
  id?: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const EnhancedLessonManagementScreen: React.FC<EnhancedLessonManagementScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Utility function to generate ObjectId-like strings
  const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const random = Math.random().toString(16).substring(2, 14);
    return timestamp + random;
  };
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    ageRange: ageRange,
    estimatedDuration: 1,
    tags: ''
  });
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: ''
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: 0,
    description: '',
    file: null as any,
    thumbnail: null as any,
    assignedQuiz: null as string | null
  });
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    questions: [
      { id: generateObjectId(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Imported lessons from main learning interface
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Get imported lessons data
  const getImportedLessons = () => {
    const importedLessons: Lesson[] = [
      {
        id: '1',
        title: 'Alphabet & Phonics',
        description: 'Learn the English alphabet and basic phonics sounds',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 120,
        tags: ['phonics', 'alphabet', 'beginner'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '1', title: 'ABC Song Fun', description: 'Learn A-Z sounds with fun animations and examples', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '2', title: 'Letter Hunt Game', description: 'Practice recognizing letters A through Z', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '3', title: 'Magic Writing', description: 'Practice writing letters with guided tracing exercises', order: 3, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '2',
        title: 'Basic Vocabulary',
        description: 'Essential words for daily communication',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 90,
        tags: ['vocabulary', 'words', 'beginner'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '4', title: 'Around Me Words', description: 'Words for objects, animals, people, and daily life', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '5', title: 'Picture Cards', description: 'Learn vocabulary using flashcards with pictures', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '6', title: 'Match & Learn', description: 'Match pictures with their correct words', order: 3, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '3',
        title: 'Numbers & Counting',
        description: 'Learn numbers 1-100 and basic counting',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 60,
        tags: ['numbers', 'counting', 'math'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '7', title: 'Counting to 100', description: 'Numbers 1–100, basic addition/subtraction terms', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '8', title: 'Number Songs', description: 'Learn numbers through fun songs and rhymes', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '9', title: 'Counting Games', description: 'Practice counting with visual aids and exercises', order: 3, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '4',
        title: 'Colors & Shapes',
        description: 'Learn about colors and basic shapes',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 45,
        tags: ['colors', 'shapes', 'visual'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '10', title: 'Rainbow Colors', description: 'Color names, shape recognition, comparisons', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '11', title: 'Drawing Fun', description: 'Interactive drawing/coloring activities', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '5',
        title: 'Family & Relationships',
        description: 'Learn about family members and relationships',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 50,
        tags: ['family', 'relationships', 'social'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '12', title: 'Family Tree', description: 'Vocabulary for family members, friends, greetings', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '13', title: 'Meet My Family', description: 'Roleplay: "My Family," "Introducing a Friend"', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '6',
        title: 'Animals & Nature',
        description: 'Learn about animals and natural elements',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 70,
        tags: ['animals', 'nature', 'environment'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '14', title: 'Zoo & Farm Animals', description: 'Wild vs domestic animals, natural elements', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '15', title: 'Nature Stories', description: 'Story-based learning, nature quizzes', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '7',
        title: 'Food & Drinks',
        description: 'Learn about different foods and beverages',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 55,
        tags: ['food', 'drinks', 'nutrition'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '16', title: 'Food Around Me', description: 'Common foods, meals, asking for food', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '17', title: 'Restaurant Game', description: 'Interactive "menu game"', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '8',
        title: 'Clothing & Accessories',
        description: 'Learn about clothes and fashion',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 40,
        tags: ['clothing', 'fashion', 'style'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '18', title: 'My Clothes', description: 'Clothes, shoes, accessories, describing outfits', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '19', title: 'Fashion Show', description: 'Dress-up vocabulary activities', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '9',
        title: 'Home & Furniture',
        description: 'Learn about house and furniture',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 60,
        tags: ['home', 'furniture', 'household'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '20', title: 'House Tour', description: 'Rooms, furniture names, household items', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '21', title: 'Label My Home', description: 'Label-your-home activity', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '10',
        title: 'School & Education',
        description: 'Learn about school and education',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 65,
        tags: ['school', 'education', 'learning'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '22', title: 'My School Bag', description: 'Subjects, school supplies, classroom expressions', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '23', title: 'Classroom Fun', description: '"In the classroom" roleplay', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '11',
        title: 'Body Parts & Health',
        description: 'Learn about human body and health',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 50,
        tags: ['body', 'health', 'anatomy'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '24', title: 'Body Explorer', description: 'Human body parts, basic health vocabulary', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '25', title: 'Doctor Visit', description: '"Doctor & patient" conversation practice', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '12',
        title: 'Transportation',
        description: 'Learn about different modes of transport',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 45,
        tags: ['transportation', 'travel', 'vehicles'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '26', title: 'Wheels & Wings', description: 'Vehicles, travel words, asking directions', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '27', title: 'Adventure Map', description: 'Map activities & travel dialogues', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '13',
        title: 'Weather & Seasons',
        description: 'Learn about weather and seasons',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 40,
        tags: ['weather', 'seasons', 'climate'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '28', title: 'Sunny & Rainy', description: 'Weather words, seasonal changes', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '29', title: 'Weather News', description: 'Daily weather reports practice', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '14',
        title: 'Time & Calendar',
        description: 'Learn about time and calendar',
        difficulty: 'beginner',
        ageRange: '6-15',
        estimatedDuration: 55,
        tags: ['time', 'calendar', 'schedule'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '30', title: 'Calendar Magic', description: 'Days, months, telling time', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '31', title: 'My Schedule', description: 'Scheduling activities', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '15',
        title: 'Basic Grammar',
        description: 'Learn fundamental grammar rules',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 90,
        tags: ['grammar', 'rules', 'structure'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '32', title: 'Sentence Builder', description: 'Sentence structure, nouns, verbs, simple tenses', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '33', title: 'Word Puzzle', description: 'Fill-in-the-blanks, rearrange words game', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '16',
        title: 'Common Verbs',
        description: 'Learn about action words and verbs',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 70,
        tags: ['verbs', 'actions', 'grammar'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '34', title: 'Move & Play', description: 'Action words (run, eat, play), verb forms', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '35', title: 'Action Charades', description: '"Verb charades" game', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '17',
        title: 'Adjectives & Descriptions',
        description: 'Learn to describe things and people',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 60,
        tags: ['adjectives', 'descriptions', 'vocabulary'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '36', title: 'Big & Small', description: 'Describing objects, people, comparisons', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '37', title: 'Picture Story', description: 'Picture description tasks', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '18',
        title: 'Prepositions & Directions',
        description: 'Learn about positions and directions',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 65,
        tags: ['prepositions', 'directions', 'positions'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '38', title: 'Position Words', description: 'In, on, under, near, giving directions', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '39', title: 'Treasure Hunt', description: 'Treasure hunt with prepositions', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '19',
        title: 'Questions & Answers',
        description: 'Learn to ask and answer questions',
        difficulty: 'intermediate',
        ageRange: '6-15',
        estimatedDuration: 75,
        tags: ['questions', 'answers', 'communication'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '40', title: 'Question Time', description: 'Forming WH-questions, yes/no questions', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '41', title: 'Quick Quiz', description: 'Quiz-style practice', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      },
      {
        id: '20',
        title: 'Conversation Practice',
        description: 'Practice real-world conversations',
        difficulty: 'advanced',
        ageRange: '6-15',
        estimatedDuration: 100,
        tags: ['conversation', 'speaking', 'communication'],
        status: 'published',
        createdAt: new Date().toISOString(),
        topics: [
          { id: '42', title: 'Real Talk', description: 'Real-world dialogues: shopping, school, friends', order: 1, createdAt: new Date().toISOString(), videos: [], quizzes: [] },
          { id: '43', title: 'Story Adventure', description: 'Roleplay and storytelling', order: 2, createdAt: new Date().toISOString(), videos: [], quizzes: [] }
        ]
      }
    ];

    setLessons(importedLessons);
    return importedLessons;
  };

  // Import all 20 lessons from main learning interface
  const importLessonsFromMainInterface = () => {
    const importedLessons = getImportedLessons();
    setLessons(importedLessons);
    return importedLessons;
  };

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load lessons from backend when component mounts
  useEffect(() => {
    const loadLessons = async () => {
      try {
        console.log('Loading lessons from backend...');
        const data = await apiService.get('/lessons');
        console.log('Loaded lessons from backend:', data.length);
        if (Array.isArray(data) && data.length > 0) {
          console.log('Lessons found in database, loading them...');
          // Ensure all lessons have proper structure
          const validatedLessons = data.map((lesson: any) => ({
            ...lesson,
            topics: Array.isArray(lesson.topics) ? lesson.topics.map((topic: any) => ({
              ...topic,
              videos: Array.isArray(topic.videos) ? topic.videos : [],
              quizzes: Array.isArray(topic.quizzes) ? topic.quizzes : []
            })) : []
          }));
          setLessons(validatedLessons);
        } else {
          console.log('No lessons found, creating default lessons in backend...');
          // If no lessons in database, save all 20 lessons to backend
          await saveAllLessonsToBackend();
        }
      } catch (error) {
        console.error('Error loading lessons from backend:', error);
        // If API fails, use local lessons
        importLessonsFromMainInterface();
      }
    };
    loadLessons();
  }, []);

  // Debug: Log lessons when they change
  useEffect(() => {
    console.log('Lessons updated:', lessons.length);
    if (lessons.length > 0) {
      console.log('First lesson topics:', lessons[0]?.topics?.length);
      console.log('First topic title:', lessons[0]?.topics?.[0]?.title);
    }
  }, [lessons]);

  // Function to get available quizzes for a topic
  const getAvailableQuizzes = (topic: Topic) => {
    if (!topic || !Array.isArray(topic.quizzes)) {
      console.log('No quizzes available for topic:', topic?.title);
      return [];
    }
    const quizzes = topic.quizzes.filter(quiz => quiz); // Filter out undefined quizzes
    console.log('Available quizzes for topic:', topic.title, 'Count:', quizzes.length);
    return quizzes;
  };

  // Function to save all 20 lessons to backend
  const saveAllLessonsToBackend = async () => {
    try {
      // First check if lessons already exist
      console.log('Checking existing lessons...');
      const checkResponse = await fetch('http://192.168.1.18:5000/api/lessons');
      if (checkResponse.ok) {
        const existingLessons = await checkResponse.json();
        if (existingLessons.length > 0) {
          console.log('Lessons already exist in database:', existingLessons.length);
          setLessons(existingLessons);
          return;
        }
      }

      console.log('Saving all lessons to backend...');
      const lessonsData = getImportedLessons();
      console.log('Lessons data to save:', lessonsData.length);
      
      const response = await fetch('http://192.168.1.18:5000/api/lessons/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: lessonsData }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('All lessons saved to backend successfully!', result.message);
        // Reload lessons from backend
        const reloadResponse = await fetch('http://192.168.1.18:5000/api/lessons');
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          console.log('Reloaded lessons from backend:', data.length);
          setLessons(data);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to save lessons to backend:', response.status, errorText);
        // Fallback to local lessons
        const localLessons = importLessonsFromMainInterface();
        setLessons(localLessons);
      }
    } catch (error) {
      console.error('Error saving lessons to backend:', error);
      // Fallback to local lessons
      const localLessons = importLessonsFromMainInterface();
      setLessons(localLessons);
    }
  };


  // Function to delete a lesson
  const deleteLesson = async (lessonId: string) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from backend
              const response = await fetch(`http://192.168.1.18:5000/api/lessons/${lessonId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                // Remove from local state
                setLessons(prev => {
                  if (!Array.isArray(prev)) return prev;
                  return prev.filter(lesson => lesson._id !== lessonId);
                });
                Alert.alert('Success', 'Lesson deleted successfully!');
              } else {
                Alert.alert('Error', 'Failed to delete lesson from backend');
              }
            } catch (error) {
              console.error('Error deleting lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson');
            }
          }
        }
      ]
    );
  };


  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    if (!newLesson.description.trim()) {
      Alert.alert('Error', 'Please enter a lesson description');
      return;
    }

    if (newLesson.estimatedDuration < 1) {
      Alert.alert('Error', 'Estimated duration must be at least 1 minute');
      return;
    }

    try {
      const lessonData = {
        title: newLesson.title.trim(),
        description: newLesson.description.trim(),
        difficulty: newLesson.difficulty,
        estimatedDuration: newLesson.estimatedDuration,
        ageRange: newLesson.ageRange
      };

      console.log('Sending lesson data:', lessonData);

      const response = await fetch('http://192.168.1.18:5000/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (response.ok) {
        const newLessonData = await response.json();
        setLessons(prev => [...prev, newLessonData]);
        setNewLesson({
          title: '',
          description: '',
          difficulty: 'Beginner',
          ageRange: ageRange,
          estimatedDuration: 1,
          tags: ''
        });
        setShowAddModal(false);
        Alert.alert('Success', 'Lesson added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        Alert.alert('Error', `Failed to add lesson: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      Alert.alert('Error', 'Failed to add lesson');
    }
  };

  const handleSyncToModules = async () => {
    try {
      setLoading(true);
      Alert.alert(
        'Sync Topics to Modules',
        'This will sync all topics from lessons to the main modules system. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sync',
            onPress: async () => {
              try {
                const response = await fetch('http://192.168.1.18:5000/api/lessons/sync-to-modules', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {
                  const result = await response.json();
                  Alert.alert(
                    'Sync Successful!',
                    `Synced ${result.data.syncedModules} modules, ${result.data.syncedVideos} videos, and ${result.data.syncedQuizzes} quizzes.\n\nYour modules are now available in the main app!`,
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          // Navigate back to dashboard to see the updated modules
                          navigation.navigate('ChildrenDashboard');
                        }
                      }
                    ]
                  );
                } else {
                  Alert.alert('Error', 'Failed to sync topics to modules');
                }
              } catch (error) {
                console.error('Error syncing topics:', error);
                Alert.alert('Error', 'Failed to sync topics to modules');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error syncing topics:', error);
      Alert.alert('Error', 'Failed to sync topics to modules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!selectedLesson || !newTopic.title.trim()) {
      Alert.alert('Error', 'Please enter a topic title');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.18:5000/api/lessons/${selectedLesson._id}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTopic.title,
          description: newTopic.description,
          order: selectedLesson.topics.length + 1
        }),
      });

      if (response.ok) {
        const newTopicData = await response.json();
        setLessons(prev => {
          if (!Array.isArray(prev)) return prev;
          return prev.map(lesson => 
            lesson._id === selectedLesson._id 
              ? { ...lesson, topics: [...(lesson.topics || []), newTopicData] }
              : lesson
          );
        });
        setNewTopic({ title: '', description: '' });
        setShowTopicModal(false);
        Alert.alert('Success', 'Topic added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add topic to backend');
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      Alert.alert('Error', 'Failed to add topic');
    }
  };

  const handleAddVideo = async () => {
    if (!selectedTopic || !newVideo.title.trim()) {
      Alert.alert('Error', 'Please enter a video title');
      return;
    }

    try {
      console.log('Creating video with API service...');
      const newVideoData = await apiService.post(`/lessons/${selectedLesson?._id}/topics/${selectedTopic._id}/videos`, {
        title: newVideo.title,
        description: newVideo.description,
        url: newVideo.file ? newVideo.file.uri : newVideo.url,
        duration: newVideo.duration,
        thumbnail: newVideo.thumbnail ? newVideo.thumbnail.uri : '',
        assignedQuiz: newVideo.assignedQuiz
      });

      console.log('Video creation successful:', newVideoData);
        setLessons(prev => {
          if (!Array.isArray(prev)) return prev;
          return prev.map(lesson => 
            lesson._id === selectedLesson?._id 
              ? {
                  ...lesson,
                  topics: (lesson.topics || []).map(topic =>
                    topic._id === selectedTopic._id
                      ? { ...topic, videos: [...(topic.videos || []), newVideoData] }
                      : topic
                  )
                }
              : lesson
          );
        });
        setNewVideo({ title: '', url: '', duration: 0, description: '', file: null, thumbnail: null, assignedQuiz: null });
        setShowVideoModal(false);
        Alert.alert('Success', 'Video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video');
    }
  };

  const pickVideoFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setNewVideo(prev => ({ ...prev, file }));
        Alert.alert('Success', `Video file selected: ${file.name}`);
      }
    } catch (error) {
      console.error('Error picking video file:', error);
      Alert.alert('Error', 'Failed to select video file');
    }
  };

  const pickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setNewVideo(prev => ({ ...prev, thumbnail: image }));
        Alert.alert('Success', 'Thumbnail selected');
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to select thumbnail');
    }
  };

  const handleAddQuiz = async () => {
    console.log('🔍 Debug - selectedLesson:', selectedLesson);
    console.log('🔍 Debug - selectedTopic:', selectedTopic);
    console.log('🔍 Debug - selectedLesson._id:', selectedLesson?._id);
    console.log('🔍 Debug - selectedTopic._id:', selectedTopic?._id);
    
    if (!selectedTopic || !newQuiz.title.trim()) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    if (!selectedLesson) {
      Alert.alert('Error', 'No lesson selected. Please close this modal and try clicking "Add Quiz" from the topic list again.');
      return;
    }

    // Filter out empty questions
    const validQuestions = (newQuiz.questions || []).filter(q => q && q.question && q.question.trim() && q.options && q.options.some(opt => opt && opt.trim()));
    
    if (validQuestions.length === 0) {
      Alert.alert('Error', 'Please add at least one question with options');
      return;
    }

    try {
      console.log('Creating quiz with API service...');
      console.log('🔍 API URL will be:', `/lessons/${selectedLesson._id}/topics/${selectedTopic._id}/quizzes`);
      const newQuizData = await apiService.post(`/lessons/${selectedLesson._id}/topics/${selectedTopic._id}/quizzes`, {
        title: newQuiz.title,
        questions: validQuestions
      });

      console.log('Quiz creation successful:', newQuizData);
      setLessons(prev => {
        if (!Array.isArray(prev)) return prev;
        return prev.map(lesson => 
          lesson._id === selectedLesson?._id 
            ? {
                ...lesson,
                topics: (lesson.topics || []).map(topic =>
                  topic._id === selectedTopic._id
                    ? { ...topic, quizzes: [...(topic.quizzes || []), newQuizData] }
                    : topic
                )
              }
            : lesson
        );
      });
      setNewQuiz({ 
        title: '', 
        questions: [
          { id: generateObjectId(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
        ]
      });
      setShowQuizModal(false);
      Alert.alert('Success', 'Quiz added successfully!');
    } catch (error) {
      console.error('Error adding quiz:', error);
      Alert.alert('Error', 'Failed to add quiz');
    }
  };

  const handleAddQuestion = () => {
    if (!selectedQuiz) {
      Alert.alert('Error', 'No quiz selected');
      return;
    }

    if (!newQuestion.question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    // Check if at least 2 options are provided
    const validOptions = (newQuestion.options || []).filter(opt => opt && opt.trim());
    if (validOptions.length < 2) {
      Alert.alert('Error', 'Please provide at least 2 answer options');
      return;
    }

    // Check if correct answer is valid
    if (newQuestion.correctAnswer < 0 || newQuestion.correctAnswer >= validOptions.length) {
      Alert.alert('Error', 'Please select a valid correct answer');
      return;
    }

    const question: QuizQuestion = {
      id: generateObjectId(),
      question: newQuestion.question,
      options: (newQuestion.options || []).filter(opt => opt && opt.trim()),
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation
    };

    setLessons(prev => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(lesson => 
        lesson.id === selectedLesson?.id 
          ? {
              ...lesson,
              topics: (lesson.topics || []).map(topic =>
                topic.id === selectedTopic?.id
                  ? {
                      ...topic,
                      quizzes: (topic.quizzes || []).map(quiz =>
                        quiz.id === selectedQuiz.id
                          ? { ...quiz, questions: [...(quiz.questions || []), question] }
                          : quiz
                      )
                    }
                  : topic
              )
            }
          : lesson
      );
    });

    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
    setShowQuestionModal(false);
    Alert.alert('Success', 'Question added successfully!');
  };

  const handleQuizPress = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowQuestionModal(true);
  };

  const renderLessonCard = ({ item }: { item: Lesson }) => {
    if (!item) return null; // Skip undefined lessons
    return (
    <Animated.View 
      style={[
        styles.lessonCard,
        { backgroundColor: theme.colors.surface }
      ]}
    >
      <View style={styles.lessonHeader}>
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.lessonMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
              {item.estimatedDuration} min
            </Text>
            <Text style={[styles.topicsCount, { color: theme.colors.textSecondary }]}>
              {item.topics.length} topics
            </Text>
          </View>
        </View>
        <View style={styles.lessonActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setSelectedLesson(item);
              setShowTopicModal(true);
            }}
          >
            <MaterialIcons name="add" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.colors.error || '#dc3545' }]}
            onPress={() => deleteLesson(item._id || item.id || '')}
          >
            <MaterialIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

        {item.topics.length > 0 && (
        <View style={styles.topicsContainer}>
          <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>
            Topics ({item.topics.length}):
          </Text>
          {item.topics.map((topic, index) => {
            if (!topic) return null; // Skip undefined topics
            console.log('Rendering topic:', topic.title, 'ID:', topic._id || topic.id);
            return (
            <View key={topic._id || topic.id || `topic-${index}`} style={[styles.topicCard, { backgroundColor: theme.colors.surface }]}>
              {/* Topic Header */}
              <View style={styles.topicHeader}>
                <View style={styles.topicInfo}>
                  <Text style={[styles.topicTitle, { color: theme.colors.text }]}>
                    {topic.title || 'No Title'}
                  </Text>
                  <Text style={[styles.topicDescription, { color: theme.colors.textSecondary }]}>
                    {topic.description}
                  </Text>
                </View>
                <View style={styles.topicStats}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="video-library" size={16} color={theme.colors.primary} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {Array.isArray(topic.videos) ? topic.videos.length : 0}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="quiz" size={16} color={theme.colors.primary} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {Array.isArray(topic.quizzes) ? topic.quizzes.length : 0}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.topicActions}>
                <TouchableOpacity
                  style={[styles.topicActionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    setSelectedLesson(item);
                    setSelectedTopic(topic);
                    setShowVideoModal(true);
                  }}
                >
                  <MaterialIcons name="video-library" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Add Video</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.topicActionButton, { backgroundColor: theme.colors.secondary || '#6c757d' }]}
                  onPress={() => {
                    console.log('🔍 Setting selectedLesson from topic list:', item);
                    console.log('🔍 selectedLesson._id:', item?._id);
                    console.log('🔍 Setting selectedTopic from topic list:', topic);
                    console.log('🔍 selectedTopic._id:', topic?._id);
                    console.log('🔍 selectedTopic.title:', topic?.title);
                    setSelectedLesson(item);
                    setSelectedTopic(topic);
                    setShowQuizModal(true);
                  }}
                >
                  <MaterialIcons name="quiz" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Add Quiz</Text>
                </TouchableOpacity>
              </View>

              {/* Show Videos and Quizzes */}
              {Array.isArray(topic.videos) && topic.videos.length > 0 && (
                <View style={styles.contentList}>
                  <Text style={[styles.contentListTitle, { color: theme.colors.text }]}>Videos:</Text>
             {topic.videos.map((video, videoIndex) => {
               if (!video) return null; // Skip undefined videos
               return (
               <View key={video._id || video.id || `video-${videoIndex}`} style={[styles.contentItem, { backgroundColor: theme.colors.background }]}>
                 <MaterialIcons name="play-circle-outline" size={20} color={theme.colors.primary} />
                 <View style={styles.videoInfo}>
                   <Text style={[styles.contentItemText, { color: theme.colors.text }]}>{video.title || 'Untitled Video'}</Text>
                   <Text style={[styles.contentItemDuration, { color: theme.colors.textSecondary }]}>
                     {video.duration || 0} min
                   </Text>
                   {video.assignedQuiz && (
                     <Text style={[styles.assignedQuizText, { color: theme.colors.primary }]}>
                       📝 Quiz Assigned
                     </Text>
                   )}
                 </View>
               </View>
               );
             })}
                </View>
              )}

              {Array.isArray(topic.quizzes) && topic.quizzes.length > 0 && (
                <View style={styles.contentList}>
                  <Text style={[styles.contentListTitle, { color: theme.colors.text }]}>Quizzes:</Text>
                  {topic.quizzes.map((quiz, quizIndex) => {
                    if (!quiz) return null; // Skip undefined quizzes
                    return (
                    <View key={quiz._id || quiz.id || `quiz-${quizIndex}`} style={[styles.contentItem, { backgroundColor: theme.colors.background }]}>
                      <View style={styles.quizInfo}>
                        <MaterialIcons name="quiz" size={20} color={theme.colors.primary} />
                        <Text style={[styles.contentItemText, { color: theme.colors.text }]}>{quiz.title || 'Untitled Quiz'}</Text>
                        <Text style={[styles.contentItemDuration, { color: theme.colors.textSecondary }]}>
                          {Array.isArray(quiz.questions) ? quiz.questions.length : 0} questions
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.manageButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => handleQuizPress(quiz)}
                      >
                        <MaterialIcons name="edit" size={16} color="white" />
                        <Text style={styles.manageButtonText}>Manage</Text>
                      </TouchableOpacity>
                    </View>
                    );
                  })}
                </View>
              )}
            </View>
            );
          })}
        </View>
      )}
    </Animated.View>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Lesson Management</Text>
            <Text style={styles.headerSubtitle}>Manage lessons and topics</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleSyncToModules}
              style={[styles.syncButton, { backgroundColor: '#28a745' }]}
            >
              <MaterialIcons name="sync" size={20} color="white" />
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveAllLessonsToBackend}
              style={[styles.saveAllButton, { backgroundColor: theme.colors.primary }]}
            >
              <MaterialIcons name="save" size={20} color="white" />
              <Text style={styles.saveAllButtonText}>Save All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.addButton}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <FlatList
          data={lessons}
          renderItem={renderLessonCard}
          keyExtractor={(item) => item._id || item.id || ''}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Add Lesson Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add New Lesson
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Lesson Title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newLesson.title}
              onChangeText={(text) => setNewLesson(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newLesson.description}
              onChangeText={(text) => setNewLesson(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Difficulty</Text>
                <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      Alert.alert(
                        'Select Difficulty',
                        'Choose the difficulty level',
                        [
                          { text: 'Beginner', onPress: () => setNewLesson(prev => ({ ...prev, difficulty: 'Beginner' })) },
                          { text: 'Intermediate', onPress: () => setNewLesson(prev => ({ ...prev, difficulty: 'Intermediate' })) },
                          { text: 'Advanced', onPress: () => setNewLesson(prev => ({ ...prev, difficulty: 'Advanced' })) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.pickerText, { color: theme.colors.text }]}>{newLesson.difficulty}</Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Duration (min)</Text>
                <TextInput
                  style={[styles.input, styles.numberInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder="Duration"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newLesson.estimatedDuration.toString()}
                  onChangeText={(text) => setNewLesson(prev => ({ ...prev, estimatedDuration: parseInt(text) || 1 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddLesson}
              >
                <Text style={styles.saveButtonText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        visible={showTopicModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Topic to {selectedLesson?.title}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Topic Title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTopic.title}
              onChangeText={(text) => setNewTopic(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Topic Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTopic.description}
              onChangeText={(text) => setNewTopic(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTopicModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTopic}
              >
                <Text style={styles.saveButtonText}>Add Topic</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Video to {selectedTopic?.title}
            </Text>
            
            <ScrollView 
              style={styles.videoScrollView}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Video Title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.title}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, title: text }))}
            />
            
            {/* Video File Upload */}
            <TouchableOpacity
              style={[styles.uploadButton, { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary
              }]}
              onPress={pickVideoFile}
            >
              <MaterialIcons name="video-library" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {newVideo.file ? `Selected: ${newVideo.file.name}` : 'Select Video File'}
              </Text>
            </TouchableOpacity>

            {/* Or URL Input */}
            <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>OR</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Video URL (if not uploading file)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.url}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, url: text }))}
            />

            {/* Thumbnail Upload */}
            <TouchableOpacity
              style={[styles.uploadButton, { 
                backgroundColor: theme.colors.secondary || '#6c757d',
                borderColor: theme.colors.secondary || '#6c757d'
              }]}
              onPress={pickThumbnail}
            >
              <MaterialIcons name="image" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {newVideo.thumbnail ? 'Thumbnail Selected' : 'Select Thumbnail'}
              </Text>
            </TouchableOpacity>

            {newVideo.thumbnail && (
              <Image 
                source={{ uri: newVideo.thumbnail.uri }} 
                style={styles.thumbnailPreview}
                resizeMode="cover"
              />
            )}
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Duration (minutes)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.duration.toString()}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Video Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newVideo.description}
              onChangeText={(text) => setNewVideo(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            {/* Quiz Assignment */}
            <Text style={[styles.quizAssignmentTitle, { color: theme.colors.text }]}>
              Assign Quiz to Video (Optional):
            </Text>
            
            {selectedTopic && getAvailableQuizzes(selectedTopic).length > 0 ? (
              <View style={styles.quizSelection}>
                {getAvailableQuizzes(selectedTopic).map((quiz, index) => {
                  const quizId = quiz._id || quiz.id || '';
                  return (
                  <TouchableOpacity
                    key={quizId}
                    activeOpacity={0.7}
                    style={[
                      styles.quizOption,
                      { 
                        backgroundColor: newVideo.assignedQuiz === quizId ? theme.colors.primary : theme.colors.background,
                        borderColor: newVideo.assignedQuiz === quizId ? theme.colors.primary : '#ddd'
                      }
                    ]}
                    onPress={() => {
                      console.log('Quiz assignment clicked:', quizId, 'Current assigned:', newVideo.assignedQuiz);
                      setNewVideo(prev => ({ 
                        ...prev, 
                        assignedQuiz: newVideo.assignedQuiz === quizId ? null : quizId
                      }));
                    }}
                  >
                    <View style={styles.quizOptionInfo}>
                      <Text style={[
                        styles.quizOptionTitle, 
                        { color: newVideo.assignedQuiz === quizId ? 'white' : theme.colors.text }
                      ]}>
                        {quiz.title || 'Untitled Quiz'}
                      </Text>
                      <Text style={[
                        styles.quizOptionCount, 
                        { color: newVideo.assignedQuiz === quizId ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }
                      ]}>
                        {quiz.questions?.length || 0} questions
                      </Text>
                    </View>
                    {newVideo.assignedQuiz === quizId && (
                      <MaterialIcons name="check" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.noQuizzesText, { color: theme.colors.textSecondary }]}>
                No quizzes available for this topic. Create a quiz first.
              </Text>
            )}

              <TouchableOpacity
                style={[styles.addQuizButton, { backgroundColor: theme.colors.secondary || '#6c757d' }]}
                onPress={() => {
                  console.log('🔍 Current selectedLesson from video modal:', selectedLesson);
                  console.log('🔍 Current selectedTopic from video modal:', selectedTopic);
                  
                  if (!selectedLesson || !selectedTopic) {
                    Alert.alert('Error', 'No lesson or topic selected. Please try again.');
                    return;
                  }
                  
                  setShowVideoModal(false);
                  setShowQuizModal(true);
                }}
              >
                <MaterialIcons name="quiz" size={20} color="white" />
                <Text style={styles.addQuizButtonText}>Create New Quiz for This Topic</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowVideoModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddVideo}
              >
                <Text style={styles.saveButtonText}>Add Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Quiz Modal */}
      <Modal
        visible={showQuizModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuizModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Quiz to {selectedTopic?.title || 'Unknown Topic'}
            </Text>
            {console.log('🔍 Quiz Modal - selectedLesson:', selectedLesson)}
            {console.log('🔍 Quiz Modal - selectedLesson._id:', selectedLesson?._id)}
            {console.log('🔍 Quiz Modal - selectedTopic:', selectedTopic)}
            {console.log('🔍 Quiz Modal - selectedTopic._id:', selectedTopic?._id)}
            {console.log('🔍 Quiz Modal - selectedTopic.title:', selectedTopic?.title)}
            
            <ScrollView 
              style={styles.quizScrollView}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                placeholder="Quiz Title"
                placeholderTextColor={theme.colors.textSecondary}
                value={newQuiz.title}
                onChangeText={(text) => setNewQuiz(prev => ({ ...prev, title: text }))}
              />
              
              {/* Questions List */}
              <Text style={[styles.questionsTitle, { color: theme.colors.text }]}>Questions:</Text>
              
              {newQuiz.questions.map((question, index) => (
              <View key={question.id} style={[styles.questionCard, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                  Question {index + 1}:
                </Text>
                
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  placeholder="Enter your question here..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={question.question}
                  onChangeText={(text) => {
                    const updatedQuestions = [...newQuiz.questions];
                    updatedQuestions[index].question = text;
                    setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                  }}
                  multiline
                  numberOfLines={2}
                />

                <Text style={[styles.optionsTitle, { color: theme.colors.text }]}>Answer Options:</Text>
                
                {question.options.map((option, optionIndex) => (
                  <View key={`option-${question.id}-${optionIndex}`} style={styles.optionRow}>
                    <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                      {String.fromCharCode(65 + optionIndex)}:
                    </Text>
                    <TextInput
                      style={[styles.optionInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                      placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)}...`}
                      placeholderTextColor={theme.colors.textSecondary}
                      value={option}
                      onChangeText={(text) => {
                        const updatedQuestions = [...newQuiz.questions];
                        updatedQuestions[index].options[optionIndex] = text;
                        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                      }}
                    />
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        {
                          backgroundColor: question.correctAnswer === optionIndex ? theme.colors.primary : 'transparent',
                          borderColor: question.correctAnswer === optionIndex ? theme.colors.primary : '#ddd'
                        }
                      ]}
                      onPress={() => {
                        const updatedQuestions = [...newQuiz.questions];
                        updatedQuestions[index].correctAnswer = optionIndex;
                        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                      }}
                    >
                      {question.correctAnswer === optionIndex && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.removeQuestionButton, { backgroundColor: theme.colors.error || '#dc3545' }]}
                  onPress={() => {
                    if (newQuiz.questions.length > 1) {
                      const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
                      setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                    }
                  }}
                >
                  <MaterialIcons name="delete" size={16} color="white" />
                  <Text style={styles.removeQuestionButtonText}>Remove Question</Text>
                </TouchableOpacity>
              </View>
            ))}

              <TouchableOpacity
                style={[styles.addQuestionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  const newQuestion = {
                    id: generateObjectId(),
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: ''
                  };
                  setNewQuiz(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
                }}
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text style={styles.addQuestionButtonText}>Add Another Question</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowQuizModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddQuiz}
              >
                <Text style={styles.saveButtonText}>Add Quiz</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuestionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Manage Questions for {selectedQuiz?.title}
            </Text>
            
            <ScrollView 
              style={styles.questionScrollView}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Show existing questions */}
             {selectedQuiz && Array.isArray(selectedQuiz.questions) && selectedQuiz.questions.length > 0 && (
               <View style={styles.existingQuestions}>
                 <Text style={[styles.existingQuestionsTitle, { color: theme.colors.text }]}>
                   Existing Questions ({selectedQuiz.questions.length}):
                 </Text>
                 {selectedQuiz.questions.map((question: QuizQuestion, index: number) => (
                  <View key={question.id} style={[styles.questionItem, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                      Q{index + 1}:
                    </Text>
                    <Text style={[styles.questionText, { color: theme.colors.text }]}>
                      {question.question}
                    </Text>
                    <Text style={[styles.questionOptions, { color: theme.colors.textSecondary }]}>
                      Options: {question.options.join(', ')}
                    </Text>
                    <Text style={[styles.questionAnswer, { color: theme.colors.primary }]}>
                      Correct: {String.fromCharCode(65 + question.correctAnswer)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter your question here..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newQuestion.question}
              onChangeText={(text) => setNewQuestion(prev => ({ ...prev, question: text }))}
              multiline
              numberOfLines={3}
            />
            
            <Text style={[styles.optionsTitle, { color: theme.colors.text }]}>Answer Options:</Text>
            <Text style={[styles.optionsSubtitle, { color: theme.colors.textSecondary }]}>
              Provide at least 2 options and select the correct answer
            </Text>
            {newQuestion.options.map((option, index) => (
              <View key={`new-option-${index}`} style={styles.optionRow}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {String.fromCharCode(65 + index)}:
                </Text>
                <TextInput
                  style={[styles.optionInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  placeholder={`Enter option ${String.fromCharCode(65 + index)}...`}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = text;
                    setNewQuestion(prev => ({ ...prev, options: newOptions }));
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    { 
                      backgroundColor: newQuestion.correctAnswer === index ? theme.colors.primary : 'transparent',
                      borderColor: newQuestion.correctAnswer === index ? theme.colors.primary : '#ddd'
                    }
                  ]}
                  onPress={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                >
                  {newQuestion.correctAnswer === index && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Explanation (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newQuestion.explanation}
              onChangeText={(text) => setNewQuestion(prev => ({ ...prev, explanation: text }))}
              multiline
              numberOfLines={2}
            />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowQuestionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddQuestion}
              >
                <Text style={styles.saveButtonText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    gap: 4,
  },
  headerSaveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    gap: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  lessonCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  lessonMeta: {
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
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 12,
  },
  topicsCount: {
    fontSize: 12,
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  saveAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  numberInput: {
    textAlign: 'center',
  },
  topicsContainer: {
    marginTop: 16,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  topicCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  topicStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '600',
  },
  thumbnailPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  addQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addQuizButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  topicActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  topicActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentList: {
    marginTop: 12,
  },
  contentListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  contentItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  contentItemDuration: {
    fontSize: 12,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  optionsSubtitle: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  questionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  questionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  removeQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  removeQuestionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quizAssignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  quizSelection: {
    marginBottom: 16,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  quizOptionInfo: {
    flex: 1,
  },
  quizOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quizOptionCount: {
    fontSize: 12,
  },
  noQuizzesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 8,
  },
  assignedQuizText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  quizScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  videoScrollView: {
    maxHeight: 500,
    marginBottom: 16,
  },
  questionScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addQuestionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  existingQuestions: {
    marginBottom: 16,
  },
  existingQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  questionOptions: {
    fontSize: 12,
    marginBottom: 2,
  },
  questionAnswer: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EnhancedLessonManagementScreen;
