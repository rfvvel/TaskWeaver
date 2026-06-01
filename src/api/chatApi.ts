// src/api/chatApi.ts
// Semua pemanggilan API Chat & Channel. Path sesuai index.js backend.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApiChannel {
  channel_id: string;
  channel_name: string;
  group_id: string;
  creator: string;
}

export interface ApiChat {
  chat_id: string;
  group_id: string;
  user_id: string;
  channel_id: string;
  chat_message: string;
  user_full_name: string;
  audited_activity: string;
  audited_time: string;
}

// ── Helper ─────────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.pesan ?? "Request failed");
  return json as T;
}

// ── Channel API ────────────────────────────────────────────────────────────────

export const channelApi = {
  /** POST /api/channelCreate */
  create: (group_id: string, user_id: string, channel_name: string) =>
    post<{ status: string; pesan: string }>("/api/channelCreate", {
      group_id, user_id, channel_name,
    }),

  /** POST /api/channelGetByGroup */
  getByGroup: (group_id: string) =>
    post<{ status: string; data: ApiChannel[] }>("/api/channelGetByGroup", { group_id }),

  /** POST /api/channelDelete */
  delete: (channel_id: string, group_id: string, user_id: string) =>
    post<{ status: string; pesan: string }>("/api/channelDelete", {
      channel_id, group_id, user_id,
    }),

  /** POST /api/channelUpdate */
  update: (channel_id: string, group_id: string, user_id: string, channel_name: string) =>
    post<{ status: string; pesan: string }>("/api/channelUpdate", {
      channel_id, group_id, user_id, channel_name,
    }),
};

// ── Chat API ───────────────────────────────────────────────────────────────────

export const chatApi = {
  /** POST /api/chatSend */
  send: (group_id: string, user_id: string, channel_id: string, chat_message: string) =>
    post<{ status: string; pesan: string }>("/api/chatSend", {
      group_id, user_id, channel_id, chat_message,
    }),

  /** POST /api/chatGet */
  getByChannel: (group_id: string, channel_id: string) =>
    post<{ status: string; data: ApiChat[] }>("/api/chatGet", { group_id, channel_id }),

  /** POST /api/chatUpdate */
  update: (chat_id: string, user_id: string, chat_message: string) =>
    post<{ status: string; pesan: string }>("/api/chatUpdate", {
      chat_id, user_id, chat_message,
    }),

  /** POST /api/chatDelete */
  delete: (chat_id: string, user_id: string) =>
    post<{ status: string; pesan: string }>("/api/chatDelete", { chat_id, user_id }),
};