import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  passwordStrength = 0;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.registerForm.controls;
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  /**
   * Calculate password strength (0-4)
   */
  calculatePasswordStrength(password: string): void {
    let strength = 0;
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    this.passwordStrength = strength;
  }

  onPasswordChange(): void {
    const password = this.registerForm.get('password')?.value;
    this.calculatePasswordStrength(password);
  }

  getPasswordStrengthText(): string {
    const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return strengthTexts[this.passwordStrength] || 'Weak';
  }

  getPasswordStrengthClass(): string {
    const strengthClasses = ['strength-weak', 'strength-fair', 'strength-good', 'strength-strong', 'strength-very-strong'];
    return strengthClasses[this.passwordStrength] || 'strength-weak';
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/hello']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error || 'Registration failed. Please try again.';
      }
    });
  }
}
