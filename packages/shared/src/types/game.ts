export enum GameGenre {
  OBBY = "obby",
  SURVIVAL = "survival",
  TYCOON = "tycoon",
  SHOOTER = "shooter",
  HIDE_AND_SEEK = "hide_and_seek",
  RACING = "racing",
  SANDBOX = "sandbox",
  RPG = "rpg",
  SIMULATOR = "simulator",
}

/** Status of a game's implementation, surfaced honestly in the UI. */
export enum GameStatus {
  PLAYABLE = "playable",
  PROTOTYPE = "prototype",
}

export interface GameSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  genre: GameGenre;
  status: GameStatus;
  thumbnailUrl: string;
  authorId: string;
  authorName: string;
  playCount: number;
  likeCount: number;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

/** A serialized scene produced by the editor and consumed by engine3d + game-server. */
export interface SceneNode {
  id: string;
  name: string;
  type: "group" | "box" | "sphere" | "plane" | "cylinder" | "model" | "spawn" | "checkpoint" | "light" | "trigger";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  modelUrl?: string;
  script?: string;
  physics?: {
    enabled: boolean;
    isStatic: boolean;
    shape: "box" | "sphere" | "cylinder" | "plane";
    mass: number;
  };
  metadata?: Record<string, string | number | boolean>;
  children: SceneNode[];
}

export interface GameScene {
  gameId: string;
  version: number;
  ambientLight: string;
  skyColor: string;
  gravity: [number, number, number];
  root: SceneNode;
}

export function createEmptyScene(gameId: string): GameScene {
  return {
    gameId,
    version: 1,
    ambientLight: "#ffffff",
    skyColor: "#87ceeb",
    gravity: [0, -9.81, 0],
    root: {
      id: "root",
      name: "Workspace",
      type: "group",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      children: [],
    },
  };
}
