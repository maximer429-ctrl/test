import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, timer } from 'rxjs';
import { tap, catchError, delay, switchMap } from 'rxjs/operators';
import { MockUserDatabaseService } from './mock-user-database.service';

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
  private mockUserDb = inject(MockUserDatabaseService);

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
    // Validate against mock database synchronously
    const validation = this.mockUserDb.validateCredentials(username, password);

    if (validation.success && validation.user) {
      const token = 'mock-token-' + Date.now();
      const user: User = {
        username: validation.user.username,
        email: validation.user.email,
        token
      };

      // Persist session synchronously, then emit response after a short delay
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUser.next(user);
      this.authState.next(true);

      return of({ success: true, token, username }).pipe(delay(1000));
    }

    // Emit error after delay so subscribers see it consistently
    return timer(1000).pipe(switchMap(() => throwError(() => new Error('Invalid username or password'))));
  }

  /**
   * Register new user
   * TODO: Replace with actual API call when backend is ready
   */
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const result = this.mockUserDb.registerUser(username, email, password);

    if (result.success) {
      const token = 'mock-token-' + Date.now();
      const user: User = { username, email, token };

      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));

      this.currentUser.next(user);
      this.authState.next(true);

      return of({ success: true, token, username, email }).pipe(delay(1000));
    }

    return timer(1000).pipe(switchMap(() => throwError(() => new Error(result.error || 'Registration failed'))));
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
    if (usernameOrEmail) {
      return of({ success: true, message: 'Password recovery email sent. Please check your inbox.' }).pipe(delay(1000));
    }

    return timer(1000).pipe(switchMap(() => throwError(() => new Error('Invalid username or email'))));
  }

  /**
   * Reset password with token
   * TODO: Replace with actual API call when backend is ready
   */
  resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
    if (token && newPassword && newPassword.length >= 6) {
      return of({ success: true, message: 'Password reset successfully. Please login with your new password.' }).pipe(delay(1000));
    }

    return timer(1000).pipe(switchMap(() => throwError(() => new Error('Invalid token or password'))));
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
