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

/**
 * HTTP Interceptor for global error handling
 * - Catches and logs HTTP errors
 * - Provides user-friendly error messages
 * - Handles network errors
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse | any) => {
        let errorMessage = 'An error occurred. Please try again later.';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
          console.error('Client-side error:', errorMessage);
        } else {
          // Server-side error
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.status) {
            switch (error.status) {
              case 400:
                errorMessage = 'Bad request. Please check your input.';
                break;
              case 401:
                errorMessage = 'Unauthorized. Please login again.';
                break;
              case 403:
                errorMessage = 'Forbidden. You do not have access to this resource.';
                break;
              case 404:
                errorMessage = 'Resource not found.';
                break;
              case 409:
                errorMessage = 'Conflict. The resource already exists.';
                break;
              case 500:
                errorMessage = 'Server error. Please try again later.';
                break;
              case 503:
                errorMessage = 'Service unavailable. Please try again later.';
                break;
              default:
                errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
          }

          console.error(`Server-side error [${error.status}]:`, errorMessage);
        }

        return throwError(() => ({
          error: errorMessage,
          status: error.status,
          originalError: error
        }));
      })
    );
  }
}
