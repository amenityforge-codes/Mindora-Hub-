import { Audio } from 'expo-av';

class SoundEffects {
  private static instance: SoundEffects;
  private sounds: { [key: string]: Audio.Sound } = {};
  private isEnabled: boolean = true;

  private constructor() {
    this.initializeSounds();
  }

  public static getInstance(): SoundEffects {
    if (!SoundEffects.instance) {
      SoundEffects.instance = new SoundEffects();
    }
    return SoundEffects.instance;
  }

  private async initializeSounds() {
    try {
      // Initialize audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load sound effects (using system sounds for now)
      // In a real app, you would load actual sound files
      console.log('Sound effects initialized');
    } catch (error) {
      console.error('Failed to initialize sound effects:', error);
    }
  }

  public async playSound(type: 'success' | 'error' | 'click' | 'achievement' | 'levelup') {
    if (!this.isEnabled) return;

    try {
      // For now, we'll use system sounds
      // In a real app, you would play actual sound files
      switch (type) {
        case 'success':
          // Play success sound
          console.log('🔊 Playing success sound');
          break;
        case 'error':
          // Play error sound
          console.log('🔊 Playing error sound');
          break;
        case 'click':
          // Play click sound
          console.log('🔊 Playing click sound');
          break;
        case 'achievement':
          // Play achievement sound
          console.log('🔊 Playing achievement sound');
          break;
        case 'levelup':
          // Play level up sound
          console.log('🔊 Playing level up sound');
          break;
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public async cleanup() {
    try {
      // Unload all sounds
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync();
      }
      this.sounds = {};
    } catch (error) {
      console.error('Failed to cleanup sounds:', error);
    }
  }
}

export default SoundEffects;


















