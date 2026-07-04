export interface SendFriendRequestDto {
  toUsername: string;
}

export interface RespondFriendRequestDto {
  accept: boolean;
}

export interface CreateGroupDto {
  name: string;
  description: string;
}

export interface SendInviteDto {
  toUsername: string;
  targetId: string;
  message?: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatar?: {
    bodyColor?: string;
    headColor?: string;
    hatId?: string | null;
    shirtId?: string | null;
    pantsId?: string | null;
    faceId?: string | null;
    accessoryIds?: string[];
  };
}
