import { apiClient } from "./client";
import type {
  AuthResponseDto,
  PublicUser,
  GameSummary,
  ShopItem,
  InventoryEntry,
  Achievement,
  UserAchievement,
  LeaderboardEntry,
  Group,
  FriendRequest,
  Friendship,
} from "@nova/shared";

export const AuthApi = {
  register: (username: string, email: string, password: string) =>
    apiClient.post<AuthResponseDto>("/auth/register", { username, email, password }).then((r) => r.data),
  login: (usernameOrEmail: string, password: string) =>
    apiClient.post<AuthResponseDto>("/auth/login", { usernameOrEmail, password }).then((r) => r.data),
};

export const UsersApi = {
  me: () => apiClient.get<PublicUser>("/users/me").then((r) => r.data),
  byUsername: (username: string) => apiClient.get<PublicUser>(`/users/${username}`).then((r) => r.data),
  updateProfile: (dto: Partial<PublicUser> & { avatar?: Partial<PublicUser["avatar"]> }) =>
    apiClient.patch<PublicUser>("/users/me", dto).then((r) => r.data),
  search: (q: string) => apiClient.get<PublicUser[]>("/users/search", { params: { q } }).then((r) => r.data),
};

export const GamesApi = {
  list: () => apiClient.get<GameSummary[]>("/games").then((r) => r.data),
  mine: () => apiClient.get<GameSummary[]>("/games/mine").then((r) => r.data),
  bySlug: (slug: string) => apiClient.get<any>(`/games/${slug}`).then((r) => r.data),
  create: (dto: { title: string; description: string; genre: string; maxPlayers: number }) =>
    apiClient.post<GameSummary>("/games", dto).then((r) => r.data),
  publish: (id: string, scene: unknown) => apiClient.post(`/games/${id}/publish`, { scene }).then((r) => r.data),
  incrementPlay: (id: string) => apiClient.post(`/games/${id}/play`).then((r) => r.data),
};

export const ShopApi = {
  items: () => apiClient.get<ShopItem[]>("/shop/items").then((r) => r.data),
  purchase: (itemId: string) => apiClient.post<InventoryEntry>(`/shop/items/${itemId}/purchase`).then((r) => r.data),
  inventory: () => apiClient.get<InventoryEntry[]>("/inventory").then((r) => r.data),
  setEquipped: (entryId: string, equipped: boolean) => apiClient.patch(`/inventory/${entryId}`, { equipped }).then((r) => r.data),
};

export const AchievementsApi = {
  all: () => apiClient.get<Achievement[]>("/achievements").then((r) => r.data),
  mine: () => apiClient.get<UserAchievement[]>("/achievements/me").then((r) => r.data),
};

export const LeaderboardApi = {
  global: () => apiClient.get<LeaderboardEntry[]>("/leaderboard/global").then((r) => r.data),
  forGame: (gameId: string) => apiClient.get<LeaderboardEntry[]>(`/leaderboard/game/${gameId}`).then((r) => r.data),
};

export const FriendsApi = {
  send: (toUsername: string) => apiClient.post<FriendRequest>("/friends/requests", { toUsername }).then((r) => r.data),
  incoming: () => apiClient.get<FriendRequest[]>("/friends/requests").then((r) => r.data),
  respond: (id: string, accept: boolean) => apiClient.post(`/friends/requests/${id}/respond`, { accept }).then((r) => r.data),
  list: () => apiClient.get<Friendship[]>("/friends").then((r) => r.data),
  remove: (friendId: string) => apiClient.delete(`/friends/${friendId}`).then((r) => r.data),
};

export const GroupsApi = {
  list: () => apiClient.get<Group[]>("/groups").then((r) => r.data),
  create: (name: string, description: string) => apiClient.post<Group>("/groups", { name, description }).then((r) => r.data),
  join: (id: string) => apiClient.post(`/groups/${id}/join`).then((r) => r.data),
  leave: (id: string) => apiClient.post(`/groups/${id}/leave`).then((r) => r.data),
  members: (id: string) => apiClient.get(`/groups/${id}/members`).then((r) => r.data),
};

export const AdminApi = {
  stats: () => apiClient.get("/admin/stats").then((r) => r.data),
  users: () => apiClient.get<PublicUser[]>("/admin/users").then((r) => r.data),
  setBanned: (id: string, banned: boolean, reason?: string) => apiClient.patch(`/admin/users/${id}/ban`, { banned, reason }).then((r) => r.data),
  setRole: (id: string, role: string) => apiClient.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  games: () => apiClient.get<GameSummary[]>("/admin/games").then((r) => r.data),
  removeGame: (id: string) => apiClient.delete(`/admin/games/${id}`).then((r) => r.data),
};

export const ModerationApi = {
  fileReport: (targetType: string, targetId: string, reason: string) =>
    apiClient.post("/moderation/reports", { targetType, targetId, reason }).then((r) => r.data),
  listOpen: () => apiClient.get("/moderation/reports").then((r) => r.data),
  resolve: (id: string, status: "resolved" | "dismissed", note?: string) =>
    apiClient.post(`/moderation/reports/${id}/resolve`, { status, note }).then((r) => r.data),
  banUser: (id: string, reason?: string) => apiClient.post(`/moderation/users/${id}/ban`, { reason }).then((r) => r.data),
};

export const NpcApi = {
  listForGame: (gameId: string) => apiClient.get(`/npc/game/${gameId}`).then((r) => r.data),
  talk: (npcId: string, message: string) => apiClient.post(`/npc/${npcId}/talk`, { message }).then((r) => r.data),
};
