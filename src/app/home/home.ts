import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  NgZone,
} from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
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
  private readonly BASE_URL = 'frames/';
  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private frames: HTMLImageElement[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private currentFrame = 0;
  private currentFrameFloat = 0;
  private targetFrame = 0;
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
    if (this.prefersReducedMotion) {
      this.isLoading.set(false);
      return;
    }

    let loadedCount = 0;
    const frameCount = this.getFrameCount();

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        loadedCount++;
        this.loadProgress.set(Math.round((loadedCount / frameCount) * 100));

        if (loadedCount === frameCount) {
          this.isLoading.set(false);
          this.initCanvas();
          this.renderFrame(0);
        }
      };

      img.onerror = () => {
        loadedCount++;
        this.loadProgress.set(Math.round((loadedCount / frameCount) * 100));
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
        this.updateTargetFrame();
      };

      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.startRenderLoop();
    });
  }

  private updateTargetFrame(): void {
    const scrollTop = window.scrollY;
    // Lowered to 8x viewport height so it scrolls through all frames faster
    const heroHeight = window.innerHeight * 8; 
    const scrollProgress = Math.min(scrollTop / heroHeight, 1);

    this.targetFrame = scrollProgress * (this.getFrameCount() - 1);
  }

  private startRenderLoop(): void {
    const render = () => {
      // Smooth interpolation (lerp) for Apple-like momentum
      // Increased from 0.08 to 0.25 to make it snappier and faster
      this.currentFrameFloat += (this.targetFrame - this.currentFrameFloat) * 0.25;
      
      const frameIndex = Math.min(
        Math.max(Math.round(this.currentFrameFloat), 0),
        this.getFrameCount() - 1
      );

      // Only draw if the integer frame actually changed, saving performance
      if (frameIndex !== this.currentFrame) {
        this.currentFrame = frameIndex;
        this.renderFrame(frameIndex);
      }

      this.animationId = requestAnimationFrame(render);
    };

    this.animationId = requestAnimationFrame(render);
  }

  private getFrameCount(): number {
    if (window.innerWidth < 640) return 80;
    if (window.innerWidth < 1024) return 120;
    return this.TOTAL_FRAMES;
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

