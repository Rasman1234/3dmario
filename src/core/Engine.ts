import * as THREE from 'three';
import type { GameSettings, GraphicsQuality, ShadowQuality } from '../domain/types';
import type { IDisposable } from '../domain/interfaces';
import { addDefaultLighting } from '../world/BootstrapScene';

/** Three.js engine wrapper — scene, renderer, PBR pipeline, resize handling. */

export class Engine implements IDisposable {
  readonly scene: THREE.Scene;
  readonly renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 40, 120);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const aspect = window.innerWidth / window.innerHeight;
    this._camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 500);
    this._camera.position.set(0, 8, 16);
    this._camera.lookAt(0, 2, 0);

    addDefaultLighting(this.scene);

    this.resize();
    window.addEventListener('resize', this.onResize);
  }

  get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  set camera(cam: THREE.PerspectiveCamera) {
    this._camera = cam;
  }

  applySettings(settings: GameSettings): void {
    this.applyGraphicsQuality(settings.graphicsQuality);
    this.applyShadowQuality(settings.shadowQuality);
  }

  private applyGraphicsQuality(quality: GraphicsQuality): void {
    const pixelRatio: Record<GraphicsQuality, number> = {
      low: 0.75,
      medium: 1,
      high: 1.5,
      ultra: 2,
    };
    this.renderer.setPixelRatio(Math.min(pixelRatio[quality], window.devicePixelRatio));
    this.resize();
  }

  private applyShadowQuality(quality: ShadowQuality): void {
    const mapSize: Record<ShadowQuality, number> = {
      off: 0,
      low: 512,
      medium: 1024,
      high: 2048,
    };
    this.renderer.shadowMap.enabled = quality !== 'off';
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.DirectionalLight) {
        obj.castShadow = quality !== 'off';
        if (obj.shadow) {
          obj.shadow.mapSize.setScalar(mapSize[quality]);
        }
      }
    });
  }

  getDelta(): number {
    return this.clock.getDelta();
  }

  getElapsed(): number {
    return this.clock.getElapsedTime();
  }

  render(): void {
    this.renderer.render(this.scene, this._camera);
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }

  private onResize = (): void => {
    this.resize();
  };
}
