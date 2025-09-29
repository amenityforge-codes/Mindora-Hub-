import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';

interface ModuleContentScreenProps {
  navigation: any;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'document';
  duration?: string;
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
}

const ModuleContentScreen: React.FC<ModuleContentScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setContentItems([
      {
        id: '1',
        title: 'Introduction to Grammar',
        type: 'video',
        duration: '5:30',
        status: 'published',
        lastModified: '2024-01-15',
      },
      {
        id: '2',
        title: 'Basic Vocabulary',
        type: 'text',
        status: 'published',
        lastModified: '2024-01-16',
      },
      {
        id: '3',
        title: 'Grammar Quiz',
        type: 'quiz',
        duration: '10 min',
        status: 'draft',
        lastModified: '2024-01-17',
      },
      {
        id: '4',
        title: 'Practice Exercises',
        type: 'document',
        status: 'published',
        lastModified: '2024-01-18',
      },
    ]);
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    Alert.alert(
      'Change Status',
      `Are you sure you want to change this content status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setContentItems(contentItems.map(item => 
              item.id === itemId ? { ...item, status: newStatus as any } : item
            ));
          },
        },
      ]
    );
  };

  const handleEdit = (item: ContentItem) => {
    Alert.alert('Edit Content', `Edit "${item.title}"?`);
  };

  const handleDelete = (itemId: string) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setContentItems(contentItems.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const filteredContent = selectedType === 'all' 
    ? contentItems 
    : contentItems.filter(item => item.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'video-library';
      case 'text': return 'article';
      case 'quiz': return 'quiz';
      case 'document': return 'description';
      default: return 'file';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#43e97b';
      case 'draft': return '#fa709a';
      case 'archived': return '#667eea';
      default: return '#4facfe';
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <MaterialIcons name="description" size={32} color="white" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Module Content</Text>
            </View>
            
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <MaterialIcons
                name={isDarkMode ? "wb-sunny" : "nightlight-round"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>Manage module content and materials</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filterContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Filter by Type
            </Text>
            <View style={styles.filterButtons}>
              {['all', 'video', 'text', 'quiz', 'document'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    selectedType === type && styles.filterButtonActive,
                    { backgroundColor: selectedType === type ? theme.colors.primary : theme.colors.surface }
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: selectedType === type ? 'white' : theme.colors.onSurface }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Content Items ({filteredContent.length})
            </Text>
            
            {filteredContent.map((item) => (
              <Card key={item.id} style={[styles.contentCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content style={styles.contentCardContent}>
                  <View style={styles.contentInfo}>
                    <View style={[styles.contentIcon, { backgroundColor: getStatusColor(item.status) }]}>
                      <MaterialIcons name={getTypeIcon(item.type) as any} size={24} color="white" />
                    </View>
                    <View style={styles.contentDetails}>
                      <Text style={[styles.contentTitle, { color: theme.colors.onSurface }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.contentType, { color: theme.colors.onSurfaceVariant }]}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        {item.duration && ` • ${item.duration}`}
                      </Text>
                      <Text style={[styles.contentDate, { color: theme.colors.onSurfaceVariant }]}>
                        Modified: {item.lastModified}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.contentActions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        { backgroundColor: getStatusColor(item.status) }
                      ]}
                      onPress={() => handleStatusChange(item.id, item.status === 'published' ? 'draft' : 'published')}
                    >
                      <Text style={styles.statusButtonText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#4facfe' }]}
                      onPress={() => handleEdit(item)}
                    >
                      <MaterialIcons name="edit" size={16} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#fa709a' }]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <MaterialIcons name="delete" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginLeft: -24,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  filterContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  contentCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  contentCardContent: {
    padding: 16,
  },
  contentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentDetails: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 14,
    marginBottom: 2,
  },
  contentDate: {
    fontSize: 12,
  },
  contentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModuleContentScreen;
