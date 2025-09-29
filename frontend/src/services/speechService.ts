import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechAnalysisResult {
  pronunciation: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  fluency: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  intonation: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  overall: {
    score: number;
    feedback: string;
    nextSteps: string[];
  };
}

class SpeechService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private recognitionCallbacks: ((result: SpeechRecognitionResult) => void)[] = [];

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      // Simulate real-time speech recognition
      this.simulateSpeechRecognition();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      this.isRecording = false;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      // Simulate speech-to-text conversion
      const transcribedText = await this.simulateSpeechToText(uri);
      return transcribedText;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  private simulateSpeechRecognition(): void {
    // Simulate real-time speech recognition feedback
    const phrases = [
      "Hello, how are you today?",
      "I would like to practice my English pronunciation",
      "This is a test of the speech recognition system",
      "Can you help me improve my speaking skills?"
    ];

    let currentPhrase = "";
    let phraseIndex = 0;
    let charIndex = 0;

    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }

      if (phraseIndex < phrases.length) {
        const phrase = phrases[phraseIndex];
        if (charIndex < phrase.length) {
          currentPhrase += phrase[charIndex];
          charIndex++;
          
          this.recognitionCallbacks.forEach(callback => {
            callback({
              text: currentPhrase,
              confidence: 0.8 + Math.random() * 0.2,
              isFinal: false
            });
          });
        } else {
          // Phrase complete
          this.recognitionCallbacks.forEach(callback => {
            callback({
              text: currentPhrase,
              confidence: 0.9,
              isFinal: true
            });
          });
          
          phraseIndex++;
          charIndex = 0;
          currentPhrase = "";
        }
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  private async simulateSpeechToText(audioUri: string): Promise<string> {
    // Simulate API call to speech-to-text service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sampleTexts = [
      "Hello, I would like to practice my English pronunciation and improve my speaking skills.",
      "This is a test of the speech recognition system to see how well it can understand my voice.",
      "I am working on improving my fluency and reducing my accent when speaking English.",
      "Can you help me with the pronunciation of difficult words and phrases?"
    ];
    
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  }

  async analyzeSpeech(text: string, targetText?: string): Promise<SpeechAnalysisResult> {
    // Simulate AI speech analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pronunciationScore = 70 + Math.random() * 25;
    const fluencyScore = 65 + Math.random() * 30;
    const intonationScore = 75 + Math.random() * 20;
    const overallScore = Math.round((pronunciationScore + fluencyScore + intonationScore) / 3);

    return {
      pronunciation: {
        score: Math.round(pronunciationScore),
        feedback: this.getPronunciationFeedback(pronunciationScore),
        improvements: this.getPronunciationImprovements(pronunciationScore)
      },
      fluency: {
        score: Math.round(fluencyScore),
        feedback: this.getFluencyFeedback(fluencyScore),
        improvements: this.getFluencyImprovements(fluencyScore)
      },
      intonation: {
        score: Math.round(intonationScore),
        feedback: this.getIntonationFeedback(intonationScore),
        improvements: this.getIntonationImprovements(intonationScore)
      },
      overall: {
        score: overallScore,
        feedback: this.getOverallFeedback(overallScore),
        nextSteps: this.getNextSteps(overallScore)
      }
    };
  }

  private getPronunciationFeedback(score: number): string {
    if (score >= 90) return "Excellent pronunciation! Your speech is very clear and accurate.";
    if (score >= 80) return "Good pronunciation with minor areas for improvement.";
    if (score >= 70) return "Fair pronunciation. Focus on specific sounds and clarity.";
    return "Pronunciation needs work. Practice individual sounds and word stress.";
  }

  private getFluencyFeedback(score: number): string {
    if (score >= 90) return "Very fluent speech with natural rhythm and flow.";
    if (score >= 80) return "Good fluency with occasional pauses or hesitations.";
    if (score >= 70) return "Moderate fluency. Work on reducing pauses and hesitations.";
    return "Fluency needs improvement. Practice speaking more smoothly and confidently.";
  }

  private getIntonationFeedback(score: number): string {
    if (score >= 90) return "Excellent intonation and stress patterns.";
    if (score >= 80) return "Good intonation with minor adjustments needed.";
    if (score >= 70) return "Fair intonation. Focus on stress and rhythm patterns.";
    return "Intonation needs work. Practice stress patterns and sentence rhythm.";
  }

  private getOverallFeedback(score: number): string {
    if (score >= 90) return "Outstanding performance! You're speaking English very well.";
    if (score >= 80) return "Great job! You're showing strong English speaking skills.";
    if (score >= 70) return "Good progress! Keep practicing to improve further.";
    return "Keep practicing! Focus on the areas mentioned above for improvement.";
  }

  private getPronunciationImprovements(score: number): string[] {
    if (score >= 80) return ["Continue practicing difficult sounds", "Work on word stress patterns"];
    return ["Practice 'th' sounds", "Focus on vowel pronunciation", "Work on consonant clarity"];
  }

  private getFluencyImprovements(score: number): string[] {
    if (score >= 80) return ["Reduce filler words", "Practice speaking faster"];
    return ["Practice speaking without pauses", "Work on sentence flow", "Build confidence"];
  }

  private getIntonationImprovements(score: number): string[] {
    if (score >= 80) return ["Practice question intonation", "Work on emphasis patterns"];
    return ["Learn stress patterns", "Practice sentence rhythm", "Work on pitch variation"];
  }

  private getNextSteps(score: number): string[] {
    if (score >= 80) return ["Practice advanced vocabulary", "Work on complex sentences"];
    return ["Focus on pronunciation basics", "Practice daily conversations", "Record yourself speaking"];
  }

  speak(text: string, options?: { language?: string; rate?: number; pitch?: number }): void {
    const speechOptions = {
      language: options?.language || 'en-US',
      rate: options?.rate || 0.8,
      pitch: options?.pitch || 1.0,
      quality: Speech.VoiceQuality.Enhanced
    };

    Speech.speak(text, speechOptions);
  }

  stopSpeaking(): void {
    Speech.stop();
  }

  onRecognitionResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.recognitionCallbacks.push(callback);
  }

  removeRecognitionCallback(callback: (result: SpeechRecognitionResult) => void): void {
    const index = this.recognitionCallbacks.indexOf(callback);
    if (index > -1) {
      this.recognitionCallbacks.splice(index, 1);
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

export const speechService = new SpeechService();






