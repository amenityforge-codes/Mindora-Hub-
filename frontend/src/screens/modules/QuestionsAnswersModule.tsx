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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function QuestionsAnswersModule() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  
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
              <Text style={styles.headerTitle}>Questions & Answers</Text>
              <Text style={styles.headerSubtitle}>Forming WH-questions, yes/no questions</Text>
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

  // Questions & Answers specific topics
  const topicCategories = [
  {
    title: "Ask & Answer",
    icon: "help",
    topics: [
      {
        title: "Question Time",
        description: "Forming WH-questions, yes/no questions.",
        icon: "quiz",
        type: "Grammar",
        duration: 10,
        difficulty: "Medium",
        isCompleted: false
      },
      {
        title: "Quick Quiz",
        description: "Quiz-style practice.",
        icon: "quiz",
        type: "Activity",
        duration: 12,
        difficulty: "Medium",
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
