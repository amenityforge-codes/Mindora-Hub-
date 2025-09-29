import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Speech from 'expo-speech';
import { translationService, SUPPORTED_LANGUAGES } from '../../services/translationService';
import { Language, TranslationResponse } from '../../types';
import VirtualKeyboard from '../../components/VirtualKeyboard';

interface LiveTranslationScreenProps {
  navigation: any;
}

const LiveTranslationScreen: React.FC<LiveTranslationScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]); // English
  const [targetLanguage, setTargetLanguage] = useState<Language>(SUPPORTED_LANGUAGES[2]); // Telugu
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [showLanguagePicker, setShowLanguagePicker] = useState<'source' | 'target' | null>(null);
  const [translationHistory, setTranslationHistory] = useState<TranslationResponse[]>([]);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [useVirtualKeyboard, setUseVirtualKeyboard] = useState(true);

  // Handle virtual keyboard input
  const handleVirtualKeyPress = (key: string) => {
    setInputText(prev => prev + key);
  };

  const handleVirtualBackspace = () => {
    setInputText(prev => prev.slice(0, -1));
  };

  const handleVirtualSpace = () => {
    setInputText(prev => prev + ' ');
  };

  const handleVirtualEnter = () => {
    // Handle enter key if needed
    setShowVirtualKeyboard(false);
  };

  // Debounced translation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText.trim() && inputText.length > 0) {
        handleTranslation();
      } else {
        setTranslatedText('');
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [inputText, sourceLanguage, targetLanguage, autoDetect]);

  const handleTranslation = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      let sourceLang = sourceLanguage.code;
      
      // Auto-detect language if enabled
      if (autoDetect) {
        const detection = await translationService.detectLanguage(inputText);
        sourceLang = detection.language;
        const detectedLang = translationService.getLanguageByCode(sourceLang);
        if (detectedLang) {
          setSourceLanguage(detectedLang);
        }
      }

      const response = await translationService.translateText({
        text: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLanguage.code,
      });

      setTranslatedText(response.translatedText);
      
      // Add to history
      setTranslationHistory(prev => [response, ...prev.slice(0, 9)]); // Keep last 10
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Translation Error', 'Failed to translate text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, sourceLanguage, targetLanguage, autoDetect]);

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const clearText = () => {
    setInputText('');
    setTranslatedText('');
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard.setString(text)
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const speakText = (text: string, language: string) => {
    if (!text.trim()) {
      Alert.alert('No Text', 'Please enter some text to speak');
      return;
    }

    try {
      // Stop any current speech
      Speech.stop();
      
      // Get language code for speech
      const speechOptions = {
        language: getSpeechLanguageCode(language),
        pitch: 1.0,
        rate: 0.8,
        quality: Speech.VoiceQuality.Enhanced,
      };

      Speech.speak(text, speechOptions);
    } catch (error) {
      console.error('Speech error:', error);
      Alert.alert('Speech Error', 'Unable to speak the text. Please try again.');
    }
  };

  const getSpeechLanguageCode = (languageCode: string): string => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN',
      'ur': 'ur-PK',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'tr': 'tr-TR',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'no': 'no-NO',
      'da': 'da-DK',
      'fi': 'fi-FI',
      'pl': 'pl-PL'
    };
    
    return languageMap[languageCode] || 'en-US';
  };

  const renderLanguagePicker = () => {
    if (!showLanguagePicker) return null;

    return (
      <View style={[styles.languagePicker, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.pickerHeader}>
          <Text style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
            Select {showLanguagePicker === 'source' ? 'Source' : 'Target'} Language
          </Text>
          <TouchableOpacity onPress={() => setShowLanguagePicker(null)}>
            <Icon name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.languageList}>
          {SUPPORTED_LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                {
                  backgroundColor: 
                    (showLanguagePicker === 'source' ? sourceLanguage : targetLanguage).code === language.code
                      ? theme.colors.primaryContainer
                      : 'transparent',
                }
              ]}
              onPress={() => {
                if (showLanguagePicker === 'source') {
                  setSourceLanguage(language);
                } else {
                  setTargetLanguage(language);
                }
                setShowLanguagePicker(null);
              }}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: theme.colors.onSurface }]}>
                  {language.name}
                </Text>
                <Text style={[styles.languageNative, { color: theme.colors.onSurfaceVariant }]}>
                  {language.nativeName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTranslationHistory = () => {
    if (translationHistory.length === 0) return null;

    return (
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Recent Translations
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {translationHistory.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.historyItem, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                setInputText(item.originalText);
                setTranslatedText(item.translatedText);
              }}
            >
              <Text style={[styles.historyOriginal, { color: theme.colors.onSurfaceVariant }]}>
                {item.originalText.substring(0, 30)}...
              </Text>
              <Text style={[styles.historyTranslated, { color: theme.colors.onSurface }]}>
                {item.translatedText.substring(0, 30)}...
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          paddingBottom: showVirtualKeyboard && useVirtualKeyboard ? 200 : 0
        }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          Live Translation
        </Text>
        <TouchableOpacity onPress={clearText}>
          <Icon name="clear" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
      </View>

      {/* Auto-detect toggle */}
      <View style={styles.autoDetectSection}>
        <Text style={[styles.autoDetectLabel, { color: theme.colors.onBackground }]}>
          Auto-detect language
        </Text>
        <Switch
          value={autoDetect}
          onValueChange={setAutoDetect}
          trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
          thumbColor={autoDetect ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
        />
      </View>

      {/* Virtual Keyboard toggle */}
      <View style={styles.autoDetectSection}>
        <Text style={[styles.autoDetectLabel, { color: theme.colors.onBackground }]}>
          Use Custom Keyboard
        </Text>
        <Switch
          value={useVirtualKeyboard}
          onValueChange={(value) => {
            setUseVirtualKeyboard(value);
            if (!value) {
              setShowVirtualKeyboard(false);
            }
          }}
          trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
          thumbColor={useVirtualKeyboard ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
        />
      </View>

      {/* Language selection */}
      <View style={styles.languageSection}>
        <TouchableOpacity
          style={[styles.languageButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowLanguagePicker('source')}
        >
          <Text style={styles.languageFlag}>{sourceLanguage.flag}</Text>
          <View style={styles.languageButtonInfo}>
            <Text style={[styles.languageButtonName, { color: theme.colors.onSurface }]}>
              {sourceLanguage.name}
            </Text>
            <Text style={[styles.languageButtonNative, { color: theme.colors.onSurfaceVariant }]}>
              {sourceLanguage.nativeName}
            </Text>
            <Text style={[styles.keyboardIndicator, { color: theme.colors.primary }]}>
              {useVirtualKeyboard ? '🎹' : '📱'} {sourceLanguage.name} Keyboard
            </Text>
          </View>
          <Icon name="keyboard-arrow-down" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
          <Icon name="swap-horiz" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.languageButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowLanguagePicker('target')}
        >
          <Text style={styles.languageFlag}>{targetLanguage.flag}</Text>
          <View style={styles.languageButtonInfo}>
            <Text style={[styles.languageButtonName, { color: theme.colors.onSurface }]}>
              {targetLanguage.name}
            </Text>
            <Text style={[styles.languageButtonNative, { color: theme.colors.onSurfaceVariant }]}>
              {targetLanguage.nativeName}
            </Text>
            <Text style={[styles.keyboardIndicator, { color: theme.colors.primary }]}>
              {useVirtualKeyboard ? '🎹' : '📱'} {targetLanguage.name} Keyboard
            </Text>
          </View>
          <Icon name="keyboard-arrow-down" size={20} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Translation area */}
      <View style={styles.translationArea}>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.inputHeader}>
            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              {sourceLanguage.name}
            </Text>
            <View style={styles.inputActions}>
              <TouchableOpacity onPress={() => speakText(inputText, sourceLanguage.code)}>
                <Icon name="volume-up" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => copyToClipboard(inputText)}>
                <Icon name="content-copy" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={[styles.textInput, { color: theme.colors.onSurface }]}
            placeholder={`Type in ${sourceLanguage.name}...`}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={inputText}
            onChangeText={setInputText}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            showSoftInputOnFocus={!useVirtualKeyboard}
            onFocus={() => {
              if (useVirtualKeyboard) {
                setShowVirtualKeyboard(true);
              }
            }}
            onBlur={() => {
              // Keep virtual keyboard open when using it
              if (!useVirtualKeyboard) {
                setShowVirtualKeyboard(false);
              }
            }}
          />
        </View>

        <View style={styles.translationIndicator}>
          {isTranslating ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Icon name="arrow-downward" size={20} color={theme.colors.onSurfaceVariant} />
          )}
        </View>

        <View style={[styles.outputContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.inputHeader}>
            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              {targetLanguage.name}
            </Text>
            <View style={styles.inputActions}>
              <TouchableOpacity onPress={() => speakText(translatedText, targetLanguage.code)}>
                <Icon name="volume-up" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => copyToClipboard(translatedText)}>
                <Icon name="content-copy" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.translatedTextContainer}>
            <Text style={[styles.translatedText, { color: theme.colors.onSurface }]}>
              {translatedText || 'Translation will appear here...'}
            </Text>
          </View>
        </View>
      </View>

      {renderTranslationHistory()}
      {renderLanguagePicker()}
      
      {/* Virtual Keyboard */}
      <VirtualKeyboard
        language={sourceLanguage.code}
        onKeyPress={handleVirtualKeyPress}
        onBackspace={handleVirtualBackspace}
        onSpace={handleVirtualSpace}
        onEnter={handleVirtualEnter}
        visible={showVirtualKeyboard && useVirtualKeyboard}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  autoDetectSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  autoDetectLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  languageButtonInfo: {
    flex: 1,
  },
  languageButtonName: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageButtonNative: {
    fontSize: 12,
  },
  keyboardIndicator: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  languageFlag: {
    fontSize: 20,
  },
  swapButton: {
    padding: 8,
  },
  translationArea: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  outputContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
  },
  translatedTextContainer: {
    flex: 1,
    minHeight: 100,
  },
  translatedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  translationIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  historySection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    width: 200,
  },
  historyOriginal: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyTranslated: {
    fontSize: 14,
    fontWeight: '500',
  },
  languagePicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageNative: {
    fontSize: 14,
  },
});

export default LiveTranslationScreen;
