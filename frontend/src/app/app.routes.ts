import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'capture',
    loadComponent: () =>
      import('./components/capture/capture.component').then((m) => m.CaptureComponent),
    canActivate: [authGuard],
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./components/gallery/gallery.component').then((m) => m.GalleryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
