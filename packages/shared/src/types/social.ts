export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
  since: string;
}

export enum GroupRole {
  MEMBER = "member",
  MODERATOR = "moderator",
  OWNER = "owner",
}

export interface Group {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupMembership {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
}

export enum InviteType {
  FRIEND = "friend",
  GROUP = "group",
  GAME_SERVER = "game_server",
}

export interface Invite {
  id: string;
  type: InviteType;
  fromUserId: string;
  toUserId: string;
  targetId: string;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channel: string;
  fromUserId: string;
  fromUsername: string;
  body: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
}
