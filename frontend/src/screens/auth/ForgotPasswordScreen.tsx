import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      // TODO: Implement forgot password API call
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsEmailSent(true);
      Alert.alert(
        'Email Sent',
        'If an account with this email exists, you will receive password reset instructions shortly.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    }
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    handleForgotPassword();
  };

  if (isEmailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.successContent}>
              <Icon name="mark-email-read" size={64} color={theme.colors.primary} />
              
              <Text variant="headlineSmall" style={{ 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginTop: 16,
                marginBottom: 8
              }}>
                Check Your Email
              </Text>
              
              <Text variant="bodyMedium" style={{ 
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                marginBottom: 24
              }}>
                We've sent password reset instructions to:
              </Text>
              
              <Text variant="bodyLarge" style={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                color: theme.colors.primary,
                marginBottom: 24
              }}>
                {email}
              </Text>
              
              <Text variant="bodySmall" style={{ 
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                marginBottom: 32
              }}>
                Didn't receive the email? Check your spam folder or try again.
              </Text>
              
              <Button
                mode="outlined"
                onPress={handleResendEmail}
                style={styles.resendButton}
                icon="refresh"
              >
                Resend Email
              </Button>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', textAlign: 'center' }}>
            Forgot Password?
          </Text>
          <Text variant="bodyMedium" style={{ 
            color: theme.colors.onSurfaceVariant, 
            textAlign: 'center',
            marginTop: 8
          }}>
            No worries! Enter your email and we'll send you reset instructions.
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              placeholder="Enter your registered email"
            />

            {error && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleForgotPassword}
              disabled={isLoading || !email.trim()}
              style={styles.resetButton}
              contentStyle={styles.buttonContent}
              icon="email-send"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.helpCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              Need Help?
            </Text>
            
            <View style={styles.helpItem}>
              <Icon name="help" size={20} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.helpText}>
                Make sure you're using the email address you registered with
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Icon name="email" size={20} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.helpText}>
                Check your spam/junk folder if you don't see the email
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Icon name="support" size={20} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.helpText}>
                Contact support if you continue to have issues
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  card: {
    elevation: 2,
    marginBottom: 16,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
  },
  resetButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    width: '100%',
  },
  helpCard: {
    elevation: 2,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  helpText: {
    marginLeft: 12,
    flex: 1,
    color: '#666',
  },
});



















