import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor for handling authentication
 * - Adds authorization token to all API requests
 * - Handles 401 unauthorized responses
 * - Logs errors for debugging
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service
    const authToken = this.authService.getToken();

    // Clone the request and add the authorization header if token exists
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Add Content-Type header if not already present
    if (!request.headers.has('Content-Type')) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          // Clear auth state and redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
          
          return throwError(() => ({
            error: 'Your session has expired. Please login again.',
            status: 401
          }));
        }

        // Handle 403 Forbidden errors
        if (error.status === 403) {
          return throwError(() => ({
            error: 'You do not have permission to access this resource.',
            status: 403
          }));
        }

        // Handle 500 Server errors
        if (error.status >= 500) {
          return throwError(() => ({
            error: 'Server error. Please try again later.',
            status: error.status
          }));
        }

        // Pass through other errors
        return throwError(() => error);
      })
    );
  }
}
