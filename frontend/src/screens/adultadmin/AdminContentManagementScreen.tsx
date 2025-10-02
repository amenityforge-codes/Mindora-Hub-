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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface AdminContentManagementScreenProps {
  navigation: any;
  route?: {
    params: {
      dashboardType?: string;
      ageRange?: string;
    };
  };
}

const AdminContentManagementScreen: React.FC<AdminContentManagementScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const dashboardType = route?.params?.dashboardType || 'children';
  const ageRange = route?.params?.ageRange || '6-15';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: '',
    difficulty: 'beginner'
  });

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const getDashboardConfig = () => {
    const configs = {
      children: {
        title: 'Children Content Management',
        subtitle: 'Create engaging content for kids (6-15)',
        icon: 'child-care',
        color: ['#ff6b6b', '#ee5a52'],
        sections: [
          { id: 'lessons', title: 'Lessons', icon: 'school', color: '#4ecdc4' },
          { id: 'games', title: 'Interactive Games', icon: 'games', color: '#45b7d1' },
          { id: 'stories', title: 'Stories & Reading', icon: 'auto-stories', color: '#9b59b6' },
          { id: 'phonics', title: 'Phonics & Sounds', icon: 'volume-up', color: '#f39c12' }
        ]
      },
      teens: {
        title: 'Teens Content Management',
        subtitle: 'Create content for teenagers (16-18)',
        icon: 'teenager',
        color: ['#4ecdc4', '#45b7d1'],
        sections: [
          { id: 'modules', title: 'Learning Modules', icon: 'library-books', color: '#4ecdc4' },
          { id: 'communication', title: 'Communication Skills', icon: 'chat', color: '#45b7d1' },
          { id: 'career', title: 'Career Preparation', icon: 'work', color: '#9b59b6' },
          { id: 'soft-skills', title: 'Soft Skills', icon: 'psychology', color: '#f39c12' }
        ]
      },
      adults: {
        title: 'Adults Content Management',
        subtitle: 'Create professional content for adults',
        icon: 'person',
        color: ['#667eea', '#764ba2'],
        sections: [
          { id: 'business', title: 'Business English', icon: 'business', color: '#667eea' },
          { id: 'finance', title: 'Finance & AI', icon: 'account-balance', color: '#764ba2' },
          { id: 'communication', title: 'Professional Communication', icon: 'mic', color: '#4ecdc4' },
          { id: 'presentation', title: 'Presentation Skills', icon: 'present-to-all', color: '#45b7d1' }
        ]
      },
      business: {
        title: 'Business Content Management',
        subtitle: 'Create corporate training content',
        icon: 'business-center',
        color: ['#2c3e50', '#34495e'],
        sections: [
          { id: 'leadership', title: 'Leadership Skills', icon: 'group', color: '#2c3e50' },
          { id: 'negotiation', title: 'Negotiation', icon: 'handshake', color: '#34495e' },
          { id: 'interview', title: 'Interview Skills', icon: 'record-voice-over', color: '#4ecdc4' },
          { id: 'teamwork', title: 'Team Collaboration', icon: 'group-work', color: '#45b7d1' }
        ]
      }
    };
    
    return configs[dashboardType as keyof typeof configs] || configs.children;
  };

  const config = getDashboardConfig();

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
          colors={config.color}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Content Management</Text>
              <Text style={styles.userName}>{config.title} 📝</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={styles.themeToggle}
              >
                <MaterialIcons 
                  name={isDarkMode ? "wb-sunny" : "nightlight-round"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderContentSections = () => {
    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Content Sections</Text>
        <View style={styles.sectionsGrid}>
          {config.sections.map((section, index) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleSectionPress(section.id)}
            >
              <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
                <MaterialIcons name={section.icon as any} size={24} color="white" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: section.color }]}
                onPress={() => handleAddContent(section.id)}
              >
                <MaterialIcons name="add" size={16} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { 
        title: 'Add Lesson', 
        subtitle: 'Create new lesson', 
        icon: 'add-circle',
        colors: ['#4ecdc4', '#45b7d1'],
        onPress: () => handleAddContent('lesson')
      },
      { 
        title: 'Add Video', 
        subtitle: 'Upload video content', 
        icon: 'video-library',
        colors: ['#ff6b6b', '#ee5a52'],
        onPress: () => handleAddContent('video')
      },
      { 
        title: 'Add Quiz', 
        subtitle: 'Create quiz questions', 
        icon: 'quiz',
        colors: ['#2ed573', '#26d065'],
        onPress: () => handleAddContent('quiz')
      },
      { 
        title: 'Add Module', 
        subtitle: 'Create learning module', 
        icon: 'library-books',
        colors: ['#9b59b6', '#8e44ad'],
        onPress: () => handleAddContent('module')
      },
      { 
        title: 'Manage Content', 
        subtitle: 'Edit existing content', 
        icon: 'edit',
        colors: ['#f39c12', '#e67e22'],
        onPress: () => navigation.navigate('ModuleManagement', { dashboardType, ageRange })
      },
      { 
        title: 'Analytics', 
        subtitle: 'View content performance', 
        icon: 'analytics',
        colors: ['#34495e', '#2c3e50'],
        onPress: () => navigation.navigate('Analytics')
      },
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={action.onPress}
            >
              <LinearGradient
                colors={action.colors}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name={action.icon as any} size={28} color="white" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderContentStats = () => {
    const stats = [
      { label: 'Total Lessons', value: '24', icon: 'school', color: '#4ecdc4' },
      { label: 'Videos Uploaded', value: '156', icon: 'video-library', color: '#ff6b6b' },
      { label: 'Quizzes Created', value: '89', icon: 'quiz', color: '#2ed573' },
      { label: 'Active Modules', value: '12', icon: 'library-books', color: '#9b59b6' },
    ];

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Content Statistics</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View 
              key={index} 
              style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <MaterialIcons name={stat.icon as any} size={20} color="white" />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const handleSectionPress = (sectionId: string) => {
    // Navigate to section-specific content management
    switch (sectionId) {
      case 'lessons':
        navigation.navigate('ModuleManagement', { 
          dashboardType, 
          ageRange, 
          section: 'lessons' 
        });
        break;
      case 'games':
        navigation.navigate('SentenceBuilderManagement', { 
          dashboardType, 
          ageRange 
        });
        break;
      case 'stories':
        navigation.navigate('ContentUpload', { 
          dashboardType, 
          ageRange, 
          type: 'stories' 
        });
        break;
      case 'phonics':
        navigation.navigate('ContentUpload', { 
          dashboardType, 
          ageRange, 
          type: 'phonics' 
        });
        break;
      default:
        navigation.navigate('ModuleManagement', { 
          dashboardType, 
          ageRange, 
          section: sectionId 
        });
    }
  };

  const handleAddContent = (type: string) => {
    setModalType(type);
    setNewContent({
      title: '',
      description: '',
      type: type,
      difficulty: 'beginner'
    });
    setShowAddModal(true);
  };

  const handleSaveContent = () => {
    if (!newContent.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    // Here you would save the content to your backend
    console.log('Saving content:', newContent);
    
    Alert.alert('Success', `${modalType} created successfully!`);
    setShowAddModal(false);
    setNewContent({ title: '', description: '', type: '', difficulty: 'beginner' });
  };

  const renderAddModal = () => {
    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newContent.title}
              onChangeText={(text) => setNewContent({...newContent, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter description"
              placeholderTextColor={theme.colors.textSecondary}
              value={newContent.description}
              onChangeText={(text) => setNewContent({...newContent, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveContent}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={config.color[0]} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderContentSections()}
        {renderQuickActions()}
        {renderContentStats()}
      </ScrollView>
      {renderAddModal()}
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
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AdminContentManagementScreen;




