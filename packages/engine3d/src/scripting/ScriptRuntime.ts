import * as THREE from "three";
import type { BuiltNode } from "../scene/SceneBuilder";

/** Surface exposed to user scripts written in the editor. Intentionally tiny and side-effect-free. */
export interface ScriptApi {
  object3D: THREE.Object3D;
  time: number;
  deltaTime: number;
  input: {
    isDown(code: string): boolean;
  };
  emit(event: string, payload?: unknown): void;
}

export type CompiledScript = {
  onStart?: (api: ScriptApi) => void;
  onUpdate?: (api: ScriptApi) => void;
};

/**
 * Compiles a user-authored script body into lifecycle hooks.
 * Scripts run in a `Function` closure (NOT a real VM sandbox) so this must only ever execute
 * scripts authored by the game's own creator inside their own client - never untrusted third-party
 * code server-side. The game-server re-implements authoritative logic natively instead of eval'ing scripts.
 */
export function compileScript(source: string): CompiledScript {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const factory = new Function(
      `"use strict";
      let onStart, onUpdate;
      ${source}
      return { onStart: typeof onStart === "function" ? onStart : undefined, onUpdate: typeof onUpdate === "function" ? onUpdate : undefined };`
    );
    return factory();
  } catch (err) {
    console.error("Script compile error", err);
    return {};
  }
}

export class ScriptInstance {
  private compiled: CompiledScript;
  private started = false;
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  constructor(private source: string, private built: BuiltNode) {
    this.compiled = compileScript(source);
  }

  on(event: string, cb: (payload: unknown) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }

  update(time: number, deltaTime: number, isDown: (code: string) => boolean): void {
    const api: ScriptApi = {
      object3D: this.built.object3D,
      time,
      deltaTime,
      input: { isDown },
      emit: (event, payload) => {
        this.listeners.get(event)?.forEach((cb) => cb(payload));
      },
    };
    if (!this.started) {
      this.compiled.onStart?.(api);
      this.started = true;
    }
    this.compiled.onUpdate?.(api);
  }
}

export const EXAMPLE_SCRIPT = `// Available: object3D, time, deltaTime, input.isDown(code), emit(name, payload)
function onUpdate(api) {
  api.object3D.rotation.y += api.deltaTime * 0.8;
}
`;
