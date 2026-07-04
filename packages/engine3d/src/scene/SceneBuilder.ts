import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GameScene, SceneNode } from "@nova/shared";

export interface BuiltNode {
  node: SceneNode;
  object3D: THREE.Object3D;
}

export interface BuiltScene {
  root: THREE.Group;
  /** Flat index of every node that carries a physics body, for the physics package to consume. */
  physicsNodes: BuiltNode[];
  /** Flat index of every node that has a script attached. */
  scriptedNodes: BuiltNode[];
  spawnPoints: BuiltNode[];
  checkpoints: BuiltNode[];
  byId: Map<string, BuiltNode>;
}

const gltfLoader = new GLTFLoader();

function applyTransform(object3D: THREE.Object3D, node: SceneNode): void {
  object3D.position.set(...node.position);
  object3D.rotation.set(...node.rotation);
  object3D.scale.set(...node.scale);
  object3D.name = node.name;
  object3D.userData.nodeId = node.id;
  object3D.userData.nodeType = node.type;
}

function buildPrimitive(node: SceneNode): THREE.Object3D {
  const material = new THREE.MeshStandardMaterial({ color: node.color ?? "#889" });
  let geometry: THREE.BufferGeometry;
  switch (node.type) {
    case "box":
      geometry = new THREE.BoxGeometry(1, 1, 1);
      break;
    case "sphere":
      geometry = new THREE.SphereGeometry(0.5, 24, 16);
      break;
    case "cylinder":
      geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 20);
      break;
    case "plane":
      geometry = new THREE.PlaneGeometry(1, 1);
      material.side = THREE.DoubleSide;
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildMarker(node: SceneNode, color: number): THREE.Object3D {
  const group = new THREE.Group();
  const geo = new THREE.ConeGeometry(0.4, 0.8, 8);
  const mat = new THREE.MeshBasicMaterial({ color, wireframe: true });
  const cone = new THREE.Mesh(geo, mat);
  cone.position.y = 0.8;
  group.add(cone);
  return group;
}

/** Recursively converts editor scene JSON into a live Three.js graph, indexing physics/script/spawn nodes. */
export async function buildScene(scene: GameScene): Promise<BuiltScene> {
  const physicsNodes: BuiltNode[] = [];
  const scriptedNodes: BuiltNode[] = [];
  const spawnPoints: BuiltNode[] = [];
  const checkpoints: BuiltNode[] = [];
  const byId = new Map<string, BuiltNode>();

  async function build(node: SceneNode): Promise<THREE.Object3D> {
    let object3D: THREE.Object3D;

    switch (node.type) {
      case "group":
        object3D = new THREE.Group();
        break;
      case "box":
      case "sphere":
      case "cylinder":
      case "plane":
        object3D = buildPrimitive(node);
        break;
      case "light": {
        const light = new THREE.PointLight(node.color ?? "#ffffff", 1.2, 30);
        light.castShadow = true;
        object3D = light;
        break;
      }
      case "spawn":
        object3D = buildMarker(node, 0x00ff88);
        break;
      case "checkpoint":
        object3D = buildMarker(node, 0xffaa00);
        break;
      case "trigger":
        object3D = buildMarker(node, 0x8888ff);
        break;
      case "model":
        object3D = new THREE.Group();
        if (node.modelUrl) {
          try {
            const gltf = await gltfLoader.loadAsync(node.modelUrl);
            gltf.scene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            object3D.add(gltf.scene);
          } catch {
            object3D.add(buildPrimitive({ ...node, type: "box" }));
          }
        }
        break;
      default:
        object3D = new THREE.Group();
    }

    applyTransform(object3D, node);
    const built: BuiltNode = { node, object3D };
    byId.set(node.id, built);

    if (node.physics?.enabled) physicsNodes.push(built);
    if (node.script) scriptedNodes.push(built);
    if (node.type === "spawn") spawnPoints.push(built);
    if (node.type === "checkpoint") checkpoints.push(built);

    for (const child of node.children) {
      object3D.add(await build(child));
    }
    return object3D;
  }

  const root = (await build(scene.root)) as THREE.Group;
  return { root, physicsNodes, scriptedNodes, spawnPoints, checkpoints, byId };
}
