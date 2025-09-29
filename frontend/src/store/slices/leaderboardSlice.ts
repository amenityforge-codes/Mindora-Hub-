import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface LeaderboardUser {
  userId: string;
  name: string;
  email: string;
  profilePicture: string;
  totalPoints: number;
  totalTopics: number;
  lastActivity: string;
  rank: number;
}

export interface LeaderboardState {
  leaderboard: LeaderboardUser[];
  currentUserRank: number | null;
  currentUserStats: {
    totalPoints: number;
    totalTopics: number;
    lastActivity: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  leaderboard: [],
  currentUserRank: null,
  currentUserStats: null,
  isLoading: false,
  error: null,
};

// Simple async thunk to fetch leaderboard
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🏆 Redux: Fetching leaderboard...');
      const response = await api.get('/leaderboard');
      console.log('🏆 Redux: Leaderboard response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏆 Redux: Leaderboard error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

// Async thunk to fetch current user's rank and stats with retry mechanism
export const fetchUserRank = createAsyncThunk(
  'leaderboard/fetchUserRank',
  async (userId: string, { rejectWithValue }) => {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🏆 Redux: Fetching user rank for: ${userId} (attempt ${retryCount + 1})`);
        const response = await api.get(`/leaderboard/user/${userId}`);
        console.log('🏆 Redux: User rank response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error(`🏆 Redux: User rank error (attempt ${retryCount + 1}):`, error);
        
        if (error.response?.status === 429) {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`🏆 Rate limited - retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            console.log('🏆 Rate limited - max retries reached');
            return rejectWithValue('Rate limited - please wait a moment');
          }
        }
        
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user rank');
      }
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearLeaderboard: (state) => {
      state.leaderboard = [];
      state.currentUserRank = null;
      state.currentUserStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('🏆 Redux: fetchLeaderboard.fulfilled payload:', action.payload);
        console.log('🏆 Redux: payload.data:', action.payload.data);
        console.log('🏆 Redux: payload.data.leaderboard:', action.payload.data?.leaderboard);
        console.log('🏆 Redux: payload.leaderboard:', action.payload.leaderboard);
        console.log('🏆 Redux: payload keys:', Object.keys(action.payload));
        
        // Try different possible response structures
        const leaderboardData = action.payload.data?.leaderboard || action.payload.leaderboard || action.payload || [];
        console.log('🏆 Redux: Final leaderboard data:', leaderboardData);
        
        state.leaderboard = leaderboardData;
        state.error = null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user rank
      .addCase(fetchUserRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('🏆 Redux: fetchUserRank.fulfilled payload:', action.payload);
        console.log('🏆 Redux: payload.data:', action.payload.data);
        console.log('🏆 Redux: payload.data.rank:', action.payload.data?.rank);
        console.log('🏆 Redux: payload.data.userStats:', action.payload.data?.userStats);
        console.log('🏆 Redux: payload keys:', Object.keys(action.payload));
        
        // Try different possible response structures
        const rank = action.payload.data?.rank || action.payload.rank || null;
        const userStats = action.payload.data?.userStats || action.payload.userStats || null;
        
        console.log('🏆 Redux: Final rank:', rank);
        console.log('🏆 Redux: Final userStats:', userStats);
        
        state.currentUserRank = rank;
        state.currentUserStats = userStats;
        state.error = null;
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
