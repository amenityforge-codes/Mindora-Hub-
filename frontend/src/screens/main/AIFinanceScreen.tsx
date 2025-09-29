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

import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AIFinanceScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [selectedModule, setSelectedModule] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [financeScore, setFinanceScore] = useState(0);

  const financeModules = [
    {
      id: 1,
      title: 'Financial Vocabulary',
      description: 'Master essential financial terms and concepts',
      type: 'vocabulary',
      difficulty: 'Easy',
      estimatedTime: '15 min',
      topics: [
        'Investment terms (stocks, bonds, mutual funds)',
        'Banking vocabulary (interest, loan, mortgage)',
        'Business finance (revenue, profit, loss)',
        'Economic indicators (inflation, GDP, recession)'
      ]
    },
    {
      id: 2,
      title: 'AI Tools for Finance',
      description: 'Learn to use AI tools for financial analysis',
      type: 'ai-tools',
      difficulty: 'Medium',
      estimatedTime: '20 min',
      topics: [
        'ChatGPT for financial research',
        'AI-powered investment analysis',
        'Automated financial reporting',
        'AI budgeting and expense tracking'
      ]
    },
    {
      id: 3,
      title: 'Investment English',
      description: 'Communicate effectively about investments',
      type: 'investment',
      difficulty: 'Hard',
      estimatedTime: '25 min',
      topics: [
        'Portfolio management discussions',
        'Risk assessment conversations',
        'Market analysis presentations',
        'Investment strategy meetings'
      ]
    },
    {
      id: 4,
      title: 'Financial Presentations',
      description: 'Present financial data and insights professionally',
      type: 'presentation',
      difficulty: 'Hard',
      estimatedTime: '30 min',
      topics: [
        'Quarterly earnings presentations',
        'Budget proposal meetings',
        'Financial forecasting reports',
        'Investment pitch decks'
      ]
    }
  ];

  const financialScenarios = [
    {
      id: 1,
      title: 'Investment Discussion',
      context: 'You\'re discussing investment options with a client. Explain the difference between stocks and bonds.',
      keyTerms: ['stocks', 'bonds', 'risk', 'return', 'portfolio', 'diversification'],
      expectedResponse: 'Stocks represent ownership in a company, while bonds are loans to governments or corporations...'
    },
    {
      id: 2,
      title: 'Budget Meeting',
      context: 'Present your department\'s budget proposal to senior management.',
      keyTerms: ['budget', 'allocation', 'expenses', 'revenue', 'forecast', 'variance'],
      expectedResponse: 'Our proposed budget allocates 40% to personnel costs, 30% to operations...'
    },
    {
      id: 3,
      title: 'AI Tool Explanation',
      context: 'Explain how AI can help with financial analysis to a non-technical audience.',
      keyTerms: ['artificial intelligence', 'data analysis', 'automation', 'insights', 'efficiency'],
      expectedResponse: 'AI can analyze large amounts of financial data quickly and identify patterns...'
    }
  ];

  const handleStartModule = async (module: any) => {
    setIsLoading(true);
    setSelectedModule(module.id);
    
    // Simulate AI preparing the module
    setTimeout(() => {
      setAiResponse(`Welcome to ${module.title}! I'll help you master financial English and AI tools. Let's start with some key concepts and then practice real-world scenarios.`);
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmitResponse = async () => {
    if (!userInput.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockFeedback = generateFinanceFeedback(userInput);
      setAiResponse(mockFeedback);
      setFinanceScore(Math.floor(Math.random() * 30) + 70); // 70-100
      setUserInput('');
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateFinanceFeedback = (response: string) => {
    return `Excellent financial communication! Here's my analysis:

✅ **Financial Vocabulary Usage:**
• Good use of technical terms
• Appropriate business language
• Clear explanations of complex concepts

✅ **AI Integration:**
• Shows understanding of AI applications
• Demonstrates practical knowledge
• Good examples of AI tools

🔧 **Areas for Improvement:**
• Consider adding more specific data points
• Try to include more quantitative analysis
• Practice using financial ratios and metrics

💡 **Suggestions:**
• Use more charts and graphs in presentations
• Practice explaining complex financial concepts simply
• Learn more about AI-powered financial tools

**Financial Communication Score: ${Math.floor(Math.random() * 30) + 70}%**

Ready for the next financial scenario?`;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#ef4444', '#dc2626']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI & Finance</Text>
          <Text style={styles.headerSubtitle}>Master financial English with AI tools</Text>
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

  const renderFinanceCoach = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.coachProfile}>
          <Avatar.Icon 
            size={64} 
            icon="account-balance" 
            style={{ backgroundColor: '#ef4444' }}
          />
          <View style={styles.coachInfo}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              AI Finance Coach
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Financial English + AI tools expertise
            </Text>
            <View style={styles.coachStats}>
              <Chip mode="outlined" compact style={styles.statChip}>
                <MaterialIcons name="trending-up" size={16} color="#ef4444" />
                <Text style={{ marginLeft: 4, color: '#ef4444' }}>Expert Level</Text>
              </Chip>
              <Chip mode="outlined" compact style={styles.statChip}>
                <MaterialIcons name="psychology" size={16} color="#8b5cf6" />
                <Text style={{ marginLeft: 4, color: '#8b5cf6' }}>AI Powered</Text>
              </Chip>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderModuleSelector = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Choose Finance Module
        </Text>
        <View style={styles.modulesGrid}>
          {financeModules.map((module, index) => (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleCard,
                { backgroundColor: theme.colors.background },
                selectedModule === module.id && { borderColor: theme.colors.primary, borderWidth: 2 }
              ]}
              onPress={() => handleStartModule(module)}
            >
              <LinearGradient
                colors={[getModuleColor(module.type), `${getModuleColor(module.type)}CC`]}
                style={styles.moduleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.moduleContent}>
                  <MaterialIcons 
                    name={getModuleIcon(module.type)} 
                    size={32} 
                    color="white" 
                  />
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                  
                  <View style={styles.moduleMeta}>
                    <Chip mode="outlined" compact style={styles.metaChip}>
                      <Text style={{ fontSize: 12, color: 'white' }}>{module.difficulty}</Text>
                    </Chip>
                    <Chip mode="outlined" compact style={styles.metaChip}>
                      <MaterialIcons name="timer" size={16} color="white" />
                      <Text style={{ marginLeft: 4, fontSize: 12, color: 'white' }}>{module.estimatedTime}</Text>
                    </Chip>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderCurrentModule = () => {
    if (!selectedModule) return null;
    
    const module = financeModules[selectedModule - 1];
    const scenario = financialScenarios[0]; // For demo, using first scenario
    
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Current Module: {module?.title}
          </Text>
          
          <View style={styles.scenarioContainer}>
            <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
              Scenario: {scenario?.title}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {scenario?.context}
            </Text>
            
            <View style={styles.keyTermsContainer}>
              <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 8 }}>
                Key Financial Terms to Use:
              </Text>
              <View style={styles.termsList}>
                {scenario?.keyTerms.map((term, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.termChip}>
                    {term}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderResponseInput = () => {
    if (!selectedModule) return null;

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Your Financial Response
          </Text>
          
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.colors.background }]}
            placeholder="Write your financial explanation or analysis here..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={userInput}
            onChangeText={setUserInput}
            multiline
            numberOfLines={6}
            mode="outlined"
          />
          
          <Button
            mode="contained"
            onPress={handleSubmitResponse}
            disabled={!userInput.trim() || isAnalyzing}
            style={styles.submitButton}
            icon="send"
          >
            {isAnalyzing ? 'Analyzing...' : 'Submit for AI Review'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderAIFeedback = () => {
    if (!aiResponse || !selectedModule) return null;

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.feedbackHeader}>
            <Avatar.Icon 
              size={40} 
              icon="psychology" 
              style={{ backgroundColor: '#ef4444' }}
            />
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 12 }}>
              AI Finance Analysis
            </Text>
          </View>
          
          {financeScore > 0 && (
            <View style={styles.scoreContainer}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#10b981' }}>
                {financeScore}%
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Financial Communication Score
              </Text>
            </View>
          )}
          
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{aiResponse}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderAIToolsSection = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          AI Tools for Finance
        </Text>
        
        <View style={styles.aiToolsList}>
          <View style={styles.aiToolItem}>
            <MaterialIcons name="psychology" size={24} color="#8b5cf6" />
            <View style={styles.aiToolInfo}>
              <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                ChatGPT for Financial Research
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Use AI to research companies, analyze market trends, and explain financial concepts
              </Text>
            </View>
          </View>
          
          <View style={styles.aiToolItem}>
            <MaterialIcons name="analytics" size={24} color="#10b981" />
            <View style={styles.aiToolInfo}>
              <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                AI Investment Analysis
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Leverage AI tools for portfolio optimization and risk assessment
              </Text>
            </View>
          </View>
          
          <View style={styles.aiToolItem}>
            <MaterialIcons name="auto-awesome" size={24} color="#f59e0b" />
            <View style={styles.aiToolInfo}>
              <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                Automated Financial Reports
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Generate financial reports and presentations using AI automation
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return '#8b5cf6';
      case 'ai-tools': return '#f59e0b';
      case 'investment': return '#10b981';
      case 'presentation': return '#06b6d4';
      default: return '#ef4444';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'book';
      case 'ai-tools': return 'psychology';
      case 'investment': return 'trending-up';
      case 'presentation': return 'presentation-chart';
      default: return 'account-balance';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        {renderFinanceCoach()}
        {renderModuleSelector()}
        {renderCurrentModule()}
        {renderResponseInput()}
        {renderAIFeedback()}
        {renderAIToolsSection()}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
              AI is preparing your finance module...
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
  coachProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
    marginLeft: 16,
  },
  coachStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  moduleCard: {
    width: (width - 80) / 2, // More precise calculation for 2-per-row
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 16,
  },
  moduleGradient: {
    padding: 16,
    minHeight: 160,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  moduleDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  moduleMeta: {
    flexDirection: 'row',
    gap: 4,
  },
  metaChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scenarioContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  keyTermsContainer: {
    marginTop: 16,
  },
  termsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  termChip: {
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 16,
  },
  submitButton: {
    alignSelf: 'flex-end',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
  },
  feedbackContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiToolsList: {
    gap: 16,
  },
  aiToolItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiToolInfo: {
    flex: 1,
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
