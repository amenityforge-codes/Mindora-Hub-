import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface ProgressState {
  userProgress: any[];
  currentModuleProgress: any | null;
  summary: any[];
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
const initialState: ProgressState = {
  userProgress: [],
  currentModuleProgress: null,
  summary: [],
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
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (params?: {
    status?: string;
    limit?: number;
    page?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.getProgress(params);
      
      if (response.success) {
        return {
          progress: response.data.progress,
          summary: response.data.summary,
          pagination: response.data.pagination,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const fetchModuleProgress = createAsyncThunk(
  'progress/fetchModuleProgress',
  async (moduleId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getModuleProgress(moduleId);
      
      if (response.success) {
        return response.data.progress;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module progress');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async ({ moduleId, step, percentage, timeSpent = 0 }: {
    moduleId: string;
    step: number;
    percentage: number;
    timeSpent?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProgress(moduleId, step, percentage, timeSpent);
      
      if (response.success) {
        return response.data.progress;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'progress/submitQuiz',
  async ({ moduleId, answers, timeSpent }: {
    moduleId: string;
    answers: any[];
    timeSpent: number;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitQuiz(moduleId, answers, timeSpent);
      
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz');
    }
  }
);

export const addBookmark = createAsyncThunk(
  'progress/addBookmark',
  async ({ moduleId, step, timestamp, note }: {
    moduleId: string;
    step: number;
    timestamp?: number;
    note?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.addBookmark(moduleId, step, timestamp, note);
      
      if (response.success) {
        return response.data.bookmark;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add bookmark');
    }
  }
);

export const addNote = createAsyncThunk(
  'progress/addNote',
  async ({ moduleId, step, content }: {
    moduleId: string;
    step: number;
    content: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.addNote(moduleId, step, content);
      
      if (response.success) {
        return response.data.note;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'progress/submitFeedback',
  async ({ moduleId, rating, comment, helpful, difficulty }: {
    moduleId: string;
    rating: number;
    comment?: string;
    helpful?: boolean;
    difficulty?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitFeedback(moduleId, rating, comment, helpful, difficulty);
      
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const endSession = createAsyncThunk(
  'progress/endSession',
  async (moduleId?: string, { rejectWithValue }) => {
    try {
      const response = await apiService.endSession(moduleId);
      
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end session');
    }
  }
);

// Progress slice
const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentModuleProgress: (state) => {
      state.currentModuleProgress = null;
    },
    updateLocalProgress: (state, action: PayloadAction<{ moduleId: string; progress: any }>) => {
      const { moduleId, progress } = action.payload;
      
      // Update in user progress array
      const progressIndex = state.userProgress.findIndex(p => p.moduleId._id === moduleId);
      if (progressIndex !== -1) {
        state.userProgress[progressIndex] = { ...state.userProgress[progressIndex], ...progress };
      }
      
      // Update current module progress if it matches
      if (state.currentModuleProgress?.moduleId._id === moduleId) {
        state.currentModuleProgress = { ...state.currentModuleProgress, ...progress };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Progress
      .addCase(fetchProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProgress = action.payload.progress;
        state.summary = action.payload.summary;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Module Progress
      .addCase(fetchModuleProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModuleProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchModuleProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Progress
      .addCase(updateProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add Bookmark
      .addCase(addBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add Note
      .addCase(addNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Submit Feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // End Session
      .addCase(endSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(endSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentModuleProgress,
  updateLocalProgress,
} = progressSlice.actions;

export default progressSlice.reducer;


