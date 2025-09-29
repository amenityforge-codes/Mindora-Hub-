import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, clearError } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../types';

export default function LoginScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      dispatch(clearError());
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
    } catch (error) {
      // Error is handled by the reducer
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to continue your English learning journey
            </Text>
          </View>

          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              {error && (
                <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
                  <Card.Content>
                    <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
                      {error}
                    </Text>
                  </Card.Content>
                </Card>
              )}

              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Button
                mode="text"
                onPress={navigateToForgotPassword}
                style={styles.forgotPasswordButton}
                labelStyle={{ color: theme.colors.primary }}
              >
                Forgot Password?
              </Button>

              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  'Sign In'
                )}
              </Button>

              <View style={styles.registerSection}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Don't have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={navigateToRegister}
                  labelStyle={{ color: theme.colors.primary }}
                >
                  Sign Up
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  errorCard: {
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});



