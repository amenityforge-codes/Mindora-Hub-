import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../services/api';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  symbol: string;
  color: string;
  pointsRequired: number;
  category: string;
  rarity: string;
  isActive: boolean;
  isSecret: boolean;
  rewards: {
    points: number;
    xp: number;
    coins: number;
  };
  tags: string[];
  displayOrder: number;
  createdAt: string;
}

const AchievementManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showRarityPicker, setShowRarityPicker] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'star',
    symbol: '⭐',
    color: '#FFD700',
    pointsRequired: 100,
    category: 'learning',
    rarity: 'common',
    isSecret: false,
    tags: '',
    displayOrder: 0,
    imageUri: null as string | null
  });

  const categories = [
    { value: 'learning', label: 'Learning', icon: 'school', color: '#4ECDC4' },
    { value: 'streak', label: 'Streak', icon: 'local-fire-department', color: '#FF6B6B' },
    { value: 'quiz', label: 'Quiz', icon: 'quiz', color: '#45B7D1' },
    { value: 'video', label: 'Video', icon: 'play-circle', color: '#96CEB4' },
    { value: 'speaking', label: 'Speaking', icon: 'mic', color: '#FFEAA7' },
    { value: 'writing', label: 'Writing', icon: 'edit', color: '#DDA0DD' },
    { value: 'listening', label: 'Listening', icon: 'headphones', color: '#82E0AA' },
    { value: 'reading', label: 'Reading', icon: 'menu-book', color: '#F7DC6F' },
    { value: 'grammar', label: 'Grammar', icon: 'spellcheck', color: '#BB8FCE' },
    { value: 'vocabulary', label: 'Vocabulary', icon: 'translate', color: '#85C1E9' },
    { value: 'social', label: 'Social', icon: 'people', color: '#F8C471' },
    { value: 'milestone', label: 'Milestone', icon: 'flag', color: '#FFD700' },
    { value: 'special', label: 'Special', icon: 'star', color: '#FF69B4' },
    { value: 'seasonal', label: 'Seasonal', icon: 'wb-sunny', color: '#58D68D' },
    { value: 'challenge', label: 'Challenge', icon: 'fitness-center', color: '#E74C3C' }
  ];

  const rarities = [
    { value: 'common', label: 'Common', color: '#9CA3AF' },
    { value: 'uncommon', label: 'Uncommon', color: '#10B981' },
    { value: 'rare', label: 'Rare', color: '#3B82F6' },
    { value: 'epic', label: 'Epic', color: '#8B5CF6' },
    { value: 'legendary', label: 'Legendary', color: '#F59E0B' }
  ];

  const colorOptions = [
    // Gold & Premium
    '#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347',
    // Blue & Teal
    '#4ECDC4', '#45B7D1', '#87CEEB', '#4682B4', '#5F9EA0', '#20B2AA',
    // Green & Nature
    '#96CEB4', '#82E0AA', '#A9DFBF', '#58D68D', '#52C41A', '#7CB342',
    // Purple & Pink
    '#DDA0DD', '#BB8FCE', '#D7BDE2', '#E8DAEF', '#F8BBD9', '#FF69B4',
    // Red & Orange
    '#FF6B6B', '#F1948A', '#FFB6C1', '#FFA07A', '#FF7F7F', '#E74C3C',
    // Yellow & Bright
    '#FFEAA7', '#F7DC6F', '#F9E79F', '#FCF3CF', '#FFFACD', '#FFFFE0',
    // Silver & Gray
    '#D5DBDB', '#B0C4DE', '#C0C0C0', '#A9A9A9', '#808080', '#696969'
  ];

  const symbols = [
    // Achievement & Awards
    '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎗️', '👑', '💎', '⭐',
    '🌟', '💫', '✨', '🎯', '🎊', '🎉', '🎈', '🎁', '🔥', '💯',
    '⚡', '🌈', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠', '🎲', '🎮',
    
    // Learning & Education
    '📚', '📖', '📝', '✏️', '✒️', '🖊️', '🖋️', '📏', '📐', '📊',
    '📈', '📉', '📋', '📌', '📍', '📎', '🗂️', '🗃️', '🗄️', '🔍',
    '🔎', '🔬', '🔭', '📡', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️',
    
    // Success & Growth
    '🌱', '🌿', '🍀', '🌳', '🌺', '🌸', '🌻', '🌹', '🌷', '🌼',
    '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑',
    
    // Technology & Innovation
    '💡', '🔦', '🕯️', '🪔', '🔋', '🔌', '⚙️', '🔧', '🔨', '⚒️',
    '🛠️', '⛏️', '🔩', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓',
    
    // Special & Unique
    '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺',
    '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻',
    
    // Fun & Playful
    '🧸', '🧵', '🧶', '🪡', '🪢', '🧼', '🪥', '🧽', '🪣', '🧴',
    '🧷', '🧸', '🎈', '🎊', '🎉', '🎁', '🎀', '🎂', '🍰', '🧁'
  ];

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      console.log('Loading achievements with API service...');
      const data = await apiService.get('/achievements');
      
      console.log('Achievements API response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        const achievementsList = data.data.achievements;
        setAchievements(achievementsList);
        console.log('Achievements loaded successfully:', achievementsList.length);
        console.log('Achievements data:', JSON.stringify(achievementsList, null, 2));
      } else {
        throw new Error(data.message || 'Failed to load achievements');
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      Alert.alert('Error', 'Failed to load achievements. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const handleCreateAchievement = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter an achievement name');
        return;
      }
      if (!formData.description.trim()) {
        Alert.alert('Error', 'Please enter an achievement description');
        return;
      }
      if (!formData.symbol) {
        Alert.alert('Error', 'Please select a symbol for the achievement');
        return;
      }
      if (!formData.category) {
        Alert.alert('Error', 'Please select a category for the achievement');
        return;
      }

      const achievementData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.symbol, // Use symbol as icon since both are required
        symbol: formData.symbol,
        color: formData.color,
        pointsRequired: formData.pointsRequired,
        category: formData.category,
        rarity: formData.rarity,
        isActive: true, // Explicitly set as active
        isSecret: formData.isSecret,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        displayOrder: formData.displayOrder
      };

      console.log('Creating achievement with data:', achievementData);
      const data = await apiService.post('/achievements', achievementData);

      if (data.success) {
        Alert.alert('Success', 'Achievement created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadAchievements();
      } else {
        Alert.alert('Error', data.message || 'Failed to create achievement');
      }
    } catch (error) {
      console.error('Error creating achievement:', error);
      Alert.alert('Error', 'Failed to create achievement. Please check your connection.');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    Alert.alert(
      'Delete Achievement',
      'Are you sure you want to delete this achievement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting achievement with API service...');
              const data = await apiService.delete(`/achievements/${id}`);

              if (data.success) {
                Alert.alert('Success', 'Achievement deleted successfully!');
                loadAchievements();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete achievement');
              }
            } catch (error) {
              console.error('Error deleting achievement:', error);
              Alert.alert('Error', 'Failed to delete achievement. Please check your connection.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'star',
      symbol: '⭐',
      color: '#FFD700',
      pointsRequired: 100,
      category: 'learning',
      rarity: 'common',
      isSecret: false,
      tags: '',
      displayOrder: 0,
      imageUri: null
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          imageUri: result.assets[0].uri,
          symbol: result.assets[0].uri // Use image URI as symbol
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory;
    const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity;
    
    const result = matchesSearch && matchesCategory && matchesRarity;
    console.log(`Achievement "${achievement.name}" - Search: ${matchesSearch}, Category: ${matchesCategory}, Rarity: ${matchesRarity}, Result: ${result}`);
    
    return result;
  });

  console.log('Total achievements:', achievements.length);
  console.log('Filtered achievements:', filteredAchievements.length);

  const renderAchievementCard = ({ item }: { item: Achievement }) => {
    const rarityInfo = rarities.find(r => r.value === item.rarity);
    
    return (
      <View style={[styles.achievementCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIcon}>
            {item.symbol && item.symbol.startsWith('http') ? (
              <Image source={{ uri: item.symbol }} style={styles.achievementImage} />
            ) : (
              <Text style={styles.achievementSymbol}>{item.symbol}</Text>
            )}
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            <View style={styles.achievementMeta}>
              <Text style={[styles.achievementPoints, { color: theme.colors.primary }]}>
                {item.pointsRequired} points
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: rarityInfo?.color }]}>
                <Text style={styles.rarityText}>{rarityInfo?.label}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.achievementActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setEditingAchievement(item)}
          >
            <MaterialIcons name="edit" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => handleDeleteAchievement(item._id)}
          >
            <MaterialIcons name="delete" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSymbolPicker = () => (
    <Modal
      visible={showSymbolPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSymbolPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.symbolPicker, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.symbolPickerHeader}>
            <Text style={[styles.symbolPickerTitle, { color: theme.colors.text }]}>
              Choose Symbol
            </Text>
            <TouchableOpacity
              onPress={() => setShowSymbolPicker(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={symbols}
            numColumns={10}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.symbolItem}
                onPress={() => {
                  setFormData({ ...formData, symbol: item });
                  setShowSymbolPicker(false);
                }}
              >
                <Text style={styles.symbolText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.symbolsList}
          />
        </View>
      </View>
    </Modal>
  );

  const renderCategoryPicker = () => {
    console.log('Category picker modal visible:', showCategoryPicker);
    return (
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity 
          style={[styles.pickerModal, { backgroundColor: theme.colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
              Choose Category
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.pickerList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryItem,
                  { backgroundColor: formData.category === category.value ? theme.colors.primary : 'transparent' }
                ]}
                onPress={() => {
                  console.log('Category selected:', category.value);
                  setFormData({ ...formData, category: category.value });
                  setShowCategoryPicker(false);
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <MaterialIcons name={category.icon as any} size={20} color="white" />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  { color: formData.category === category.value ? 'white' : theme.colors.text }
                ]}>
                  {category.label}
                </Text>
                {formData.category === category.value && (
                  <MaterialIcons name="check" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

  const renderRarityPicker = () => {
    console.log('Rarity picker modal visible:', showRarityPicker);
    return (
      <Modal
        visible={showRarityPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRarityPicker(false)}
      >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowRarityPicker(false)}
      >
        <TouchableOpacity 
          style={[styles.pickerModal, { backgroundColor: theme.colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
              Choose Rarity
            </Text>
            <TouchableOpacity
              onPress={() => setShowRarityPicker(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.pickerList}>
            {rarities.map((rarity) => (
              <TouchableOpacity
                key={rarity.value}
                style={[
                  styles.rarityItem,
                  { backgroundColor: formData.rarity === rarity.value ? theme.colors.primary : 'transparent' }
                ]}
                onPress={() => {
                  console.log('Rarity selected:', rarity.value);
                  setFormData({ ...formData, rarity: rarity.value });
                  setShowRarityPicker(false);
                }}
              >
                <View style={styles.rarityContent}>
                  <View style={[styles.rarityIndicator, { backgroundColor: rarity.color }]} />
                  <Text style={[
                    styles.rarityLabel,
                    { color: formData.rarity === rarity.value ? 'white' : theme.colors.text }
                  ]}>
                    {rarity.label}
                  </Text>
                </View>
                {formData.rarity === rarity.value && (
                  <MaterialIcons name="check" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

  const renderColorPicker = () => {
    console.log('Color picker modal visible:', showColorPicker);
    return (
      <Modal
        visible={showColorPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowColorPicker(false)}
      >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowColorPicker(false)}
      >
        <TouchableOpacity 
          style={[styles.pickerModal, { backgroundColor: theme.colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
              Choose Color
            </Text>
            <TouchableOpacity
              onPress={() => setShowColorPicker(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.colorPickerContent}>
            <Text style={[styles.colorSectionTitle, { color: theme.colors.text }]}>
              Popular Colors
            </Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color, index) => (
                <TouchableOpacity
                  key={`color-${index}-${color}`}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    formData.color === color && styles.selectedColorItem
                  ]}
                  onPress={() => {
                    console.log('Color selected:', color);
                    setFormData({ ...formData, color });
                    setShowColorPicker(false);
                  }}
                >
                  {formData.color === color && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.colorSectionTitle, { color: theme.colors.text }]}>
              Custom Color
            </Text>
            <View style={styles.customColorContainer}>
              <TextInput
                style={[styles.customColorInput, { 
                  backgroundColor: theme.colors.background, 
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={formData.color}
                onChangeText={(text) => setFormData({ ...formData, color: text })}
                placeholder="#FFD700"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <View style={[styles.colorPreview, { backgroundColor: formData.color }]} />
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView style={[styles.createModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Create Achievement
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Achievement name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Achievement description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Symbol</Text>
              <View style={styles.symbolContainer}>
                <TouchableOpacity
                  style={[styles.symbolButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setShowSymbolPicker(true)}
                >
                  {formData.imageUri ? (
                    <Image source={{ uri: formData.imageUri }} style={styles.symbolImage} />
                  ) : (
                    <Text style={styles.symbolButtonText}>{formData.symbol}</Text>
                  )}
                  <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imagePickerButton, { backgroundColor: theme.colors.primary }]}
                  onPress={pickImage}
                >
                  <MaterialIcons name="photo-library" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Color</Text>
              <TouchableOpacity
                style={[styles.colorButton, { backgroundColor: formData.color }]}
                onPress={() => {
                  console.log('Color picker button pressed');
                  setShowColorPicker(true);
                }}
              >
                <Text style={styles.colorButtonText}>{formData.color}</Text>
                <MaterialIcons name="palette" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Points Required</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={formData.pointsRequired.toString()}
                onChangeText={(text) => setFormData({ ...formData, pointsRequired: parseInt(text) || 0 })}
                placeholder="100"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
              <TouchableOpacity
                style={[styles.categoryPicker, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  console.log('Category picker button pressed');
                  setShowCategoryPicker(true);
                }}
              >
                <View style={styles.categoryPickerContent}>
                  {(() => {
                    const selectedCategory = categories.find(cat => cat.value === formData.category);
                    return selectedCategory ? (
                      <>
                        <View style={[styles.categoryPickerIcon, { backgroundColor: selectedCategory.color }]}>
                          <MaterialIcons name={selectedCategory.icon as any} size={16} color="white" />
                        </View>
                        <Text style={[styles.categoryPickerText, { color: theme.colors.text }]}>
                          {selectedCategory.label}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.categoryPickerText, { color: theme.colors.text }]}>
                        Select Category
                      </Text>
                    );
                  })()}
                </View>
                <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Rarity</Text>
              <TouchableOpacity
                style={[styles.rarityPicker, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  console.log('Rarity picker button pressed');
                  setShowRarityPicker(true);
                }}
              >
                <View style={styles.rarityPickerContent}>
                  {(() => {
                    const selectedRarity = rarities.find(r => r.value === formData.rarity);
                    return selectedRarity ? (
                      <>
                        <View style={[styles.rarityPickerIndicator, { backgroundColor: selectedRarity.color }]} />
                        <Text style={[styles.rarityPickerText, { color: theme.colors.text }]}>
                          {selectedRarity.label}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.rarityPickerText, { color: theme.colors.text }]}>
                        Select Rarity
                      </Text>
                    );
                  })()}
                </View>
                <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Display Order</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={formData.displayOrder.toString()}
                onChangeText={(text) => setFormData({ ...formData, displayOrder: parseInt(text) || 0 })}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Color</Text>
            <TouchableOpacity
              style={[styles.colorPicker, { backgroundColor: formData.color }]}
              onPress={() => setShowColorPicker(true)}
            >
              <Text style={styles.colorText}>{formData.color}</Text>
              <MaterialIcons name="palette" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Tags (comma-separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
              placeholder="learning, beginner, milestone"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateAchievement}
          >
            <Text style={styles.createButtonText}>Create Achievement</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Achievement Management
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filters}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search achievements..."
          placeholderTextColor={theme.colors.textSecondary}
        />
        
        <View style={styles.filterRow}>
          <View style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.filterText, { color: theme.colors.text }]}>
              Category: {filterCategory}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color={theme.colors.text} />
          </View>
          
          <View style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.filterText, { color: theme.colors.text }]}>
              Rarity: {filterRarity}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color={theme.colors.text} />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredAchievements}
        renderItem={renderAchievementCard}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No achievements found. Create your first achievement!
            </Text>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingAddButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {renderCreateModal()}
      {renderSymbolPicker()}
      {renderCategoryPicker()}
      {renderRarityPicker()}
      {renderColorPicker()}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filters: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementSymbol: {
    fontSize: 24,
  },
  achievementImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementPoints: {
    fontSize: 14,
    fontWeight: '600',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rarityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  achievementActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  colorPickerContent: {
    maxHeight: 400,
  },
  colorSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  customColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  customColorInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  rarityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rarityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryPickerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryPickerText: {
    fontSize: 16,
    flex: 1,
  },
  rarityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rarityPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rarityPickerIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  rarityPickerText: {
    fontSize: 16,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  symbolButtonText: {
    fontSize: 20,
  },
  symbolImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  imagePickerButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardInput: {
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  symbolPicker: {
    width: '90%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
  },
  symbolPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  symbolPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  symbolsList: {
    maxHeight: 300,
  },
  symbolItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  symbolText: {
    fontSize: 20,
  },
  pickerModal: {
    width: '90%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
  },
  colorPickerModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemText: {
    fontSize: 16,
    marginLeft: 8,
  },
  rarityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorItem: {
    borderColor: '#000',
    borderWidth: 3,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  colorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AchievementManagementScreen;
