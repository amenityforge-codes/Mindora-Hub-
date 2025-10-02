import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const VideoQuizTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  console.log('=== VideoQuizTestScreen Loaded ===');
  console.log('Route params:', route.params);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>VideoQuiz Test Screen</Text>
        <Text style={styles.subtitle}>This is a test screen to verify navigation is working</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Going back...');
            navigation.goBack();
          }}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.params}>
          Params: {JSON.stringify(route.params, null, 2)}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  params: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default VideoQuizTestScreen;















