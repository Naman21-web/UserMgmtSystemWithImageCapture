import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { ImageService } from '../../services/image.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="capture-page">
        <div class="page-header">
          <div>
            <h1>Capture Image</h1>
            <p class="page-subtitle">Use your camera to capture and save images</p>
          </div>
        </div>

        <!-- Camera area -->
        <div class="camera-container">
          <!-- Permission denied -->
          <div *ngIf="cameraError" class="camera-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <h3>Camera Access Denied</h3>
            <p>{{ cameraError }}</p>
            <button class="btn btn-primary" (click)="startCamera()">Try Again</button>
          </div>

          <!-- Video feed -->
          <video
            #videoEl
            [class.hidden]="!streamActive || capturedImage"
            autoplay
            playsinline
            muted
            class="camera-video"
          ></video>

          <!-- Captured image preview -->
          <div *ngIf="capturedImage" class="captured-preview">
            <img [src]="capturedImage" alt="Captured" class="preview-image"/>
            <div class="preview-badge">Preview</div>
          </div>

          <!-- Loading state -->
          <div *ngIf="!streamActive && !cameraError && !capturedImage" class="camera-loading">
            <div class="spinner spinner-lg"></div>
            <p>Starting camera...</p>
          </div>

          <!-- Camera overlay UI -->
          <div *ngIf="streamActive && !capturedImage" class="camera-overlay">
            <div class="viewfinder"></div>
          </div>
        </div>

        <!-- Controls -->
        <div class="capture-controls">
          <div class="controls-row">
            <!-- Camera select -->
            <div class="form-group" *ngIf="cameras.length > 1">
              <label class="form-label">Camera</label>
              <select class="form-control" [(ngModel)]="selectedCamera" (change)="switchCamera()">
                <option *ngFor="let cam of cameras" [value]="cam.deviceId">{{ cam.label || 'Camera' }}</option>
              </select>
            </div>

            <!-- Description -->
            <div class="form-group flex-1">
              <label class="form-label">Description (optional)</label>
              <input class="form-control" type="text" [(ngModel)]="description" placeholder="Add a description..."/>
            </div>
          </div>

          <div class="btn-row">
            <button
              *ngIf="!capturedImage"
              class="btn-capture"
              (click)="capturePhoto()"
              [disabled]="!streamActive"
            >
              <div class="capture-ring">
                <div class="capture-inner"></div>
              </div>
            </button>

            <ng-container *ngIf="capturedImage">
              <button class="btn btn-secondary btn-lg" (click)="retake()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Retake
              </button>
              <button class="btn btn-primary btn-lg" (click)="saveImage()" [disabled]="uploading">
                <div class="spinner" *ngIf="uploading"></div>
                <svg *ngIf="!uploading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {{ uploading ? 'Saving...' : 'Save Image' }}
              </button>
            </ng-container>
          </div>
        </div>

        <!-- Hidden canvas for capture -->
        <canvas #canvasEl class="hidden"></canvas>
      </div>
    </app-layout>
  `,
  styles: [`
    .capture-page { padding: 32px; max-width: 800px; }

    .page-header {
      margin-bottom: 28px;
    }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: 4px; }
    .page-subtitle { color: var(--text-secondary); }

    .camera-container {
      background: #000;
      border-radius: var(--radius-xl);
      overflow: hidden;
      aspect-ratio: 4/3;
      position: relative;
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .camera-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .camera-loading, .camera-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: var(--text-secondary);
      text-align: center;
      padding: 32px;
    }

    .camera-error {
      color: #ff6b6b;
    }

    .camera-error h3 { color: #fff; font-size: 1.25rem; }
    .camera-error p { color: var(--text-secondary); max-width: 300px; }

    .captured-preview {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      color: #fff;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .camera-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .viewfinder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 12px;
    }

    .viewfinder::before, .viewfinder::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      border-color: white;
      border-style: solid;
    }

    .viewfinder::before {
      top: -2px; left: -2px;
      border-width: 3px 0 0 3px;
      border-radius: 4px 0 0 0;
    }

    .viewfinder::after {
      bottom: -2px; right: -2px;
      border-width: 0 3px 3px 0;
      border-radius: 0 0 4px 0;
    }

    .capture-controls {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .controls-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .controls-row .form-group { flex: 1; min-width: 200px; }
    .flex-1 { flex: 1; }

    .btn-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .btn-capture {
      width: 72px; height: 72px;
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
      transition: transform var(--transition);
    }

    .btn-capture:hover:not(:disabled) { transform: scale(1.05); }
    .btn-capture:disabled { opacity: 0.5; cursor: not-allowed; }

    .capture-ring {
      width: 72px; height: 72px;
      border-radius: 50%;
      border: 3px solid var(--accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .capture-inner {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: var(--accent-primary);
      transition: background var(--transition);
    }

    .btn-capture:hover .capture-inner { background: var(--accent-secondary); }

    @media (max-width: 600px) {
      .capture-page { padding: 16px; }
    }
  `],
})
export class CaptureComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  streamActive = false;
  cameraError = '';
  capturedImage: string | null = null;
  cameras: MediaDeviceInfo[] = [];
  selectedCamera = '';
  description = '';
  uploading = false;
  private stream: MediaStream | null = null;

  constructor(
    private imageService: ImageService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.startCamera();
  }

  async startCamera(): Promise<void> {
    this.cameraError = '';
    this.streamActive = false;

    try {
      // Enumerate cameras first
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter((d) => d.kind === 'videoinput');
      if (this.cameras.length && !this.selectedCamera) {
        this.selectedCamera = this.cameras[0].deviceId;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: this.selectedCamera ? { ideal: this.selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      };

      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoEl.nativeElement.srcObject = this.stream;
      this.streamActive = true;
    } catch (err: any) {
      this.cameraError =
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera device found on this device.'
          : `Camera error: ${err.message}`;
    }
  }

  async switchCamera(): Promise<void> {
    await this.startCamera();
  }

  capturePhoto(): void {
    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    this.capturedImage = canvas.toDataURL('image/jpeg', 0.92);
  }

  retake(): void {
    this.capturedImage = null;
  }

  async saveImage(): Promise<void> {
    if (!this.capturedImage) return;
    this.uploading = true;

    try {
      const blob = await fetch(this.capturedImage).then((r) => r.blob());
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });

      this.imageService.uploadImage(file, this.description).subscribe({
        next: () => {
          this.toast.success('Image saved successfully!');
          this.uploading = false;
          this.router.navigate(['/gallery']);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to save image.');
          this.uploading = false;
        },
      });
    } catch {
      this.toast.error('Failed to process image.');
      this.uploading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
    }
  }
}
