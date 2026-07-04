/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CHAT_URL: string;
  readonly VITE_GAME_SERVER_URL: string;
  readonly VITE_EDITOR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
