import React, { useEffect, useRef } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

type AlphabetPhonicsModuleNavigationProp = StackNavigationProp<RootStackParamList, 'ModuleDetail'>;

export default function AlphabetPhonicsModule() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<AlphabetPhonicsModuleNavigationProp>();
  const route = useRoute();
  
  // Get moduleId from route parameters
  const moduleId = (route.params as any)?.moduleId || 'alphabet-phonics';
  
  console.log('=== AlphabetPhonicsModule ===');
  console.log('Route params:', route.params);
  console.log('Module ID from route:', (route.params as any)?.moduleId);
  console.log('Final moduleId:', moduleId);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Alphabet & Phonics</Text>
              <Text style={styles.headerSubtitle}>Learn A–Z sounds, recognition, and basic blending</Text>
            </View>
            
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <MaterialIcons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderTopicCard = (topic: any, index: number) => {
    const colors = ['#4169e1', '#4ecdc4', '#2ed573', '#667eea', '#f093fb'];
    const cardColor = colors[index % colors.length];

    return (
      <Animated.View
        key={index}
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
          onPress={() => {
            console.log('Starting topic:', topic.title);
            console.log('=== NAVIGATING TO TOPIC CONTENT ===');
            console.log('Topic:', topic);
            console.log('Module ID:', moduleId);
            
            try {
              navigation.navigate('TopicContent', {
                moduleId: moduleId,
                moduleTitle: 'Alphabet & Phonics',
                topicTitle: topic.title,
                topicDescription: topic.description
              });
              console.log('✅ Navigation to TopicContent successful!');
            } catch (error) {
              console.error('❌ Navigation error:', error);
              Alert.alert('Navigation Error', (error as Error).message);
            }
          }}
        >
          <LinearGradient
            colors={[cardColor, cardColor + '80']}
            style={styles.topicHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.topicHeaderContent}>
              <View style={styles.topicIcon}>
                <MaterialIcons name={topic.icon as any} size={24} color="white" />
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicType}>{topic.type}</Text>
              </View>
              <View style={styles.topicMeta}>
                <Text style={styles.topicDuration}>{topic.duration} min</Text>
                <Text style={styles.topicDifficulty}>{topic.difficulty}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.topicBody}>
            <Text style={[styles.topicDescription, { color: theme.colors.textSecondary }]}>
              {topic.description}
            </Text>
            
            <View style={styles.topicFooter}>
              <View style={styles.progressIndicator}>
                <MaterialIcons 
                  name={topic.isCompleted ? "check-circle" : "radio-button-unchecked"} 
                  size={20} 
                  color={topic.isCompleted ? theme.colors.success : theme.colors.textSecondary} 
                />
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {topic.isCompleted ? 'Completed' : 'Not Started'}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.startButton}>
                <MaterialIcons name="play-arrow" size={20} color="white" />
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategorySection = (category: any, categoryIndex: number) => {
    return (
      <View key={categoryIndex} style={styles.categorySection}>
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
            <MaterialIcons name={category.icon as any} size={24} color={theme.colors.primary} />
            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{category.title}</Text>
          </View>
        </Animated.View>
        
        {category.topics.map((topic: any, topicIndex: number) => 
          renderTopicCard(topic, categoryIndex * 10 + topicIndex)
        )}
      </View>
    );
  };

  // Alphabet & Phonics specific topics
  const topicCategories = [
    {
      title: "Letter Learning",
      icon: "text-fields",
      topics: [
        {
          title: "ABC Song Fun",
          description: "Learn A–Z sounds with fun animations and examples.",
          icon: "volume-up",
          type: "Audio",
          duration: 8,
          difficulty: "Easy",
          isCompleted: false
        },
        {
          title: "Letter Hunt Game",
          description: "Practice recognizing letters A through Z.",
          icon: "visibility",
          type: "Visual",
          duration: 10,
          difficulty: "Easy",
          isCompleted: false
        },
        {
          title: "Magic Writing",
          description: "Practice writing letters with guided tracing exercises.",
          icon: "edit",
          type: "Writing",
          duration: 12,
          difficulty: "Easy",
          isCompleted: false
        }
      ]
    },
    {
      title: "Sound Games",
      icon: "games",
      topics: [
        {
          title: "Sound Detective",
          description: "Match letters with their sounds in interactive games.",
          icon: "games",
          type: "Game",
          duration: 8,
          difficulty: "Easy",
          isCompleted: false
        },
        {
          title: "Word Building Magic",
          description: "Learn to blend sounds to make simple words.",
          icon: "spellcheck",
          type: "Reading",
          duration: 10,
          difficulty: "Medium",
          isCompleted: false
        },
        {
          title: "Phonics Adventure",
          description: "Play fun phonics games to practice sounds.",
          icon: "games",
          type: "Game",
          duration: 6,
          difficulty: "Easy",
          isCompleted: false
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {topicCategories.map((category, index) => 
          renderCategorySection(category, index)
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
    paddingTop: 10,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  topicCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topicCardContent: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  topicHeader: {
    padding: 15,
  },
  topicHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  topicType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  topicMeta: {
    alignItems: 'flex-end',
  },
  topicDuration: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  topicDifficulty: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  topicBody: {
    padding: 15,
  },
  topicDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    marginLeft: 5,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4169e1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
});
