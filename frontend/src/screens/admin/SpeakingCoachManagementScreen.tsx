import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SpeakingParagraph {
  id: string;
  title: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scheduledDate: string; // Date when this paragraph should be available
  createdAt: string;
}

const SpeakingCoachManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [paragraphs, setParagraphs] = useState<SpeakingParagraph[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingParagraph, setEditingParagraph] = useState<SpeakingParagraph | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newParagraph, setNewParagraph] = useState({
    title: '',
    content: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    scheduledDate: new Date().toISOString().split('T')[0], // Default to today
  });

  useEffect(() => {
    loadParagraphs();
  }, []);

  const loadParagraphs = async () => {
    try {
      const stored = await AsyncStorage.getItem('speakingParagraphs');
      if (stored) {
        setParagraphs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading paragraphs:', error);
    }
  };

  const saveParagraphs = async (updatedParagraphs: SpeakingParagraph[]) => {
    try {
      await AsyncStorage.setItem('speakingParagraphs', JSON.stringify(updatedParagraphs));
      setParagraphs(updatedParagraphs);
    } catch (error) {
      console.error('Error saving paragraphs:', error);
    }
  };

  const handleAddParagraph = () => {
    if (!newParagraph.title.trim() || !newParagraph.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const paragraph: SpeakingParagraph = {
      id: Date.now().toString(),
      title: newParagraph.title,
      content: newParagraph.content,
      difficulty: newParagraph.difficulty,
      scheduledDate: newParagraph.scheduledDate,
      createdAt: new Date().toISOString(),
    };

    const updatedParagraphs = [...paragraphs, paragraph];
    saveParagraphs(updatedParagraphs);
    
    setNewParagraph({ title: '', content: '', difficulty: 'beginner', scheduledDate: new Date().toISOString().split('T')[0] });
    setIsAddingNew(false);
    Alert.alert('Success', 'Paragraph added successfully!');
  };

  const handleEditParagraph = (paragraph: SpeakingParagraph) => {
    setEditingParagraph(paragraph);
    setNewParagraph({
      title: paragraph.title,
      content: paragraph.content,
      difficulty: paragraph.difficulty,
      scheduledDate: paragraph.scheduledDate,
    });
    setIsAddingNew(true);
  };

  const handleUpdateParagraph = () => {
    if (!editingParagraph || !newParagraph.title.trim() || !newParagraph.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const updatedParagraphs = paragraphs.map(p => 
      p.id === editingParagraph.id 
        ? { ...p, ...newParagraph }
        : p
    );
    
    saveParagraphs(updatedParagraphs);
    setEditingParagraph(null);
    setNewParagraph({ title: '', content: '', difficulty: 'beginner', scheduledDate: new Date().toISOString().split('T')[0] });
    setIsAddingNew(false);
    Alert.alert('Success', 'Paragraph updated successfully!');
  };

  const handleDeleteParagraph = (id: string) => {
    Alert.alert(
      'Delete Paragraph',
      'Are you sure you want to delete this paragraph?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedParagraphs = paragraphs.filter(p => p.id !== id);
            saveParagraphs(updatedParagraphs);
            Alert.alert('Success', 'Paragraph deleted successfully!');
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    setNewParagraph({
      ...newParagraph,
      scheduledDate: selectedDate.toISOString().split('T')[0]
    });
    setShowDatePicker(false);
  };

  const renderDatePickerModal = () => (
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.datePickerScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.datePickerContainer}
          >
            {Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const isSelected = newParagraph.scheduledDate === date.toISOString().split('T')[0];
              const isToday = i === 0;
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dateOption,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.background,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => handleDateChange(date)}
                >
                  <Text style={[
                    styles.dateOptionText,
                    {
                      color: isSelected ? 'white' : theme.colors.text,
                      fontWeight: isToday ? 'bold' : 'normal'
                    }
                  ]}>
                    {date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={[
                    styles.dateOptionDay,
                    {
                      color: isSelected ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
                      fontWeight: isToday ? 'bold' : 'normal'
                    }
                  ]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  {isToday && (
                    <Text style={[styles.todayLabel, { color: theme.colors.primary }]}>Today</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={theme.gradients.header}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Speaking Coach Management</Text>
          <Text style={styles.headerSubtitle}>Manage speaking paragraphs</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingParagraph(null);
            setNewParagraph({ title: '', content: '', difficulty: 'beginner', scheduledDate: new Date().toISOString().split('T')[0] });
            setIsAddingNew(true);
          }}
        >
          <Icon name="add" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderParagraphForm = () => (
    <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        {editingParagraph ? 'Edit Paragraph' : 'Add New Paragraph'}
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Paragraph Title"
        placeholderTextColor={theme.colors.textSecondary}
        value={newParagraph.title}
        onChangeText={(text) => setNewParagraph({ ...newParagraph, title: text })}
      />
      
      <TextInput
        style={[styles.textArea, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Enter the paragraph content here..."
        placeholderTextColor={theme.colors.textSecondary}
        value={newParagraph.content}
        onChangeText={(text) => setNewParagraph({ ...newParagraph, content: text })}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />
      
      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {[
              { 
                level: 'beginner', 
                label: 'Beginner', 
                description: 'Easy content for new learners',
                color: '#4CAF50',
                icon: 'star'
              },
              { 
                level: 'intermediate', 
                label: 'Intermediate', 
                description: 'Medium content for practice',
                color: '#FF9800',
                icon: 'star-half'
              },
              { 
                level: 'advanced', 
                label: 'Advanced', 
                description: 'Challenging content for experts',
                color: '#F44336',
                icon: 'star-border'
              }
            ].map((item) => (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.difficultyCard,
                  { 
                    backgroundColor: newParagraph.difficulty === item.level 
                      ? item.color 
                      : theme.colors.surface,
                    borderColor: item.color,
                    borderWidth: newParagraph.difficulty === item.level ? 3 : 1,
                    transform: [{ scale: newParagraph.difficulty === item.level ? 1.05 : 1 }],
                  }
                ]}
                onPress={() => setNewParagraph({ ...newParagraph, difficulty: item.level as any })}
              >
                <View style={[
                  styles.difficultyIconContainer,
                  { backgroundColor: newParagraph.difficulty === item.level ? 'rgba(255,255,255,0.2)' : `${item.color}20` }
                ]}>
                  <Icon 
                    name={item.icon} 
                    size={28} 
                    color={newParagraph.difficulty === item.level ? 'white' : item.color} 
                  />
                </View>
                <Text style={[
                  styles.difficultyLabel,
                  { 
                    color: newParagraph.difficulty === item.level 
                      ? 'white' 
                      : item.color,
                    fontWeight: 'bold'
                  }
                ]}>
                  {item.label}
                </Text>
                <Text style={[
                  styles.difficultyDescription,
                  { 
                    color: newParagraph.difficulty === item.level 
                      ? 'rgba(255,255,255,0.9)' 
                      : theme.colors.textSecondary
                  }
                ]}>
                  {item.description}
                </Text>
                {newParagraph.difficulty === item.level && (
                  <View style={styles.selectedIndicator}>
                    <Icon name="check-circle" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Scheduled Date</Text>
          <TouchableOpacity
            style={[styles.dateContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="event" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateInput, { color: theme.colors.text }]}>
              {new Date(newParagraph.scheduledDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.dateHelper, { color: theme.colors.textSecondary }]}>
            When should this paragraph be available to users?
          </Text>
        </View>
      </View>
      
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.colors.error }]}
          onPress={() => {
            setIsAddingNew(false);
            setEditingParagraph(null);
            setNewParagraph({ title: '', content: '', difficulty: 'beginner', scheduledDate: new Date().toISOString().split('T')[0] });
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={editingParagraph ? handleUpdateParagraph : handleAddParagraph}
        >
          <Text style={styles.buttonText}>
            {editingParagraph ? 'Update' : 'Add'} Paragraph
          </Text>
        </TouchableOpacity>
      </View>
      
      {renderDatePickerModal()}
    </View>
  );

  const renderParagraphItem = (paragraph: SpeakingParagraph) => (
    <View key={paragraph.id} style={[styles.paragraphCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.paragraphHeader}>
        <View style={styles.paragraphInfo}>
          <Text style={[styles.paragraphTitle, { color: theme.colors.text }]}>
            {paragraph.title}
          </Text>
          <View style={styles.paragraphMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(paragraph.difficulty) }]}>
              <Text style={styles.difficultyBadgeText}>{paragraph.difficulty}</Text>
            </View>
            <View style={styles.dateBadge}>
              <Icon name="event" size={12} color={theme.colors.primary} />
              <Text style={[styles.dateText, { color: theme.colors.primary }]}>
                {new Date(paragraph.scheduledDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.paragraphActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditParagraph(paragraph)}
          >
            <Icon name="edit" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteParagraph(paragraph.id)}
          >
            <Icon name="delete" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.paragraphContent, { color: theme.colors.textSecondary }]} numberOfLines={3}>
        {paragraph.content}
      </Text>
      
      <Text style={[styles.paragraphDate, { color: theme.colors.textSecondary }]}>
        Created: {new Date(paragraph.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isAddingNew && renderParagraphForm()}
        
        <View style={styles.paragraphsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Weekly Speaking Paragraphs ({paragraphs.length})
          </Text>
          
          {paragraphs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="mic" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No paragraphs added yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Add your first speaking paragraph to get started
              </Text>
            </View>
          ) : (
            paragraphs.map(renderParagraphItem)
          )}
        </View>
      </ScrollView>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 120,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formField: {
    flex: 1,
    marginHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
    marginHorizontal: 6,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  difficultyDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    minHeight: 48,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  dateHelper: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paragraphsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paragraphCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  paragraphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paragraphInfo: {
    flex: 1,
  },
  paragraphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paragraphMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  paragraphActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  paragraphContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  paragraphDate: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  datePickerScrollView: {
    maxHeight: 300,
  },
  datePickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  dateOption: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 8,
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateOptionDay: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  todayLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default SpeakingCoachManagementScreen;
