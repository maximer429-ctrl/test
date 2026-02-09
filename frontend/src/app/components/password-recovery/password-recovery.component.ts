import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.css'
})
export class PasswordRecoveryComponent {
  recoveryForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  successMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.recoveryForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]]
    });
  }

  get f() {
    return this.recoveryForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;
    this.successMessage = null;

    if (this.recoveryForm.invalid) {
      return;
    }

    this.loading = true;
    const { usernameOrEmail } = this.recoveryForm.value;

    this.authService.requestPasswordRecovery(usernameOrEmail).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Password recovery email has been sent. Check your inbox.';
          this.recoveryForm.reset();
          this.submitted = false;
          
          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error || 'Password recovery request failed. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}

