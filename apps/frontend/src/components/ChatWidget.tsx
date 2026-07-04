import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "@nova/shared";
import { CHAT_URL } from "../api/client";
import { useAuth } from "../auth/AuthContext";

/** Persistent global chat, independent of any in-game Colyseus session. */
export function ChatWidget() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    const socket = io(CHAT_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join_channel", "global"));
    socket.on("history", (history: ChatMessage[]) => setMessages(history));
    socket.on("message", (message: ChatMessage) => setMessages((prev) => [...prev.slice(-99), message]));

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  if (!user) return null;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    socketRef.current?.emit("send_message", { channel: "global", body: draft.trim() });
    setDraft("");
  };

  return (
    <div className="chat-widget">
      <div className="messages" ref={listRef}>
        {messages.map((m) => (
          <div className="msg" key={m.id}>
            <b>{m.fromUsername}: </b>
            {m.body}
          </div>
        ))}
        {messages.length === 0 && <div style={{ color: "var(--text-muted)" }}>Czat globalny - napisz cos!</div>}
      </div>
      <form onSubmit={send}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Napisz wiadomosc..." maxLength={300} />
        <button type="submit">Wyslij</button>
      </form>
    </div>
  );
}
