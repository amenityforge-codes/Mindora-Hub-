import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  ActivityIndicator,
  Chip,
  RadioButton,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch } from '../../hooks/redux';
import apiService from '../../services/api';
import { ModuleType } from '../../types';

export default function ContentUploadScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleType: 'business-writing' as ModuleType,
    ageRange: '16+' as '6-15' | '16+' | 'business' | 'all',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedDuration: '',
    content: {
      text: '',
      instructions: '',
      objectives: '',
    },
    media: {
      video: {
        url: '',
        duration: 0,
        thumbnail: '',
        transcript: '',
        subtitles: '',
      },
      audio: {
        url: '',
        duration: 0,
        transcript: '',
      },
      pdf: {
        url: '',
        pages: 0,
        title: '',
      },
      images: [],
    },
    tags: '',
    isFeatured: false,
    isPremium: false,
    publishAt: '',
  });

  const moduleTypes: { type: ModuleType; label: string }[] = [
    { type: 'business-writing', label: 'Business Writing' },
    { type: 'presentation', label: 'Presentation Skills' },
    { type: 'negotiation', label: 'Negotiation' },
    { type: 'interview', label: 'Interview Skills' },
    { type: 'communication', label: 'Professional Communication' },
    { type: 'soft-skills', label: 'Soft Skills' },
    { type: 'finance', label: 'Financial Literacy' },
    { type: 'ai', label: 'AI & Technology' },
    { type: 'brainstorming', label: 'Creative Thinking' },
    { type: 'math', label: 'Business Math' },
    { type: 'writing', label: 'Professional Writing' },
    { type: 'speaking', label: 'Public Speaking' },
    { type: 'listening', label: 'Active Listening' },
    { type: 'reading', label: 'Professional Reading' },
    { type: 'grammar', label: 'Advanced Grammar' },
    { type: 'vocabulary', label: 'Business Vocabulary' },
  ];

  const ageRanges = [
    { value: '16+', label: 'Adults (16+)' },
    { value: 'business', label: 'Business Professionals' },
    { value: 'all', label: 'All Ages' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        const existingObject = typeof parentValue === 'object' && parentValue !== null ? parentValue : {};
        return {
          ...prev,
          [parent]: {
            ...existingObject,
            [child]: value,
          },
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const moduleData = {
        ...formData,
        content: {
          ...formData.content,
          objectives: formData.content.objectives.split('\n').filter(obj => obj.trim()),
        },
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        estimatedDuration: parseInt(formData.estimatedDuration) || 30,
        publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString() : new Date().toISOString(),
      };

      const response = await apiService.createAdultModule(moduleData);
      if (response.success) {
        Alert.alert(
          'Success',
          'Module created successfully!',
          [
            {
              text: 'Create Another',
              onPress: () => {
                setFormData({
                  title: '',
                  description: '',
                  moduleType: 'business-writing',
                  ageRange: '16+' as '6-15' | '16+' | 'business' | 'all',
                  difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
                  estimatedDuration: '',
                  content: { text: '', instructions: '', objectives: '' },
                  media: { 
                    video: { url: '', duration: 0, thumbnail: '', transcript: '', subtitles: '' },
                    audio: { url: '', duration: 0, transcript: '' },
                    pdf: { url: '', pages: 0, title: '' },
                    images: []
                  },
                  tags: '',
                  isFeatured: false,
                  isPremium: false,
                  publishAt: '',
                });
                setCurrentStep(1);
              },
            },
            {
              text: 'View Module',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create module');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create module. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={[
            styles.step,
            {
              backgroundColor: step <= currentStep ? theme.colors.primary : theme.colors.outline,
            },
          ]}
        >
          <Text
            style={[
              styles.stepText,
              {
                color: step <= currentStep ? 'white' : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Basic Information
        </Text>
        
        <TextInput
          label="Title *"
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          mode="outlined"
          style={styles.input}
        />
        
        <TextInput
          label="Description *"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
              Module Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {moduleTypes.map((type) => (
                  <Chip
                    key={type.type}
                    mode={formData.moduleType === type.type ? 'flat' : 'outlined'}
                    selected={formData.moduleType === type.type}
                    onPress={() => handleInputChange('moduleType', type.type)}
                    style={styles.chip}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
              Age Range
            </Text>
            <RadioButton.Group onValueChange={(value) => handleInputChange('ageRange', value)} value={formData.ageRange}>
              {ageRanges.map((range) => (
                <View key={range.value} style={styles.radioItem}>
                  <RadioButton value={range.value} />
                  <Text variant="bodyMedium">{range.label}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </View>
          
          <View style={styles.halfWidth}>
            <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
              Difficulty
            </Text>
            <RadioButton.Group onValueChange={(value) => handleInputChange('difficulty', value)} value={formData.difficulty}>
              {difficulties.map((diff) => (
                <View key={diff.value} style={styles.radioItem}>
                  <RadioButton value={diff.value} />
                  <Text variant="bodyMedium">{diff.label}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </View>
        </View>
        
        <TextInput
          label="Estimated Duration (minutes)"
          value={formData.estimatedDuration}
          onChangeText={(value) => handleInputChange('estimatedDuration', value)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
      </Card.Content>
    </Card>
  );

  const renderContent = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Content
        </Text>
        
        <TextInput
          label="Lesson Text"
          value={formData.content.text}
          onChangeText={(value) => handleInputChange('content.text', value)}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
        />
        
        <TextInput
          label="Instructions"
          value={formData.content.instructions}
          onChangeText={(value) => handleInputChange('content.instructions', value)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        
        <TextInput
          label="Learning Objectives (one per line)"
          value={formData.content.objectives}
          onChangeText={(value) => handleInputChange('content.objectives', value)}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="Students will be able to...&#10;Students will understand...&#10;Students will practice..."
        />
      </Card.Content>
    </Card>
  );

  const renderMedia = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Media Files
        </Text>
        
        <TextInput
          label="Video URL"
          value={formData.media.video?.url || ''}
          onChangeText={(value) => handleInputChange('media.video.url', value)}
          mode="outlined"
          style={styles.input}
          placeholder="https://example.com/video.mp4"
        />
        
        <TextInput
          label="Audio URL"
          value={formData.media.audio?.url || ''}
          onChangeText={(value) => handleInputChange('media.audio.url', value)}
          mode="outlined"
          style={styles.input}
          placeholder="https://example.com/audio.mp3"
        />
        
        <TextInput
          label="PDF URL"
          value={formData.media.pdf?.url || ''}
          onChangeText={(value) => handleInputChange('media.pdf.url', value)}
          mode="outlined"
          style={styles.input}
          placeholder="https://example.com/document.pdf"
        />
      </Card.Content>
    </Card>
  );

  const renderPublishSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Publish Settings
        </Text>
        
        <TextInput
          label="Tags (comma-separated)"
          value={formData.tags}
          onChangeText={(value) => handleInputChange('tags', value)}
          mode="outlined"
          style={styles.input}
          placeholder="grammar, beginner, vocabulary"
        />
        
        <TextInput
          label="Publish Date (optional)"
          value={formData.publishAt}
          onChangeText={(value) => handleInputChange('publishAt', value)}
          mode="outlined"
          style={styles.input}
          placeholder="2024-01-01T00:00:00Z"
        />
        
        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <Text variant="bodyMedium">Featured Module</Text>
            <Switch
              value={formData.isFeatured}
              onValueChange={(value) => handleInputChange('isFeatured', value)}
            />
          </View>
          
          <View style={styles.switchItem}>
            <Text variant="bodyMedium">Premium Content</Text>
            <Switch
              value={formData.isPremium}
              onValueChange={(value) => handleInputChange('isPremium', value)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderNavigation = () => (
    <View style={styles.navigation}>
      {currentStep > 1 && (
        <Button
          mode="outlined"
          onPress={() => setCurrentStep(currentStep - 1)}
          icon="chevron-left"
        >
          Previous
        </Button>
      )}
      
      {currentStep < 4 ? (
        <Button
          mode="contained"
          onPress={() => setCurrentStep(currentStep + 1)}
          icon="chevron-right"
        >
          Next
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isLoading}
          icon="upload"
        >
          {isLoading ? 'Creating...' : 'Create Module'}
        </Button>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderContent();
      case 3:
        return renderMedia();
      case 4:
        return renderPublishSettings();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Upload Content
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Create a new learning module
          </Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation */}
        {renderNavigation()}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
              Creating module...
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
    padding: 16,
    paddingBottom: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchContainer: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});



