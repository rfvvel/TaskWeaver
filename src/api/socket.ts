import { io, type Socket } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
}
