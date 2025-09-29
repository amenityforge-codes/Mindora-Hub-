import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
  RadioButton,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { register } from '../../store/slices/authSlice';

export default function RegisterScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ageRange: '16+' as '6-15' | '16+' | 'business',
    role: 'student' as 'student' | 'professional'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      ageRange: formData.ageRange,
      role: formData.role
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', textAlign: 'center' }}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={{ 
            color: theme.colors.onSurfaceVariant, 
            textAlign: 'center',
            marginTop: 8
          }}>
            Join our English learning community
          </Text>
        </View>

        <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              mode="outlined"
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              mode="outlined"
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TextInput
              mode="outlined"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <View style={styles.ageRangeSection}>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                Select Your Age Group
              </Text>
              
              <RadioButton.Group
                onValueChange={(value) => handleInputChange('ageRange', value)}
                value={formData.ageRange}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="6-15" />
                  <Text variant="bodyMedium" style={styles.radioLabel}>
                    Children (6-15 years)
                  </Text>
                </View>
                
                <View style={styles.radioOption}>
                  <RadioButton value="16+" />
                  <Text variant="bodyMedium" style={styles.radioLabel}>
                    Adults (16+ years)
                  </Text>
                </View>
                
                <View style={styles.radioOption}>
                  <RadioButton value="business" />
                  <Text variant="bodyMedium" style={styles.radioLabel}>
                    Business Professional
                  </Text>
                </View>
              </RadioButton.Group>
            </View>

            {error && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
              icon="account-plus"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              Why Join Us?
            </Text>
            
            <View style={styles.benefitItem}>
              <Icon name="school" size={24} color={theme.colors.primary} />
              <View style={styles.benefitText}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  Age-Appropriate Learning
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Content tailored for your age group and learning goals
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Icon name="psychology" size={24} color={theme.colors.primary} />
              <View style={styles.benefitText}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  AI-Powered Features
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Grammar checking, speech feedback, and personalized learning
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Icon name="trending-up" size={24} color={theme.colors.primary} />
              <View style={styles.benefitText}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  Track Your Progress
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Monitor your learning journey with detailed analytics
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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
    padding: 24,
    paddingBottom: 16,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  ageRangeSection: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    flex: 1,
  },
  errorText: {
    marginBottom: 16,
  },
  registerButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitText: {
    marginLeft: 16,
    flex: 1,
  },
});










