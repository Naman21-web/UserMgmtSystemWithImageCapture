import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid-lines"></div>
      </div>

      <div class="login-card">
        <div class="brand">
          <div class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="3" fill="currentColor"/>
              <rect x="15" y="2" width="11" height="11" rx="3" fill="currentColor" opacity="0.5"/>
              <rect x="2" y="15" width="11" height="11" rx="3" fill="currentColor" opacity="0.5"/>
              <rect x="15" y="15" width="11" height="11" rx="3" fill="currentColor"/>
            </svg>
          </div>
          <span class="brand-name">UserVault</span>
        </div>

        <h1 class="login-title">Welcome back</h1>
        <p class="login-subtitle">Sign in to your account to continue</p>

        <div *ngIf="error" class="alert alert-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 8a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
          {{ error }}
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="login-form">
          <div class="form-group">
            <label class="form-label">Username or Email</label>
            <input
              class="form-control"
              type="text"
              [(ngModel)]="credentials.username"
              name="username"
              placeholder="Enter your username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-wrapper">
              <input
                class="form-control"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            [disabled]="loading || !loginForm.valid"
          >
            <div class="spinner" *ngIf="loading"></div>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="login-footer">
          <p class="contact-hint">Contact your administrator if you don't have an account.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .login-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
    }

    .orb-1 {
      width: 500px; height: 500px;
      background: var(--accent-primary);
      top: -150px; left: -150px;
    }

    .orb-2 {
      width: 400px; height: 400px;
      background: #4f3ff0;
      bottom: -100px; right: -100px;
    }

    .grid-lines {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--border-subtle) 1px, transparent 1px),
        linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      background: rgba(22, 22, 31, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: 40px;
      box-shadow: var(--shadow-card), var(--shadow-glow);
      animation: slideUp 0.4s ease;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .brand-icon {
      width: 44px; height: 44px;
      background: var(--accent-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .brand-name {
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .login-subtitle {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      margin-bottom: 28px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .password-wrapper {
      position: relative;
    }

    .password-wrapper .form-control {
      padding-right: 48px;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      transition: color var(--transition);
    }
    .password-toggle:hover { color: var(--text-secondary); }

    .login-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
    }

    .contact-hint {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8125rem;
    }

    .alert { margin-bottom: 16px; }
  `],
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  loading = false;
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  onLogin(): void {
    this.error = '';
    this.loading = true;

    this.auth.login(this.credentials.username, this.credentials.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
