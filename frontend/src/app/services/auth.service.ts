import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'supervisor' | 'worker';
  lastLogin?: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          if (res.success) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }
}
