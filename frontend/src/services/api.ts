import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginCredentials, RegisterData, Module, Quiz, User, Notification } from '../types';

// API Configuration
// For development, try different URLs for different environments
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.18:5000/api'  // Your actual IP address for mobile
  : 'https://your-production-api.com/api';

// Fallback URLs for development - including localhost for web and IP for mobile
const FALLBACK_URLS = [
  'http://192.168.1.18:5000/api',     // Your actual IP address (primary)
  'http://localhost:5000/api',        // Local development server (web)
  'http://127.0.0.1:5000/api',        // Alternative localhost
  'http://172.19.109.137:5000/api',  // Previous IP address
  'http://172.20.10.4:5000/api',      // Previous IP address
  'http://10.0.2.2:5000/api'          // Android emulator
];

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // Reduced to 10s for faster fallback
      headers: {
        'Content-Type': 'application/json',
      },
      // Add these options for better network reliability
      withCredentials: false,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },
    });

    this.setupInterceptors();
    this.testConnection();
  }

  private async testConnection() {
    if (__DEV__) {
      try {
        // Test current connection
        await this.api.get('/health');
        console.log('✅ API connection successful');
      } catch (error) {
        console.log('❌ API connection failed, trying fallback URLs...');
        await this.tryFallbackUrls();
      }
    }
  }

  private async tryFallbackUrls() {
    for (const url of FALLBACK_URLS) {
      try {
        console.log(`🔍 Trying fallback URL: ${url}`);
        const testApi = axios.create({
          baseURL: url,
          timeout: 3000, // Reduced to 3s for faster testing
          headers: { 'Content-Type': 'application/json' }
        });
        
        await testApi.get('/health');
        console.log(`✅ Fallback URL works: ${url}`);
        
        // Update the main API instance
        this.api.defaults.baseURL = url;
        break;
      } catch (error) {
        console.log(`❌ Fallback URL failed: ${url}`);
      }
    }
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        console.log('🚀 API Base URL:', config.baseURL);
        console.log('🚀 API Full URL:', `${config.baseURL}${config.url}`);
        
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh and retries
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Log API errors for debugging
        console.error('❌ API Error Details:', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          code: error.code,
          config: {
            baseURL: originalRequest?.baseURL,
            url: originalRequest?.url,
            fullURL: `${originalRequest?.baseURL}${originalRequest?.url}`
          }
        });

        // Handle timeout and network errors with retry
        if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('Retrying request due to timeout...');
          
          // Wait 1 second before retry (reduced from 2s)
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.api(originalRequest);
        }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { token } = response.data.data;
              
              await AsyncStorage.setItem('authToken', token);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<ApiResponse> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  // User Methods
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put('/users/profile', profileData);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  }

  async getUserStats(): Promise<ApiResponse> {
    const response = await this.api.get('/users/stats');
    return response.data;
  }

  // Content Methods
  async getModules(params?: {
    ageRange?: string;
    moduleType?: string;
    difficulty?: string;
    tags?: string;
    limit?: number;
    page?: number;
    featured?: boolean;
    weekly?: boolean;
  }): Promise<ApiResponse<{ modules: Module[]; pagination: any }>> {
    const response = await this.api.get('/modules', { params });
    return response.data;
  }

  async getModule(moduleId: string): Promise<ApiResponse<{ module: Module; userProgress?: any }>> {
    const response = await this.api.get(`/modules/${moduleId}`);
    return response.data;
  }

  async getWeeklyContent(weekNumber: number, year: number, ageRange?: string): Promise<ApiResponse> {
    const response = await this.api.get(`/content/weekly/${weekNumber}/${year}`, {
      params: { ageRange }
    });
    return response.data;
  }

  async searchModules(query: string, limit = 10): Promise<ApiResponse<{ modules: Module[]; query: string; count: number }>> {
    const response = await this.api.get('/content/search', {
      params: { q: query, limit }
    });
    return response.data;
  }

  async getFeaturedModules(limit = 5): Promise<ApiResponse<{ modules: Module[] }>> {
    const response = await this.api.get('/content/featured', {
      params: { limit }
    });
    return response.data;
  }

  async getRecommendedModules(limit = 10): Promise<ApiResponse<{ modules: Module[] }>> {
    const response = await this.api.get('/content/recommended', {
      params: { limit }
    });
    return response.data;
  }

  // Progress Methods
  async getProgress(params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ progress: any[]; summary: any[]; pagination: any }>> {
    const response = await this.api.get('/progress', { params });
    return response.data;
  }

  async getModuleProgress(moduleId: string): Promise<ApiResponse<{ progress: any }>> {
    const response = await this.api.get(`/progress/${moduleId}`);
    return response.data;
  }

  async updateProgress(moduleId: string, step: number, percentage: number, timeSpent = 0): Promise<ApiResponse> {
    const response = await this.api.post('/progress', {
      moduleId,
      step,
      percentage,
      timeSpent
    });
    return response.data;
  }

  async submitQuiz(moduleId: string, answers: any[], timeSpent: number): Promise<ApiResponse> {
    const response = await this.api.post(`/progress/${moduleId}/quiz`, {
      answers,
      timeSpent
    });
    return response.data;
  }

  async addBookmark(moduleId: string, step: number, timestamp?: number, note?: string): Promise<ApiResponse> {
    const response = await this.api.post(`/progress/${moduleId}/bookmark`, {
      step,
      timestamp,
      note
    });
    return response.data;
  }

  async addNote(moduleId: string, step: number, content: string): Promise<ApiResponse> {
    const response = await this.api.post(`/progress/${moduleId}/note`, {
      step,
      content
    });
    return response.data;
  }

  async submitFeedback(moduleId: string, rating: number, comment?: string, helpful?: boolean, difficulty?: string): Promise<ApiResponse> {
    const response = await this.api.post(`/progress/${moduleId}/feedback`, {
      rating,
      comment,
      helpful,
      difficulty
    });
    return response.data;
  }

  async endSession(moduleId?: string): Promise<ApiResponse> {
    const response = await this.api.post('/progress/session/end', { moduleId });
    return response.data;
  }

  // Quiz Methods
  async getQuiz(quizId: string, mode?: 'take'): Promise<ApiResponse<{ quiz: Quiz }>> {
    const response = await this.api.get(`/quiz/${quizId}`, {
      params: { mode }
    });
    return response.data;
  }

  async submitQuizAnswers(quizId: string, answers: any[], timeSpent: number): Promise<ApiResponse> {
    const response = await this.api.post(`/quiz/${quizId}/submit`, {
      answers,
      timeSpent
    });
    return response.data;
  }

  async getQuizResults(quizId: string): Promise<ApiResponse> {
    const response = await this.api.get(`/quiz/${quizId}/results`);
    return response.data;
  }

  async getPracticeQuiz(moduleType: string, difficulty?: string, limit = 10): Promise<ApiResponse<{ quiz: Quiz }>> {
    const response = await this.api.get(`/quiz/practice/${moduleType}`, {
      params: { difficulty, limit }
    });
    return response.data;
  }

  // AI Methods
  async checkGrammar(text: string, context?: string): Promise<ApiResponse> {
    const response = await this.api.post('/ai/grammar-check', { text, context });
    return response.data;
  }

  async rewriteText(text: string, style?: string, tone?: string): Promise<ApiResponse> {
    const response = await this.api.post('/ai/rewrite', { text, style, tone });
    return response.data;
  }

  async analyzeSpeech(audioUrl: string, targetText?: string, language = 'en'): Promise<ApiResponse> {
    const response = await this.api.post('/ai/speech-feedback', {
      audioUrl,
      targetText,
      language
    });
    return response.data;
  }

  async summarizeText(text: string, maxLength = 200, style = 'paragraph'): Promise<ApiResponse> {
    const response = await this.api.post('/ai/summarize', {
      text,
      maxLength,
      style
    });
    return response.data;
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage = 'auto'): Promise<ApiResponse> {
    const response = await this.api.post('/ai/translate', {
      text,
      targetLanguage,
      sourceLanguage
    });
    return response.data;
  }

  // Admin Methods (require admin role)
  async getAdminDashboard(): Promise<ApiResponse> {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }

  async createModule(moduleData: Partial<Module>): Promise<ApiResponse<{ module: Module }>> {
    const response = await this.api.post('/admin/modules', moduleData);
    return response.data;
  }

  async createAdultModule(moduleData: Partial<Module>): Promise<ApiResponse<{ module: Module }>> {
    const response = await this.api.post('/adult-content', moduleData);
    return response.data;
  }

  async getAdultModules(params?: {
    moduleType?: string;
    difficulty?: string;
    limit?: number;
    page?: number;
    featured?: boolean;
    weekly?: boolean;
  }): Promise<ApiResponse<{ modules: Module[]; totalCount: number; page: number; limit: number; totalPages: number }>> {
    const response = await this.api.get('/adult-content', { params });
    return response.data;
  }

  async updateModule(moduleId: string, moduleData: Partial<Module>): Promise<ApiResponse<{ module: Module }>> {
    const response = await this.api.put(`/admin/modules/${moduleId}`, moduleData);
    return response.data;
  }

  async publishModule(moduleId: string): Promise<ApiResponse<{ module: Module }>> {
    const response = await this.api.post(`/admin/modules/${moduleId}/publish`);
    return response.data;
  }

  async scheduleModule(moduleId: string, publishAt: string): Promise<ApiResponse<{ module: Module }>> {
    const response = await this.api.post(`/admin/modules/${moduleId}/schedule`, { publishAt });
    return response.data;
  }

  async createWeeklyPackage(weekNumber: number, year: number, modules: string[], publishAt?: string): Promise<ApiResponse> {
    const response = await this.api.post('/admin/weekly-package', {
      weekNumber,
      year,
      modules,
      publishAt
    });
    return response.data;
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    ageRange?: string;
    search?: string;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    const response = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse> {
    const response = await this.api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  }

  async getModuleAnalytics(moduleId: string): Promise<ApiResponse> {
    const response = await this.api.get(`/admin/analytics/modules/${moduleId}`);
    return response.data;
  }

  async sendNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    targetUsers?: string[];
    targetCohort?: string;
    scheduledAt?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/admin/notifications', notificationData);
    return response.data;
  }

  // Utility Methods
  async uploadFile(file: any, type: 'image' | 'video' | 'audio' | 'document'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getHealth(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Generic GET method for any endpoint
  async get(endpoint: string, params?: any): Promise<ApiResponse> {
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }

  // Generic POST method for any endpoint
  async post(endpoint: string, data?: any): Promise<ApiResponse> {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  // Generic PUT method for any endpoint
  async put(endpoint: string, data?: any): Promise<ApiResponse> {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  // Generic DELETE method for any endpoint
  async delete(endpoint: string): Promise<ApiResponse> {
    const response = await this.api.delete(endpoint);
    return response.data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export the api instance for direct use
export const api = apiService;
