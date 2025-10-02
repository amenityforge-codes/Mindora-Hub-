import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchModules, setFilters, clearFilters } from '../../store/slices/contentSlice';
import { Module, ModuleFilters } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function ModulesScreen() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { modules, filters, isLoading, pagination } = useAppSelector((state) => state.content);
  const { user } = useAppSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Local state for lessons from lesson management system
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadModules();
    
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
  }, [filters]);

  // Refresh data when screen comes into focus (e.g., after syncing)
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        try {
          console.log('=== MODULES SCREEN: Refreshing data on focus ===');
          await loadModules();
        } catch (error) {
          console.error('Error refreshing modules data:', error);
        }
      };

      refreshData();
    }, [])
  );

  const loadModules = async () => {
    try {
      console.log('=== MODULES SCREEN: Loading modules from modules API ===');
      setLessonsLoading(true);
      
      // Load modules from the modules API instead of lessons
      const lessonsResponse = await fetch('http://192.168.1.18:5000/api/modules?ageRange=6-15');
      const lessonsData = await lessonsResponse.json();
      
      console.log('=== MODULES SCREEN: Modules response:', lessonsData);
      
      if (lessonsData.success) {
        console.log('=== MODULES SCREEN: Found modules:', lessonsData.data.modules.length);
        setLessons(lessonsData.data.modules);
        
        // Also update Redux for compatibility
        const modulesData = {
          modules: lessonsData.data.modules.map(module => ({
            _id: module._id,
            title: module.title,
            description: module.description,
            difficulty: module.difficulty,
            ageRange: module.ageRange,
            estimatedDuration: module.estimatedDuration,
            topics: module.topics || [],
            createdAt: module.createdAt,
            status: module.status || 'published'
          })),
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: lessonsData.data.modules.length,
            hasNextPage: false,
            hasPrevPage: false
          }
        };
        
        // Update Redux store with lessons data
        dispatch({ type: 'content/fetchModules/fulfilled', payload: modulesData });
      }
      
      setLessonsLoading(false);
    } catch (error) {
      console.error('Error loading lessons from lesson management:', error);
      setLessonsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadModules();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Search functionality will be handled by filtering the display modules
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      dispatch(clearFilters());
    } else {
      dispatch(setFilters({ moduleType: filter }));
    }
  };

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
              <Text style={styles.headerTitle}>Lessons 📚</Text>
              <Text style={styles.headerSubtitle}>From Lesson Management System</Text>
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

  const renderSearchAndFilters = () => {
    const filterOptions = [
      { key: 'all', label: 'All', icon: 'apps' },
      { key: 'phonics', label: 'Phonics', icon: 'spellcheck' },
      { key: 'vocabulary', label: 'Vocabulary', icon: 'book' },
      { key: 'grammar', label: 'Grammar', icon: 'school' },
      { key: 'speaking', label: 'Speaking', icon: 'mic' },
      { key: 'math', label: 'Math', icon: 'calculate' },
    ];

    return (
      <Animated.View
        style={[
          styles.searchSection,
          { backgroundColor: theme.colors.background },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.searchContainer, { backgroundColor: 'transparent' }]}>
          <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search lessons..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedFilter === filter.key 
                    ? theme.colors.primary 
                    : 'transparent',
                  borderColor: theme.colors.primary,
                }
              ]}
              onPress={() => handleFilterChange(filter.key)}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={16} 
                color={selectedFilter === filter.key ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.filterText,
                { color: selectedFilter === filter.key ? 'white' : theme.colors.primary }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

  // Map old hardcoded IDs to real MongoDB ObjectIds
  const getRealModuleId = (moduleId: string) => {
    const idMap: { [key: string]: string } = {
      '1': '68cfdd9ae3bc97188711e040', // Alphabet & Phonics
      '2': '68cfdd9ae3bc97188711e041', // Basic Vocabulary (placeholder)
      '3': '68cfdd9ae3bc97188711e042', // Numbers & Counting (placeholder)
      // For modules 4-20, use the original ID since they don't have real MongoDB IDs yet
    };
    // For modules 4-20, return the original ID (they use hardcoded fallback data)
    return idMap[moduleId] || moduleId;
  };

  // Map module IDs to their corresponding screen names
  const getModuleScreenName = (moduleId: string) => {
    const moduleMap: { [key: string]: string } = {
      // Old hardcoded IDs (for backward compatibility)
      '1': 'AlphabetPhonicsModule',
      '2': 'BasicVocabularyModule',
      '3': 'NumbersCountingModule',
      '4': 'ColorsShapesModule',
      '5': 'FamilyRelationshipsModule',
      '6': 'AnimalsNatureModule',
      '7': 'FoodDrinksModule',
      '8': 'ClothingAccessoriesModule',
      '9': 'HomeFurnitureModule',
      '10': 'SchoolEducationModule',
      '11': 'BodyPartsHealthModule',
      '12': 'TransportationModule',
      '13': 'WeatherSeasonsModule',
      '14': 'TimeCalendarModule',
      '15': 'BasicGrammarModule',
      '16': 'CommonVerbsModule',
      '17': 'AdjectivesDescriptionsModule',
      '18': 'PrepositionsDirectionsModule',
      '19': 'QuestionsAnswersModule',
      '20': 'ConversationPracticeModule',
      // New MongoDB ObjectIds
      '68cfdd9ae3bc97188711e040': 'AlphabetPhonicsModule', // Alphabet & Phonics
    };
    // For now, use ModuleDetail for all modules to ensure consistent navigation
    // This will allow all modules to properly navigate to TopicContent for video/quiz display
    return 'ModuleDetail';
  };

  const renderModuleItem = ({ item, index }: { item: Module; index: number }) => {
    const progress = item.userProgress?.percentage || 0;
    const status = item.userProgress?.status || 'not-started';
    const colors = ['#4169e1', '#4ecdc4', '#2ed573', '#667eea', '#f093fb'];
    const cardColor = colors[index % colors.length];

    return (
      <Animated.View
        style={[
          styles.moduleCard,
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
          style={[styles.moduleCardContent, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            console.log('=== LESSONS SCREEN: Lesson clicked ===');
            console.log('Lesson ID:', item._id);
            console.log('Lesson Title:', item.title);
            console.log('Lesson Topics:', item.topics?.length || 0);
            
            // Navigate to LessonDetailScreen to show all topics
            navigation.navigate('LessonDetail' as never, { 
              lessonId: item._id,
              lessonTitle: item.title,
              lessonDescription: item.description,
              topics: item.topics || [],
            } as never);
          }}
        >
          <LinearGradient
            colors={[cardColor, cardColor + '80']}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.moduleHeaderContent}>
              <View style={styles.moduleIcon}>
                <MaterialIcons name="play-circle-filled" size={24} color="white" />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.moduleType}>{item.moduleType}</Text>
              </View>
              {item.isFeatured && (
                <View style={styles.featuredBadge}>
                  <MaterialIcons name="star" size={16} color="#ffd93d" />
                </View>
              )}
            </View>
          </LinearGradient>

          <View style={styles.moduleBody}>
            <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {item.description}
            </Text>
            
            <View style={styles.moduleMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.estimatedDuration} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="trending-up" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.difficulty}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="topic" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {item.topics?.length || 0} topics
                </Text>
              </View>
            </View>

            {/* Topics and Videos Information */}
            {item.topics && item.topics.length > 0 && (
              <View style={styles.topicsContainer}>
                <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>
                  📚 Topics & Content:
                </Text>
                {item.topics.slice(0, 3).map((topic, topicIndex) => (
                  <View key={topic._id || topicIndex} style={styles.topicItem}>
                    <Text style={[styles.topicTitle, { color: theme.colors.text }]}>
                      • {topic.title}
                    </Text>
                    <View style={styles.topicMeta}>
                      <View style={styles.topicMetaItem}>
                        <MaterialIcons name="play-circle-outline" size={14} color={theme.colors.primary} />
                        <Text style={[styles.topicMetaText, { color: theme.colors.textSecondary }]}>
                          {topic.videos?.length || 0} videos
                        </Text>
                      </View>
                      <View style={styles.topicMetaItem}>
                        <MaterialIcons name="quiz" size={14} color={theme.colors.primary} />
                        <Text style={[styles.topicMetaText, { color: theme.colors.textSecondary }]}>
                          {topic.quizzes?.length || 0} quizzes
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                {item.topics.length > 3 && (
                  <Text style={[styles.moreTopics, { color: theme.colors.textSecondary }]}>
                    +{item.topics.length - 3} more topics...
                  </Text>
                )}
              </View>
            )}

            {status !== 'not-started' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                    {status === 'completed' ? 'Completed' : 'In Progress'}
                  </Text>
                  <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
                    {progress}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: status === 'completed' ? theme.colors.success : theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery.length > 0 ? 'No lessons found' : 'No lessons available'}
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        {searchQuery.length > 0 
          ? `No lessons match "${searchQuery}". Try a different search term.`
          : 'Try adjusting your filters or check back later for new content'
        }
      </Text>
    </View>
  );

  // Organize lessons into categories using real lessons from lesson management
  const lessonCategories = [
    {
      title: 'Foundation Skills',
      icon: 'school',
      lessons: lessons.filter(lesson => 
        lesson.difficulty === 'Beginner' && (
          lesson.title.toLowerCase().includes('alphabet') ||
          lesson.title.toLowerCase().includes('phonics') ||
          lesson.title.toLowerCase().includes('vocabulary') ||
          lesson.title.toLowerCase().includes('numbers') ||
          lesson.title.toLowerCase().includes('counting') ||
          lesson.title.toLowerCase().includes('colors') ||
          lesson.title.toLowerCase().includes('shapes')
        )
      ).map(lesson => ({
        ...lesson,
        moduleType: 'phonics',
        isFeatured: true,
        userProgress: { percentage: 0, status: 'not-started' }
      }))
    },
    {
      title: 'Daily Life Topics',
      icon: 'home',
      lessons: [
        {
          _id: '5',
          title: 'Family & Relationships',
          description: 'Vocabulary for family members, friends, greetings. Roleplay: "My Family," "Introducing a Friend."',
          moduleType: 'vocabulary',
          difficulty: 'Easy',
          estimatedDuration: 16,
          isFeatured: true,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '6',
          title: 'Animals & Nature',
          description: 'Wild vs domestic animals, natural elements (tree, river, sky). Story-based learning, nature quizzes.',
          moduleType: 'vocabulary',
          difficulty: 'Medium',
          estimatedDuration: 22,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '7',
          title: 'Food & Drinks',
          description: 'Common foods, meals, asking for food. Interactive "menu game."',
          moduleType: 'vocabulary',
          difficulty: 'Easy',
          estimatedDuration: 14,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '8',
          title: 'Clothing & Accessories',
          description: 'Clothes, shoes, accessories, describing outfits. Dress-up vocabulary activities.',
          moduleType: 'vocabulary',
          difficulty: 'Easy',
          estimatedDuration: 13,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '9',
          title: 'Home & Furniture',
          description: 'Rooms, furniture names, household items. Label-your-home activity.',
          moduleType: 'vocabulary',
          difficulty: 'Easy',
          estimatedDuration: 17,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '10',
          title: 'School & Education',
          description: 'Subjects, school supplies, classroom expressions. "In the classroom" roleplay.',
          moduleType: 'vocabulary',
          difficulty: 'Medium',
          estimatedDuration: 19,
          isFeatured: true,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '11',
          title: 'Body Parts & Health',
          description: 'Human body parts, basic health vocabulary. "Doctor & patient" conversation practice.',
          moduleType: 'vocabulary',
          difficulty: 'Easy',
          estimatedDuration: 15,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '12',
          title: 'Transportation',
          description: 'Vehicles, travel words, asking directions. Map activities & travel dialogues.',
          moduleType: 'vocabulary',
          difficulty: 'Medium',
          estimatedDuration: 18,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '13',
          title: 'Weather & Seasons',
          description: 'Weather words, seasonal changes. Daily weather reports practice.',
          moduleType: 'vocabulary',
          difficulty: 'Easy',
          estimatedDuration: 16,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '14',
          title: 'Time & Calendar',
          description: 'Days, months, telling time. Scheduling activities.',
          moduleType: 'vocabulary',
          difficulty: 'Medium',
          estimatedDuration: 20,
          isFeatured: true,
          userProgress: { percentage: 0, status: 'not-started' }
        }
      ]
    },
    {
      title: 'Grammar & Language',
      icon: 'menu-book',
      lessons: [
        {
          _id: '15',
          title: 'Basic Grammar',
          description: 'Sentence structure, nouns, verbs, simple tenses. Fill-in-the-blanks, rearrange words game.',
          moduleType: 'grammar',
          difficulty: 'Medium',
          estimatedDuration: 25,
          isFeatured: true,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '16',
          title: 'Common Verbs',
          description: 'Action words (run, eat, play), verb forms. "Verb charades" game.',
          moduleType: 'grammar',
          difficulty: 'Easy',
          estimatedDuration: 18,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '17',
          title: 'Adjectives & Descriptions',
          description: 'Describing objects, people, comparisons. Picture description tasks.',
          moduleType: 'grammar',
          difficulty: 'Medium',
          estimatedDuration: 22,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '18',
          title: 'Prepositions & Directions',
          description: 'In, on, under, near, giving directions. Treasure hunt with prepositions.',
          moduleType: 'grammar',
          difficulty: 'Medium',
          estimatedDuration: 19,
          isFeatured: false,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '19',
          title: 'Questions & Answers',
          description: 'Forming WH-questions, yes/no questions. Quiz-style practice.',
          moduleType: 'grammar',
          difficulty: 'Medium',
          estimatedDuration: 21,
          isFeatured: true,
          userProgress: { percentage: 0, status: 'not-started' }
        },
        {
          _id: '20',
          title: 'Conversation Practice',
          description: 'Real-world dialogues: shopping, school, friends. Roleplay and storytelling.',
          moduleType: 'speaking',
          difficulty: 'Hard',
          estimatedDuration: 30,
          isFeatured: true,
          userProgress: { percentage: 0, status: 'not-started' }
        }
      ]
    }
  ];

  // Filter lessons based on search and selected filter
  const getFilteredCategories = () => {
    return lessonCategories.map(category => {
      let filteredLessons = category.lessons;
      
      // Apply search filter
      if (searchQuery.length > 0) {
        filteredLessons = filteredLessons.filter(lesson =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply type filter
      if (selectedFilter !== 'all') {
        filteredLessons = filteredLessons.filter(lesson =>
          lesson.moduleType === selectedFilter
        );
      }
      
      return {
        ...category,
        lessons: filteredLessons
      };
    }).filter(category => category.lessons.length > 0); // Only show categories with lessons
  };

  const filteredCategories = getFilteredCategories();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      
      {renderHeader()}
      {renderSearchAndFilters()}
      
      {/* Debug banners for lesson management */}
      {lessons.length === 0 && !lessonsLoading && (
        <View style={{ backgroundColor: '#ff6b6b', padding: 10, margin: 10, borderRadius: 5 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            DEBUG: No lessons loaded from lesson management system!
          </Text>
        </View>
      )}
      
      {lessons.length > 0 && (
        <View style={{ backgroundColor: '#4ecdc4', padding: 10, margin: 10, borderRadius: 5 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            DEBUG: {lessons.length} lessons loaded from lesson management system!
          </Text>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12, marginTop: 5 }}>
            Lessons: {lessons.slice(0, 3).map(l => l.title).join(', ')}...
          </Text>
        </View>
      )}
      
      {lessonsLoading && (
        <View style={{ backgroundColor: '#ffa500', padding: 10, margin: 10, borderRadius: 5 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            DEBUG: Loading lessons from lesson management system...
          </Text>
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {lessons.length > 0 ? (
          <View>
            <View style={{ backgroundColor: '#4ecdc4', padding: 15, margin: 10, borderRadius: 10 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                📚 Lessons from Lesson Management System
              </Text>
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 12, marginTop: 5 }}>
                {lessons.length} lessons available
              </Text>
            </View>
            {lessons.map((lesson, index) => (
              <View key={lesson._id}>
                {renderModuleItem({ item: lesson, index: index })}
              </View>
            ))}
          </View>
        ) : (
          renderEmptyState()
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
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filtersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  moduleCard: {
    marginBottom: 16,
  },
  moduleCardContent: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  moduleHeader: {
    padding: 16,
  },
  moduleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  moduleType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleBody: {
    padding: 16,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  moduleMeta: {
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
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Topics and Videos styles
  topicsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  topicItem: {
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  topicMeta: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  topicMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  topicMetaText: {
    marginLeft: 4,
    fontSize: 11,
  },
  moreTopics: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

