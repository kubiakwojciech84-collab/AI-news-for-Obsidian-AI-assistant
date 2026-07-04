export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  };
}
