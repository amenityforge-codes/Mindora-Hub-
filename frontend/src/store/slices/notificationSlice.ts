import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { Notification } from '../../types';

// Types
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (limit = 20, { rejectWithValue }) => {
    try {
      // This would be implemented when we have a notifications endpoint
      // For now, return empty array
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // This would be implemented when we have a notifications endpoint
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markNotificationAsClicked = createAsyncThunk(
  'notifications/markAsClicked',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // This would be implemented when we have a notifications endpoint
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as clicked');
    }
  }
);

export const dismissNotification = createAsyncThunk(
  'notifications/dismiss',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // This would be implemented when we have a notifications endpoint
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dismiss notification');
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      
      state.notifications = state.notifications.filter(n => n._id !== notificationId);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      
      if (notification && !notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount -= 1;
      }
    },
    markAsClicked: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      
      if (notification) {
        notification.clicked = true;
        notification.clickedAt = new Date().toISOString();
        
        if (!notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount -= 1;
        }
      }
    },
    dismiss: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      
      if (notification) {
        notification.dismissed = true;
        notification.dismissedAt = new Date().toISOString();
        
        if (!notification.read) {
          state.unreadCount -= 1;
        }
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount -= 1;
        }
      })
      
      // Mark as Clicked
      .addCase(markNotificationAsClicked.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        
        if (notification) {
          notification.clicked = true;
          notification.clickedAt = new Date().toISOString();
          
          if (!notification.read) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
            state.unreadCount -= 1;
          }
        }
      })
      
      // Dismiss Notification
      .addCase(dismissNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        
        if (notification) {
          notification.dismissed = true;
          notification.dismissedAt = new Date().toISOString();
          
          if (!notification.read) {
            state.unreadCount -= 1;
          }
        }
      });
  },
});

export const {
  clearError,
  addNotification,
  removeNotification,
  markAsRead,
  markAsClicked,
  dismiss,
  clearAllNotifications,
  updateUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;


