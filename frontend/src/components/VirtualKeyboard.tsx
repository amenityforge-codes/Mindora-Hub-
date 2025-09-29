import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface VirtualKeyboardProps {
  language: string;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onEnter: () => void;
  visible: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  language,
  onKeyPress,
  onBackspace,
  onSpace,
  onEnter,
  visible,
}) => {
  const theme = useTheme();
  const [keyboardMode, setKeyboardMode] = useState<'letters' | 'numbers'>('letters');

  if (!visible) return null;

  // Define number keyboard layout with vowel extensions
  const getNumberKeyboardLayout = (lang: string) => {
    switch (lang) {
      case 'te': // Telugu vowel extensions - Complete set
        return {
          rows: [
            // Basic vowel extensions (matras)
            ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ై', 'ొ', 'ో'],
            // Extended vowel combinations
            ['ౌ', 'ౕ', 'ౖ', 'ౘ', 'ౙ', 'ౚ', 'ౠ', 'ౡ', 'ౢ', 'ౣ'],
            // Special marks and numbers
            ['్', 'ం', 'ః', 'ృ', 'ౄ', '౦', '౧', '౨', '౩', '౪'],
            // More numbers and controls
            ['౫', '౬', '౭', '౮', '౯', 'ABC', '⌫', ' ', ' ', ' ']
          ]
        };
      
      case 'ta': // Tamil vowel extensions - Complete set
        return {
          rows: [
            // All vowel extensions (uyirmei ezhuthukkal)
            ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ'],
            // Extended vowel combinations and special marks
            ['ௌ', 'ௗ', 'ௐ', '௹', '௺', '௸', '்', 'ஂ', 'ஃ', '௦'],
            // Tamil numbers
            ['௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '௰'],
            // More numbers and controls
            ['௱', '௲', 'ABC', '⌫', ' ', ' ', ' ', ' ', ' ', ' ']
          ]
        };
      
      case 'hi': // Hindi vowel extensions - Complete set
        return {
          rows: [
            // All vowel extensions (matras)
            ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ृ'],
            // Extended vowel combinations
            ['ॄ', 'ॢ', 'ॣ', 'ॅ', 'ॆ', 'ॉ', 'ॊ', 'ं', 'ः', '्'],
            // Special marks and numbers
            ['ँ', '़', '़', '़', '़', '०', '१', '२', '३', '४'],
            // More numbers and controls
            ['५', '६', '७', '८', '९', 'ABC', '⌫', ' ', ' ', ' ']
          ]
        };
      
      case 'bn': // Bengali vowel extensions
        return {
          rows: [
            // All vowel extensions
            ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ'],
            ['ং', 'ঃ', 'ঁ', '্', '০', '১', '২', '৩', '৪', '৫'],
            ['৬', '৭', '৮', '৯', '।', '॥', 'ABC', '⌫', ' ', ' ']
          ]
        };
      
      default: // English numbers
        return {
          rows: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
            ['.', ',', '?', '!', "'", 'ABC', '⌫', ' ', '↵', ' ']
          ]
        };
    }
  };

  // Define keyboard layouts for different languages
  const getKeyboardLayout = (lang: string) => {
    switch (lang) {
      case 'te': // Telugu - Complete alphabet
        return {
          rows: [
            // Basic vowels (swaras)
            ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ'],
            // More vowels and consonants - Ka varga
            ['ఒ', 'ఓ', 'ఔ', 'క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ'],
            // Consonants - Ta varga
            ['జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ'],
            // Consonants - Pa varga
            ['ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర'],
            // Remaining consonants and special keys
            ['ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ', 'ఴ'],
            // Special consonants and controls
            ['ౘ', 'ౙ', 'ౚ', 'ౠ', 'ౡ', '123', '⌫', ' ', ' ', ' ']
          ]
        };
      
      case 'hi': // Hindi - Complete alphabet
        return {
          rows: [
            // Basic vowels (swar)
            ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ'],
            // More vowels and consonants - Ka varga
            ['औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ'],
            // Consonants - Ta varga
            ['ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध'],
            // Consonants - Pa varga
            ['न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व'],
            // Remaining consonants and special keys
            ['श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ', 'ड़', 'ढ़', 'फ़'],
            // Special keys
            ['123', '⌫', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
          ]
        };
      
      case 'ta': // Tamil - Complete alphabet
        return {
          rows: [
            // Basic vowels (uyir ezhuthukkal)
            ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ'],
            // More vowels and consonants
            ['ஓ', 'ஔ', 'க்', 'ங்', 'ச்', 'ஞ்', 'ட்', 'ண்', 'த்', 'ந்'],
            // Consonants - Pa varga
            ['ப்', 'ம்', 'ய்', 'ர்', 'ல்', 'வ்', 'ழ்', 'ள்', 'ற்', 'ன்'],
            // Additional consonants and special keys
            ['ஜ்', 'ஷ்', 'ஸ்', 'ஹ்', 'க்ஷ்', 'ஸ்ரீ', '123', '⌫', ' ', ' ']
          ]
        };
      
      case 'bn': // Bengali - Complete alphabet
        return {
          rows: [
            // Basic vowels (swarabarna)
            ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও'],
            // More vowels and consonants - Ka varga
            ['ঔ', 'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ'],
            // Consonants - Ta varga
            ['ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ'],
            // Consonants - Pa varga
            ['ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ'],
            // Remaining consonants and special keys
            ['ষ', 'স', 'হ', 'ড়', 'ঢ়', 'য়', 'ৎ', '123', '⌫', ' ']
          ]
        };
      
      case 'gu': // Gujarati - Complete keyboard
        return {
          rows: [
            // Swar (Vowels) - First row
            ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'ઋ', 'એ', 'ઐ', 'ઓ'],
            // More vowels and basic consonants
            ['ઔ', 'અં', 'અઃ', 'ક', 'ખ', 'ગ', 'ઘ', 'ઙ', 'ચ', 'છ'],
            // Vyanjan (Consonants) - Ka varga
            ['જ', 'ઝ', 'ઞ', 'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ'],
            // Consonants - Ta varga
            ['દ', 'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર'],
            // Consonants - Pa varga and others
            ['લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ', 'ક્ષ', 'જ્ઞ', '૦'],
            // Numbers and special characters
            ['૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯', '।']
          ]
        };
      
      case 'kn': // Kannada - Complete keyboard
        return {
          rows: [
            // Swaragalu (Vowels) - First row
            ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ೠ', 'ಌ', 'ೡ'],
            // More vowels and basic consonants
            ['ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಅಂ', 'ಅಃ', 'ಕ', 'ಖ'],
            // Vyanjanagalu (Consonants) - Ka varga
            ['ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ'],
            // Consonants - Ta varga
            ['ಡ', 'ಢ', 'ಣ', 'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ'],
            // Consonants - Pa varga and others
            ['ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ'],
            // Remaining consonants and numbers
            ['ಹ', 'ಳ', 'ೞ', '೦', '೧', '೨', '೩', '೪', '೫', '೬']
          ]
        };
      
      case 'ml': // Malayalam - Complete keyboard
        return {
          rows: [
            // Swaraksharangal (Vowels) - First row
            ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'ൠ', 'ഌ', 'ൡ'],
            // More vowels and basic consonants
            ['എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'അം', 'അഃ', 'ക', 'ഖ'],
            // Vyanjanaksharangal (Consonants) - Ka varga
            ['ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ'],
            // Consonants - Ta varga
            ['ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ'],
            // Consonants - Pa varga and others
            ['ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ'],
            // Remaining consonants and numbers
            ['ഹ', 'ള', 'ഴ', 'റ', '൦', '൧', '൨', '൩', '൪', '൫']
          ]
        };
      
      case 'mr': // Marathi - Complete Devanagari keyboard
        return {
          rows: [
            // Swar (Vowels) - First row
            ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ', 'ॡ'],
            // More vowels and basic consonants
            ['ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः', 'क', 'ख', 'ग', 'घ'],
            // Vyanjan (Consonants) - Ka varga
            ['ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ'],
            // Consonants - Ta varga
            ['ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ'],
            // Consonants - Pa varga and others
            ['म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष'],
            // Special characters and numbers
            ['त्र', 'ज्ञ', 'ळ', '०', '१', '२', '३', '४', '५', '६']
          ]
        };
      
      case 'pa': // Punjabi - Complete Gurmukhi keyboard
        return {
          rows: [
            // Swar (Vowels) - First row
            ['ਅ', 'ਆ', 'ਇ', 'ਈ', 'ਉ', 'ਊ', 'ਏ', 'ਐ', 'ਓ', 'ਔ'],
            // More vowels and basic consonants
            ['ਅੰ', 'ਅੱ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ', 'ਚ', 'ਛ', 'ਜ'],
            // Vyanjan (Consonants) - Ka varga
            ['ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ', 'ਤ', 'ਥ', 'ਦ'],
            // Consonants - Ta varga
            ['ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ', 'ਯ', 'ਰ', 'ਲ'],
            // Consonants - Pa varga and others
            ['ਵ', 'ਸ', 'ਹ', 'ੜ', '੦', '੧', '੨', '੩', '੪', '੫'],
            // Numbers and special characters
            ['੬', '੭', '੮', '੯', '।', '॥', 'ੴ', 'ੵ', '੶', '੷']
          ]
        };
      
      case 'ar': // Arabic
        return {
          rows: [
            ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح'],
            ['ج', 'د', 'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن'],
            ['م', 'ك', 'ط', 'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة'],
            ['و', 'ز', 'ظ', 'ذ', 'ي', 'إ', 'أ', 'آ', 'لإ', 'لأ']
          ]
        };
      
      case 'zh': // Chinese (Simplified)
        return {
          rows: [
            ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
            ['人', '大', '小', '中', '国', '学', '生', '老', '师', '朋'],
            ['友', '家', '里', '上', '下', '左', '右', '前', '后', '东'],
            ['西', '南', '北', '好', '不', '是', '的', '了', '在', '有']
          ]
        };
      
      case 'ja': // Japanese (Hiragana)
        return {
          rows: [
            ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ'],
            ['さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と'],
            ['な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ'],
            ['ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り'],
            ['る', 'れ', 'ろ', 'わ', 'を', 'ん', 'っ', 'ゃ', 'ゅ', 'ょ']
          ]
        };
      
      case 'ko': // Korean
        return {
          rows: [
            ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ'],
            ['ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ'],
            ['ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', '가', '나', '다', '라', '마', '바'],
            ['사', '아', '자', '차', '카', '타', '파', '하', '거', '너']
          ]
        };
      
      default: // English
        return {
          rows: [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
          ]
        };
    }
  };

  const keyboardLayout = keyboardMode === 'numbers' 
    ? getNumberKeyboardLayout(language) 
    : getKeyboardLayout(language);

  const renderKey = (key: string, index: number) => {
    const handleKeyPress = () => {
      if (key === '123') {
        setKeyboardMode('numbers');
      } else if (key === 'ABC') {
        setKeyboardMode('letters');
      } else if (key === '⌫') {
        onBackspace();
      } else if (key === '↵') {
        onEnter();
      } else if (key === ' ') {
        onSpace();
      } else {
        onKeyPress(key);
      }
    };

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.key,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          }
        ]}
        onPress={handleKeyPress}
      >
        <Text style={[styles.keyText, { color: theme.colors.onSurface }]}>
          {key}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (row: string[], rowIndex: number) => (
    <View key={rowIndex} style={styles.keyRow}>
      {row.map((key, keyIndex) => renderKey(key, keyIndex))}
    </View>
  );

  return (
    <View style={[styles.keyboard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.keyboardHeader}>
        <Text style={[styles.keyboardTitle, { color: theme.colors.onSurfaceVariant }]}>
          {keyboardMode === 'numbers' ? 
            (language === 'te' ? 'స్వర విస్తరణలు' :
             language === 'hi' ? 'स्वर विस्तार' :
             language === 'ta' ? 'உயிர் விரிவுகள்' :
             language === 'bn' ? 'স্বর বিস্তার' :
             'Vowel Extensions') :
            (language === 'te' ? 'తెలుగు కీబోర్డ్' :
             language === 'hi' ? 'हिंदी कीबोर्ड' :
             language === 'ta' ? 'தமிழ் விசைப்பலகை' :
             language === 'bn' ? 'বাংলা কিবোর্ড' :
             language === 'ar' ? 'لوحة مفاتيح عربية' :
             language === 'zh' ? '中文键盘' :
             language === 'ja' ? '日本語キーボード' :
             language === 'ko' ? '한국어 키보드' :
             'English Keyboard')
          }
        </Text>
      </View>
      
      <View style={styles.keyboardBody}>
        {keyboardLayout.rows.map((row, index) => renderRow(row, index))}
        
        {/* Special keys row */}
        <View style={styles.specialKeysRow}>
          <TouchableOpacity
            style={[
              styles.specialKey,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }
            ]}
            onPress={onBackspace}
          >
            <Icon name="backspace" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.spaceKey,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }
            ]}
            onPress={onSpace}
          >
            <Text style={[styles.spaceKeyText, { color: theme.colors.onSurface }]}>
              {language === 'te' ? 'స్పేస్' :
               language === 'hi' ? 'स्पेस' :
               language === 'ta' ? 'இடைவெளி' :
               language === 'bn' ? 'স্পেস' :
               language === 'ar' ? 'مسافة' :
               language === 'zh' ? '空格' :
               language === 'ja' ? 'スペース' :
               language === 'ko' ? '스페이스' :
               'SPACE'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.specialKey,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }
            ]}
            onPress={onEnter}
          >
            <Icon name="keyboard-return" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingBottom: 20,
  },
  keyboardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  keyboardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  keyboardBody: {
    padding: 4,
    paddingBottom: 10,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  key: {
    minWidth: 28,
    height: 36,
    marginHorizontal: 1,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1,
    maxWidth: 35,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  specialKeysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  specialKey: {
    width: 60,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  spaceKey: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  spaceKeyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VirtualKeyboard;
