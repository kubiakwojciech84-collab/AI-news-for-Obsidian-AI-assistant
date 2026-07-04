import { apiClient } from "./client";
import type { AuthResponseDto, GameSummary, GameGenre, PublicUser } from "@nova/shared";

export const AuthApi = {
  login: (usernameOrEmail: string, password: string) =>
    apiClient.post<AuthResponseDto>("/auth/login", { usernameOrEmail, password }).then((r) => r.data),
  register: (username: string, email: string, password: string) =>
    apiClient.post<AuthResponseDto>("/auth/register", { username, email, password }).then((r) => r.data),
};

export const UsersApi = {
  me: () => apiClient.get<PublicUser>("/users/me").then((r) => r.data),
};

export const GamesApi = {
  mine: () => apiClient.get<GameSummary[]>("/games/mine").then((r) => r.data),
  create: (dto: { title: string; description: string; genre: GameGenre; maxPlayers: number }) =>
    apiClient.post<GameSummary>("/games", dto).then((r) => r.data),
  get: (idOrSlug: string) => apiClient.get<any>(`/games/${idOrSlug}`).then((r) => r.data),
  publish: (id: string, scene: unknown) => apiClient.post(`/games/${id}/publish`, { scene }).then((r) => r.data),
};

export const UploadsApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<{ url: string }>("/uploads", form, { headers: { "content-type": "multipart/form-data" } }).then((r) => r.data);
  },
};
