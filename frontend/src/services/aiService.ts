import api from './api';

export interface GrammarCheckRequest {
  text: string;
  context?: string;
}

export interface GrammarCheckResponse {
  originalText: string;
  correctedText: string;
  corrections: Array<{
    type: string;
    original: string;
    suggestion: string;
    explanation: string;
    confidence: number;
  }>;
  suggestions: Array<{
    type: string;
    suggestion: string;
    explanation: string;
  }>;
  overallScore: number;
  readabilityScore: number;
}

export interface SpeechFeedbackRequest {
  audioUrl: string;
  targetText?: string;
  language?: string;
}

export interface SpeechFeedbackResponse {
  transcript: string;
  accuracy: number;
  fluency: {
    score: number;
    feedback: string;
  };
  pronunciation: {
    score: number;
    issues: Array<{
      word: string;
      issue: string;
      suggestion: string;
    }>;
  };
  grammar: {
    score: number;
    corrections: any[];
  };
  suggestions: string[];
  overallScore: number;
}

export interface RewriteRequest {
  text: string;
  style?: 'formal' | 'casual' | 'academic' | 'business';
  tone?: 'professional' | 'friendly' | 'persuasive' | 'neutral';
}

export interface RewriteResponse {
  originalText: string;
  rewrittenText: string;
  style: string;
  tone: string;
  changes: Array<{
    type: string;
    original: string;
    replacement: string;
    reason: string;
  }>;
  confidence: number;
}

export interface QuizGenerationRequest {
  content: string;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: string[];
}

export interface QuizGenerationResponse {
  questions: Array<{
    type: string;
    prompt: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer?: boolean | number;
    explanation: string;
    marks: number;
    difficulty: string;
  }>;
  metadata: {
    sourceContent: string;
    generatedAt: string;
    difficulty: string;
    questionCount: number;
  };
}

export interface SummarizeRequest {
  text: string;
  maxLength?: number;
  style?: 'bullet' | 'paragraph' | 'outline';
}

export interface SummarizeResponse {
  originalLength: number;
  summaryLength: number;
  summary: string;
  style: string;
  keyPoints: string[];
  confidence: number;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  alternatives: string[];
}

export interface WritingAssistantRequest {
  text: string;
  task?: 'improve' | 'expand' | 'condense' | 'formalize' | 'casualize';
  context?: string;
}

export interface WritingAssistantResponse {
  originalText: string;
  improvedText: string;
  task: string;
  context: string;
  suggestions: Array<{
    type: string;
    message: string;
    position: {
      start: number;
      end: number;
    };
    priority: string;
  }>;
  improvements: {
    clarity: number;
    coherence: number;
    vocabulary: number;
    grammar: number;
  };
  overallScore: number;
  readability: {
    level: string;
    score: number;
  };
}

export interface PronunciationGuideRequest {
  text: string;
  language?: string;
}

export interface PronunciationGuideResponse {
  text: string;
  language: string;
  pronunciation: {
    phonetic: string;
    syllables: string[];
    stress: number[];
    audioUrl: string;
  };
  words: Array<{
    word: string;
    phonetic: string;
    syllables: string[];
    stress: number;
    difficulty: string;
  }>;
  tips: string[];
}

export interface VocabularyBuilderRequest {
  text: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  count?: number;
}

export interface VocabularyBuilderResponse {
  text: string;
  level: string;
  vocabulary: Array<{
    word: string;
    definition: string;
    partOfSpeech: string;
    difficulty: string;
    example: string;
    synonyms: string[];
    antonyms: string[];
  }>;
  exercises: Array<{
    type: string;
    word: string;
    options: string[];
    correctAnswer: number;
  }>;
}

class AIService {
  // Grammar Check
  async checkGrammar(request: GrammarCheckRequest): Promise<GrammarCheckResponse> {
    const response = await api.post('/ai/grammar-check', request);
    return response.data.data;
  }

  // Speech Feedback
  async getSpeechFeedback(request: SpeechFeedbackRequest): Promise<SpeechFeedbackResponse> {
    const response = await api.post('/ai/speech-feedback', request);
    return response.data.data;
  }

  // Text Rewrite
  async rewriteText(request: RewriteRequest): Promise<RewriteResponse> {
    const response = await api.post('/ai/rewrite', request);
    return response.data.data;
  }

  // Generate Quiz
  async generateQuiz(request: QuizGenerationRequest): Promise<QuizGenerationResponse> {
    const response = await api.post('/ai/generate-quiz', request);
    return response.data.data;
  }

  // Summarize Text
  async summarizeText(request: SummarizeRequest): Promise<SummarizeResponse> {
    const response = await api.post('/ai/summarize', request);
    return response.data.data;
  }

  // Translate Text
  async translateText(request: TranslateRequest): Promise<TranslateResponse> {
    const response = await api.post('/ai/translate', request);
    return response.data.data;
  }

  // Writing Assistant
  async getWritingAssistance(request: WritingAssistantRequest): Promise<WritingAssistantResponse> {
    const response = await api.post('/ai/writing-assistant', request);
    return response.data.data;
  }

  // Pronunciation Guide
  async getPronunciationGuide(request: PronunciationGuideRequest): Promise<PronunciationGuideResponse> {
    const response = await api.post('/ai/pronunciation-guide', request);
    return response.data.data;
  }

  // Vocabulary Builder
  async buildVocabulary(request: VocabularyBuilderRequest): Promise<VocabularyBuilderResponse> {
    const response = await api.post('/ai/vocabulary-builder', request);
    return response.data.data;
  }

  // Utility method to get AI service status
  async getServiceStatus(): Promise<{ status: string; services: string[] }> {
    try {
      // This would typically check the status of various AI services
      return {
        status: 'operational',
        services: [
          'grammar-check',
          'speech-feedback',
          'text-rewrite',
          'quiz-generation',
          'text-summarization',
          'translation',
          'writing-assistant',
          'pronunciation-guide',
          'vocabulary-builder'
        ]
      };
    } catch (error) {
      throw new Error('Failed to get AI service status');
    }
  }
}

export default new AIService();





















