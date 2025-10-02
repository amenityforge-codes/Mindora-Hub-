import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

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

interface AchievementDisplayProps {
  achievements: Achievement[];
  userAchievements?: string[];
  onAchievementPress?: (achievement: Achievement) => void;
}

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({
  achievements,
  userAchievements = [],
  onAchievementPress
}) => {
  const { theme } = useTheme();

  const getRarityColor = (rarity: string) => {
    const rarityColors: { [key: string]: string } = {
      'common': '#95A5A6',
      'uncommon': '#2ECC71',
      'rare': '#3498DB',
      'epic': '#9B59B6',
      'legendary': '#F39C12',
      'mythic': '#E74C3C'
    };
    return rarityColors[rarity] || '#95A5A6';
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.includes(achievementId);
  };

  const renderAchievement = (achievement: Achievement) => {
    const unlocked = isUnlocked(achievement._id);
    const rarityColor = getRarityColor(achievement.rarity);

    return (
      <TouchableOpacity
        key={achievement._id}
        style={[
          styles.achievementCard,
          { 
            backgroundColor: theme.colors.surface,
            opacity: unlocked ? 1 : 0.6,
            borderColor: unlocked ? rarityColor : '#ddd'
          }
        ]}
        onPress={() => onAchievementPress?.(achievement)}
        disabled={!unlocked}
      >
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
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
            <Text style={[styles.achievementName, { color: theme.colors.text }]}>
              {achievement.name}
            </Text>
            <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
              {achievement.description}
            </Text>
            
            <View style={styles.achievementMeta}>
              <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
              </View>
              <Text style={[styles.pointsText, { color: theme.colors.primary }]}>
                {achievement.pointsRequired} pts
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons name="emoji-events" size={24} color={theme.colors.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Achievements
        </Text>
      </View>
      
      <View style={styles.achievementsGrid}>
        {achievements && Array.isArray(achievements) ? achievements.map(renderAchievement) : null}
      </View>
      
      {(!achievements || !Array.isArray(achievements) || achievements.length === 0) && (
        <View style={styles.emptyState}>
          <MaterialIcons name="emoji-events" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No achievements yet!
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Keep learning to unlock achievements
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  achievementSymbol: {
    fontSize: 24,
  },
  achievementImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 20,
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
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default AchievementDisplay;
