import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  rawError: any = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const { username, password } = this.loginForm.value;
    console.debug('Attempting login for', username);

    this.authService.login(username, password).pipe(
      finalize(() => {
        // Always clear loading state
        this.loading = false;
      })
    ).subscribe({
      next: (response: any) => {
        console.debug('Login response:', response);
        if (response.success) {
          this.router.navigate(['/hello']);
        }
      },
      error: (err: any) => {
        this.rawError = err;
        // Handle Error objects or custom error objects
        if (err instanceof Error) {
          this.error = err.message;
        } else if (typeof err === 'object' && err.error) {
          this.error = err.error;
        } else if (typeof err === 'string') {
          this.error = err;
        } else {
          this.error = 'Login failed. Please try again.';
        }
        console.error('Login error:', err);
      }
    });
  }
}
