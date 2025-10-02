import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import aiService, {
  GrammarCheckRequest,
  GrammarCheckResponse,
  SpeechFeedbackRequest,
  SpeechFeedbackResponse,
  RewriteRequest,
  RewriteResponse,
  SummarizeRequest,
  SummarizeResponse,
  TranslateRequest,
  TranslateResponse,
  WritingAssistantRequest,
  WritingAssistantResponse,
  PronunciationGuideRequest,
  PronunciationGuideResponse,
  VocabularyBuilderRequest,
  VocabularyBuilderResponse,
} from '../../services/aiService';

interface AIState {
  // Grammar Check
  grammarCheck: {
    result: GrammarCheckResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Speech Feedback
  speechFeedback: {
    result: SpeechFeedbackResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Text Rewrite
  textRewrite: {
    result: RewriteResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Text Summarization
  textSummarization: {
    result: SummarizeResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Translation
  translation: {
    result: TranslateResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Writing Assistant
  writingAssistant: {
    result: WritingAssistantResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Pronunciation Guide
  pronunciationGuide: {
    result: PronunciationGuideResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Vocabulary Builder
  vocabularyBuilder: {
    result: VocabularyBuilderResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Service Status
  serviceStatus: {
    status: string;
    services: string[];
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: AIState = {
  grammarCheck: {
    result: null,
    isLoading: false,
    error: null,
  },
  speechFeedback: {
    result: null,
    isLoading: false,
    error: null,
  },
  textRewrite: {
    result: null,
    isLoading: false,
    error: null,
  },
  textSummarization: {
    result: null,
    isLoading: false,
    error: null,
  },
  translation: {
    result: null,
    isLoading: false,
    error: null,
  },
  writingAssistant: {
    result: null,
    isLoading: false,
    error: null,
  },
  pronunciationGuide: {
    result: null,
    isLoading: false,
    error: null,
  },
  vocabularyBuilder: {
    result: null,
    isLoading: false,
    error: null,
  },
  serviceStatus: {
    status: 'unknown',
    services: [],
    isLoading: false,
    error: null,
  },
};

// Async thunks
export const checkGrammar = createAsyncThunk(
  'ai/checkGrammar',
  async (request: GrammarCheckRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.checkGrammar(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check grammar');
    }
  }
);

export const getSpeechFeedback = createAsyncThunk(
  'ai/getSpeechFeedback',
  async (request: SpeechFeedbackRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.getSpeechFeedback(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get speech feedback');
    }
  }
);

export const rewriteText = createAsyncThunk(
  'ai/rewriteText',
  async (request: RewriteRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.rewriteText(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rewrite text');
    }
  }
);

export const summarizeText = createAsyncThunk(
  'ai/summarizeText',
  async (request: SummarizeRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.summarizeText(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to summarize text');
    }
  }
);

export const translateText = createAsyncThunk(
  'ai/translateText',
  async (request: TranslateRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.translateText(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to translate text');
    }
  }
);

export const getWritingAssistance = createAsyncThunk(
  'ai/getWritingAssistance',
  async (request: WritingAssistantRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.getWritingAssistance(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get writing assistance');
    }
  }
);

export const getPronunciationGuide = createAsyncThunk(
  'ai/getPronunciationGuide',
  async (request: PronunciationGuideRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.getPronunciationGuide(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get pronunciation guide');
    }
  }
);

export const buildVocabulary = createAsyncThunk(
  'ai/buildVocabulary',
  async (request: VocabularyBuilderRequest, { rejectWithValue }) => {
    try {
      const response = await aiService.buildVocabulary(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to build vocabulary');
    }
  }
);

export const getServiceStatus = createAsyncThunk(
  'ai/getServiceStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiService.getServiceStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get service status');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearGrammarCheck: (state) => {
      state.grammarCheck = initialState.grammarCheck;
    },
    clearSpeechFeedback: (state) => {
      state.speechFeedback = initialState.speechFeedback;
    },
    clearTextRewrite: (state) => {
      state.textRewrite = initialState.textRewrite;
    },
    clearTextSummarization: (state) => {
      state.textSummarization = initialState.textSummarization;
    },
    clearTranslation: (state) => {
      state.translation = initialState.translation;
    },
    clearWritingAssistant: (state) => {
      state.writingAssistant = initialState.writingAssistant;
    },
    clearPronunciationGuide: (state) => {
      state.pronunciationGuide = initialState.pronunciationGuide;
    },
    clearVocabularyBuilder: (state) => {
      state.vocabularyBuilder = initialState.vocabularyBuilder;
    },
    clearAllAIResults: (state) => {
      state.grammarCheck = initialState.grammarCheck;
      state.speechFeedback = initialState.speechFeedback;
      state.textRewrite = initialState.textRewrite;
      state.textSummarization = initialState.textSummarization;
      state.translation = initialState.translation;
      state.writingAssistant = initialState.writingAssistant;
      state.pronunciationGuide = initialState.pronunciationGuide;
      state.vocabularyBuilder = initialState.vocabularyBuilder;
    },
  },
  extraReducers: (builder) => {
    // Grammar Check
    builder
      .addCase(checkGrammar.pending, (state) => {
        state.grammarCheck.isLoading = true;
        state.grammarCheck.error = null;
      })
      .addCase(checkGrammar.fulfilled, (state, action: PayloadAction<GrammarCheckResponse>) => {
        state.grammarCheck.isLoading = false;
        state.grammarCheck.result = action.payload;
      })
      .addCase(checkGrammar.rejected, (state, action) => {
        state.grammarCheck.isLoading = false;
        state.grammarCheck.error = action.payload as string;
      });

    // Speech Feedback
    builder
      .addCase(getSpeechFeedback.pending, (state) => {
        state.speechFeedback.isLoading = true;
        state.speechFeedback.error = null;
      })
      .addCase(getSpeechFeedback.fulfilled, (state, action: PayloadAction<SpeechFeedbackResponse>) => {
        state.speechFeedback.isLoading = false;
        state.speechFeedback.result = action.payload;
      })
      .addCase(getSpeechFeedback.rejected, (state, action) => {
        state.speechFeedback.isLoading = false;
        state.speechFeedback.error = action.payload as string;
      });

    // Text Rewrite
    builder
      .addCase(rewriteText.pending, (state) => {
        state.textRewrite.isLoading = true;
        state.textRewrite.error = null;
      })
      .addCase(rewriteText.fulfilled, (state, action: PayloadAction<RewriteResponse>) => {
        state.textRewrite.isLoading = false;
        state.textRewrite.result = action.payload;
      })
      .addCase(rewriteText.rejected, (state, action) => {
        state.textRewrite.isLoading = false;
        state.textRewrite.error = action.payload as string;
      });

    // Text Summarization
    builder
      .addCase(summarizeText.pending, (state) => {
        state.textSummarization.isLoading = true;
        state.textSummarization.error = null;
      })
      .addCase(summarizeText.fulfilled, (state, action: PayloadAction<SummarizeResponse>) => {
        state.textSummarization.isLoading = false;
        state.textSummarization.result = action.payload;
      })
      .addCase(summarizeText.rejected, (state, action) => {
        state.textSummarization.isLoading = false;
        state.textSummarization.error = action.payload as string;
      });

    // Translation
    builder
      .addCase(translateText.pending, (state) => {
        state.translation.isLoading = true;
        state.translation.error = null;
      })
      .addCase(translateText.fulfilled, (state, action: PayloadAction<TranslateResponse>) => {
        state.translation.isLoading = false;
        state.translation.result = action.payload;
      })
      .addCase(translateText.rejected, (state, action) => {
        state.translation.isLoading = false;
        state.translation.error = action.payload as string;
      });

    // Writing Assistant
    builder
      .addCase(getWritingAssistance.pending, (state) => {
        state.writingAssistant.isLoading = true;
        state.writingAssistant.error = null;
      })
      .addCase(getWritingAssistance.fulfilled, (state, action: PayloadAction<WritingAssistantResponse>) => {
        state.writingAssistant.isLoading = false;
        state.writingAssistant.result = action.payload;
      })
      .addCase(getWritingAssistance.rejected, (state, action) => {
        state.writingAssistant.isLoading = false;
        state.writingAssistant.error = action.payload as string;
      });

    // Pronunciation Guide
    builder
      .addCase(getPronunciationGuide.pending, (state) => {
        state.pronunciationGuide.isLoading = true;
        state.pronunciationGuide.error = null;
      })
      .addCase(getPronunciationGuide.fulfilled, (state, action: PayloadAction<PronunciationGuideResponse>) => {
        state.pronunciationGuide.isLoading = false;
        state.pronunciationGuide.result = action.payload;
      })
      .addCase(getPronunciationGuide.rejected, (state, action) => {
        state.pronunciationGuide.isLoading = false;
        state.pronunciationGuide.error = action.payload as string;
      });

    // Vocabulary Builder
    builder
      .addCase(buildVocabulary.pending, (state) => {
        state.vocabularyBuilder.isLoading = true;
        state.vocabularyBuilder.error = null;
      })
      .addCase(buildVocabulary.fulfilled, (state, action: PayloadAction<VocabularyBuilderResponse>) => {
        state.vocabularyBuilder.isLoading = false;
        state.vocabularyBuilder.result = action.payload;
      })
      .addCase(buildVocabulary.rejected, (state, action) => {
        state.vocabularyBuilder.isLoading = false;
        state.vocabularyBuilder.error = action.payload as string;
      });

    // Service Status
    builder
      .addCase(getServiceStatus.pending, (state) => {
        state.serviceStatus.isLoading = true;
        state.serviceStatus.error = null;
      })
      .addCase(getServiceStatus.fulfilled, (state, action) => {
        state.serviceStatus.isLoading = false;
        state.serviceStatus.status = action.payload.status;
        state.serviceStatus.services = action.payload.services;
      })
      .addCase(getServiceStatus.rejected, (state, action) => {
        state.serviceStatus.isLoading = false;
        state.serviceStatus.error = action.payload as string;
      });
  },
});

export const {
  clearGrammarCheck,
  clearSpeechFeedback,
  clearTextRewrite,
  clearTextSummarization,
  clearTranslation,
  clearWritingAssistant,
  clearPronunciationGuide,
  clearVocabularyBuilder,
  clearAllAIResults,
} = aiSlice.actions;

export default aiSlice.reducer;





















