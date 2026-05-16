import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { ImageService } from '../../services/image.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

interface GalleryImage {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  description: string;
  capturedBy: any;
  createdAt: string;
  // null = still loading, 'error' = failed, string = blob object URL
  blobUrl: string | null | 'error';
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="gallery-page">
        <div class="page-header">
          <div>
            <h1>Image Gallery</h1>
            <p class="page-subtitle">
              {{ isAdminOrSupervisor ? 'All captured images' : 'Your captured images' }}
              <span class="count-badge">{{ images.length }}</span>
            </p>
          </div>
          <a routerLink="/capture" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Capture
          </a>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="page-loader">
          <div class="spinner spinner-lg"></div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && images.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h3>No images yet</h3>
          <p>Start capturing images using your camera</p>
          <a routerLink="/capture" class="btn btn-primary mt-4">Go to Capture</a>
        </div>

        <!-- Gallery grid -->
        <div *ngIf="!loading && images.length > 0" class="gallery-grid">
          <div *ngFor="let img of images" class="gallery-item" (click)="openLightbox(img)">
            <div class="img-wrapper">

              <!-- Skeleton shimmer while fetching blob -->
              <div *ngIf="img.blobUrl === null" class="img-skeleton">
                <div class="skeleton-shimmer"></div>
              </div>

              <!-- Error placeholder -->
              <div *ngIf="img.blobUrl === 'error'" class="img-error">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <span>Failed to load</span>
              </div>

              <!-- Actual image rendered from authenticated blob URL -->
              <img
                *ngIf="img.blobUrl && img.blobUrl !== 'error'"
                [src]="img.blobUrl"
                [alt]="img.description || img.originalName"
                class="gallery-img"
              />

              <div class="img-overlay" *ngIf="img.blobUrl && img.blobUrl !== 'error'">
                <div class="img-info">
                  <div class="img-name">{{ img.description || img.originalName }}</div>
                  <div class="img-meta">
                    <span *ngIf="isAdminOrSupervisor && img.capturedBy">{{ img.capturedBy.username }}</span>
                    <span>{{ formatDate(img.createdAt) }}</span>
                  </div>
                </div>
                <div class="img-actions" (click)="$event.stopPropagation()">
                  <button
                    *ngIf="canDelete(img)"
                    class="btn btn-danger btn-sm"
                    (click)="deleteImage(img)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6m4-6v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div class="img-caption">
              <div class="img-caption-text">{{ img.description || img.originalName }}</div>
              <div class="img-size">{{ formatSize(img.size) }}</div>
            </div>
          </div>
        </div>

        <!-- Lightbox -->
        <div *ngIf="lightboxImage" class="modal-overlay" (click)="closeLightbox()">
          <div class="lightbox" (click)="$event.stopPropagation()">
            <button class="modal-close lightbox-close" (click)="closeLightbox()">×</button>
            <img
              [src]="lightboxImage.blobUrl!"
              [alt]="lightboxImage.originalName"
              class="lightbox-img"
            />
            <div class="lightbox-info">
              <div class="lightbox-name">{{ lightboxImage.description || lightboxImage.originalName }}</div>
              <div class="lightbox-meta">
                <span *ngIf="isAdminOrSupervisor && lightboxImage.capturedBy">
                  By: {{ lightboxImage.capturedBy.username }} ({{ lightboxImage.capturedBy.role }})
                </span>
                <span>{{ formatDate(lightboxImage.createdAt) }}</span>
                <span>{{ formatSize(lightboxImage.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .gallery-page { padding: 32px; }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .page-header h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: 4px; }
    .page-subtitle {
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .count-badge {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 100px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 80px 24px;
      text-align: center;
    }

    .empty-icon {
      width: 80px; height: 80px;
      background: var(--bg-card);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .empty-state h3 { font-size: 1.25rem; }
    .empty-state p { color: var(--text-secondary); }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .gallery-item { cursor: pointer; }

    .img-wrapper {
      position: relative;
      aspect-ratio: 4/3;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
    }

    /* Skeleton loader */
    .img-skeleton {
      width: 100%; height: 100%;
      background: var(--bg-secondary);
      overflow: hidden;
      position: relative;
    }

    .skeleton-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,0.05) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }

    /* Error placeholder */
    .img-error {
      width: 100%; height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.75rem;
      background: var(--bg-secondary);
    }

    .gallery-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
      display: block;
    }

    .img-wrapper:hover .gallery-img { transform: scale(1.06); }

    .img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%);
      opacity: 0;
      transition: opacity var(--transition);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 14px;
    }

    .img-wrapper:hover .img-overlay { opacity: 1; }

    .img-name {
      color: #fff;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .img-meta {
      display: flex;
      gap: 8px;
      color: rgba(255,255,255,0.7);
      font-size: 0.75rem;
    }

    .img-actions { margin-top: 8px; }

    .img-caption {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 4px 0;
    }

    .img-caption-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .img-size {
      font-size: 0.75rem;
      color: var(--text-muted);
      flex-shrink: 0;
      margin-left: 8px;
    }

    /* Lightbox */
    .lightbox {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      overflow: hidden;
      animation: slideUp 0.25s ease;
    }

    .lightbox-close {
      position: absolute;
      top: 12px; right: 12px;
      z-index: 1;
      background: rgba(0,0,0,0.5) !important;
      border-radius: 50% !important;
      width: 36px; height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white !important;
    }

    .lightbox-img {
      max-height: 70vh;
      object-fit: contain;
      width: 100%;
    }

    .lightbox-info {
      padding: 16px 20px;
      border-top: 1px solid var(--border-subtle);
    }

    .lightbox-name { font-weight: 600; margin-bottom: 6px; }

    .lightbox-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    @media (max-width: 600px) {
      .gallery-page { padding: 16px; }
      .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class GalleryComponent implements OnInit, OnDestroy {
  images: GalleryImage[] = [];
  loading = true;
  lightboxImage: GalleryImage | null = null;

  constructor(
    private imageService: ImageService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  ngOnDestroy(): void {
    // Free all blob object URLs to prevent memory leaks
    this.imageService.revokeAll();
  }

  loadImages(): void {
    this.loading = true;
    this.imageService.getImages().subscribe({
      next: (res: any) => {
        this.images = res.images.map((img: any) => ({
          ...img,
          blobUrl: null, // will be populated by loadImageBlob
        }));
        this.loading = false;
        // Kick off authenticated blob fetch for every image
        this.images.forEach((img) => this.loadImageBlob(img));
      },
      error: () => {
        this.toast.error('Failed to load images.');
        this.loading = false;
      },
    });
  }

  private loadImageBlob(img: GalleryImage): void {
    this.imageService.getAuthenticatedImageUrl(img.filename).subscribe({
      next: (url) => (img.blobUrl = url),
      error: () => (img.blobUrl = 'error'),
    });
  }

  get isAdminOrSupervisor(): boolean {
    return this.auth.hasRole('admin', 'supervisor');
  }

  canDelete(img: GalleryImage): boolean {
    const user = this.auth.currentUser;
    return (
      user?.role === 'admin' ||
      img.capturedBy?._id === user?.id ||
      img.capturedBy?.id === user?.id
    );
  }

  openLightbox(img: GalleryImage): void {
    if (img.blobUrl && img.blobUrl !== 'error') {
      this.lightboxImage = img;
    }
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }

  deleteImage(img: GalleryImage): void {
    if (!confirm('Delete this image?')) return;
    this.imageService.deleteImage(img.id).subscribe({
      next: () => {
        this.images = this.images.filter((i) => i.id !== img.id);
        this.toast.success('Image deleted.');
        if (this.lightboxImage?.id === img.id) this.closeLightbox();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete.'),
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
