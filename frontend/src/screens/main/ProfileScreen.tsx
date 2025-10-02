import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
  Image,
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
  Surface,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { User } from '../../types';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    city: user?.profile?.location?.city || '',
    state: user?.profile?.location?.state || '',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.notifications?.email || true,
    pushNotifications: user?.preferences?.notifications?.push || true,
    weeklyDigest: user?.preferences?.notifications?.weeklyDigest || true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({
        name: formData.name,
        profile: {
          bio: formData.bio,
          phone: formData.phone,
          location: {
            city: formData.city,
            state: formData.state,
            country: user?.profile?.location?.country || 'India'
          }
        },
        preferences: {
          notifications: preferences,
        }
      })).unwrap();
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
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
        }
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={theme.dark ? ['#1a1a1a', '#2d2d2d'] : ['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.charAt(0)?.toUpperCase() || 'U'}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="camera-alt" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={[styles.userName, { color: 'white' }]}>
              {user?.name || 'User'}
            </Text>
            <Text variant="bodyMedium" style={[styles.userEmail, { color: 'rgba(255,255,255,0.8)' }]}>
              {user?.email}
            </Text>
            <View style={styles.roleContainer}>
              <Chip 
                mode="outlined" 
                textStyle={{ color: 'white', fontSize: 12 }}
                style={[styles.roleChip, { borderColor: 'rgba(255,255,255,0.3)' }]}
              >
                {user?.role?.toUpperCase() || 'STUDENT'}
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: 'white' }]}>
              {user?.progress?.points || 0}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Points
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: 'white' }]}>
              {user?.progress?.totalModulesCompleted || 0}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Completed
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: 'white' }]}>
              {user?.progress?.currentStreak || 0}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Streak
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderPersonalInfo = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="person" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>
          <IconButton
            icon={isEditing ? "close" : "edit"}
            size={20}
            onPress={() => setIsEditing(!isEditing)}
            iconColor={theme.colors.primary}
          />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            mode="outlined"
            disabled={!isEditing}
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            mode="outlined"
            multiline
            numberOfLines={3}
            disabled={!isEditing}
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
          />

          <View style={styles.rowContainer}>
            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              mode="outlined"
              disabled={!isEditing}
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Icon icon="phone" />}
            />
            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
              mode="outlined"
              disabled={!isEditing}
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Icon icon="city" />}
            />
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderPreferences = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="settings" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>
        </View>

        <View style={styles.preferenceContainer}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <MaterialIcons name="email" size={20} color={theme.colors.primary} />
              <View style={styles.preferenceText}>
                <Text variant="bodyLarge" style={{ color: theme.colors.text }}>
                  Email Notifications
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.emailNotifications}
              onValueChange={(value) => handlePreferenceChange('emailNotifications', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <MaterialIcons name="notifications" size={20} color={theme.colors.primary} />
              <View style={styles.preferenceText}>
                <Text variant="bodyLarge" style={{ color: theme.colors.text }}>
                  Push Notifications
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Get notified on your device
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.pushNotifications}
              onValueChange={(value) => handlePreferenceChange('pushNotifications', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <MaterialIcons name="schedule" size={20} color={theme.colors.primary} />
              <View style={styles.preferenceText}>
                <Text variant="bodyLarge" style={{ color: theme.colors.text }}>
                  Weekly Digest
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Weekly progress summary
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.weeklyDigest}
              onValueChange={(value) => handlePreferenceChange('weeklyDigest', value)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="flash-on" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialIcons name="security" size={24} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.text, marginTop: 8 }}>
              Security
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialIcons name="help" size={24} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.text, marginTop: 8 }}>
              Help
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialIcons name="info" size={24} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.text, marginTop: 8 }}>
              About
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: '#ffebee' }]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#d32f2f" />
            <Text variant="bodyMedium" style={{ color: '#d32f2f', marginTop: 8 }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 16 }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <View style={styles.content}>
          {renderPersonalInfo()}
          {renderPreferences()}
          {renderQuickActions()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    marginBottom: 12,
  },
  roleContainer: {
    marginTop: 8,
  },
  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    marginLeft: 12,
    flex: 1,
    fontWeight: 'bold',
  },
  formContainer: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    borderRadius: 12,
  },
  preferenceContainer: {
    gap: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    minWidth: (width - 60) / 2,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    elevation: 1,
  },
});