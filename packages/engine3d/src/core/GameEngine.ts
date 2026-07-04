import * as THREE from "three";
import { InputManager } from "../input/InputManager";

export interface GameEngineOptions {
  container: HTMLElement;
  skyColor?: string;
  ambientColor?: string;
}

export type UpdateCallback = (deltaSeconds: number, elapsedSeconds: number) => void;

/**
 * Owns the renderer, scene graph, camera, clock and the render loop.
 * Every playable game and the editor viewport is built on top of this.
 */
export class GameEngine {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly clock: THREE.Clock;
  readonly input: InputManager;

  private container: HTMLElement;
  private updateCallbacks: UpdateCallback[] = [];
  private frameHandle: number | null = null;
  private resizeObserver: ResizeObserver;

  constructor(options: GameEngineOptions) {
    this.container = options.container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.skyColor ?? "#87ceeb");
    this.scene.fog = new THREE.Fog(options.skyColor ?? "#87ceeb", 60, 220);

    this.camera = new THREE.PerspectiveCamera(70, this.aspect(), 0.1, 1000);
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resize();
    this.container.appendChild(this.renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444466, 0.9);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(options.ambientColor ?? "#ffffff", 1.1);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);

    this.clock = new THREE.Clock();
    this.input = new InputManager(this.renderer.domElement);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
  }

  private aspect(): number {
    return Math.max(this.container.clientWidth, 1) / Math.max(this.container.clientHeight, 1);
  }

  resize(): void {
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onUpdate(cb: UpdateCallback): () => void {
    this.updateCallbacks.push(cb);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter((c) => c !== cb);
    };
  }

  start(): void {
    const loop = () => {
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();
      this.input.update();
      for (const cb of this.updateCallbacks) cb(dt, elapsed);
      this.renderer.render(this.scene, this.camera);
      this.frameHandle = requestAnimationFrame(loop);
    };
    this.frameHandle = requestAnimationFrame(loop);
  }

  dispose(): void {
    if (this.frameHandle !== null) cancelAnimationFrame(this.frameHandle);
    this.resizeObserver.disconnect();
    this.input.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
