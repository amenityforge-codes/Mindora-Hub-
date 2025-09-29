import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CareerScenario {
  id: string;
  title: string;
  degree: string;
  description: string;
  icon: string;
  color: string[];
  benefits: string[];
  scenarios: string[];
  englishModules: string[];
  fluencyRequirements: {
    speaking: string;
    writing: string;
    listening: string;
    reading: string;
    overall: string;
  };
  salaryRange: string;
  globalOpportunities: string;
}

const CareerScenariosScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const careerScenarios: CareerScenario[] = [
    {
      id: 'btech-engineering',
      title: 'BTech Engineering',
      degree: 'Bachelor of Technology',
      description: 'Master English for engineering careers in India and abroad',
      icon: 'engineering',
      color: ['#3b82f6', '#1d4ed8'],
      benefits: [
        'Technical documentation writing',
        'International project collaboration',
        'Research paper publication',
        'Global job opportunities'
      ],
      scenarios: [
        'Presenting technical solutions to international clients',
        'Writing project proposals in English',
        'Collaborating with global engineering teams',
        'Attending international conferences'
      ],
      englishModules: [
        'Technical Writing',
        'Presentation Skills',
        'Professional Communication',
        'Academic English'
      ],
      fluencyRequirements: {
        speaking: '85% - Clear technical explanations',
        writing: '90% - Precise documentation',
        listening: '80% - Understand global teams',
        reading: '95% - Research papers & manuals',
        overall: '87% - Advanced Professional'
      },
      salaryRange: '₹8-25 LPA (India) | $70-150K (Global)',
      globalOpportunities: 'Silicon Valley, Europe, Singapore, Australia'
    },
    {
      id: 'mba-business',
      title: 'MBA Business',
      degree: 'Master of Business Administration',
      description: 'Excel in business communication and leadership',
      icon: 'business',
      color: ['#10b981', '#059669'],
      benefits: [
        'Business proposal writing',
        'Leadership communication',
        'International negotiations',
        'Executive presentations'
      ],
      scenarios: [
        'Leading international business meetings',
        'Negotiating with global partners',
        'Presenting business strategies',
        'Writing executive reports'
      ],
      englishModules: [
        'Business Writing',
        'Negotiation Skills',
        'Leadership Communication',
        'Financial English'
      ],
      fluencyRequirements: {
        speaking: '92% - Executive presentations',
        writing: '88% - Business proposals',
        listening: '85% - International meetings',
        reading: '90% - Financial reports',
        overall: '89% - Executive Level'
      },
      salaryRange: '₹12-40 LPA (India) | $100-300K (Global)',
      globalOpportunities: 'Wall Street, London, Dubai, Hong Kong'
    },
    {
      id: 'medicine-healthcare',
      title: 'Medicine & Healthcare',
      degree: 'MBBS / MD / Nursing',
      description: 'Communicate effectively in healthcare settings',
      icon: 'local-hospital',
      color: ['#ef4444', '#dc2626'],
      benefits: [
        'Patient communication',
        'Medical research writing',
        'International medical practice',
        'Healthcare documentation'
      ],
      scenarios: [
        'Explaining treatments to international patients',
        'Writing medical research papers',
        'Attending global medical conferences',
        'Collaborating with international healthcare teams'
      ],
      englishModules: [
        'Medical English',
        'Patient Communication',
        'Research Writing',
        'Healthcare Documentation'
      ],
      fluencyRequirements: {
        speaking: '88% - Patient explanations',
        writing: '93% - Medical documentation',
        listening: '85% - International conferences',
        reading: '95% - Medical journals',
        overall: '90% - Medical Professional'
      },
      salaryRange: '₹6-20 LPA (India) | $80-200K (Global)',
      globalOpportunities: 'USA, UK, Canada, Australia, Middle East'
    },
    {
      id: 'computer-science',
      title: 'Computer Science',
      degree: 'B.Tech / M.Tech / PhD',
      description: 'Excel in tech industry communication',
      icon: 'computer',
      color: ['#8b5cf6', '#7c3aed'],
      benefits: [
        'Code documentation',
        'Technical presentations',
        'Open source contributions',
        'International tech jobs'
      ],
      scenarios: [
        'Explaining complex algorithms to teams',
        'Writing technical documentation',
        'Presenting at tech conferences',
        'Collaborating on global projects'
      ],
      englishModules: [
        'Technical Documentation',
        'Software Communication',
        'Tech Presentations',
        'Open Source English'
      ],
      fluencyRequirements: {
        speaking: '82% - Technical explanations',
        writing: '88% - Code documentation',
        listening: '80% - Global teams',
        reading: '92% - Technical papers',
        overall: '86% - Tech Professional'
      },
      salaryRange: '₹10-50 LPA (India) | $100-300K (Global)',
      globalOpportunities: 'Silicon Valley, Seattle, London, Berlin, Tokyo'
    },
    {
      id: 'foreign-studies',
      title: 'Foreign Studies',
      degree: 'Study Abroad Programs',
      description: 'Prepare for international education',
      icon: 'school',
      color: ['#f59e0b', '#d97706'],
      benefits: [
        'Academic writing',
        'Classroom participation',
        'Research collaboration',
        'Cultural integration'
      ],
      scenarios: [
        'Participating in international classrooms',
        'Writing academic papers',
        'Presenting research findings',
        'Building global networks'
      ],
      englishModules: [
        'Academic Writing',
        'Classroom English',
        'Research Communication',
        'Cultural English'
      ],
      fluencyRequirements: {
        speaking: '85% - Academic discussions',
        writing: '90% - Research papers',
        listening: '88% - Lectures & seminars',
        reading: '95% - Academic texts',
        overall: '90% - Academic Level'
      },
      salaryRange: 'Scholarships & Grants Available',
      globalOpportunities: 'Harvard, MIT, Oxford, Cambridge, Stanford'
    },
    {
      id: 'finance-banking',
      title: 'Finance & Banking',
      degree: 'CA / CFA / MBA Finance',
      description: 'Master financial communication',
      icon: 'account-balance',
      color: ['#06b6d4', '#0891b2'],
      benefits: [
        'Financial reporting',
        'Investment presentations',
        'Client communication',
        'Regulatory compliance'
      ],
      scenarios: [
        'Presenting investment strategies',
        'Writing financial reports',
        'Client relationship management',
        'International banking operations'
      ],
      englishModules: [
        'Financial English',
        'Investment Communication',
        'Banking English',
        'Regulatory Writing'
      ],
      fluencyRequirements: {
        speaking: '90% - Client presentations',
        writing: '92% - Financial reports',
        listening: '87% - Market analysis',
        reading: '94% - Financial documents',
        overall: '91% - Financial Professional'
      },
      salaryRange: '₹15-60 LPA (India) | $120-500K (Global)',
      globalOpportunities: 'Wall Street, London, Singapore, Hong Kong, Dubai'
    }
  ];

  const handleCareerSelect = (career: CareerScenario) => {
    // Navigate to Communication page with career context
    navigation.navigate('CommunicationEnglish' as never, { 
      careerContext: career 
    } as never);
  };

  const renderCareerCard = (career: CareerScenario) => (
    <TouchableOpacity
      key={career.id}
      style={styles.careerCard}
      onPress={() => handleCareerSelect(career)}
    >
      <LinearGradient
        colors={career.color}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Icon name={career.icon} size={32} color="white" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.careerTitle}>{career.title}</Text>
            <Text style={styles.degreeText}>{career.degree}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{career.description}</Text>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Key Benefits:</Text>
          {Array.isArray(career.benefits) ? career.benefits.slice(0, 2).map((benefit, index) => (
            <Text key={index} style={styles.benefitItem}>
              • {benefit}
            </Text>
          )) : null}
        </View>
        
        <View style={styles.fluencyContainer}>
          <Text style={styles.fluencyTitle}>🎯 Required English Level:</Text>
          <Text style={styles.fluencyOverall}>{career.fluencyRequirements.overall}</Text>
          <View style={styles.fluencyBreakdown}>
            <Text style={styles.fluencyItem}>🗣️ Speaking: {career.fluencyRequirements.speaking}</Text>
            <Text style={styles.fluencyItem}>✍️ Writing: {career.fluencyRequirements.writing}</Text>
          </View>
        </View>
        
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryText}>💰 {career.salaryRange}</Text>
          <Text style={styles.globalText}>🌍 {career.globalOpportunities}</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <Text style={styles.actionText}>Tap to explore →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Career Scenarios
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Choose your career path and master English for success
          </Text>
        </View>
      </View>

      <View style={styles.introContainer}>
        <Text style={[styles.introTitle, { color: theme.colors.text }]}>
          🎯 Why English Matters for Your Career
        </Text>
        <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
          English proficiency opens doors to global opportunities, higher salaries, 
          and international recognition. Choose your career path below to see how 
          English can accelerate your success.
        </Text>
      </View>

      <View style={styles.careersGrid}>
        {careerScenarios.map(renderCareerCard)}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          💡 Each career path includes specialized English modules designed for your field
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  introContainer: {
    padding: 16,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  careersGrid: {
    padding: 16,
    gap: 16,
  },
  careerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  careerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  degreeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  modulesContainer: {
    marginBottom: 16,
  },
  modulesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  modulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moduleTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moduleText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  actionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  fluencyContainer: {
    marginBottom: 12,
  },
  fluencyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  fluencyOverall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
  },
  fluencyBreakdown: {
    gap: 2,
  },
  fluencyItem: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  salaryContainer: {
    marginBottom: 12,
  },
  salaryText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 2,
  },
  globalText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default CareerScenariosScreen;
