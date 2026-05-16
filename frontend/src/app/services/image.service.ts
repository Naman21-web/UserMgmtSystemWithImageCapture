import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private apiUrl = 'http://localhost:5000/api/images';

  // Cache object URLs so we don't re-fetch the same image
  private urlCache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  uploadImage(file: File, description?: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    if (description) formData.append('description', description);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getImages(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Fetches an image as a Blob via HttpClient (carries JWT header),
   * converts it to an object URL and caches it.
   */
  getAuthenticatedImageUrl(filename: string): Observable<string> {
    if (this.urlCache.has(filename)) {
      return new Observable((observer) => {
        observer.next(this.urlCache.get(filename)!);
        observer.complete();
      });
    }

    return this.http
      .get(`${this.apiUrl}/file/${filename}`, { responseType: 'blob' })
      .pipe(
        map((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.urlCache.set(filename, objectUrl);
          return objectUrl;
        })
      );
  }

  /** Revoke all cached object URLs to free memory */
  revokeAll(): void {
    this.urlCache.forEach((url) => URL.revokeObjectURL(url));
    this.urlCache.clear();
  }

  deleteImage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
