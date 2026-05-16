import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="profile-page">
        <div class="page-header">
          <h1>My Profile</h1>
          <p class="page-subtitle">Manage your account settings</p>
        </div>

        <div class="profile-grid">
          <!-- Profile Card -->
          <div class="card profile-card">
            <div class="avatar-large">{{ userInitial }}</div>
            <div class="profile-name">{{ currentUser?.username }}</div>
            <div class="profile-email">{{ currentUser?.email }}</div>
            <span class="badge mt-4" [ngClass]="'badge-' + currentUser?.role">
              {{ currentUser?.role }}
            </span>

            <div class="profile-meta">
              <div class="meta-item">
                <span class="meta-label">Last Login</span>
                <span class="meta-value">{{ currentUser?.lastLogin ? formatDate(currentUser!.lastLogin!) : 'N/A' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Account Status</span>
                <span class="badge badge-active">Active</span>
              </div>
            </div>
          </div>

          <!-- Change Password Card -->
          <div class="card">
            <h2 class="section-heading">Change Password</h2>
            <p class="section-desc">Use a strong password with letters, numbers and symbols.</p>

            <div *ngIf="pwError" class="alert alert-error" style="margin-bottom:16px;">{{ pwError }}</div>
            <div *ngIf="pwSuccess" class="alert alert-success" style="margin-bottom:16px;">{{ pwSuccess }}</div>

            <form (ngSubmit)="changePassword()" #pwForm="ngForm" style="display:flex; flex-direction:column; gap:16px;">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <div class="password-wrapper">
                  <input
                    class="form-control"
                    [type]="showCurrentPw ? 'text' : 'password'"
                    [(ngModel)]="pwData.current"
                    name="current"
                    required
                    placeholder="Enter current password"
                  />
                  <button type="button" class="pw-toggle" (click)="showCurrentPw = !showCurrentPw">
                    <svg *ngIf="!showCurrentPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showCurrentPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">New Password</label>
                <div class="password-wrapper">
                  <input
                    class="form-control"
                    [type]="showNewPw ? 'text' : 'password'"
                    [(ngModel)]="pwData.newPw"
                    name="newPw"
                    required
                    minlength="6"
                    placeholder="At least 6 characters"
                  />
                  <button type="button" class="pw-toggle" (click)="showNewPw = !showNewPw">
                    <svg *ngIf="!showNewPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showNewPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <!-- Password strength indicator -->
                <div class="pw-strength" *ngIf="pwData.newPw">
                  <div class="strength-bar">
                    <div class="strength-fill" [style.width]="pwStrengthPct + '%'" [style.background]="pwStrengthColor"></div>
                  </div>
                  <span [style.color]="pwStrengthColor">{{ pwStrengthLabel }}</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input
                  class="form-control"
                  type="password"
                  [(ngModel)]="pwData.confirm"
                  name="confirm"
                  required
                  placeholder="Repeat new password"
                  [class.input-error]="pwData.confirm && pwData.newPw !== pwData.confirm"
                />
                <span class="error-hint" *ngIf="pwData.confirm && pwData.newPw !== pwData.confirm">
                  Passwords do not match
                </span>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="pwLoading || !pwForm.valid || pwData.newPw !== pwData.confirm"
              >
                <div class="spinner" *ngIf="pwLoading"></div>
                {{ pwLoading ? 'Updating...' : 'Update Password' }}
              </button>
            </form>
          </div>

          <!-- Role Permissions Card -->
          <div class="card permissions-info">
            <h2 class="section-heading">Role & Permissions</h2>
            <p class="section-desc">What you can do with your current role.</p>

            <div class="role-banner" [ngClass]="'role-banner-' + currentUser?.role">
              <div class="role-icon">
                <svg *ngIf="currentUser?.role === 'admin'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <svg *ngIf="currentUser?.role === 'supervisor'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                </svg>
                <svg *ngIf="currentUser?.role === 'worker'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div class="role-title">{{ currentUser?.role | titlecase }}</div>
                <div class="role-desc">{{ roleDescription }}</div>
              </div>
            </div>

            <div class="perm-list">
              <div class="perm-item" *ngFor="let perm of allPermissions">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  [style.color]="perm.allowed ? 'var(--accent-success)' : 'var(--text-muted)'">
                  <polyline *ngIf="perm.allowed" points="20 6 9 17 4 12"/>
                  <line *ngIf="!perm.allowed" x1="18" y1="6" x2="6" y2="18"/>
                  <line *ngIf="!perm.allowed" x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span [style.color]="perm.allowed ? 'var(--text-primary)' : 'var(--text-muted)'">{{ perm.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .profile-page { padding: 32px; max-width: 1000px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: 4px; }
    .page-subtitle { color: var(--text-secondary); }

    .profile-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      grid-template-rows: auto auto;
      gap: 20px;
    }

    .profile-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      grid-row: 1 / 3;
    }

    .avatar-large {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: var(--accent-primary);
      color: white;
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      box-shadow: 0 0 0 4px var(--accent-glow);
    }

    .profile-name { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
    .profile-email { color: var(--text-secondary); font-size: 0.875rem; }

    .profile-meta {
      width: 100%;
      margin-top: 16px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
    }
    .meta-label { color: var(--text-muted); }
    .meta-value { color: var(--text-primary); }

    .section-heading {
      font-size: 1.125rem;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .section-desc { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 20px; }

    .password-wrapper { position: relative; }
    .password-wrapper .form-control { padding-right: 44px; }
    .pw-toggle {
      position: absolute;
      right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--text-muted); cursor: pointer;
      display: flex; transition: color var(--transition);
    }
    .pw-toggle:hover { color: var(--text-secondary); }

    .pw-strength {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .strength-bar {
      flex: 1;
      height: 4px;
      background: var(--border-subtle);
      border-radius: 2px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .input-error { border-color: var(--accent-danger) !important; }
    .error-hint { color: var(--accent-danger); font-size: 0.75rem; margin-top: 4px; }

    /* Role banner */
    .role-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }
    .role-banner-admin { background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.2); }
    .role-banner-supervisor { background: rgba(90,180,247,0.1); border: 1px solid rgba(90,180,247,0.2); }
    .role-banner-worker { background: rgba(45,212,164,0.1); border: 1px solid rgba(45,212,164,0.2); }

    .role-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .role-title { font-weight: 700; font-size: 1rem; }
    .role-desc { color: var(--text-secondary); font-size: 0.8125rem; margin-top: 2px; }

    .perm-list { display: flex; flex-direction: column; gap: 10px; }
    .perm-item { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; }

    .permissions-info { grid-column: 2; }

    @media (max-width: 768px) {
      .profile-page { padding: 16px; }
      .profile-grid { grid-template-columns: 1fr; }
      .profile-card { grid-row: auto; }
      .permissions-info { grid-column: 1; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  pwData = { current: '', newPw: '', confirm: '' };
  pwLoading = false;
  pwError = '';
  pwSuccess = '';
  showCurrentPw = false;
  showNewPw = false;

  constructor(private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => (this.currentUser = u));
  }

  get userInitial(): string {
    return (this.currentUser?.username || 'U').charAt(0).toUpperCase();
  }

  get roleDescription(): string {
    const descs: Record<string, string> = {
      admin: 'Full system access. Can manage all users, view all images, and configure the system.',
      supervisor: 'Can view all captured images and monitor worker activity.',
      worker: 'Can capture images and view their own image gallery.',
    };
    return descs[this.currentUser?.role || 'worker'] || '';
  }

  get pwStrengthPct(): number {
    const pw = this.pwData.newPw;
    let score = 0;
    if (pw.length >= 6) score += 25;
    if (pw.length >= 10) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pw)) score += 25;
    return score;
  }

  get pwStrengthLabel(): string {
    const pct = this.pwStrengthPct;
    if (pct <= 25) return 'Weak';
    if (pct <= 50) return 'Fair';
    if (pct <= 75) return 'Good';
    return 'Strong';
  }

  get pwStrengthColor(): string {
    const pct = this.pwStrengthPct;
    if (pct <= 25) return 'var(--accent-danger)';
    if (pct <= 50) return 'var(--accent-warning)';
    if (pct <= 75) return 'var(--accent-info)';
    return 'var(--accent-success)';
  }

  get allPermissions() {
    const role = this.currentUser?.role;
    return [
      { label: 'Login to the system', allowed: true },
      { label: 'Capture images using camera', allowed: true },
      { label: 'View own images', allowed: true },
      { label: 'Delete own images', allowed: true },
      { label: 'View all users\' images', allowed: role === 'admin' || role === 'supervisor' },
      { label: 'Manage user accounts', allowed: role === 'admin' },
      { label: 'Create new users', allowed: role === 'admin' },
      { label: 'Assign roles to users', allowed: role === 'admin' },
      { label: 'Deactivate / activate users', allowed: role === 'admin' },
      { label: 'Reset user passwords', allowed: role === 'admin' },
      { label: 'Delete any image', allowed: role === 'admin' },
    ];
  }

  changePassword(): void {
    this.pwError = '';
    this.pwSuccess = '';

    if (this.pwData.newPw !== this.pwData.confirm) {
      this.pwError = 'New passwords do not match.';
      return;
    }

    this.pwLoading = true;
    this.auth.changePassword(this.pwData.current, this.pwData.newPw).subscribe({
      next: () => {
        this.pwSuccess = 'Password updated successfully!';
        this.pwData = { current: '', newPw: '', confirm: '' };
        this.pwLoading = false;
        this.toast.success('Password changed.');
      },
      error: (err) => {
        this.pwError = err.error?.message || 'Failed to update password.';
        this.pwLoading = false;
      },
    });
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
