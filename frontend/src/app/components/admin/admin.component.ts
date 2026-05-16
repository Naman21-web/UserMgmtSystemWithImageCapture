import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="admin-page">
        <div class="page-header">
          <div>
            <h1>User Management</h1>
            <p class="page-subtitle">Create and manage user accounts</p>
          </div>
          <button class="btn btn-primary" (click)="openCreateModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New User
          </button>
        </div>

        <!-- Filters -->
        <div class="filters card">
          <div class="filter-row">
            <div class="form-group" style="flex:1; min-width:200px;">
              <label class="form-label">Search</label>
              <input class="form-control" type="text" [(ngModel)]="searchQuery" (input)="loadUsers()" placeholder="Search by name or email..."/>
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select class="form-control" [(ngModel)]="filterRole" (change)="loadUsers()">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" [(ngModel)]="filterStatus" (change)="loadUsers()">
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div *ngIf="loading" class="page-loader">
          <div class="spinner spinner-lg"></div>
        </div>

        <div *ngIf="!loading" class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-sm">{{ user.username.charAt(0).toUpperCase() }}</div>
                    <div>
                      <div class="username">{{ user.username }}</div>
                      <div *ngIf="user._id === currentUserId" class="you-badge">You</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" [ngClass]="'badge-' + user.role">{{ user.role }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="user.isActive ? 'badge-active' : 'badge-inactive'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-btns" *ngIf="user.role !== 'admin'">
                    <button class="btn btn-secondary btn-sm" (click)="openRoleModal(user)" title="Change Role">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      Role
                    </button>
                    <button
                      class="btn btn-sm"
                      [ngClass]="user.isActive ? 'btn-danger' : 'btn-success'"
                      (click)="toggleStatus(user)"
                    >
                      {{ user.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="btn btn-secondary btn-sm" (click)="openResetModal(user)" title="Reset Password">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      Reset Pwd
                    </button>
                    <button class="btn btn-danger btn-sm" (click)="deleteUser(user)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                  <span *ngIf="user.role === 'admin'" class="text-muted" style="font-size:0.8125rem;">Protected</span>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="6" class="text-center text-muted" style="padding: 40px;">
                  No users found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Create User Modal -->
        <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">Create New User</div>
              <button class="modal-close" (click)="closeModals()">×</button>
            </div>
            <div *ngIf="modalError" class="alert alert-error" style="margin-bottom:16px;">{{ modalError }}</div>
            <form (ngSubmit)="createUser()" #createForm="ngForm">
              <div style="display:flex; flex-direction:column; gap:16px;">
                <div class="form-group">
                  <label class="form-label">Username *</label>
                  <input class="form-control" type="text" [(ngModel)]="newUser.username" name="username" required minlength="3" placeholder="Enter username"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input class="form-control" type="email" [(ngModel)]="newUser.email" name="email" required placeholder="Enter email"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Password *</label>
                  <input class="form-control" type="password" [(ngModel)]="newUser.password" name="password" required minlength="6" placeholder="Min 6 characters"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Role *</label>
                  <select class="form-control" [(ngModel)]="newUser.role" name="role" required>
                    <option value="supervisor">Supervisor</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>
              </div>
              <div style="display:flex; gap:12px; margin-top:24px; justify-content:flex-end;">
                <button type="button" class="btn btn-secondary" (click)="closeModals()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="modalLoading || !createForm.valid">
                  <div class="spinner" *ngIf="modalLoading"></div>
                  {{ modalLoading ? 'Creating...' : 'Create User' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Role Modal -->
        <div class="modal-overlay" *ngIf="showRoleModal" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">Change Role — {{ selectedUser?.username }}</div>
              <button class="modal-close" (click)="closeModals()">×</button>
            </div>
            <div *ngIf="modalError" class="alert alert-error" style="margin-bottom:16px;">{{ modalError }}</div>
            <div class="form-group" style="margin-bottom:24px;">
              <label class="form-label">New Role</label>
              <select class="form-control" [(ngModel)]="newRole">
                <option value="supervisor">Supervisor</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div style="display:flex; gap:12px; justify-content:flex-end;">
              <button class="btn btn-secondary" (click)="closeModals()">Cancel</button>
              <button class="btn btn-primary" (click)="updateRole()" [disabled]="modalLoading">
                <div class="spinner" *ngIf="modalLoading"></div>
                {{ modalLoading ? 'Updating...' : 'Update Role' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Reset Password Modal -->
        <div class="modal-overlay" *ngIf="showResetModal" (click)="closeModals()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title">Reset Password — {{ selectedUser?.username }}</div>
              <button class="modal-close" (click)="closeModals()">×</button>
            </div>
            <div *ngIf="modalError" class="alert alert-error" style="margin-bottom:16px;">{{ modalError }}</div>
            <div class="form-group" style="margin-bottom:24px;">
              <label class="form-label">New Password</label>
              <input class="form-control" type="password" [(ngModel)]="newPassword" placeholder="Min 6 characters" minlength="6"/>
            </div>
            <div style="display:flex; gap:12px; justify-content:flex-end;">
              <button class="btn btn-secondary" (click)="closeModals()">Cancel</button>
              <button class="btn btn-primary" (click)="resetPassword()" [disabled]="modalLoading || newPassword.length < 6">
                <div class="spinner" *ngIf="modalLoading"></div>
                {{ modalLoading ? 'Resetting...' : 'Reset Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .admin-page { padding: 32px; }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: 4px; }
    .page-subtitle { color: var(--text-secondary); }

    .filters { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; flex-wrap: wrap; }

    .user-cell { display: flex; align-items: center; gap: 10px; }

    .user-avatar-sm {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--accent-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .username { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
    .you-badge {
      display: inline-block;
      font-size: 0.6875rem;
      background: rgba(124,106,247,0.2);
      color: var(--accent-primary);
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .action-btns { display: flex; gap: 6px; flex-wrap: wrap; }

    @media (max-width: 768px) {
      .admin-page { padding: 16px; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  loading = true;
  searchQuery = '';
  filterRole = '';
  filterStatus = '';

  showCreateModal = false;
  showRoleModal = false;
  showResetModal = false;
  selectedUser: any = null;
  modalLoading = false;
  modalError = '';

  newUser = { username: '', email: '', password: '', role: 'worker' };
  newRole = 'worker';
  newPassword = '';

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  get currentUserId(): string { return this.auth.currentUser?.id || ''; }

  loadUsers(): void {
    this.loading = true;
    const filters: any = {};
    if (this.filterRole) filters.role = this.filterRole;
    if (this.filterStatus !== '') filters.isActive = this.filterStatus === 'true';
    if (this.searchQuery) filters.search = this.searchQuery;

    this.userService.getAllUsers(filters).subscribe({
      next: (res: any) => { this.users = res.users; this.loading = false; },
      error: () => { this.toast.error('Failed to load users.'); this.loading = false; },
    });
  }

  openCreateModal(): void {
    this.newUser = { username: '', email: '', password: '', role: 'worker' };
    this.modalError = '';
    this.showCreateModal = true;
  }

  openRoleModal(user: any): void {
    this.selectedUser = user;
    this.newRole = user.role;
    this.modalError = '';
    this.showRoleModal = true;
  }

  openResetModal(user: any): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.modalError = '';
    this.showResetModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showRoleModal = false;
    this.showResetModal = false;
    this.modalError = '';
    this.selectedUser = null;
  }

  createUser(): void {
    this.modalLoading = true;
    this.modalError = '';
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.toast.success('User created successfully!');
        this.closeModals();
        this.loadUsers();
        this.modalLoading = false;
      },
      error: (err) => {
        this.modalError = err.error?.message || 'Failed to create user.';
        this.modalLoading = false;
      },
    });
  }

  updateRole(): void {
    this.modalLoading = true;
    this.userService.updateRole(this.selectedUser._id, this.newRole).subscribe({
      next: () => {
        this.toast.success('Role updated!');
        this.closeModals();
        this.loadUsers();
        this.modalLoading = false;
      },
      error: (err) => {
        this.modalError = err.error?.message || 'Failed to update role.';
        this.modalLoading = false;
      },
    });
  }

  toggleStatus(user: any): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return;
    this.userService.toggleStatus(user._id).subscribe({
      next: () => {
        this.toast.success(`User ${action}d successfully.`);
        this.loadUsers();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed.'),
    });
  }

  resetPassword(): void {
    this.modalLoading = true;
    this.userService.resetPassword(this.selectedUser._id, this.newPassword).subscribe({
      next: () => {
        this.toast.success('Password reset successfully!');
        this.closeModals();
        this.modalLoading = false;
      },
      error: (err) => {
        this.modalError = err.error?.message || 'Failed to reset password.';
        this.modalLoading = false;
      },
    });
  }

  deleteUser(user: any): void {
    if (!confirm(`Permanently delete user '${user.username}'? This cannot be undone.`)) return;
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.toast.success('User deleted.');
        this.loadUsers();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete.'),
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
