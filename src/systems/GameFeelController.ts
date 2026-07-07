import type { EventBus } from '../infrastructure/EventBus';
import type { SpringArmCamera } from '../camera/SpringArmCamera';
import { Time } from '../core/Time';

/** Landing shake, hit stop, screen flash — game feel controller. */

export class GameFeelController {
  private flashEl: HTMLElement | null = null;
  private hitStopTimer = 0;

  constructor(events: EventBus) {
    events.on('camera:shake', ({ intensity, duration }) => {
      this.shakeCamera(intensity, duration);
    });
    events.on('player:damaged', () => {
      this.hitStop(0.05);
      this.flash('#ff000044');
    });
    events.on('enemy:defeated', () => {
      this.hitStop(0.03);
    });
    events.on('coin:collected', () => {
      this.flash('#ffd70022', 0.05);
    });
  }

  setFlashElement(el: HTMLElement): void {
    this.flashEl = el;
  }

  setCamera(camera: SpringArmCamera): void {
    this._camera = camera;
  }

  private _camera: SpringArmCamera | null = null;

  update(dt: number): void {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      Time.scale = 0.1;
    } else if (Time.scale < 1 && Time.scale > 0) {
      Time.scale = 1;
    }
  }

  private shakeCamera(intensity: number, duration: number): void {
    this._camera?.shake(intensity, duration);
  }

  private hitStop(duration: number): void {
    this.hitStopTimer = duration;
    Time.scale = 0.05;
  }

  private flash(color: string, duration = 0.1): void {
    if (!this.flashEl) return;
    this.flashEl.style.background = color;
    this.flashEl.style.opacity = '1';
    setTimeout(() => {
      if (this.flashEl) this.flashEl.style.opacity = '0';
    }, duration * 1000);
  }
}
