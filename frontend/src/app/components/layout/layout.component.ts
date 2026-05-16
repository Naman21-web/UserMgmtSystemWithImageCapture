import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="11" height="11" rx="3" fill="currentColor"/>
                <rect x="15" y="2" width="11" height="11" rx="3" fill="currentColor" opacity="0.5"/>
                <rect x="2" y="15" width="11" height="11" rx="3" fill="currentColor" opacity="0.5"/>
                <rect x="15" y="15" width="11" height="11" rx="3" fill="currentColor"/>
              </svg>
            </div>
            <span class="brand-name" *ngIf="!sidebarCollapsed">UserVault</span>
          </div>
          <button class="collapse-btn" (click)="sidebarCollapsed = !sidebarCollapsed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Dashboard</span>
          </a>

          <a routerLink="/capture" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Capture</span>
          </a>

          <a routerLink="/gallery" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Gallery</span>
          </a>

          <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">User Management</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/profile" class="nav-item user-item">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-info" *ngIf="!sidebarCollapsed">
              <div class="user-name">{{ currentUser?.username }}</div>
              <div class="user-role">
                <span class="badge" [ngClass]="'badge-' + currentUser?.role">{{ currentUser?.role }}</span>
              </div>
            </div>
          </a>

          <button class="nav-item logout-btn" (click)="logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span *ngIf="!sidebarCollapsed">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <ng-content></ng-content>
      </main>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast"
        [ngClass]="'toast-' + toast.type"
      >
        <svg *ngIf="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg *ngIf="toast.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <svg *ngIf="toast.type === 'info'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.message }}
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 240px;
      min-height: 100vh;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      transition: width var(--transition);
      flex-shrink: 0;
      z-index: 100;
    }

    .sidebar.collapsed { width: 68px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .brand-icon {
      width: 36px; height: 36px;
      background: var(--accent-primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .brand-name {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .collapse-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      flex-shrink: 0;
      transition: all var(--transition);
    }
    .collapse-btn:hover { color: var(--text-primary); background: var(--bg-card); }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all var(--transition);
      white-space: nowrap;
      overflow: hidden;
      background: none;
      border: none;
      width: 100%;
      cursor: pointer;
      text-align: left;
    }

    .nav-item:hover, .nav-item.active {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .nav-item.active {
      color: var(--accent-primary);
      background: rgba(124, 106, 247, 0.1);
    }

    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-avatar {
      width: 32px; height: 32px;
      background: var(--accent-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      color: white;
      flex-shrink: 0;
    }

    .user-info { overflow: hidden; }
    .user-name { font-size: 0.875rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { margin-top: 2px; }

    .logout-btn { color: var(--accent-danger) !important; }
    .logout-btn:hover { background: rgba(247, 90, 90, 0.1) !important; }

    .main-content {
      flex: 1;
      overflow: auto;
      background: var(--bg-primary);
    }
  `],
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = false;
  currentUser: User | null = null;
  toasts: Toast[] = [];

  constructor(
    private auth: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => (this.currentUser = u));
    this.toastService.toasts$.subscribe((t) => (this.toasts = t));
  }

  get isAdmin(): boolean { return this.auth.hasRole('admin'); }
  get userInitial(): string {
    return (this.currentUser?.username || 'U').charAt(0).toUpperCase();
  }

  logout(): void { this.auth.logout(); }
}
