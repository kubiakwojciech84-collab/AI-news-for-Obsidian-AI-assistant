export const JWT_ACCESS_TOKEN_EXPIRY = "2h";

export const STARTING_COINS = 500;

export const XP_PER_LEVEL = 1000;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export const DEFAULT_PAGE_SIZE = 20;
