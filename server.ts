import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer);

    // Make IO accessible globally for API routes
    (global as any).io = io;

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Join user to their own room for notifications
        // Only allow joining a room matching a claimed userId once per socket
        socket.on("join-user", (userId) => {
            if (typeof userId !== "string" || !userId || userId.length > 64) return;
            // Drop previous user rooms on this socket
            for (const room of socket.rooms) {
                if (room.startsWith("user:") && room !== `user:${userId}`) {
                    socket.leave(room);
                }
            }
            socket.data.userId = userId;
            socket.join(`user:${userId}`);
            console.log(`Socket ${socket.id} joined user:${userId}`);
        });

        // Join specific rooms (chats, emergency channels) — validate format only
        socket.on("join-room", (room) => {
            if (typeof room !== "string" || !room || room.length > 128) return;
            // Block joining arbitrary user rooms via join-room
            if (room.startsWith("user:")) return;
            const allowed = /^(chat:|emergency:|sos:)[\w-]+$/i.test(room);
            if (!allowed) return;
            socket.join(room);
            console.log(`Socket ${socket.id} joined room:${room}`);
        });

        socket.on("leave-room", (room) => {
            if (typeof room === "string" && room) {
                socket.leave(room);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port} with Socket.IO`);
    });
});
