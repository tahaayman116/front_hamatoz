import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  NgZone,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('frameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  categories = [
    { title: 'Zero Cars', icon: 'new_releases' },
    { title: 'Imported Cars', icon: 'public' },
    { title: 'Used Cars', icon: 'sell' },
  ];

  // Frame animation properties
  private readonly TOTAL_FRAMES = 200;
  private readonly BASE_URL =
    'https://lethgiylpcoexwhtxagu.supabase.co/storage/v1/object/public/hamatoz/';
  private frames: HTMLImageElement[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private currentFrame = 0;
  private animationId: number | null = null;
  private scrollHandler: (() => void) | null = null;
  private resizeHandler: (() => void) | null = null;

  isLoading = signal(true);
  loadProgress = signal(0);

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    this.preloadFrames();
    this.setupScrollListener();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private getFrameUrl(index: number): string {
    const paddedIndex = index.toString().padStart(3, '0');
    return `${this.BASE_URL}frame_${paddedIndex}_delay-0.04s.webp`;
  }

  private preloadFrames(): void {
    let loadedCount = 0;

    for (let i = 0; i < this.TOTAL_FRAMES; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        loadedCount++;
        this.loadProgress.set(Math.round((loadedCount / this.TOTAL_FRAMES) * 100));

        if (loadedCount === this.TOTAL_FRAMES) {
          this.isLoading.set(false);
          this.initCanvas();
          this.renderFrame(0);
        }
      };

      img.onerror = () => {
        loadedCount++;
        this.loadProgress.set(Math.round((loadedCount / this.TOTAL_FRAMES) * 100));
      };

      img.src = this.getFrameUrl(i);
      this.frames[i] = img;
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // Set canvas to fill the hero section
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Re-render current frame after resize
    if (this.frames[this.currentFrame]) {
      this.renderFrame(this.currentFrame);
    }
  }

  private setupResizeListener(): void {
    this.resizeHandler = () => {
      this.resizeCanvas();
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  private setupScrollListener(): void {
    this.ngZone.runOutsideAngular(() => {
      this.scrollHandler = () => {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }

        this.animationId = requestAnimationFrame(() => {
          this.updateFrameOnScroll();
        });
      };

      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  private updateFrameOnScroll(): void {
    // Calculate scroll progress (0 to 1) based on hero section height
    const scrollTop = window.scrollY;
    const heroHeight = window.innerHeight * 15; // Extended scroll distance to view all 200 frames smoothly
    const scrollProgress = Math.min(scrollTop / heroHeight, 1);

    // Calculate which frame to show
    const targetFrame = Math.min(
      Math.floor(scrollProgress * (this.TOTAL_FRAMES - 1)),
      this.TOTAL_FRAMES - 1
    );

    // Only render if frame changed
    if (targetFrame !== this.currentFrame) {
      this.currentFrame = targetFrame;
      this.renderFrame(targetFrame);
    }
  }

  private renderFrame(frameIndex: number): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;

    const img = this.frames[frameIndex];
    if (!img || !img.complete) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions to cover canvas (like background-size: cover)
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      // Image is taller than canvas
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    }

    // Draw image
    this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }
}

