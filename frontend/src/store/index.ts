import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import contentSlice from './slices/contentSlice';
import progressSlice from './slices/progressSlice';
import notificationSlice from './slices/notificationSlice';
import aiSlice from './slices/aiSlice';
import leaderboardSlice from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    content: contentSlice,
    progress: progressSlice,
    notifications: notificationSlice,
    ai: aiSlice,
    leaderboard: leaderboardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
