import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { api } from '../services/api';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    let info = 'API Test Results:\n\n';
    
    try {
      // Test health endpoint
      const healthResponse = await api.get('/health');
      info += `✅ Health Check: ${JSON.stringify(healthResponse)}\n\n`;
      
      // Test AI analysis endpoint
      const analysisResponse = await api.post('/ai/analyze-text', {
        text: 'Hello, this is a test',
        type: 'speaking'
      });
      info += `✅ AI Analysis: ${JSON.stringify(analysisResponse)}\n\n`;
      
    } catch (error: any) {
      info += `❌ Error: ${error.message}\n`;
      info += `Details: ${JSON.stringify(error.response?.data || error)}\n\n`;
    }
    
    setDebugInfo(info);
    setIsLoading(false);
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Debug Information
        </Text>
        
        <Button
          mode="outlined"
          onPress={testAPI}
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading ? 'Testing...' : 'Test API'}
        </Button>
        
        <View style={styles.infoContainer}>
          <Text variant="bodySmall" style={styles.infoText}>
            {debugInfo}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  button: {
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
});






