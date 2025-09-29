const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const translate = require('translate-google');

const router = express.Router();

// @route   POST /api/ai/grammar-check
// @desc    Check grammar and provide suggestions
// @access  Private
router.post('/grammar-check', authenticate, [
  body('text').notEmpty().withMessage('Text is required'),
  body('context').optional().isString().withMessage('Context must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, context } = req.body;

    // TODO: Integrate with OpenAI or other AI service
    // For now, return mock response
    const mockResponse = {
      originalText: text,
      correctedText: text, // In real implementation, this would be AI-corrected
      corrections: [
        {
          type: 'grammar',
          original: 'grammar error example',
          suggestion: 'corrected grammar example',
          explanation: 'This is a grammar correction explanation',
          confidence: 0.95
        }
      ],
      suggestions: [
        {
          type: 'style',
          suggestion: 'Consider using more active voice',
          explanation: 'Active voice makes your writing more direct and engaging'
        }
      ],
      overallScore: 85,
      readabilityScore: 78
    };

    res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during grammar check'
    });
  }
});

// @route   POST /api/ai/rewrite
// @desc    Rewrite text with AI assistance
// @access  Private
router.post('/rewrite', authenticate, [
  body('text').notEmpty().withMessage('Text is required'),
  body('style').optional().isIn(['formal', 'casual', 'academic', 'business']).withMessage('Invalid style'),
  body('tone').optional().isIn(['professional', 'friendly', 'persuasive', 'neutral']).withMessage('Invalid tone')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, style = 'neutral', tone = 'neutral' } = req.body;

    // TODO: Integrate with AI service for text rewriting
    const mockResponse = {
      originalText: text,
      rewrittenText: text, // In real implementation, this would be AI-rewritten
      style: style,
      tone: tone,
      changes: [
        {
          type: 'vocabulary',
          original: 'word',
          replacement: 'better word',
          reason: 'More appropriate for the selected style'
        }
      ],
      confidence: 0.88
    };

    res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    console.error('Text rewrite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during text rewrite'
    });
  }
});

// @route   POST /api/ai/speech-feedback
// @desc    Analyze speech and provide feedback
// @access  Private
router.post('/speech-feedback', authenticate, [
  body('audioUrl').notEmpty().withMessage('Audio URL is required'),
  body('targetText').optional().isString().withMessage('Target text must be a string'),
  body('language').optional().isString().withMessage('Language must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { audioUrl, targetText, language = 'en' } = req.body;

    // TODO: Integrate with speech recognition and analysis services
    const mockResponse = {
      transcript: 'This is a mock transcript of the speech',
      accuracy: 0.92,
      fluency: {
        score: 85,
        feedback: 'Good pace and rhythm, minor pauses detected'
      },
      pronunciation: {
        score: 78,
        issues: [
          {
            word: 'pronunciation',
            issue: 'Stress on second syllable',
            suggestion: 'Stress on first syllable: PRO-nun-ci-a-tion'
          }
        ]
      },
      grammar: {
        score: 90,
        corrections: []
      },
      suggestions: [
        'Try to speak a bit slower for better clarity',
        'Practice the pronunciation of words with multiple syllables'
      ],
      overallScore: 84
    };

    res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    console.error('Speech feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during speech analysis'
    });
  }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate quiz questions from content (Admin only)
// @access  Private (Admin)
router.post('/generate-quiz', authenticate, [
  body('content').notEmpty().withMessage('Content is required'),
  body('questionCount').optional().isInt({ min: 1, max: 20 }).withMessage('Question count must be between 1 and 20'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('questionTypes').optional().isArray().withMessage('Question types must be an array')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      content, 
      questionCount = 5, 
      difficulty = 'medium',
      questionTypes = ['mcq', 'true-false', 'fill-blank']
    } = req.body;

    // TODO: Integrate with AI service to generate questions
    const mockQuestions = [
      {
        type: 'mcq',
        prompt: 'What is the main topic of this content?',
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false }
        ],
        explanation: 'The main topic is clearly stated in the introduction.',
        marks: 10,
        difficulty: difficulty
      },
      {
        type: 'true-false',
        prompt: 'This statement is true or false based on the content.',
        correctAnswer: true,
        explanation: 'This is explained in detail in the second paragraph.',
        marks: 5,
        difficulty: difficulty
      }
    ];

    res.json({
      success: true,
      data: {
        questions: mockQuestions.slice(0, questionCount),
        metadata: {
          sourceContent: content.substring(0, 200) + '...',
          generatedAt: new Date(),
          difficulty: difficulty,
          questionCount: mockQuestions.slice(0, questionCount).length
        }
      }
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during quiz generation'
    });
  }
});

// @route   POST /api/ai/summarize
// @desc    Summarize long text content
// @access  Private
router.post('/summarize', authenticate, [
  body('text').notEmpty().withMessage('Text is required'),
  body('maxLength').optional().isInt({ min: 50, max: 1000 }).withMessage('Max length must be between 50 and 1000 characters'),
  body('style').optional().isIn(['bullet', 'paragraph', 'outline']).withMessage('Invalid summary style')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, maxLength = 200, style = 'paragraph' } = req.body;

    // TODO: Integrate with AI service for text summarization
    const mockSummary = {
      originalLength: text.length,
      summaryLength: Math.min(maxLength, text.length),
      summary: text.substring(0, maxLength) + '...', // Mock summary
      style: style,
      keyPoints: [
        'Key point 1 from the text',
        'Key point 2 from the text',
        'Key point 3 from the text'
      ],
      confidence: 0.92
    };

    res.json({
      success: true,
      data: mockSummary
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during text summarization'
    });
  }
});

// @route   POST /api/ai/translate
// @desc    Translate text between languages
// @access  Public (for testing)
router.post('/translate', [
  body('text').notEmpty().withMessage('Text is required'),
  body('targetLanguage').notEmpty().withMessage('Target language is required'),
  body('sourceLanguage').optional().isString().withMessage('Source language must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    let translatedText;
    let confidence = 0.9;

    try {
      // Use Google Translate for real-time translation
      console.log(`Translating "${text}" from ${sourceLanguage} to ${targetLanguage}`);
      
      const translationOptions = {
        from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        to: targetLanguage
      };

      translatedText = await translate(text, translationOptions);
      console.log(`Translation result: "${translatedText}"`);
      
    } catch (error) {
      console.error('Google Translate error:', error);
      
      // Fallback to mock translations for common words
      const mockTranslations = {
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
        }
      };

      const lowerText = text.toLowerCase().trim();
      
      // Check if we have a direct translation
      if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLanguage]) {
        translatedText = mockTranslations[lowerText][targetLanguage];
        confidence = 0.8; // Lower confidence for fallback
      } else {
        // For demo purposes, return a placeholder
        translatedText = `[Translation failed: ${text}]`;
        confidence = 0.1;
      }
    }

    const translationResult = {
      originalText: text,
      translatedText,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      confidence: confidence
    };

    res.json({
      success: true,
      data: translationResult
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during translation'
    });
  }
});

// @route   POST /api/ai/writing-assistant
// @desc    AI-powered writing assistance and improvement suggestions
// @access  Private
router.post('/writing-assistant', authenticate, [
  body('text').notEmpty().withMessage('Text is required'),
  body('task').optional().isIn(['improve', 'expand', 'condense', 'formalize', 'casualize']).withMessage('Invalid task type'),
  body('context').optional().isString().withMessage('Context must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, task = 'improve', context = 'general' } = req.body;

    // TODO: Integrate with AI service for writing assistance
    const mockAssistance = {
      originalText: text,
      improvedText: text.replace(/good/g, 'excellent').replace(/bad/g, 'poor'),
      task: task,
      context: context,
      suggestions: [
        {
          type: 'structure',
          message: 'Consider adding a topic sentence to your paragraph',
          position: { start: 0, end: 10 },
          priority: 'high'
        },
        {
          type: 'vocabulary',
          message: 'Use more specific vocabulary for better impact',
          position: { start: 15, end: 20 },
          priority: 'medium'
        }
      ],
      improvements: {
        clarity: 20,
        coherence: 15,
        vocabulary: 25,
        grammar: 10
      },
      overallScore: 78,
      readability: {
        level: 'intermediate',
        score: 7.2
      }
    };

    res.json({
      success: true,
      data: mockAssistance
    });
  } catch (error) {
    console.error('Writing assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during writing assistance'
    });
  }
});

// @route   POST /api/ai/pronunciation-guide
// @desc    Generate pronunciation guide for text
// @access  Private
router.post('/pronunciation-guide', authenticate, [
  body('text').notEmpty().withMessage('Text is required'),
  body('language').optional().isString().withMessage('Language must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, language = 'en-US' } = req.body;

    // TODO: Integrate with pronunciation service
    const mockGuide = {
      text: text,
      language: language,
      pronunciation: {
        phonetic: 'ˈprəˌnʌnsiˈeɪʃən',
        syllables: ['pro', 'nun', 'ci', 'a', 'tion'],
        stress: [1, 0, 0, 0, 0], // 1 = stressed, 0 = unstressed
        audioUrl: 'https://example.com/pronunciation-audio.mp3'
      },
      words: [
        {
          word: 'pronunciation',
          phonetic: 'prəˌnʌnsiˈeɪʃən',
          syllables: ['pro', 'nun', 'ci', 'a', 'tion'],
          stress: 1,
          difficulty: 'medium'
        }
      ],
      tips: [
        'Focus on the stressed syllable',
        'Practice the "sh" sound in the middle',
        'End with a clear "tion" sound'
      ]
    };

    res.json({
      success: true,
      data: mockGuide
    });
  } catch (error) {
    console.error('Pronunciation guide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during pronunciation guide generation'
    });
  }
});

// @route   POST /api/ai/vocabulary-builder
// @desc    Generate vocabulary exercises and definitions
// @access  Private
router.post('/vocabulary-builder', authenticate, [
  body('text').notEmpty().withMessage('Text is required'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('count').optional().isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, level = 'intermediate', count = 10 } = req.body;

    // TODO: Integrate with vocabulary analysis service
    const mockVocabulary = {
      text: text,
      level: level,
      vocabulary: [
        {
          word: 'comprehensive',
          definition: 'including or dealing with all or nearly all elements or aspects',
          partOfSpeech: 'adjective',
          difficulty: 'advanced',
          example: 'The report provides a comprehensive analysis of the situation.',
          synonyms: ['complete', 'thorough', 'extensive'],
          antonyms: ['limited', 'partial', 'incomplete']
        },
        {
          word: 'analysis',
          definition: 'detailed examination of the elements or structure of something',
          partOfSpeech: 'noun',
          difficulty: 'intermediate',
          example: 'The data analysis revealed interesting patterns.',
          synonyms: ['examination', 'study', 'investigation'],
          antonyms: ['synthesis', 'combination', 'integration']
        }
      ],
      exercises: [
        {
          type: 'definition',
          word: 'comprehensive',
          options: [
            'including all aspects',
            'very fast',
            'very small',
            'very old'
          ],
          correctAnswer: 0
        },
        {
          type: 'synonym',
          word: 'analysis',
          options: [
            'examination',
            'celebration',
            'destruction',
            'creation'
          ],
          correctAnswer: 0
        }
      ]
    };

    res.json({
      success: true,
      data: mockVocabulary
    });
  } catch (error) {
    console.error('Vocabulary builder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during vocabulary building'
    });
  }
});

// @route   POST /api/ai/detect-language
// @desc    Detect the language of input text
// @access  Public (for testing)
router.post('/detect-language', [
  body('text').notEmpty().withMessage('Text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text } = req.body;

    let detectedLanguage = 'en'; // Default to English
    let confidence = 0.5;

    try {
      // Use Google Translate for language detection
      console.log(`Detecting language for: "${text}"`);
      
      const detectionResult = await translate(text, { to: 'en' });
      
      // For now, we'll use heuristic detection as fallback
      // In a full implementation, you'd use Google's language detection API
      
    } catch (error) {
      console.error('Language detection error:', error);
    }

    // Heuristic-based language detection as fallback
    // Telugu detection
    if (/[\u0C00-\u0C7F]/.test(text)) {
      detectedLanguage = 'te';
      confidence = 0.9;
    }
    // Hindi detection
    else if (/[\u0900-\u097F]/.test(text)) {
      detectedLanguage = 'hi';
      confidence = 0.9;
    }
    // Tamil detection
    else if (/[\u0B80-\u0BFF]/.test(text)) {
      detectedLanguage = 'ta';
      confidence = 0.9;
    }
    // Bengali detection
    else if (/[\u0980-\u09FF]/.test(text)) {
      detectedLanguage = 'bn';
      confidence = 0.9;
    }
    // Chinese detection
    else if (/[\u4E00-\u9FFF]/.test(text)) {
      detectedLanguage = 'zh';
      confidence = 0.9;
    }
    // Japanese detection
    else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      detectedLanguage = 'ja';
      confidence = 0.9;
    }
    // Korean detection
    else if (/[\uAC00-\uD7AF]/.test(text)) {
      detectedLanguage = 'ko';
      confidence = 0.9;
    }
    // Arabic detection
    else if (/[\u0600-\u06FF]/.test(text)) {
      detectedLanguage = 'ar';
      confidence = 0.9;
    }
    // Russian detection
    else if (/[\u0400-\u04FF]/.test(text)) {
      detectedLanguage = 'ru';
      confidence = 0.9;
    }

    res.json({
      success: true,
      data: {
        language: detectedLanguage,
        confidence,
        alternatives: [
          { language: 'en', confidence: 0.1 }
        ]
      }
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during language detection'
    });
  }
});

// @route   POST /api/ai/analyze-text
// @desc    Analyze text for various aspects (grammar, communication, finance, speaking)
// @access  Private
router.post('/analyze-text', [
  body('text').notEmpty().withMessage('Text is required'),
  body('type').isIn(['grammar', 'communication', 'finance', 'speaking']).withMessage('Invalid analysis type'),
  body('context').optional().isString().withMessage('Context must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, type, context } = req.body;
    
    // Simulate AI analysis based on type
    const analysis = await performAIAnalysis(text, type, context);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'AI analysis failed',
      error: error.message
    });
  }
});

async function performAIAnalysis(text, type, context) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const baseScore = 70 + Math.random() * 25;
  const score = Math.round(baseScore);
  
  let feedback = '';
  let strengths = [];
  let improvements = [];
  let suggestions = [];
  
  switch (type) {
    case 'grammar':
      feedback = getGrammarFeedback(score);
      strengths = getGrammarStrengths(score);
      improvements = getGrammarImprovements(score);
      suggestions = getGrammarSuggestions(score);
      break;
    
    case 'communication':
      feedback = getCommunicationFeedback(score);
      strengths = getCommunicationStrengths(score);
      improvements = getCommunicationImprovements(score);
      suggestions = getCommunicationSuggestions(score);
      break;
    
    case 'finance':
      feedback = getFinanceFeedback(score);
      strengths = getFinanceStrengths(score);
      improvements = getFinanceImprovements(score);
      suggestions = getFinanceSuggestions(score);
      break;
    
    case 'speaking':
      feedback = getSpeakingFeedback(score);
      strengths = getSpeakingStrengths(score);
      improvements = getSpeakingImprovements(score);
      suggestions = getSpeakingSuggestions(score);
      break;
  }
  
  return {
    score,
    feedback,
    strengths,
    improvements,
    suggestions,
    detailedAnalysis: {
      grammar: {
        score: score + Math.floor(Math.random() * 10 - 5),
        issues: getGrammarIssues(score),
        corrections: getGrammarCorrections(score)
      },
      vocabulary: {
        score: score + Math.floor(Math.random() * 10 - 5),
        suggestions: getVocabularySuggestions(score),
        level: getVocabularyLevel(score)
      },
      clarity: {
        score: score + Math.floor(Math.random() * 10 - 5),
        feedback: getClarityFeedback(score)
      }
    }
  };
}

function getGrammarFeedback(score) {
  if (score >= 90) return "Excellent grammar! Your writing demonstrates advanced English proficiency.";
  if (score >= 80) return "Very good grammar with only minor errors. Well done!";
  if (score >= 70) return "Good grammar overall. A few areas need attention.";
  if (score >= 60) return "Fair grammar. Focus on the common errors mentioned below.";
  return "Grammar needs improvement. Practice the fundamental rules and structures.";
}

function getCommunicationFeedback(score) {
  if (score >= 90) return "Outstanding communication skills! Your message is clear and professional.";
  if (score >= 80) return "Very good communication. Your message is clear and well-structured.";
  if (score >= 70) return "Good communication with room for improvement in clarity.";
  if (score >= 60) return "Fair communication. Focus on being more concise and clear.";
  return "Communication needs work. Practice organizing your thoughts and being more direct.";
}

function getFinanceFeedback(score) {
  if (score >= 90) return "Excellent financial communication! You demonstrate strong business English skills.";
  if (score >= 80) return "Very good financial English. Professional and clear communication.";
  if (score >= 70) return "Good financial communication with some areas for improvement.";
  if (score >= 60) return "Fair financial English. Focus on using more precise terminology.";
  return "Financial communication needs improvement. Study business vocabulary and concepts.";
}

function getSpeakingFeedback(score) {
  if (score >= 90) return "Excellent speaking skills! Clear pronunciation and natural flow.";
  if (score >= 80) return "Very good speaking. Clear and mostly natural delivery.";
  if (score >= 70) return "Good speaking with some areas for improvement.";
  if (score >= 60) return "Fair speaking skills. Focus on pronunciation and fluency.";
  return "Speaking needs improvement. Practice pronunciation and build confidence.";
}

function getGrammarStrengths(score) {
  if (score >= 80) return ["Correct verb tenses", "Proper sentence structure", "Good punctuation"];
  if (score >= 60) return ["Basic sentence structure", "Some correct verb forms"];
  return ["Attempting complex sentences"];
}

function getCommunicationStrengths(score) {
  if (score >= 80) return ["Clear message", "Good organization", "Professional tone"];
  if (score >= 60) return ["Attempts to be clear", "Some good structure"];
  return ["Shows effort to communicate"];
}

function getFinanceStrengths(score) {
  if (score >= 80) return ["Good business vocabulary", "Professional tone", "Clear financial concepts"];
  if (score >= 60) return ["Some business terms used", "Attempts professional tone"];
  return ["Shows interest in financial topics"];
}

function getSpeakingStrengths(score) {
  if (score >= 80) return ["Clear pronunciation", "Good pace", "Natural intonation"];
  if (score >= 60) return ["Some clear words", "Attempts natural speech"];
  return ["Shows effort to speak clearly"];
}

function getGrammarImprovements(score) {
  if (score >= 80) return ["Minor punctuation issues", "Occasional tense errors"];
  if (score >= 60) return ["Verb tense consistency", "Sentence structure", "Punctuation"];
  return ["Basic grammar rules", "Verb forms", "Sentence construction"];
}

function getCommunicationImprovements(score) {
  if (score >= 80) return ["Be more concise", "Stronger conclusions"];
  if (score >= 60) return ["Improve clarity", "Better organization", "Stronger arguments"];
  return ["Basic structure", "Clearer message", "Professional tone"];
}

function getFinanceImprovements(score) {
  if (score >= 80) return ["More specific data", "Advanced terminology"];
  if (score >= 60) return ["Business vocabulary", "Professional language", "Financial concepts"];
  return ["Basic business terms", "Professional tone", "Financial knowledge"];
}

function getSpeakingImprovements(score) {
  if (score >= 80) return ["Reduce hesitations", "More natural rhythm"];
  if (score >= 60) return ["Pronunciation clarity", "Speaking pace", "Confidence"];
  return ["Basic pronunciation", "Speaking practice", "Building confidence"];
}

function getGrammarSuggestions(score) {
  return [
    "Practice verb tenses with exercises",
    "Read more to see correct grammar in context",
    "Use grammar checking tools",
    "Focus on one grammar rule at a time"
  ];
}

function getCommunicationSuggestions(score) {
  return [
    "Practice writing clear, concise messages",
    "Study professional communication examples",
    "Focus on one main point per message",
    "Use bullet points for complex information"
  ];
}

function getFinanceSuggestions(score) {
  return [
    "Study financial vocabulary and terms",
    "Read business news and reports",
    "Practice explaining financial concepts simply",
    "Learn about AI tools for financial analysis"
  ];
}

function getSpeakingSuggestions(score) {
  return [
    "Practice speaking daily, even for 5 minutes",
    "Record yourself and listen back",
    "Focus on one pronunciation issue at a time",
    "Practice with native speakers or AI tools"
  ];
}

function getGrammarIssues(score) {
  if (score >= 80) return ["Minor punctuation", "Occasional tense error"];
  if (score >= 60) return ["Verb tense inconsistency", "Sentence structure issues"];
  return ["Multiple grammar errors", "Basic structure problems"];
}

function getGrammarCorrections(score) {
  if (score >= 80) return ["Check punctuation", "Review tense usage"];
  if (score >= 60) return ["Practice verb tenses", "Study sentence structure"];
  return ["Learn basic grammar rules", "Practice simple sentences"];
}

function getVocabularySuggestions(score) {
  if (score >= 80) return ["Use more advanced vocabulary", "Try synonyms for variety"];
  if (score >= 60) return ["Expand business vocabulary", "Learn more specific terms"];
  return ["Build basic vocabulary", "Learn common business words"];
}

function getVocabularyLevel(score) {
  if (score >= 80) return 'advanced';
  if (score >= 60) return 'intermediate';
  return 'beginner';
}

function getClarityFeedback(score) {
  if (score >= 80) return "Very clear and easy to understand";
  if (score >= 60) return "Mostly clear with some unclear parts";
  return "Needs improvement in clarity and organization";
}

module.exports = router;
