import { Language, TranslationRequest, TranslationResponse, LanguageDetectionResponse } from '../types';
import { api } from './api';

// Supported languages with their details
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
];

// Mock translation service - in a real app, you would use Google Translate API, Azure Translator, etc.
class TranslationService {
  private apiKey: string | null = null;

  constructor() {
    // In a real implementation, you would initialize with an API key
    // this.apiKey = process.env.TRANSLATION_API_KEY;
  }

  /**
   * Detect the language of the input text
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResponse> {
    try {
      console.log('Detecting language for text:', text);
      const response = await api.post('/ai/detect-language', { text });
      
      if (response.success && response.data) {
        console.log('Language detection successful:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Language detection failed');
      }
    } catch (error) {
      console.error('Language detection error:', error);
      console.log('Falling back to simple language detection');
      // Fallback to simple detection
      const detectedLang = this.simpleLanguageDetection(text);
      return {
        language: detectedLang,
        confidence: 0.5
      };
    }
  }

  /**
   * Translate text from source language to target language
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      console.log('Translating text:', request.text, 'from', request.sourceLanguage, 'to', request.targetLanguage);
      const response = await api.translateText(
        request.text,
        request.targetLanguage,
        request.sourceLanguage
      );
      
      if (response.success && response.data) {
        console.log('Translation successful:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      console.log('Falling back to mock translation');
      // Fallback to mock translation
      const translatedText = this.mockTranslation(request.text, request.sourceLanguage, request.targetLanguage);
      return {
        originalText: request.text,
        translatedText,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence: 0.5
      };
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get language by code
   */
  getLanguageByCode(code: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Simple heuristic-based language detection for demo
   */
  private simpleLanguageDetection(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Telugu detection
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    
    // Hindi detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    
    // Tamil detection
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    
    // Bengali detection
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';
    
    // Gujarati detection
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
    
    // Kannada detection
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    
    // Malayalam detection
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    
    // Marathi detection (uses Devanagari script like Hindi)
    if (/[\u0900-\u097F]/.test(text)) return 'mr';
    
    // Punjabi detection
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
    
    // Urdu detection
    if (/[\u0600-\u06FF]/.test(text)) return 'ur';
    
    // Arabic detection
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    
    // Chinese detection
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    
    // Japanese detection
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
    
    // Korean detection
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
    
    // Thai detection
    if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
    
    // Russian detection
    if (/[\u0400-\u04FF]/.test(text)) return 'ru';
    
    // Default to English
    return 'en';
  }

  /**
   * Mock translation function for demo purposes
   */
  private mockTranslation(text: string, sourceLang: string, targetLang: string): string {
    // This is a mock implementation - in real app, use actual translation API
    
    const translations: { [key: string]: { [key: string]: string } } = {
      'hello': {
        'hi': 'नमस्ते',
        'te': 'హలో',
        'ta': 'வணக்கம்',
        'bn': 'হ্যালো',
        'gu': 'હેલો',
        'kn': 'ಹಲೋ',
        'ml': 'ഹലോ',
        'mr': 'नमस्कार',
        'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
        'ur': 'ہیلو',
        'es': 'Hola',
        'fr': 'Bonjour',
        'de': 'Hallo',
        'it': 'Ciao',
        'pt': 'Olá',
        'ru': 'Привет',
        'ja': 'こんにちは',
        'ko': '안녕하세요',
        'zh': '你好',
        'ar': 'مرحبا',
        'th': 'สวัสดี',
        'vi': 'Xin chào',
        'tr': 'Merhaba',
        'nl': 'Hallo',
        'sv': 'Hej',
        'no': 'Hei',
        'da': 'Hej',
        'fi': 'Hei',
        'pl': 'Cześć'
      },
      'good morning': {
        'hi': 'सुप्रभात',
        'te': 'శుభోదయం',
        'ta': 'காலை வணக்கம்',
        'bn': 'সুপ্রভাত',
        'gu': 'સુપ્રભાત',
        'kn': 'ಶುಭೋದಯ',
        'ml': 'സുപ്രഭാതം',
        'mr': 'सुप्रभात',
        'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
        'ur': 'صبح بخیر',
        'es': 'Buenos días',
        'fr': 'Bonjour',
        'de': 'Guten Morgen',
        'it': 'Buongiorno',
        'pt': 'Bom dia',
        'ru': 'Доброе утро',
        'ja': 'おはようございます',
        'ko': '좋은 아침',
        'zh': '早上好',
        'ar': 'صباح الخير',
        'th': 'สวัสดีตอนเช้า',
        'vi': 'Chào buổi sáng',
        'tr': 'Günaydın',
        'nl': 'Goedemorgen',
        'sv': 'God morgon',
        'no': 'God morgen',
        'da': 'God morgen',
        'fi': 'Hyvää huomenta',
        'pl': 'Dzień dobry'
      },
      'thank you': {
        'hi': 'धन्यवाद',
        'te': 'ధన్యవాదాలు',
        'ta': 'நன்றி',
        'bn': 'ধন্যবাদ',
        'gu': 'આભાર',
        'kn': 'ಧನ್ಯವಾದಗಳು',
        'ml': 'നന്ദി',
        'mr': 'धन्यवाद',
        'pa': 'ਧੰਨਵਾਦ',
        'ur': 'شکریہ',
        'es': 'Gracias',
        'fr': 'Merci',
        'de': 'Danke',
        'it': 'Grazie',
        'pt': 'Obrigado',
        'ru': 'Спасибо',
        'ja': 'ありがとう',
        'ko': '감사합니다',
        'zh': '谢谢',
        'ar': 'شكرا',
        'th': 'ขอบคุณ',
        'vi': 'Cảm ơn',
        'tr': 'Teşekkürler',
        'nl': 'Dank je',
        'sv': 'Tack',
        'no': 'Takk',
        'da': 'Tak',
        'fi': 'Kiitos',
        'pl': 'Dziękuję'
      },
      'how are you': {
        'hi': 'आप कैसे हैं',
        'te': 'మీరు ఎలా ఉన్నారు',
        'ta': 'நீங்கள் எப்படி இருக்கிறீர்கள்',
        'bn': 'আপনি কেমন আছেন',
        'gu': 'તમે કેમ છો',
        'kn': 'ನೀವು ಹೇಗಿದ್ದೀರಿ',
        'ml': 'നിങ്ങൾ എങ്ങനെയുണ്ട്',
        'mr': 'तुम कसे आहात',
        'pa': 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ',
        'ur': 'آپ کیسے ہیں',
        'es': '¿Cómo estás?',
        'fr': 'Comment allez-vous?',
        'de': 'Wie geht es dir?',
        'it': 'Come stai?',
        'pt': 'Como você está?',
        'ru': 'Как дела?',
        'ja': '元気ですか？',
        'ko': '어떻게 지내세요?',
        'zh': '你好吗？',
        'ar': 'كيف حالك؟',
        'th': 'คุณเป็นอย่างไรบ้าง',
        'vi': 'Bạn có khỏe không?',
        'tr': 'Nasılsın?',
        'nl': 'Hoe gaat het?',
        'sv': 'Hur mår du?',
        'no': 'Hvordan har du det?',
        'da': 'Hvordan har du det?',
        'fi': 'Miten voit?',
        'pl': 'Jak się masz?'
      },
      'goodbye': {
        'hi': 'अलविदा',
        'te': 'వీడ్కోలు',
        'ta': 'பிரியாவிடை',
        'bn': 'বিদায়',
        'gu': 'આવજો',
        'kn': 'ವಿದಾಯ',
        'ml': 'വിട',
        'mr': 'निरोप',
        'pa': 'ਅਲਵਿਦਾ',
        'ur': 'الوداع',
        'es': 'Adiós',
        'fr': 'Au revoir',
        'de': 'Auf Wiedersehen',
        'it': 'Arrivederci',
        'pt': 'Tchau',
        'ru': 'До свидания',
        'ja': 'さようなら',
        'ko': '안녕히 가세요',
        'zh': '再见',
        'ar': 'وداعا',
        'th': 'ลาก่อน',
        'vi': 'Tạm biệt',
        'tr': 'Hoşça kal',
        'nl': 'Tot ziens',
        'sv': 'Hej då',
        'no': 'Ha det',
        'da': 'Farvel',
        'fi': 'Näkemiin',
        'pl': 'Do widzenia'
      },
      'yes': {
        'hi': 'हाँ',
        'te': 'అవును',
        'ta': 'ஆம்',
        'bn': 'হ্যাঁ',
        'gu': 'હા',
        'kn': 'ಹೌದು',
        'ml': 'അതെ',
        'mr': 'होय',
        'pa': 'ਹਾਂ',
        'ur': 'ہاں',
        'es': 'Sí',
        'fr': 'Oui',
        'de': 'Ja',
        'it': 'Sì',
        'pt': 'Sim',
        'ru': 'Да',
        'ja': 'はい',
        'ko': '네',
        'zh': '是',
        'ar': 'نعم',
        'th': 'ใช่',
        'vi': 'Có',
        'tr': 'Evet',
        'nl': 'Ja',
        'sv': 'Ja',
        'no': 'Ja',
        'da': 'Ja',
        'fi': 'Kyllä',
        'pl': 'Tak'
      },
      'no': {
        'hi': 'नहीं',
        'te': 'కాదు',
        'ta': 'இல்லை',
        'bn': 'না',
        'gu': 'ના',
        'kn': 'ಇಲ್ಲ',
        'ml': 'ഇല്ല',
        'mr': 'नाही',
        'pa': 'ਨਹੀਂ',
        'ur': 'نہیں',
        'es': 'No',
        'fr': 'Non',
        'de': 'Nein',
        'it': 'No',
        'pt': 'Não',
        'ru': 'Нет',
        'ja': 'いいえ',
        'ko': '아니요',
        'zh': '不',
        'ar': 'لا',
        'th': 'ไม่',
        'vi': 'Không',
        'tr': 'Hayır',
        'nl': 'Nee',
        'sv': 'Nej',
        'no': 'Nei',
        'da': 'Nej',
        'fi': 'Ei',
        'pl': 'Nie'
      }
    };

    const lowerText = text.toLowerCase().trim();
    
    // Check if we have a direct translation
    if (translations[lowerText] && translations[lowerText][targetLang]) {
      return translations[lowerText][targetLang];
    }

    // For reverse translations (from other languages to English)
    if (sourceLang !== 'en' && targetLang === 'en') {
      for (const [englishWord, langTranslations] of Object.entries(translations)) {
        if (langTranslations[sourceLang] === text) {
          return englishWord;
        }
      }
    }

    // If no translation found, return a more informative placeholder
    const languageNames = {
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'mr': 'Marathi',
      'pa': 'Punjabi',
      'ur': 'Urdu',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'tr': 'Turkish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'pl': 'Polish'
    };

    const targetLangName = languageNames[targetLang] || targetLang;
    return `[${targetLangName}: ${text}]`;
  }
}

export const translationService = new TranslationService();
