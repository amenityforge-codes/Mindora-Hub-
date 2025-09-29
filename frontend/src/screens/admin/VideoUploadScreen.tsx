import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

interface VideoData {
  title: string;
  description: string;
  level: string;
  moduleId: string;
  duration: string;
  thumbnail: string | null;
  videoFile: any | null;
  tags: string[];
}

const VideoUploadScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [videoData, setVideoData] = useState<VideoData>({
    title: '',
    description: '',
    level: '1',
    moduleId: '1',
    duration: '',
    thumbnail: null,
    videoFile: null,
    tags: [],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const modules = [
    { id: '1', title: 'Alphabet & Phonics' },
    { id: '2', title: 'Basic Vocabulary' },
    { id: '3', title: 'Numbers & Counting' },
    { id: '4', title: 'Colors & Shapes' },
    { id: '5', title: 'Family & Relationships' },
    { id: '6', title: 'Animals & Nature' },
    { id: '7', title: 'Food & Drinks' },
    { id: '8', title: 'Clothing & Accessories' },
    { id: '9', title: 'Home & Furniture' },
    { id: '10', title: 'School & Education' },
    { id: '11', title: 'Body Parts & Health' },
    { id: '12', title: 'Transportation' },
    { id: '13', title: 'Weather & Seasons' },
    { id: '14', title: 'Time & Calendar' },
    { id: '15', title: 'Basic Grammar' },
    { id: '16', title: 'Common Verbs' },
    { id: '17', title: 'Adjectives & Descriptions' },
    { id: '18', title: 'Prepositions & Directions' },
    { id: '19', title: 'Questions & Answers' },
    { id: '20', title: 'Conversation Practice' },
  ];

  const levels = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

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
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Upload Video</Text>
          <Text style={styles.headerSubtitle}>Add new video content</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
    </LinearGradient>
  );

  const handleThumbnailPick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setVideoData({ ...videoData, thumbnail: result.assets[0].uri });
    }
  };

  const handleVideoPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setVideoData({ ...videoData, videoFile: result.assets[0] });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video file');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !videoData.tags.includes(tagInput.trim())) {
      setVideoData({
        ...videoData,
        tags: [...videoData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setVideoData({
      ...videoData,
      tags: videoData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleUpload = async () => {
    if (!videoData.title || !videoData.videoFile) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Video uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Video Title *
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          }]}
          value={videoData.title}
          onChangeText={(text) => setVideoData({ ...videoData, title: text })}
          placeholder="Enter video title"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Description
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          }]}
          value={videoData.description}
          onChangeText={(text) => setVideoData({ ...videoData, description: text })}
          placeholder="Enter video description"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Module *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.moduleSelector}>
              {modules.map((module) => (
                <TouchableOpacity
                  key={module.id}
                  style={[
                    styles.moduleOption,
                    { backgroundColor: theme.colors.surface },
                    videoData.moduleId === module.id && styles.selectedModule,
                  ]}
                  onPress={() => setVideoData({ ...videoData, moduleId: module.id })}
                >
                  <Text style={[
                    styles.moduleText,
                    { color: theme.colors.text },
                    videoData.moduleId === module.id && styles.selectedModuleText,
                  ]}>
                    {module.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Level *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.levelSelector}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelOption,
                    { backgroundColor: theme.colors.surface },
                    videoData.level === level && styles.selectedLevel,
                  ]}
                  onPress={() => setVideoData({ ...videoData, level })}
                >
                  <Text style={[
                    styles.levelText,
                    { color: theme.colors.text },
                    videoData.level === level && styles.selectedLevelText,
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Duration (minutes)
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          }]}
          value={videoData.duration}
          onChangeText={(text) => setVideoData({ ...videoData, duration: text })}
          placeholder="e.g., 5"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Thumbnail
        </Text>
        <TouchableOpacity
          style={[styles.thumbnailButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleThumbnailPick}
        >
          {videoData.thumbnail ? (
            <Image source={{ uri: videoData.thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Icon name="add-photo-alternate" size={32} color={theme.colors.textSecondary} />
              <Text style={[styles.thumbnailText, { color: theme.colors.textSecondary }]}>
                Add Thumbnail
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Video File *
        </Text>
        <TouchableOpacity
          style={[styles.videoButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleVideoPick}
        >
          <Icon name="video-library" size={32} color={theme.colors.primary} />
          <Text style={[styles.videoText, { color: theme.colors.text }]}>
            {videoData.videoFile ? videoData.videoFile.name : 'Select Video File'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Tags
        </Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={[styles.tagInput, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }]}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag"
            placeholderTextColor={theme.colors.textSecondary}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity
            style={[styles.addTagButton, { backgroundColor: theme.colors.primary }]}
            onPress={addTag}
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {videoData.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Icon name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderUploadButton = () => (
    <View style={styles.uploadContainer}>
      <TouchableOpacity
        style={[
          styles.uploadButton,
          { backgroundColor: theme.colors.primary },
          isUploading && styles.uploadButtonDisabled,
        ]}
        onPress={handleUpload}
        disabled={isUploading}
      >
        <LinearGradient
          colors={theme.gradients.button}
          style={styles.uploadButtonGradient}
        >
          {isUploading ? (
            <>
              <Icon name="hourglass-empty" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Uploading...</Text>
            </>
          ) : (
            <>
              <Icon name="cloud-upload" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderForm()}
        {renderUploadButton()}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  moduleSelector: {
    flexDirection: 'row',
  },
  moduleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedModule: {
    borderColor: '#4169e1',
    backgroundColor: '#4169e120',
  },
  moduleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedModuleText: {
    color: '#4169e1',
    fontWeight: 'bold',
  },
  levelSelector: {
    flexDirection: 'row',
  },
  levelOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedLevel: {
    borderColor: '#4169e1',
    backgroundColor: '#4169e120',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLevelText: {
    color: '#4169e1',
    fontWeight: 'bold',
  },
  thumbnailButton: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    marginTop: 8,
    fontSize: 16,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  videoText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    marginRight: 4,
  },
  uploadContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default VideoUploadScreen;














