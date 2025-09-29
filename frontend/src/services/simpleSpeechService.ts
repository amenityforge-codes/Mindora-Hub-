import * as Speech from 'expo-speech';

export interface SimpleSpeechResult {
  text: string;
  confidence: number;
}

class SimpleSpeechService {
  private isRecording = false;

  async startRecording(): Promise<void> {
    this.isRecording = true;
    console.log('Simple recording started');
  }

  async stopRecording(): Promise<string> {
    this.isRecording = false;
    console.log('Simple recording stopped');
    
    // Return a mock transcribed text
    const mockTexts = [
      "Hello, I would like to practice my English pronunciation",
      "This is a test of the speech recognition system",
      "I am working on improving my speaking skills",
      "Can you help me with pronunciation practice?"
    ];
    
    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }

  speak(text: string, options?: { rate?: number; pitch?: number }): void {
    const speechOptions = {
      rate: options?.rate || 0.8,
      pitch: options?.pitch || 1.0,
      quality: Speech.VoiceQuality.Enhanced
    };

    Speech.speak(text, speechOptions);
  }

  stopSpeaking(): void {
    Speech.stop();
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async requestPermissions(): Promise<boolean> {
    // Mock permission - always return true for testing
    return true;
  }
}

export const simpleSpeechService = new SimpleSpeechService();






