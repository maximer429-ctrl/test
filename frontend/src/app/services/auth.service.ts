import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(this.checkAuthStatus());
  public authenticated$ = this.authState.asObservable();

  constructor() {}

  /**
   * Check if user is authenticated by checking localStorage
   */
  private checkAuthStatus(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.checkAuthStatus();
  }

  /**
   * Login user with credentials
   */
  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      // Mock authentication - in real app, this would call backend API
      if (username && password) {
        const token = 'mock-token-' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('username', username);
        this.authState.next(true);
        observer.next({ success: true, token });
      } else {
        observer.error({ error: 'Invalid credentials' });
      }
      observer.complete();
    });
  }

  /**
   * Register new user
   */
  register(username: string, email: string, password: string): Observable<any> {
    return new Observable(observer => {
      // Mock registration - in real app, this would call backend API
      if (username && email && password) {
        const token = 'mock-token-' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        this.authState.next(true);
        observer.next({ success: true, token });
      } else {
        observer.error({ error: 'Registration failed' });
      }
      observer.complete();
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    this.authState.next(false);
  }

  /**
   * Get current username
   */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  /**
   * Request password recovery
   */
  requestPasswordRecovery(usernameOrEmail: string): Observable<any> {
    return new Observable(observer => {
      if (usernameOrEmail) {
        observer.next({ success: true, message: 'Recovery email sent' });
      } else {
        observer.error({ error: 'Invalid username or email' });
      }
      observer.complete();
    });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return new Observable(observer => {
      if (token && newPassword) {
        observer.next({ success: true, message: 'Password reset successfully' });
      } else {
        observer.error({ error: 'Invalid token or password' });
      }
      observer.complete();
    });
  }
}
