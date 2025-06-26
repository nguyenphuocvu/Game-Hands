import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
  path: "/socket.io",
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
