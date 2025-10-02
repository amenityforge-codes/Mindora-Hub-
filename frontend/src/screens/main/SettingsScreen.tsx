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
  Switch,
  List,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateProfile, changePassword } from '../../store/slices/authSlice';

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notifications?.email || true,
    push: user?.preferences?.notifications?.push || true,
    weeklyDigest: user?.preferences?.notifications?.weeklyDigest || true,
  });
  const [difficulty, setDifficulty] = useState(user?.preferences?.difficulty || 'beginner');
  const [language, setLanguage] = useState(user?.preferences?.language?.primary || 'en');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // Save immediately
    dispatch(updateProfile({
      preferences: {
        notifications: { ...notifications, [key]: value },
      },
    }));
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    dispatch(updateProfile({
      preferences: {
        difficulty: value,
      },
    }));
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    dispatch(updateProfile({
      preferences: {
        language: {
          primary: value,
          secondary: user?.preferences.language.secondary || 'hi',
        },
      },
    }));
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your current password:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: (currentPassword) => {
            if (currentPassword) {
              Alert.prompt(
                'New Password',
                'Enter your new password:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Change', 
                    onPress: (newPassword) => {
                      if (newPassword && newPassword.length >= 6) {
                        dispatch(changePassword({ currentPassword, newPassword }));
                      } else {
                        Alert.alert('Error', 'Password must be at least 6 characters long');
                      }
                    }
                  },
                ],
                'secure-text'
              );
            }
          }
        },
      ],
      'secure-text'
    );
  };

  const renderNotificationSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Notifications
        </Text>
        
        <List.Item
          title="Email Notifications"
          description="Receive updates via email"
          left={(props) => <List.Icon {...props} icon="email" />}
          right={() => (
            <Switch
              value={notifications.email}
              onValueChange={(value) => handleNotificationChange('email', value)}
            />
          )}
        />
        
        <List.Item
          title="Push Notifications"
          description="Receive push notifications on your device"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications.push}
              onValueChange={(value) => handleNotificationChange('push', value)}
            />
          )}
        />
        
        <List.Item
          title="Weekly Digest"
          description="Get weekly summary of your progress"
          left={(props) => <List.Icon {...props} icon="calendar-week" />}
          right={() => (
            <Switch
              value={notifications.weeklyDigest}
              onValueChange={(value) => handleNotificationChange('weeklyDigest', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderLearningSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Learning Preferences
        </Text>
        
        <View style={styles.settingSection}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
            Difficulty Level
          </Text>
          <RadioButton.Group onValueChange={handleDifficultyChange} value={difficulty}>
            <View style={styles.radioItem}>
              <RadioButton value="beginner" />
              <Text variant="bodyMedium">Beginner</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="intermediate" />
              <Text variant="bodyMedium">Intermediate</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="advanced" />
              <Text variant="bodyMedium">Advanced</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.settingSection}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
            Primary Language
          </Text>
          <RadioButton.Group onValueChange={handleLanguageChange} value={language}>
            <View style={styles.radioItem}>
              <RadioButton value="en" />
              <Text variant="bodyMedium">English</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="hi" />
              <Text variant="bodyMedium">Hindi</Text>
            </View>
          </RadioButton.Group>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAccountSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Account Settings
        </Text>
        
        <List.Item
          title="Change Password"
          description="Update your account password"
          left={(props) => <List.Icon {...props} icon="lock" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleChangePassword}
        />
        
        <List.Item
          title="Privacy Settings"
          description="Manage your privacy preferences"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to privacy settings */}}
        />
        
        <List.Item
          title="Data & Storage"
          description="Manage your data and storage settings"
          left={(props) => <List.Icon {...props} icon="database" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to data settings */}}
        />
      </Card.Content>
    </Card>
  );

  const renderAppSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          App Settings
        </Text>
        
        <List.Item
          title="Theme"
          description="Choose your preferred theme"
          left={(props) => <List.Icon {...props} icon="palette" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to theme settings */}}
        />
        
        <List.Item
          title="Language"
          description="Change app language"
          left={(props) => <List.Icon {...props} icon="translate" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to language settings */}}
        />
        
        <List.Item
          title="Offline Mode"
          description="Download content for offline use"
          left={(props) => <List.Icon {...props} icon="download" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to offline settings */}}
        />
      </Card.Content>
    </Card>
  );

  const renderSupport = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          Support & Help
        </Text>
        
        <List.Item
          title="Help Center"
          description="Get help and support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to help center */}}
        />
        
        <List.Item
          title="Contact Us"
          description="Get in touch with our support team"
          left={(props) => <List.Icon {...props} icon="email" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to contact */}}
        />
        
        <List.Item
          title="Feedback"
          description="Share your feedback with us"
          left={(props) => <List.Icon {...props} icon="message" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to feedback */}}
        />
        
        <List.Item
          title="Rate App"
          description="Rate us on the app store"
          left={(props) => <List.Icon {...props} icon="star" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to app store */}}
        />
      </Card.Content>
    </Card>
  );

  const renderAbout = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
          About
        </Text>
        
        <List.Item
          title="App Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        
        <List.Item
          title="Terms of Service"
          description="Read our terms and conditions"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to terms */}}
        />
        
        <List.Item
          title="Privacy Policy"
          description="Learn how we protect your data"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to privacy policy */}}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
            Settings
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Customize your learning experience
          </Text>
        </View>

        {/* Notification Settings */}
        {renderNotificationSettings()}

        {/* Learning Settings */}
        {renderLearningSettings()}

        {/* Account Settings */}
        {renderAccountSettings()}

        {/* App Settings */}
        {renderAppSettings()}

        {/* Support */}
        {renderSupport()}

        {/* About */}
        {renderAbout()}
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
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  settingSection: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
});



