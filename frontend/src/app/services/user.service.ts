import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIUrl } from '../../environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  // private apiUrl = 'http://localhost:5000/api/users';
  private apiUrl = APIUrl + '/api/users';

  constructor(private http: HttpClient) {
    console.log('UserService initialized with API URL:', this.apiUrl);
  }

  getAllUsers(filters?: { role?: string; search?: string; isActive?: boolean }): Observable<any> {
    let params = new HttpParams();
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.isActive !== undefined) params = params.set('isActive', String(filters.isActive));
    return this.http.get(this.apiUrl, { params });
  }

  createUser(data: { username: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/role`, { role });
  }

  toggleStatus(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/status`, {});
  }

  resetPassword(userId: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/password`, { newPassword });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
