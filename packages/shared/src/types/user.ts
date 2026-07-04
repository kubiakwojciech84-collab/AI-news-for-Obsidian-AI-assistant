export enum UserRole {
  PLAYER = "player",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

export interface AvatarConfig {
  bodyColor: string;
  headColor: string;
  hatId: string | null;
  shirtId: string | null;
  pantsId: string | null;
  faceId: string | null;
  accessoryIds: string[];
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  role: UserRole;
  avatar: AvatarConfig;
  coins: number;
  level: number;
  xp: number;
  createdAt: string;
  banned: boolean;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  bodyColor: "#2e86de",
  headColor: "#ffcd94",
  hatId: null,
  shirtId: null,
  pantsId: null,
  faceId: null,
  accessoryIds: [],
};
