import axios, { AxiosInstance } from 'axios';
import { AuthTokens, AuthResponse, ApiResponse, QuizResponse, QuizzesResponse, SessionResponse, CreateSessionResponse, SessionsResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const tokens = this.getTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getTokens(): AuthTokens | null {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
  }

  private clearTokens(): void {
    localStorage.removeItem('authTokens');
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${this.client.defaults.baseURL}/auth/refresh`,
        { refreshToken: tokens.refreshToken }
      );

      const { accessToken, refreshToken } = response.data;
      this.setTokens({ accessToken, refreshToken });
      
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Auth methods
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      email,
      password,
    });
    
    this.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    this.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    
    return response.data;
  }

  async logout(): Promise<void> {
    const tokens = this.getTokens();
    if (tokens?.refreshToken) {
      try {
        await this.client.post('/auth/logout', {
          refreshToken: tokens.refreshToken,
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    this.clearTokens();
  }

  // Quiz methods
  async getQuizzes(): Promise<QuizzesResponse> {
    const response = await this.client.get<QuizzesResponse>('/quiz');
    return response.data;
  }

  async getQuiz(quizId: string): Promise<QuizResponse> {
    const response = await this.client.get<QuizResponse>(`/quiz/${quizId}`);
    return response.data;
  }

  async createQuiz(quizData: any): Promise<QuizResponse> {
    const response = await this.client.post<QuizResponse>('/quiz', quizData);
    return response.data;
  }

  async updateQuiz(quizId: string, quizData: any): Promise<QuizResponse> {
    const response = await this.client.put<QuizResponse>(`/quiz/${quizId}`, quizData);
    return response.data;
  }

  async deleteQuiz(quizId: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/quiz/${quizId}`);
    return response.data;
  }

  // Session methods
  async getSessions(): Promise<SessionsResponse> {
    const response = await this.client.get<SessionsResponse>('/session');
    return response.data;
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await this.client.get<SessionResponse>(`/session/${sessionId}`);
    return response.data;
  }

  async createSession(quizId: string): Promise<CreateSessionResponse> {
    const response = await this.client.post<CreateSessionResponse>('/session', { quizId });
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!(tokens?.accessToken);
  }

  getAuthHeaders(): Record<string, string> {
    const tokens = this.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  }
}

export const apiClient = new ApiClient();
