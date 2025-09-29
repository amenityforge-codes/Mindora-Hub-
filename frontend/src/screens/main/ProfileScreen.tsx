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
  Avatar,
  Chip,
  Switch,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { User } from '../../types';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.profile.bio || '',
    phone: user?.profile.phone || '',
    city: user?.profile.location?.city || '',
    state: user?.profile.location?.state || '',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences.notifications.email || true,
    pushNotifications: user?.preferences.notifications.push || true,
    weeklyDigest: user?.preferences.notifications.weeklyDigest || true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile({
        name: formData.name,
        profile: {
          bio: formData.bio,
          phone: formData.phone,
          location: {
            city: formData.city,
            state: formData.state,
            country: 'India',
          },
        },
        preferences: {
          notifications: preferences,
        },
      })).unwrap();
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.headerContent}>
        <Avatar.Text
          size={80}
          label={user?.name?.charAt(0) || 'U'}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.headerInfo}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            {user?.name || 'User'}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {user?.email}
          </Text>
          <View style={styles.userMeta}>
            <Chip mode="outlined" compact style={styles.metaChip}>
              {user?.role}
            </Chip>
            {user?.ageRange && (
              <Chip mode="outlined" compact style={styles.metaChip}>
                {user.ageRange}
              </Chip>
            )}
            <Chip mode="outlined" compact style={styles.metaChip}>
              Level {user?.progress?.level || 'Beginner'}
            </Chip>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => setIsEditing(!isEditing)}
          icon="edit"
          compact
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderProfileForm = () => (
    <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Profile Information
        </Text>
        
        <TextInput
          label="Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          mode="outlined"
          style={styles.input}
          disabled={!isEditing}
        />
        
        <TextInput
          label="Bio"
          value={formData.bio}
          onChangeText={(value) => handleInputChange('bio', value)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          disabled={!isEditing}
          placeholder="Tell us about yourself..."
        />
        
        <TextInput
          label="Phone"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          disabled={!isEditing}
        />
        
        <View style={styles.locationContainer}>
          <TextInput
            label="City"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            mode="outlined"
            style={[styles.input, styles.locationInput]}
            disabled={!isEditing}
          />
          <TextInput
            label="State"
            value={formData.state}
            onChangeText={(value) => handleInputChange('state', value)}
            mode="outlined"
            style={[styles.input, styles.locationInput]}
            disabled={!isEditing}
          />
        </View>
        
        {isEditing && (
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            disabled={isLoading}
            style={styles.saveButton}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderPreferences = () => (
    <Card style={[styles.preferencesCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Notification Preferences
        </Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              Email Notifications
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Receive updates via email
            </Text>
          </View>
          <Switch
            value={preferences.emailNotifications}
            onValueChange={(value) => handlePreferenceChange('emailNotifications', value)}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              Push Notifications
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Receive push notifications on your device
            </Text>
          </View>
          <Switch
            value={preferences.pushNotifications}
            onValueChange={(value) => handlePreferenceChange('pushNotifications', value)}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              Weekly Digest
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Get weekly summary of your progress
            </Text>
          </View>
          <Switch
            value={preferences.weeklyDigest}
            onValueChange={(value) => handlePreferenceChange('weeklyDigest', value)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderStats = () => (
    <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Learning Statistics
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={24} color={theme.colors.error} />
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
              {user?.progress?.currentStreak || 0}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Day Streak
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="timer" size={24} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              {Math.floor((user?.progress?.totalTimeSpent || 0) / 60)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Hours Learned
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="check-circle" size={24} color={theme.colors.tertiary} />
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.tertiary }}>
              {user?.progress?.totalModulesCompleted || 0}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Modules Completed
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="star" size={24} color={theme.colors.secondary} />
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
              {user?.progress?.points || 0}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Points Earned
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBadges = () => {
    if (!user?.progress?.badges?.length) return null;

    return (
      <Card style={[styles.badgesCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            Achievements
          </Text>
          
          <View style={styles.badgesGrid}>
            {user.progress.badges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <Icon name="emoji-events" size={32} color={theme.colors.secondary} />
                <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 4 }}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderActions = () => (
    <Card style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Account Actions
        </Text>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Settings' as never)}
          icon="cog"
          style={styles.actionButton}
        >
          Settings
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => {/* Navigate to help */}}
          icon="help"
          style={styles.actionButton}
        >
          Help & Support
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => {/* Navigate to about */}}
          icon="info"
          style={styles.actionButton}
        >
          About
        </Button>
        
        <Divider style={styles.divider} />
        
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
        >
          Logout
        </Button>
      </Card.Content>
    </Card>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Profile Form */}
        {renderProfileForm()}

        {/* Preferences */}
        {renderPreferences()}

        {/* Stats */}
        {renderStats()}

        {/* Badges */}
        {renderBadges()}

        {/* Actions */}
        {renderActions()}
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
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metaChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  preferencesCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
  },
  badgesCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeItem: {
    alignItems: 'center',
    width: '30%',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  actionButton: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



