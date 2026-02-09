import { Injectable } from '@angular/core';

export interface MockUser {
  username: string;
  email: string;
  password: string; // In production, this would be hashed
  createdAt: Date;
}

/**
 * Mock database service for storing and validating user credentials
 * This is for development/testing only. In production, use a real backend API.
 */
@Injectable({
  providedIn: 'root'
})
export class MockUserDatabaseService {
  private readonly STORAGE_KEY = 'mock_users_db';
  private users: MockUser[] = [];

  constructor() {
    this.loadUsers();
    // Initialize with a test user for demonstration
    if (this.users.length === 0) {
      this.initializeTestUser();
    }
  }

  /**
   * Initialize with a test user for easy testing
   */
  private initializeTestUser(): void {
    this.users = [
      {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123', // Test password
        createdAt: new Date()
      }
    ];
    this.saveUsers();
  }

  /**
   * Load users from localStorage
   */
  private loadUsers(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load users from storage:', error);
      this.users = [];
    }
  }

  /**
   * Save users to localStorage
   */
  private saveUsers(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Failed to save users to storage:', error);
    }
  }

  /**
   * Register a new user
   * Returns error message if user already exists
   */
  registerUser(username: string, email: string, password: string): { success: boolean; error?: string } {
    // Validate inputs
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    if (!email || !this.isValidEmail(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    if (this.userExists(username, email)) {
      return { success: false, error: 'Username or email already registered' };
    }

    // Add new user
    this.users.push({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // In production, hash this!
      createdAt: new Date()
    });

    this.saveUsers();
    return { success: true };
  }

  /**
   * Validate user credentials
   */
  validateCredentials(username: string, password: string): { success: boolean; user?: Omit<MockUser, 'password'> } {
    const user = this.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }

    return { success: false };
  }

  /**
   * Check if username or email already exists
   */
  private userExists(username: string, email: string): boolean {
    return this.users.some(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user by username (without password)
   */
  getUserByUsername(username: string): Omit<MockUser, 'password'> | null {
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  /**
   * Clear all users (for testing)
   */
  clearAllUsers(): void {
    this.users = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get all users (for debugging - remove in production!)
   */
  getAllUsers(): Array<Omit<MockUser, 'password'>> {
    return this.users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
  }
}
