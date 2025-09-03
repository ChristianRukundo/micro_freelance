import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Verify user exists in database
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, role: true, name: true, email: true },
        });

        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        socket.userId = user.id;
        socket.userRole = user.role;

        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);

      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Join user to their personal room for direct messaging
      socket.join(`user:${socket.userId}`);

      // Handle joining conversation rooms
      socket.on("join_conversation", async (conversationId: string) => {
        try {
          // Verify user is participant in this conversation
          const participant = await prisma.conversationParticipant.findFirst({
            where: {
              conversationId,
              userId: socket.userId,
            },
          });

          if (participant) {
            socket.join(`conversation:${conversationId}`);
            console.log(
              `User ${socket.userId} joined conversation ${conversationId}`
            );
          } else {
            socket.emit("error", {
              message: "Not authorized to join this conversation",
            });
          }
        } catch (error) {
          console.error("Error joining conversation:", error);
          socket.emit("error", { message: "Failed to join conversation" });
        }
      });

      // Handle leaving conversation rooms
      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(
          `User ${socket.userId} left conversation ${conversationId}`
        );
      });

      // Handle sending messages
      socket.on(
        "send_message",
        async (data: {
          conversationId: string;
          content: string;
          messageType?: "TEXT" | "IMAGE" | "FILE";
        }) => {
          try {
            // Verify user is participant in this conversation
            const participant = await prisma.conversationParticipant.findFirst({
              where: {
                conversationId: data.conversationId,
                userId: socket.userId,
              },
            });

            if (!participant) {
              socket.emit("error", {
                message: "Not authorized to send messages in this conversation",
              });
              return;
            }

            // Create message in database
            const message = await prisma.message.create({
              data: {
                conversationId: data.conversationId,
                senderId: socket.userId!,
                content: data.content,
                messageType: data.messageType || "TEXT",
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                  },
                },
              },
            });

            // Emit message to all participants in the conversation
            this.io
              .to(`conversation:${data.conversationId}`)
              .emit("new_message", message);

            // Update conversation's updatedAt timestamp
            await prisma.conversation.update({
              where: { id: data.conversationId },
              data: { updatedAt: new Date() },
            });
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      // Handle marking messages as read
      socket.on("mark_as_read", async (conversationId: string) => {
        try {
          await prisma.conversationParticipant.update({
            where: {
              conversationId_userId: {
                conversationId,
                userId: socket.userId!,
              },
            },
            data: {
              lastReadAt: new Date(),
            },
          });

          // Notify other participants that user has read messages
          socket.to(`conversation:${conversationId}`).emit("messages_read", {
            userId: socket.userId,
            conversationId,
            readAt: new Date(),
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      // Handle typing indicators
      socket.on("typing_start", (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          userId: socket.userId,
          conversationId,
        });
      });

      socket.on("typing_stop", (conversationId: string) => {
        socket
          .to(`conversation:${conversationId}`)
          .emit("user_stopped_typing", {
            userId: socket.userId,
            conversationId,
          });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  // Method to send notification to a specific user
  public sendNotificationToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Method to get online users in a conversation
  public async getOnlineUsersInConversation(
    conversationId: string
  ): Promise<string[]> {
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    return participants
      .map((p) => p.userId)
      .filter((userId) => this.connectedUsers.has(userId));
  }

  public getIO() {
    return this.io;
  }
}
