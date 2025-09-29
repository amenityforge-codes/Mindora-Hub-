import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { Module, ModuleFilters, Quiz } from '../../types';

// Types
interface ContentState {
  modules: Module[];
  currentModule: Module | null;
  featuredModules: Module[];
  recommendedModules: Module[];
  weeklyContent: Module[];
  searchResults: Module[];
  currentQuiz: Quiz | null;
  quizCompletionStatus: {
    isCompleted: boolean;
    userScore: number | null;
  };
  filters: ModuleFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    count: number;
    totalCount: number;
  };
}

// Initial state
const initialState: ContentState = {
  modules: [],
  currentModule: null,
  featuredModules: [],
  recommendedModules: [],
  weeklyContent: [],
  searchResults: [],
  currentQuiz: null,
  quizCompletionStatus: {
    isCompleted: false,
    userScore: null,
  },
  filters: {},
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    total: 1,
    count: 0,
    totalCount: 0,
  },
};

// Async thunks
export const fetchModules = createAsyncThunk(
  'content/fetchModules',
  async (params?: {
    ageRange?: string;
    moduleType?: string;
    difficulty?: string;
    tags?: string;
    limit?: number;
    page?: number;
    featured?: boolean;
    weekly?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.getModules(params);
      
      if (response.success) {
        return {
          modules: response.data.modules,
          pagination: response.data.pagination,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
);

export const fetchModule = createAsyncThunk(
  'content/fetchModule',
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getModule(moduleId);
      
      if (response.success) {
        return {
          module: response.data.module,
          userProgress: response.data.userProgress,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module');
    }
  }
);

export const fetchFeaturedModules = createAsyncThunk(
  'content/fetchFeaturedModules',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await apiService.getFeaturedModules(limit);
      
      if (response.success) {
        return response.data.modules;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured modules');
    }
  }
);

export const fetchRecommendedModules = createAsyncThunk(
  'content/fetchRecommendedModules',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await apiService.getRecommendedModules(limit);
      
      if (response.success) {
        return response.data.modules;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommended modules');
    }
  }
);

export const fetchWeeklyContent = createAsyncThunk(
  'content/fetchWeeklyContent',
  async ({ weekNumber, year, ageRange }: { weekNumber: number; year: number; ageRange?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getWeeklyContent(weekNumber, year, ageRange);
      
      if (response.success) {
        return response.data.modules;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly content');
    }
  }
);

export const searchModules = createAsyncThunk(
  'content/searchModules',
  async ({ query, limit = 10 }: { query: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.searchModules(query, limit);
      
      if (response.success) {
        return {
          modules: response.data.modules,
          query: response.data.query,
          count: response.data.count,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchQuiz = createAsyncThunk(
  'content/fetchQuiz',
  async ({ quizId, mode }: { quizId: string; mode?: 'take' }, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuiz(quizId, mode);
      
      if (response.success) {
        return {
          quiz: response.data.quiz,
          isCompleted: response.data.isCompleted || false,
          userScore: response.data.userScore || null
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const fetchPracticeQuiz = createAsyncThunk(
  'content/fetchPracticeQuiz',
  async ({ moduleType, difficulty, limit = 10 }: { moduleType: string; difficulty?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.getPracticeQuiz(moduleType, difficulty, limit);
      
      if (response.success) {
        return response.data.quiz;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch practice quiz');
    }
  }
);

// Content slice
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<ModuleFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentModule: (state) => {
      state.currentModule = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    updateModuleProgress: (state, action: PayloadAction<{ moduleId: string; progress: any }>) => {
      const { moduleId, progress } = action.payload;
      
      // Update in modules array
      const moduleIndex = state.modules.findIndex(m => m._id === moduleId);
      if (moduleIndex !== -1) {
        state.modules[moduleIndex].userProgress = progress;
      }
      
      // Update current module if it matches
      if (state.currentModule?._id === moduleId) {
        state.currentModule.userProgress = progress;
      }
      
      // Update in featured modules
      const featuredIndex = state.featuredModules.findIndex(m => m._id === moduleId);
      if (featuredIndex !== -1) {
        state.featuredModules[featuredIndex].userProgress = progress;
      }
      
      // Update in recommended modules
      const recommendedIndex = state.recommendedModules.findIndex(m => m._id === moduleId);
      if (recommendedIndex !== -1) {
        state.recommendedModules[recommendedIndex].userProgress = progress;
      }
      
      // Update in weekly content
      const weeklyIndex = state.weeklyContent.findIndex(m => m._id === moduleId);
      if (weeklyIndex !== -1) {
        state.weeklyContent[weeklyIndex].userProgress = progress;
      }
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(m => m._id === moduleId);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex].userProgress = progress;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Modules
      .addCase(fetchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules = action.payload.modules;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Module
      .addCase(fetchModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModule = action.payload.module;
        state.error = null;
      })
      .addCase(fetchModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Featured Modules
      .addCase(fetchFeaturedModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredModules = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Recommended Modules
      .addCase(fetchRecommendedModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendedModules = action.payload;
        state.error = null;
      })
      .addCase(fetchRecommendedModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Weekly Content
      .addCase(fetchWeeklyContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklyContent = action.payload;
        state.error = null;
      })
      .addCase(fetchWeeklyContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search Modules
      .addCase(searchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.modules;
        state.error = null;
      })
      .addCase(searchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Quiz
      .addCase(fetchQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuiz = action.payload.quiz;
        state.quizCompletionStatus = {
          isCompleted: action.payload.isCompleted,
          userScore: action.payload.userScore,
        };
        state.error = null;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Practice Quiz
      .addCase(fetchPracticeQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPracticeQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuiz = action.payload;
        state.error = null;
      })
      .addCase(fetchPracticeQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  clearSearchResults,
  clearCurrentModule,
  clearCurrentQuiz,
  updateModuleProgress,
} = contentSlice.actions;

export default contentSlice.reducer;


