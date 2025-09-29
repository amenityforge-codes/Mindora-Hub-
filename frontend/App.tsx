import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from './src/hooks/redux';
import { loadUser } from './src/store/slices/authSlice';
// import { theme } from './src/theme'; // Removed - using ThemeContext instead
import { ThemeProvider } from './src/contexts/ThemeContext';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load user from storage on app start
    dispatch(loadUser());
  }, [dispatch]);

  // Log any auth errors for debugging
  useEffect(() => {
    if (error) {
      console.log('Auth error:', error);
    }
  }, [error]);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator isAuthenticated={isAuthenticated} isLoading={isLoading} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <PaperProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <AppContent />
          </SafeAreaProvider>
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}