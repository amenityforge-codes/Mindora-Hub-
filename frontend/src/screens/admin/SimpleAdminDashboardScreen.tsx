import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

interface Module {
  _id: string;
  title: string;
  description: string;
  ageRange: '6-15' | '16+' | 'business';
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  topics: Topic[];
  tags: string[];
  thumbnail: string;
  isPublished: boolean;
  createdAt: string;
}

interface Topic {
  title: string;
  description: string;
  order: number;
}

interface SimpleAdminDashboardScreenProps {
  navigation: any;
}

const SimpleAdminDashboardScreen: React.FC<SimpleAdminDashboardScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedAgeRange, setSelectedAgeRange] = useState<'6-15' | '16+'>('6-15');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingSample, setCreatingSample] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [selectedAgeRange]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching real modules from API...');
      const response = await apiService.getModules({
        ageRange: selectedAgeRange,
        limit: 50
      });
      
      if (response.success && response.data) {
        setModules(response.data.modules || []);
        setUsingMockData(false);
        console.log(`Fetched ${response.data.modules?.length || 0} modules from API`);
      } else {
        throw new Error(response.message || 'Failed to fetch modules');
      }
      
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Failed to load modules. Please try again.');
      setModules([]);
      setUsingMockData(false);
    } finally {
      setLoading(false);
    }
  };

  const getMockModules = (): Module[] => {
    if (selectedAgeRange === '6-15') {
      return [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Alphabet & Phonics',
          description: 'Learn the English alphabet and basic phonics sounds',
          ageRange: '6-15',
          level: 'beginner',
          estimatedDuration: 120,
          topics: [
            { title: 'ABC Song Fun', description: 'Learn A-Z sounds with fun animations', order: 1 },
            { title: 'Letter Recognition', description: 'Identify uppercase and lowercase letters', order: 2 },
            { title: 'Phonics Sounds', description: 'Learn the sounds each letter makes', order: 3 },
            { title: 'Letter Hunt Game', description: 'Practice recognizing letters A through Z', order: 4 },
            { title: 'Vowel Sounds', description: 'Learn A, E, I, O, U sounds', order: 5 }
          ],
          tags: ['alphabet', 'phonics', 'beginner', 'reading'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: 'Basic Vocabulary',
          description: 'Essential English words for daily communication',
          ageRange: '6-15',
          level: 'beginner',
          estimatedDuration: 90,
          topics: [
            { title: 'Family Words', description: 'Learn words for family members', order: 1 },
            { title: 'Colors & Shapes', description: 'Identify colors and basic shapes', order: 2 },
            { title: 'Animals', description: 'Learn names of common animals', order: 3 },
            { title: 'Food & Drinks', description: 'Learn names of common foods', order: 4 },
            { title: 'Body Parts', description: 'Learn names of body parts', order: 5 }
          ],
          tags: ['vocabulary', 'words', 'beginner', 'communication'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439013',
          title: 'Numbers & Counting',
          description: 'Learn numbers from 1 to 100 and basic counting',
          ageRange: '6-15',
          level: 'beginner',
          estimatedDuration: 60,
          topics: [
            { title: 'Numbers 1-10', description: 'Learn to count from 1 to 10', order: 1 },
            { title: 'Numbers 11-20', description: 'Learn to count from 11 to 20', order: 2 },
            { title: 'Counting Objects', description: 'Practice counting real objects', order: 3 },
            { title: 'Number Recognition', description: 'Recognize and write numbers', order: 4 },
            { title: 'Simple Addition', description: 'Learn basic addition with numbers 1-10', order: 5 }
          ],
          tags: ['numbers', 'counting', 'math', 'beginner'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439014',
          title: 'Simple Sentences',
          description: 'Build basic English sentences',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 150,
          topics: [
            { title: 'I am...', description: 'Learn to introduce yourself', order: 1 },
            { title: 'This is...', description: 'Point out objects and people', order: 2 },
            { title: 'I like...', description: 'Express preferences', order: 3 },
            { title: 'I can...', description: 'Express abilities', order: 4 },
            { title: 'I have...', description: 'Express possession', order: 5 }
          ],
          tags: ['sentences', 'grammar', 'intermediate', 'speaking'],
          thumbnail: '',
          isPublished: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439015',
          title: 'Daily Activities',
          description: 'Learn words and phrases for daily routines',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 120,
          topics: [
            { title: 'Morning Routine', description: 'Learn morning activities', order: 1 },
            { title: 'School Activities', description: 'Words for school and learning', order: 2 },
            { title: 'Evening Routine', description: 'Learn evening activities', order: 3 },
            { title: 'Weekend Fun', description: 'Learn weekend activities', order: 4 },
            { title: 'Hobbies', description: 'Learn about different hobbies', order: 5 }
          ],
          tags: ['daily', 'routine', 'activities', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439016',
          title: 'Weather & Seasons',
          description: 'Learn about weather and seasons',
          ageRange: '6-15',
          level: 'beginner',
          estimatedDuration: 90,
          topics: [
            { title: 'Sunny Days', description: 'Learn about sunny weather', order: 1 },
            { title: 'Rainy Days', description: 'Learn about rainy weather', order: 2 },
            { title: 'Four Seasons', description: 'Learn about spring, summer, fall, winter', order: 3 },
            { title: 'Weather Clothes', description: 'Learn what to wear in different weather', order: 4 },
            { title: 'Weather Activities', description: 'Learn activities for different weather', order: 5 }
          ],
          tags: ['weather', 'seasons', 'nature', 'beginner'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439017',
          title: 'My Home',
          description: 'Learn about rooms and furniture in a house',
          ageRange: '6-15',
          level: 'beginner',
          estimatedDuration: 100,
          topics: [
            { title: 'Living Room', description: 'Learn about living room items', order: 1 },
            { title: 'Kitchen', description: 'Learn about kitchen items', order: 2 },
            { title: 'Bedroom', description: 'Learn about bedroom items', order: 3 },
            { title: 'Bathroom', description: 'Learn about bathroom items', order: 4 },
            { title: 'Garden', description: 'Learn about garden and outdoor items', order: 5 }
          ],
          tags: ['home', 'furniture', 'rooms', 'beginner'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439018',
          title: 'Transportation',
          description: 'Learn about different ways to travel',
          ageRange: '6-15',
          level: 'beginner',
          estimatedDuration: 80,
          topics: [
            { title: 'Cars & Buses', description: 'Learn about road vehicles', order: 1 },
            { title: 'Trains', description: 'Learn about trains and railways', order: 2 },
            { title: 'Planes', description: 'Learn about airplanes', order: 3 },
            { title: 'Boats & Ships', description: 'Learn about water transportation', order: 4 },
            { title: 'Bicycles', description: 'Learn about bicycles and cycling', order: 5 }
          ],
          tags: ['transportation', 'vehicles', 'travel', 'beginner'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439019',
          title: 'Sports & Games',
          description: 'Learn about different sports and games',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 110,
          topics: [
            { title: 'Ball Games', description: 'Learn about football, basketball, tennis', order: 1 },
            { title: 'Water Sports', description: 'Learn about swimming, diving', order: 2 },
            { title: 'Indoor Games', description: 'Learn about board games and puzzles', order: 3 },
            { title: 'Outdoor Games', description: 'Learn about playground games', order: 4 },
            { title: 'Team Sports', description: 'Learn about working together in sports', order: 5 }
          ],
          tags: ['sports', 'games', 'teamwork', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439020',
          title: 'Music & Art',
          description: 'Learn about music and art',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 100,
          topics: [
            { title: 'Musical Instruments', description: 'Learn about different instruments', order: 1 },
            { title: 'Singing', description: 'Learn about singing and songs', order: 2 },
            { title: 'Drawing', description: 'Learn about drawing and art', order: 3 },
            { title: 'Colors in Art', description: 'Learn about colors and painting', order: 4 },
            { title: 'Creative Activities', description: 'Learn about being creative', order: 5 }
          ],
          tags: ['music', 'art', 'creativity', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439021',
          title: 'Nature & Environment',
          description: 'Learn about nature and taking care of the environment',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 120,
          topics: [
            { title: 'Trees & Plants', description: 'Learn about different plants', order: 1 },
            { title: 'Insects & Bugs', description: 'Learn about small creatures', order: 2 },
            { title: 'Birds', description: 'Learn about different birds', order: 3 },
            { title: 'Recycling', description: 'Learn about recycling and environment', order: 4 },
            { title: 'Gardening', description: 'Learn about growing plants', order: 5 }
          ],
          tags: ['nature', 'environment', 'plants', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439022',
          title: 'Community Helpers',
          description: 'Learn about people who help in our community',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 100,
          topics: [
            { title: 'Doctors & Nurses', description: 'Learn about medical helpers', order: 1 },
            { title: 'Teachers', description: 'Learn about teachers and education', order: 2 },
            { title: 'Police & Firefighters', description: 'Learn about safety helpers', order: 3 },
            { title: 'Mail Carriers', description: 'Learn about postal workers', order: 4 },
            { title: 'Shop Keepers', description: 'Learn about store workers', order: 5 }
          ],
          tags: ['community', 'helpers', 'jobs', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439023',
          title: 'Holidays & Celebrations',
          description: 'Learn about different holidays and celebrations',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 90,
          topics: [
            { title: 'Birthday Party', description: 'Learn about birthday celebrations', order: 1 },
            { title: 'Christmas', description: 'Learn about Christmas traditions', order: 2 },
            { title: 'Halloween', description: 'Learn about Halloween fun', order: 3 },
            { title: 'Easter', description: 'Learn about Easter celebrations', order: 4 },
            { title: 'New Year', description: 'Learn about New Year celebrations', order: 5 }
          ],
          tags: ['holidays', 'celebrations', 'traditions', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439024',
          title: 'Time & Calendar',
          description: 'Learn about time, days, and calendar',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 80,
          topics: [
            { title: 'Days of the Week', description: 'Learn the seven days', order: 1 },
            { title: 'Months of the Year', description: 'Learn the twelve months', order: 2 },
            { title: 'Telling Time', description: 'Learn to read clocks', order: 3 },
            { title: 'Morning, Afternoon, Evening', description: 'Learn about different times of day', order: 4 },
            { title: 'Calendar', description: 'Learn about using a calendar', order: 5 }
          ],
          tags: ['time', 'calendar', 'schedule', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439025',
          title: 'Health & Safety',
          description: 'Learn about staying healthy and safe',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 100,
          topics: [
            { title: 'Healthy Food', description: 'Learn about good food choices', order: 1 },
            { title: 'Exercise', description: 'Learn about staying active', order: 2 },
            { title: 'Personal Hygiene', description: 'Learn about staying clean', order: 3 },
            { title: 'Safety Rules', description: 'Learn about staying safe', order: 4 },
            { title: 'Emergency Help', description: 'Learn about getting help in emergencies', order: 5 }
          ],
          tags: ['health', 'safety', 'hygiene', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439026',
          title: 'Technology',
          description: 'Learn about modern technology',
          ageRange: '6-15',
          level: 'intermediate',
          estimatedDuration: 90,
          topics: [
            { title: 'Computers', description: 'Learn about computers and laptops', order: 1 },
            { title: 'Tablets & Phones', description: 'Learn about mobile devices', order: 2 },
            { title: 'Internet', description: 'Learn about using the internet safely', order: 3 },
            { title: 'Apps & Games', description: 'Learn about educational apps', order: 4 },
            { title: 'Digital Safety', description: 'Learn about staying safe online', order: 5 }
          ],
          tags: ['technology', 'computers', 'digital', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439027',
          title: 'Space & Planets',
          description: 'Learn about space and our solar system',
          ageRange: '6-15',
          level: 'advanced',
          estimatedDuration: 120,
          topics: [
            { title: 'The Sun', description: 'Learn about our star', order: 1 },
            { title: 'Planets', description: 'Learn about the eight planets', order: 2 },
            { title: 'The Moon', description: 'Learn about Earth\'s moon', order: 3 },
            { title: 'Stars', description: 'Learn about stars in the sky', order: 4 },
            { title: 'Space Travel', description: 'Learn about astronauts and rockets', order: 5 }
          ],
          tags: ['space', 'planets', 'astronomy', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439028',
          title: 'World Cultures',
          description: 'Learn about different countries and cultures',
          ageRange: '6-15',
          level: 'advanced',
          estimatedDuration: 150,
          topics: [
            { title: 'Countries', description: 'Learn about different countries', order: 1 },
            { title: 'Languages', description: 'Learn about different languages', order: 2 },
            { title: 'Food Around the World', description: 'Learn about international foods', order: 3 },
            { title: 'Traditional Clothes', description: 'Learn about cultural clothing', order: 4 },
            { title: 'Festivals', description: 'Learn about cultural festivals', order: 5 }
          ],
          tags: ['cultures', 'countries', 'diversity', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439029',
          title: 'Science & Experiments',
          description: 'Learn about science through fun experiments',
          ageRange: '6-15',
          level: 'advanced',
          estimatedDuration: 140,
          topics: [
            { title: 'Water Experiments', description: 'Learn about water properties', order: 1 },
            { title: 'Light & Shadows', description: 'Learn about light and dark', order: 2 },
            { title: 'Magnets', description: 'Learn about magnetic forces', order: 3 },
            { title: 'Plants Growing', description: 'Learn about plant life cycles', order: 4 },
            { title: 'Simple Machines', description: 'Learn about basic machines', order: 5 }
          ],
          tags: ['science', 'experiments', 'discovery', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        }
      ];
    } else {
      return [
        {
          _id: '507f1f77bcf86cd799439030',
          title: 'Business Communication',
          description: 'Professional English for workplace communication',
          ageRange: '16+',
          level: 'intermediate',
          estimatedDuration: 180,
          topics: [
            { title: 'Email Writing', description: 'Professional email communication', order: 1 },
            { title: 'Meeting Skills', description: 'Participate effectively in meetings', order: 2 },
            { title: 'Presentation Skills', description: 'Deliver effective presentations', order: 3 },
            { title: 'Negotiation', description: 'Business negotiation techniques', order: 4 },
            { title: 'Report Writing', description: 'Write professional reports', order: 5 }
          ],
          tags: ['business', 'communication', 'professional', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439031',
          title: 'Advanced Grammar',
          description: 'Master complex English grammar structures',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 200,
          topics: [
            { title: 'Conditional Sentences', description: 'If-then statements and conditions', order: 1 },
            { title: 'Passive Voice', description: 'Understanding passive constructions', order: 2 },
            { title: 'Reported Speech', description: 'Indirect speech and reporting', order: 3 },
            { title: 'Complex Tenses', description: 'Perfect and continuous tenses', order: 4 },
            { title: 'Subjunctive Mood', description: 'Hypothetical and unreal situations', order: 5 }
          ],
          tags: ['grammar', 'advanced', 'complex', 'structures'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439032',
          title: 'Academic Writing',
          description: 'Academic English for essays and research',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 240,
          topics: [
            { title: 'Essay Structure', description: 'Introduction, body, conclusion', order: 1 },
            { title: 'Argumentation', description: 'Presenting and supporting arguments', order: 2 },
            { title: 'Research Skills', description: 'Finding and citing sources', order: 3 },
            { title: 'Critical Analysis', description: 'Analyzing texts and ideas', order: 4 },
            { title: 'Academic Vocabulary', description: 'Formal and academic language', order: 5 }
          ],
          tags: ['academic', 'writing', 'essays', 'advanced'],
          thumbnail: '',
          isPublished: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439033',
          title: 'Professional Speaking',
          description: 'Advanced speaking skills for professional contexts',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 160,
          topics: [
            { title: 'Public Speaking', description: 'Confident presentation skills', order: 1 },
            { title: 'Interview Skills', description: 'Job interview preparation', order: 2 },
            { title: 'Networking', description: 'Professional relationship building', order: 3 },
            { title: 'Debate Skills', description: 'Arguing and defending positions', order: 4 },
            { title: 'Phone Communication', description: 'Effective phone conversations', order: 5 }
          ],
          tags: ['speaking', 'professional', 'communication', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439034',
          title: 'Technical Writing',
          description: 'Writing for technical and professional contexts',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 200,
          topics: [
            { title: 'Technical Documentation', description: 'Writing technical manuals', order: 1 },
            { title: 'Proposal Writing', description: 'Business and project proposals', order: 2 },
            { title: 'Technical Reports', description: 'Scientific and technical reports', order: 3 },
            { title: 'User Manuals', description: 'Writing user-friendly instructions', order: 4 },
            { title: 'Technical Editing', description: 'Editing technical documents', order: 5 }
          ],
          tags: ['technical', 'writing', 'documentation', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439035',
          title: 'Creative Writing',
          description: 'Develop creative writing skills and techniques',
          ageRange: '16+',
          level: 'intermediate',
          estimatedDuration: 180,
          topics: [
            { title: 'Storytelling', description: 'Craft compelling narratives', order: 1 },
            { title: 'Character Development', description: 'Creating memorable characters', order: 2 },
            { title: 'Dialogue Writing', description: 'Writing realistic conversations', order: 3 },
            { title: 'Poetry Writing', description: 'Creative poetry techniques', order: 4 },
            { title: 'Writing Style', description: 'Developing your unique voice', order: 5 }
          ],
          tags: ['creative', 'writing', 'storytelling', 'intermediate'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439036',
          title: 'Media & Journalism',
          description: 'English for media, journalism, and digital communication',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 220,
          topics: [
            { title: 'News Writing', description: 'Writing news articles and reports', order: 1 },
            { title: 'Social Media', description: 'Effective social media communication', order: 2 },
            { title: 'Digital Marketing', description: 'Content marketing and copywriting', order: 3 },
            { title: 'Broadcast Writing', description: 'Writing for radio and television', order: 4 },
            { title: 'Editorial Writing', description: 'Opinion pieces and editorials', order: 5 }
          ],
          tags: ['media', 'journalism', 'digital', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439037',
          title: 'Legal English',
          description: 'English for legal contexts and law',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 250,
          topics: [
            { title: 'Legal Vocabulary', description: 'Legal terminology and concepts', order: 1 },
            { title: 'Contract Writing', description: 'Drafting legal contracts', order: 2 },
            { title: 'Court Communication', description: 'Speaking in legal proceedings', order: 3 },
            { title: 'Legal Research', description: 'Researching legal precedents', order: 4 },
            { title: 'Client Communication', description: 'Communicating with legal clients', order: 5 }
          ],
          tags: ['legal', 'law', 'professional', 'advanced'],
          thumbnail: '',
          isPublished: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439038',
          title: 'Medical English',
          description: 'English for healthcare and medical contexts',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 200,
          topics: [
            { title: 'Medical Terminology', description: 'Medical vocabulary and terms', order: 1 },
            { title: 'Patient Communication', description: 'Communicating with patients', order: 2 },
            { title: 'Medical Documentation', description: 'Writing medical reports', order: 3 },
            { title: 'Case Studies', description: 'Analyzing medical cases', order: 4 },
            { title: 'Research Writing', description: 'Medical research and papers', order: 5 }
          ],
          tags: ['medical', 'healthcare', 'professional', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439039',
          title: 'Financial English',
          description: 'English for finance, banking, and business',
          ageRange: '16+',
          level: 'advanced',
          estimatedDuration: 190,
          topics: [
            { title: 'Financial Vocabulary', description: 'Banking and finance terminology', order: 1 },
            { title: 'Investment Communication', description: 'Discussing investments and markets', order: 2 },
            { title: 'Financial Reports', description: 'Writing financial analyses', order: 3 },
            { title: 'Business Plans', description: 'Creating comprehensive business plans', order: 4 },
            { title: 'Economic Analysis', description: 'Analyzing economic trends', order: 5 }
          ],
          tags: ['finance', 'banking', 'business', 'advanced'],
          thumbnail: '',
          isPublished: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
  };

  const createSampleModules = async () => {
    try {
      setCreatingSample(true);
      
      console.log('Creating sample modules via API...');
      // This would call the backend API to create sample modules
      // For now, just refresh the modules list
      await fetchModules();
      
    } catch (err) {
      console.error('Error creating sample modules:', err);
    } finally {
      setCreatingSample(false);
    }
  };

  const renderHeader = () => {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.userName}>Module Management</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')} 
              style={styles.profileButton}
            >
              <MaterialIcons name="person" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ageRangeSelector}>
          <TouchableOpacity
            style={[
              styles.ageRangeButton,
              selectedAgeRange === '6-15' && styles.ageRangeButtonActive
            ]}
            onPress={() => setSelectedAgeRange('6-15')}
          >
            <Text style={[
              styles.ageRangeText,
              selectedAgeRange === '6-15' && styles.ageRangeTextActive
            ]}>
              6-15 Years
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.ageRangeButton,
              selectedAgeRange === '16+' && styles.ageRangeButtonActive
            ]}
            onPress={() => setSelectedAgeRange('16+')}
          >
            <Text style={[
              styles.ageRangeText,
              selectedAgeRange === '16+' && styles.ageRangeTextActive
            ]}>
              16+ Years
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Management Options */}
        <View style={styles.managementSection}>
          <Text style={[styles.managementTitle, { color: 'white' }]}>
            Management Options
          </Text>
          <View style={styles.managementGrid}>
            <TouchableOpacity
              style={styles.managementCard}
              onPress={() => navigation.navigate('EnhancedLessonManagement', { 
                dashboardType: 'children', 
                ageRange: selectedAgeRange 
              })}
            >
              <MaterialIcons name="school" size={24} color="white" />
              <Text style={styles.managementCardText}>Lesson Management</Text>
              <Text style={styles.managementCardSubtext}>Import & manage lessons</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.managementCard}
              onPress={() => navigation.navigate('ModuleManagement', { 
                dashboardType: 'children', 
                ageRange: selectedAgeRange 
              })}
            >
              <MaterialIcons name="library-books" size={24} color="white" />
              <Text style={styles.managementCardText}>Module Management</Text>
              <Text style={styles.managementCardSubtext}>Manage modules & content</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.managementCard}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <MaterialIcons name="people" size={24} color="white" />
              <Text style={styles.managementCardText}>User Management</Text>
              <Text style={styles.managementCardSubtext}>Manage users & roles</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.managementCard}
              onPress={() => navigation.navigate('QuizManagement')}
            >
              <MaterialIcons name="quiz" size={24} color="white" />
              <Text style={styles.managementCardText}>Quiz Management</Text>
              <Text style={styles.managementCardSubtext}>Create & manage quizzes</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </LinearGradient>
    );
  };

  const renderModuleCard = ({ item }: { item: Module }) => {
    const getLevelColor = (level: string) => {
      switch (level) {
        case 'beginner': return '#4ecdc4';
        case 'intermediate': return '#f39c12';
        case 'advanced': return '#e74c3c';
        default: return '#4ecdc4';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.moduleCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleModulePress(item)}
      >
        <View style={styles.moduleHeader}>
          <View style={styles.moduleInfo}>
            <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.moduleBadges}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
              <Text style={styles.badgeText}>{item.level}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.isPublished ? '#27ae60' : '#f39c12' }]}>
              <Text style={styles.badgeText}>{item.isPublished ? 'Published' : 'Draft'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.moduleStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="topic" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {Array.isArray(item.topics) ? item.topics.length : 0} Topics
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {item.estimatedDuration} min
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="tag" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {Array.isArray(item.tags) ? item.tags.length : 0} Tags
            </Text>
          </View>
        </View>
        
        <View style={styles.moduleTopics}>
          <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>Topics:</Text>
          {Array.isArray(item.topics) ? item.topics.slice(0, 3).map((topic, index) => (
            <Text key={index} style={[styles.topicText, { color: theme.colors.textSecondary }]}>
              • {topic.title}
            </Text>
          )) : null}
          {Array.isArray(item.topics) && item.topics.length > 3 && (
            <Text style={[styles.moreTopics, { color: theme.colors.primary }]}>
              +{Array.isArray(item.topics) ? item.topics.length - 3 : 0} more topics
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleModulePress = (module: Module) => {
    // Navigate to module detail screen
    navigation.navigate('AdminModuleDetail', {
      moduleId: module._id,
      moduleTitle: module.title,
      ageRange: selectedAgeRange
    });
  };

  const renderModulesList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading modules...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchModules}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!Array.isArray(modules) || modules.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="library-books" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No modules found for {selectedAgeRange} age range
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Create some sample modules to get started
          </Text>
          
          <View style={styles.emptyButtons}>
            <TouchableOpacity
              style={[styles.sampleButton, { backgroundColor: '#4ecdc4' }]}
              onPress={createSampleModules}
              disabled={creatingSample}
            >
              <MaterialIcons name="auto-fix-high" size={20} color="white" />
              <Text style={styles.sampleButtonText}>
                {creatingSample ? 'Creating...' : 'Create Sample Modules'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Navigate to add module screen
                navigation.navigate('AddModule', { ageRange: selectedAgeRange });
              }}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Module</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.modulesContainer}>
        <View style={styles.modulesHeader}>
          <Text style={[styles.modulesTitle, { color: theme.colors.text }]}>
            Modules ({Array.isArray(modules) ? modules.length : 0})
          </Text>
          <TouchableOpacity
            style={[styles.addModuleButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // Navigate to add module screen
              navigation.navigate('AddModule', { ageRange: selectedAgeRange });
            }}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addModuleButtonText}>Add Module</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={modules}
          renderItem={renderModuleCard}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modulesList}
        />
      </View>
    );
  };

  const renderItem = ({ item }: { item: Module }) => renderModuleCard({ item });

  const ListHeaderComponent = () => renderHeader();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={modules}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeaderComponent}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderModulesList}
      />
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
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
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
  ageRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  ageRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ageRangeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ageRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  ageRangeTextActive: {
    color: 'white',
  },
  managementSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  managementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  managementCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  managementCardText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  managementCardSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  devModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  devModeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  sampleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modulesContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  modulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addModuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addModuleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  modulesList: {
    paddingBottom: 20,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  moduleInfo: {
    flex: 1,
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  moduleBadges: {
    alignItems: 'flex-end',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  moduleTopics: {
    marginTop: 8,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 2,
  },
  moreTopics: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
  },
});

export default SimpleAdminDashboardScreen;
