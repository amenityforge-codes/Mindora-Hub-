import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const VideoQuizSimpleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  console.log('=== VideoQuizSimpleScreen Loaded ===');
  console.log('Route params:', route.params);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎥 Video Quiz Screen</Text>
        <Text style={styles.subtitle}>This is the working VideoQuiz screen!</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Navigation Successful! ✅</Text>
          <Text style={styles.infoText}>
            The navigation from TopicContentScreen to VideoQuizScreen is working correctly.
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Going back to TopicContent...');
            navigation.goBack();
          }}
        >
          <Text style={styles.buttonText}>← Go Back</Text>
        </TouchableOpacity>
        
        <View style={styles.paramsBox}>
          <Text style={styles.paramsTitle}>Received Parameters:</Text>
          <Text style={styles.paramsText}>
            {JSON.stringify(route.params, null, 2)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  infoBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paramsBox: {
    backgroundColor: '#e9ecef',
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    width: '100%',
  },
  paramsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
  },
  paramsText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
});

export default VideoQuizSimpleScreen;















