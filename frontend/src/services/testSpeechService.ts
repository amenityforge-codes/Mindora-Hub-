// Test file to verify speech service functionality
import { speechService } from './speechService';

export const testSpeechService = async () => {
  console.log('Testing Speech Service...');
  
  try {
    // Test permissions
    const hasPermission = await speechService.requestPermissions();
    console.log('Microphone permission:', hasPermission);
    
    // Test speaking
    speechService.speak('Hello, this is a test of the speech service');
    console.log('Speech test completed');
    
    return true;
  } catch (error) {
    console.error('Speech service test failed:', error);
    return false;
  }
};






