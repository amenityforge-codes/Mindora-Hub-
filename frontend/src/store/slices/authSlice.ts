import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/api';
import { User, LoginCredentials, RegisterData, AuthState } from '../../types';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['refreshToken', refreshToken],
          ['user', JSON.stringify(user)],
        ]);
        
        return { user, token, refreshToken };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['refreshToken', refreshToken],
          ['user', JSON.stringify(user)],
        ]);
        
        return { user, token, refreshToken };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const [token, refreshToken, userString] = await AsyncStorage.multiGet([
        'authToken',
        'refreshToken',
        'user',
      ]);
      
      if (token[1] && userString[1]) {
        const user = JSON.parse(userString[1]);
        return { user, token: token[1], refreshToken: refreshToken[1] };
      } else {
        // No stored user data - this is normal for fresh app
        return { user: null, token: null, refreshToken: null };
      }
    } catch (error: any) {
      return rejectWithValue('Failed to load user data');
    }
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      const response = await apiService.refreshToken(refreshToken);
      
      if (response.success) {
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Update stored tokens
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['refreshToken', newRefreshToken],
        ]);
        
        return { token, refreshToken: newRefreshToken };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        const { user } = response.data;
        
        // Update stored user data
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        return user;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear all stored auth data
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      
      // Call logout API if needed
      try {
        await apiService.logout();
      } catch (apiError) {
        // Don't fail logout if API call fails - user should still be logged out locally
        console.warn('Logout API call failed:', apiError);
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue('Logout failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUserProgress: (state, action: PayloadAction<Partial<User['progress']>>) => {
      if (state.user) {
        state.user.progress = { ...state.user.progress, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      })
      
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user && action.payload.token) {
          // User data found in storage
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
        } else {
          // No stored user data - user needs to login
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
        }
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      })
      
      // Refresh Token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
      });
  },
});

export const { clearError, setLoading, updateUserProgress } = authSlice.actions;
export default authSlice.reducer;
