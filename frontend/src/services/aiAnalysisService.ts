import { api } from './api';

export interface AIAnalysisRequest {
  text: string;
  type: 'grammar' | 'communication' | 'finance' | 'speaking';
  context?: string;
}

export interface AIAnalysisResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  detailedAnalysis?: {
    grammar?: {
      score: number;
      issues: string[];
      corrections: string[];
    };
    vocabulary?: {
      score: number;
      suggestions: string[];
      level: 'beginner' | 'intermediate' | 'advanced';
    };
    clarity?: {
      score: number;
      feedback: string;
    };
  };
}

class AIAnalysisService {
  async analyzeText(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      // Try to use the backend AI service first
      const response = await api.post('/ai/analyze-text', request);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.log('Backend AI service not available, using mock analysis');
    }

    // Fallback to mock analysis
    return this.mockAnalysis(request);
  }

  private mockAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    const { text, type, context } = request;
    
    // Simulate processing time
    const baseScore = 70 + Math.random() * 25;
    const score = Math.round(baseScore);

    let feedback = '';
    let strengths: string[] = [];
    let improvements: string[] = [];
    let suggestions: string[] = [];

    switch (type) {
      case 'grammar':
        feedback = this.getGrammarFeedback(score);
        strengths = this.getGrammarStrengths(score);
        improvements = this.getGrammarImprovements(score);
        suggestions = this.getGrammarSuggestions(score);
        break;
      
      case 'communication':
        feedback = this.getCommunicationFeedback(score);
        strengths = this.getCommunicationStrengths(score);
        improvements = this.getCommunicationImprovements(score);
        suggestions = this.getCommunicationSuggestions(score);
        break;
      
      case 'finance':
        feedback = this.getFinanceFeedback(score);
        strengths = this.getFinanceStrengths(score);
        improvements = this.getFinanceImprovements(score);
        suggestions = this.getFinanceSuggestions(score);
        break;
      
      case 'speaking':
        feedback = this.getSpeakingFeedback(score);
        strengths = this.getSpeakingStrengths(score);
        improvements = this.getSpeakingImprovements(score);
        suggestions = this.getSpeakingSuggestions(score);
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
          issues: this.getGrammarIssues(score),
          corrections: this.getGrammarCorrections(score)
        },
        vocabulary: {
          score: score + Math.floor(Math.random() * 10 - 5),
          suggestions: this.getVocabularySuggestions(score),
          level: this.getVocabularyLevel(score)
        },
        clarity: {
          score: score + Math.floor(Math.random() * 10 - 5),
          feedback: this.getClarityFeedback(score)
        }
      }
    };
  }

  private getGrammarFeedback(score: number): string {
    if (score >= 90) return "Excellent grammar! Your writing demonstrates advanced English proficiency.";
    if (score >= 80) return "Very good grammar with only minor errors. Well done!";
    if (score >= 70) return "Good grammar overall. A few areas need attention.";
    if (score >= 60) return "Fair grammar. Focus on the common errors mentioned below.";
    return "Grammar needs improvement. Practice the fundamental rules and structures.";
  }

  private getCommunicationFeedback(score: number): string {
    if (score >= 90) return "Outstanding communication skills! Your message is clear and professional.";
    if (score >= 80) return "Very good communication. Your message is clear and well-structured.";
    if (score >= 70) return "Good communication with room for improvement in clarity.";
    if (score >= 60) return "Fair communication. Focus on being more concise and clear.";
    return "Communication needs work. Practice organizing your thoughts and being more direct.";
  }

  private getFinanceFeedback(score: number): string {
    if (score >= 90) return "Excellent financial communication! You demonstrate strong business English skills.";
    if (score >= 80) return "Very good financial English. Professional and clear communication.";
    if (score >= 70) return "Good financial communication with some areas for improvement.";
    if (score >= 60) return "Fair financial English. Focus on using more precise terminology.";
    return "Financial communication needs improvement. Study business vocabulary and concepts.";
  }

  private getSpeakingFeedback(score: number): string {
    if (score >= 90) return "Excellent speaking skills! Clear pronunciation and natural flow.";
    if (score >= 80) return "Very good speaking. Clear and mostly natural delivery.";
    if (score >= 70) return "Good speaking with some areas for improvement.";
    if (score >= 60) return "Fair speaking skills. Focus on pronunciation and fluency.";
    return "Speaking needs improvement. Practice pronunciation and build confidence.";
  }

  private getGrammarStrengths(score: number): string[] {
    if (score >= 80) return ["Correct verb tenses", "Proper sentence structure", "Good punctuation"];
    if (score >= 60) return ["Basic sentence structure", "Some correct verb forms"];
    return ["Attempting complex sentences"];
  }

  private getCommunicationStrengths(score: number): string[] {
    if (score >= 80) return ["Clear message", "Good organization", "Professional tone"];
    if (score >= 60) return ["Attempts to be clear", "Some good structure"];
    return ["Shows effort to communicate"];
  }

  private getFinanceStrengths(score: number): string[] {
    if (score >= 80) return ["Good business vocabulary", "Professional tone", "Clear financial concepts"];
    if (score >= 60) return ["Some business terms used", "Attempts professional tone"];
    return ["Shows interest in financial topics"];
  }

  private getSpeakingStrengths(score: number): string[] {
    if (score >= 80) return ["Clear pronunciation", "Good pace", "Natural intonation"];
    if (score >= 60) return ["Some clear words", "Attempts natural speech"];
    return ["Shows effort to speak clearly"];
  }

  private getGrammarImprovements(score: number): string[] {
    if (score >= 80) return ["Minor punctuation issues", "Occasional tense errors"];
    if (score >= 60) return ["Verb tense consistency", "Sentence structure", "Punctuation"];
    return ["Basic grammar rules", "Verb forms", "Sentence construction"];
  }

  private getCommunicationImprovements(score: number): string[] {
    if (score >= 80) return ["Be more concise", "Stronger conclusions"];
    if (score >= 60) return ["Improve clarity", "Better organization", "Stronger arguments"];
    return ["Basic structure", "Clearer message", "Professional tone"];
  }

  private getFinanceImprovements(score: number): string[] {
    if (score >= 80) return ["More specific data", "Advanced terminology"];
    if (score >= 60) return ["Business vocabulary", "Professional language", "Financial concepts"];
    return ["Basic business terms", "Professional tone", "Financial knowledge"];
  }

  private getSpeakingImprovements(score: number): string[] {
    if (score >= 80) return ["Reduce hesitations", "More natural rhythm"];
    if (score >= 60) return ["Pronunciation clarity", "Speaking pace", "Confidence"];
    return ["Basic pronunciation", "Speaking practice", "Building confidence"];
  }

  private getGrammarSuggestions(score: number): string[] {
    return [
      "Practice verb tenses with exercises",
      "Read more to see correct grammar in context",
      "Use grammar checking tools",
      "Focus on one grammar rule at a time"
    ];
  }

  private getCommunicationSuggestions(score: number): string[] {
    return [
      "Practice writing clear, concise messages",
      "Study professional communication examples",
      "Focus on one main point per message",
      "Use bullet points for complex information"
    ];
  }

  private getFinanceSuggestions(score: number): string[] {
    return [
      "Study financial vocabulary and terms",
      "Read business news and reports",
      "Practice explaining financial concepts simply",
      "Learn about AI tools for financial analysis"
    ];
  }

  private getSpeakingSuggestions(score: number): string[] {
    return [
      "Practice speaking daily, even for 5 minutes",
      "Record yourself and listen back",
      "Focus on one pronunciation issue at a time",
      "Practice with native speakers or AI tools"
    ];
  }

  private getGrammarIssues(score: number): string[] {
    if (score >= 80) return ["Minor punctuation", "Occasional tense error"];
    if (score >= 60) return ["Verb tense inconsistency", "Sentence structure issues"];
    return ["Multiple grammar errors", "Basic structure problems"];
  }

  private getGrammarCorrections(score: number): string[] {
    if (score >= 80) return ["Check punctuation", "Review tense usage"];
    if (score >= 60) return ["Practice verb tenses", "Study sentence structure"];
    return ["Learn basic grammar rules", "Practice simple sentences"];
  }

  private getVocabularySuggestions(score: number): string[] {
    if (score >= 80) return ["Use more advanced vocabulary", "Try synonyms for variety"];
    if (score >= 60) return ["Expand business vocabulary", "Learn more specific terms"];
    return ["Build basic vocabulary", "Learn common business words"];
  }

  private getVocabularyLevel(score: number): 'beginner' | 'intermediate' | 'advanced' {
    if (score >= 80) return 'advanced';
    if (score >= 60) return 'intermediate';
    return 'beginner';
  }

  private getClarityFeedback(score: number): string {
    if (score >= 80) return "Very clear and easy to understand";
    if (score >= 60) return "Mostly clear with some unclear parts";
    return "Needs improvement in clarity and organization";
  }
}

export const aiAnalysisService = new AIAnalysisService();






