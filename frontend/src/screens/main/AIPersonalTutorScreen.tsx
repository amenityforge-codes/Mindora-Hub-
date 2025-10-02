import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AIPersonalTutorScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Fetch Brainstorming and Math modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        console.log('=== AI PERSONAL TUTOR: Fetching Brainstorming and Math modules ===');
        setLoadingModules(true);
        
        const response = await fetch('http://192.168.1.18:5000/api/modules?ageRange=6-15', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();

        if (data.success) {
          // Filter for Brainstorming and Math modules
          const brainstormingMathModules = data.data.modules.filter((module: any) =>
            module.moduleType === 'brainstorming' || module.moduleType === 'math'
          );

          console.log('=== AI PERSONAL TUTOR: Found Brainstorming/Math modules:', brainstormingMathModules.length);
          console.log('=== AI PERSONAL TUTOR: Modules:', brainstormingMathModules);

          setModules(brainstormingMathModules);
        }
      } catch (error) {
        console.error('Error fetching Brainstorming/Math modules:', error);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

  const getModuleColor = (moduleType: string) => {
    switch (moduleType) {
      case 'brainstorming': return '#f59e0b';
      case 'math': return '#8b5cf6';
      case 'logic': return '#06b6d4';
      case 'creative': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getModuleIcon = (moduleType: string) => {
    switch (moduleType) {
      case 'brainstorming': return 'lightbulb';
      case 'math': return 'calculate';
      case 'logic': return 'psychology';
      case 'creative': return 'palette';
      default: return 'lightbulb';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Brainstorming & Math Modules
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <MaterialIcons 
              name={isDarkMode ? "light-mode" : "dark-mode"} 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {loadingModules ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ marginTop: 10, color: theme.colors.text }}>Loading Brainstorming & Math modules...</Text>
            </View>
          ) : modules.length > 0 ? (
            modules.map((module: any) => (
              <Card key={module._id} style={[styles.moduleCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.moduleHeader}>
                    <MaterialIcons 
                      name={getModuleIcon(module.moduleType)} 
                      size={32} 
                      color={getModuleColor(module.moduleType)} 
                    />
                    <View style={styles.moduleInfo}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {module.title}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary }}>
                        {module.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.moduleMeta}>
                    <Chip mode="outlined" compact>
                      <Text style={{ fontSize: 12 }}>{module.difficulty}</Text>
                    </Chip>
                    <Chip mode="outlined" compact>
                      <MaterialIcons name="timer" size={16} color={theme.colors.textSecondary} />
                      <Text style={{ marginLeft: 4, fontSize: 12 }}>{module.estimatedDuration || '30 min'}</Text>
                    </Chip>
                    <Chip mode="outlined" compact>
                      <Text style={{ fontSize: 12 }}>{module.moduleType}</Text>
                    </Chip>
                  </View>

                  {module.topics && module.topics.length > 0 && (
                    <View style={styles.topicsSection}>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        Topics ({module.topics.length})
                      </Text>
                      {module.topics.map((topic: any, index: number) => (
                        <TouchableOpacity
                          key={topic._id || index}
                          style={[styles.topicItem, { backgroundColor: theme.colors.background }]}
                          onPress={() => {
                            // Navigate to topic detail screen
                            (navigation as any).navigate('TopicStudy', {
                              topicId: topic._id,
                              topicTitle: topic.title,
                              moduleId: module._id
                            });
                          }}
                        >
                          <MaterialIcons name="folder" size={20} color={getModuleColor(module.moduleType)} />
                          <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                            {topic.title}
                          </Text>
                          <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.noModulesContainer}>
              <MaterialIcons name="info" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.noModulesText, { color: theme.colors.text }]}>
                No Brainstorming & Math modules available
              </Text>
              <Text style={[styles.noModulesSubtext, { color: theme.colors.textSecondary }]}>
                Check back later or contact your administrator
              </Text>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  moduleCard: {
    marginBottom: 16,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  moduleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  topicsSection: {
    marginTop: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noModulesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noModulesText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  noModulesSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});