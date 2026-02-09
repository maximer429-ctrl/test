import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  successMessage: string | null = null;
  invalidToken = false;
  token: string | null = null;
  passwordStrength = 0;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      this.invalidToken = true;
    }
  }

  get f() {
    return this.resetForm.controls;
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
    const password = this.resetForm.get('password')?.value;
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
    this.successMessage = null;

    if (this.resetForm.invalid || !this.token) {
      return;
    }

    this.loading = true;
    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Password reset successfully. Redirecting to login...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error || 'Password reset failed. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}

