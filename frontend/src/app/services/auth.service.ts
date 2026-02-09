import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
  username?: string;
  email?: string;
}

export interface User {
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth'; // Update with real API URL
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private authState = new BehaviorSubject<boolean>(this.checkAuthStatus());
  public authenticated$ = this.authState.asObservable();

  private currentUser = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUser.asObservable();

  private http = inject(HttpClient);

  constructor() {
    // Restore session on service initialization
    this.restoreSession();
  }

  /**
   * Check if user is authenticated by checking localStorage
   */
  private checkAuthStatus(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Restore session on page refresh
   */
  private restoreSession(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUser.next(user);
      this.authState.next(true);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.checkAuthStatus();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Login user with credentials
   * TODO: Replace with actual API call when backend is ready
   */
  login(username: string, password: string): Observable<AuthResponse> {
    // Mock delay to simulate API call
    return new Observable(observer => {
      setTimeout(() => {
        if (username && password && password.length >= 6) {
          const token = 'mock-token-' + Date.now();
          const user: User = { username, email: `${username}@example.com`, token };

          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));

          this.currentUser.next(user);
          this.authState.next(true);

          observer.next({ success: true, token, username });
          observer.complete();
        } else {
          observer.error({
            error: 'Invalid username or password'
          });
        }
      }, 1000);
    });
  }

  /**
   * Register new user
   * TODO: Replace with actual API call when backend is ready
   */
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        if (username && email && password && password.length >= 6) {
          const token = 'mock-token-' + Date.now();
          const user: User = { username, email, token };

          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));

          this.currentUser.next(user);
          this.authState.next(true);

          observer.next({ success: true, token, username, email });
          observer.complete();
        } else {
          observer.error({
            error: 'Registration failed. Please check your input.'
          });
        }
      }, 1000);
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.next(null);
    this.authState.next(false);
  }

  /**
   * Request password recovery
   * TODO: Replace with actual API call when backend is ready
   */
  requestPasswordRecovery(usernameOrEmail: string): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        if (usernameOrEmail) {
          observer.next({
            success: true,
            message: 'Password recovery email sent. Please check your inbox.'
          });
          observer.complete();
        } else {
          observer.error({
            error: 'Invalid username or email'
          });
        }
      }, 1000);
    });
  }

  /**
   * Reset password with token
   * TODO: Replace with actual API call when backend is ready
   */
  resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        if (token && newPassword && newPassword.length >= 6) {
          observer.next({
            success: true,
            message: 'Password reset successfully. Please login with your new password.'
          });
          observer.complete();
        } else {
          observer.error({
            error: 'Invalid token or password'
          });
        }
      }, 1000);
    });
  }

  /**
   * Verify token (useful for route guards)
   */
  verifyToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    // TODO: Call backend API to verify token
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status) {
      // Server-side error
      errorMessage = error.error?.message || `Error: ${error.status} ${error.statusText}`;
    }

    return throwError(() => ({ error: errorMessage }));
  }
}
