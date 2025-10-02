import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../hooks/redux';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

interface Achievement {
  _id: string;
  name: string;
  description: string;
  symbol: string;
  color: string;
  pointsRequired: number;
  category: string;
  rarity: string;
  isActive: boolean;
  isSecret: boolean;
  tags: string[];
  displayOrder: number;
  createdAt: string;
}

interface UserAchievement {
  _id: string;
  userId: string;
  achievementId: string;
  pointsEarned: number;
  xpEarned: number;
  coinsEarned: number;
  earnedAt: string;
  achievement: Achievement;
}

interface AchievementStats {
  totalAchievements: number;
  totalPoints: number;
  totalXP: number;
  totalCoins: number;
  categories: string[];
  rarities: string[];
}

const AchievementsPage: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPoints, setUserPoints] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const categories = [
    { value: 'all', label: 'All', icon: 'apps' },
    { value: 'learning', label: 'Learning', icon: 'school' },
    { value: 'streak', label: 'Streak', icon: 'local-fire-department' },
    { value: 'quiz', label: 'Quiz', icon: 'quiz' },
    { value: 'video', label: 'Video', icon: 'play-circle' },
    { value: 'speaking', label: 'Speaking', icon: 'mic' },
    { value: 'writing', label: 'Writing', icon: 'edit' },
    { value: 'milestone', label: 'Milestone', icon: 'flag' },
    { value: 'special', label: 'Special', icon: 'star' }
  ];

  const rarities = [
    { value: 'common', label: 'Common', color: '#9CA3AF', icon: 'circle' },
    { value: 'uncommon', label: 'Uncommon', color: '#10B981', icon: 'circle' },
    { value: 'rare', label: 'Rare', color: '#3B82F6', icon: 'circle' },
    { value: 'epic', label: 'Epic', color: '#8B5CF6', icon: 'circle' },
    { value: 'legendary', label: 'Legendary', color: '#F59E0B', icon: 'star' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAchievements(),
        loadUserAchievements(),
        loadStats(),
        checkForNewAchievements()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load achievements data');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const data = await apiService.get('/achievements');
      if (data.success) {
        setAchievements(data.data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadUserAchievements = async () => {
    try {
      if (user?.id) {
        const data = await apiService.get(`/achievements/user/${user.id}`);
        if (data.success) {
          setUserAchievements(data.data.userAchievements || []);
        }
      }
    } catch (error) {
      console.error('Error loading user achievements:', error);
    }
  };

  const loadStats = async () => {
    try {
      if (user?.id) {
        const data = await apiService.get(`/achievements/user/${user.id}/stats`);
        if (data.success) {
          setStats(data.data.stats);
          setUserPoints(data.data.userPoints || 0);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkForNewAchievements = async () => {
    try {
      if (user?.id) {
        const data = await apiService.post('/achievements/check', { userId: user.id });
        if (data.success && data.data.newAchievements.length > 0) {
          // Show achievement unlocked notification
          Alert.alert(
            '🎉 Achievement Unlocked!',
            `You've unlocked ${data.data.newAchievements.length} new achievement(s)!`,
            [{ text: 'Awesome!', style: 'default' }]
          );
          // Reload data to show new achievements
          loadData();
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRarityInfo = (rarity: string) => {
    return rarities.find(r => r.value === rarity) || rarities[0];
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  const renderStatsCard = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primary + '80']}
      style={styles.statsCard}
    >
      <View style={styles.statsHeader}>
        <MaterialIcons name="emoji-events" size={24} color="white" />
        <Text style={styles.statsTitle}>Your Progress</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userAchievements.length}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{achievements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round((userAchievements.length / achievements.length) * 100) || 0}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryButton,
            {
              backgroundColor: selectedCategory === category.value 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: selectedCategory === category.value 
                ? theme.colors.primary 
                : theme.colors.border
            }
          ]}
          onPress={() => setSelectedCategory(category.value)}
        >
          <MaterialIcons 
            name={category.icon as any} 
            size={16} 
            color={selectedCategory === category.value ? 'white' : theme.colors.text} 
          />
          <Text style={[
            styles.categoryButtonText,
            { color: selectedCategory === category.value ? 'white' : theme.colors.text }
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAchievement = (achievement: Achievement) => {
    const unlocked = isUnlocked(achievement._id);
    const rarityInfo = getRarityInfo(achievement.rarity);
    const progress = Math.min((userPoints / achievement.pointsRequired) * 100, 100);
    const canUnlock = userPoints >= achievement.pointsRequired;

    return (
      <TouchableOpacity
        key={achievement._id}
        style={[
          styles.achievementCard,
          {
            backgroundColor: theme.colors.surface,
            opacity: unlocked ? 1 : 0.7,
            borderColor: unlocked ? achievement.color : theme.colors.border
          }
        ]}
        onPress={() => {
          if (unlocked) {
            Alert.alert(
              achievement.name,
              achievement.description,
              [{ text: 'Got it!', style: 'default' }]
            );
          }
        }}
      >
        <View style={styles.achievementHeader}>
          <View style={[
            styles.achievementIcon,
            { 
              backgroundColor: unlocked ? achievement.color : '#ccc',
              opacity: unlocked ? 1 : 0.6
            }
          ]}>
            {achievement.symbol && achievement.symbol.startsWith('http') ? (
              <Image source={{ uri: achievement.symbol }} style={styles.achievementImage} />
            ) : (
              <Text style={styles.achievementSymbol}>{achievement.symbol}</Text>
            )}
            {unlocked && (
              <View style={styles.unlockedBadge}>
                <MaterialIcons name="check" size={12} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementName,
              { color: theme.colors.text }
            ]}>
              {achievement.name}
            </Text>
            <Text style={[
              styles.achievementDescription,
              { color: theme.colors.textSecondary }
            ]}>
              {achievement.description}
            </Text>
            
            <View style={styles.achievementMeta}>
              <View style={[
                styles.rarityBadge,
                { backgroundColor: rarityInfo.color }
              ]}>
                <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
              </View>
              <Text style={[
                styles.pointsText,
                { color: theme.colors.primary }
              ]}>
                {achievement.pointsRequired} pts
              </Text>
            </View>
          </View>
        </View>

        {!unlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progress}%`,
                    backgroundColor: canUnlock ? '#4CAF50' : theme.colors.primary
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {userPoints}/{achievement.pointsRequired} points
            </Text>
          </View>
        )}

        {unlocked && (
          <View style={styles.unlockedContainer}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={[styles.unlockedText, { color: '#4CAF50' }]}>
              Unlocked!
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="emoji-events" size={48} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading achievements...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCard()}
        {renderCategoryFilter()}
        
        <View style={styles.achievementsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Achievements ({filteredAchievements.length})
          </Text>
          
          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="emoji-events" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No achievements found
              </Text>
            </View>
          ) : (
            filteredAchievements.map(renderAchievement)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  categoryFilter: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  achievementImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  achievementSymbol: {
    fontSize: 20,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 20,
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  unlockedText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
});

export default AchievementsPage;

