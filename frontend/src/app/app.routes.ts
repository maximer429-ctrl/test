import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/hello',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [loginGuard],
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'hello',
    canActivate: [authGuard],
    loadComponent: () => import('./components/hello/hello.component').then(m => m.HelloComponent)
  },
  {
    path: 'recovery',
    loadComponent: () => import('./components/password-recovery/password-recovery.component').then(m => m.PasswordRecoveryComponent)
  },
  {
    path: 'reset/:token',
    loadComponent: () => import('./components/password-reset/password-reset.component').then(m => m.PasswordResetComponent)
  },
  {
    path: '**',
    redirectTo: '/hello'
  }
];
