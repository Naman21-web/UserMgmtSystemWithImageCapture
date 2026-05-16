import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ImageService } from '../../services/image.service';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="dashboard">
        <div class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p class="page-subtitle">{{ greeting }}, {{ currentUser?.username }}!</p>
          </div>
          <div class="header-actions">
            <a routerLink="/capture" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Capture Image
            </a>
          </div>
        </div>

        <!-- Stats grid -->
        <div class="stats-grid">
          <div class="stat-card" *ngIf="isAdmin">
            <div class="stat-icon stat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ userCount }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ imageCount }}</div>
              <div class="stat-label">{{ isAdmin || isSupervisor ? 'Total Images' : 'My Images' }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="stat-body">
              <div class="stat-value">
                <span class="badge" [ngClass]="'badge-' + currentUser?.role">{{ currentUser?.role }}</span>
              </div>
              <div class="stat-label">Your Role</div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="section-title">Quick Actions</div>
        <div class="quick-actions">
          <a routerLink="/capture" class="action-card">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">Capture Image</div>
              <div class="action-desc">Use camera to capture</div>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a routerLink="/gallery" class="action-card">
            <div class="action-icon action-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">View Gallery</div>
              <div class="action-desc">Browse captured images</div>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a *ngIf="isAdmin" routerLink="/admin" class="action-card">
            <div class="action-icon action-icon-orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">Manage Users</div>
              <div class="action-desc">Admin user controls</div>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a routerLink="/profile" class="action-card">
            <div class="action-icon action-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="action-text">
              <div class="action-title">My Profile</div>
              <div class="action-desc">Settings & password</div>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>

        <!-- Role permissions info -->
        <div class="section-title" style="margin-top:32px">Your Permissions</div>
        <div class="permissions-card card">
          <div class="perm-item" *ngFor="let perm of permissions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [style.color]="perm.allowed ? 'var(--accent-success)' : 'var(--text-muted)'">
              <polyline *ngIf="perm.allowed" points="20 6 9 17 4 12"/>
              <line *ngIf="!perm.allowed" x1="18" y1="6" x2="6" y2="18"/><line *ngIf="!perm.allowed" x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span [style.color]="perm.allowed ? 'var(--text-primary)' : 'var(--text-muted)'">{{ perm.label }}</span>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard {
      padding: 32px;
      max-width: 1100px;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .page-header h1 {
      font-size: 1.875rem;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon-purple { background: rgba(124,106,247,0.15); color: var(--accent-primary); }
    .stat-icon-green { background: rgba(45,212,164,0.15); color: var(--accent-success); }
    .stat-icon-blue { background: rgba(90,180,247,0.15); color: var(--accent-info); }

    .stat-value { font-size: 1.5rem; font-weight: 800; font-family: var(--font-display); }
    .stat-label { color: var(--text-secondary); font-size: 0.8125rem; margin-top: 2px; }

    .section-title {
      font-family: var(--font-display);
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 14px;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }

    .action-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all var(--transition);
    }

    .action-card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-accent);
      transform: translateY(-2px);
    }

    .action-icon {
      width: 44px; height: 44px;
      background: rgba(124,106,247,0.12);
      color: var(--accent-primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .action-icon-green { background: rgba(45,212,164,0.12); color: var(--accent-success); }
    .action-icon-orange { background: rgba(247,185,85,0.12); color: var(--accent-warning); }
    .action-icon-purple { background: rgba(124,106,247,0.12); color: var(--accent-primary); }

    .action-text { flex: 1; }
    .action-title { font-weight: 600; font-size: 0.9375rem; }
    .action-desc { color: var(--text-secondary); font-size: 0.8125rem; margin-top: 2px; }
    .action-arrow { color: var(--text-muted); margin-left: auto; }

    .permissions-card {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }

    .perm-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .dashboard { padding: 16px; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userCount = 0;
  imageCount = 0;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => (this.currentUser = u));

    if (this.isAdmin) {
      this.userService.getAllUsers().subscribe((res: any) => {
        this.userCount = res.count;
      });
    }

    this.imageService.getImages().subscribe((res: any) => {
      this.imageCount = res.count;
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get isAdmin(): boolean { return this.auth.hasRole('admin'); }
  get isSupervisor(): boolean { return this.auth.hasRole('supervisor'); }

  get permissions() {
    const role = this.currentUser?.role;
    return [
      { label: 'Capture images', allowed: true },
      { label: 'View own images', allowed: true },
      { label: 'View all images', allowed: role === 'admin' || role === 'supervisor' },
      { label: 'Delete any image', allowed: role === 'admin' },
      { label: 'Manage users', allowed: role === 'admin' },
      { label: 'Assign roles', allowed: role === 'admin' },
      { label: 'Deactivate accounts', allowed: role === 'admin' },
      { label: 'Reset user passwords', allowed: role === 'admin' },
    ];
  }
}
