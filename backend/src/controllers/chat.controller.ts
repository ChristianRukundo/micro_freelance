import type { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import { AppError } from "../utils/appError";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Get or create conversation for a property
export const getOrCreateConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user!.id;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { agent: true },
    });

    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    // Don't allow agent to chat with themselves
    if (property.agentId === userId) {
      return next(
        new AppError("Cannot create conversation with yourself", 400)
      );
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        propertyId,
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            agent: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId,
          participants: {
            create: [
              { userId }, // Current user (buyer)
              { userId: property.agentId }, // Property agent
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              images: true,
              agent: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      // Notify the agent about new conversation
      if (global.socketService) {
        global.socketService.sendNotificationToUser(
          property.agentId,
          "new_conversation",
          {
            conversation,
            message: `New inquiry about ${property.title}`,
          }
        );
      }
    }

    res.status(200).json({
      status: "success",
      data: { conversation },
    });
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    next(new AppError("Failed to get or create conversation", 500));
  }
};

// Get all conversations for a user
export const getUserConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            location: true,
            pricePerNight: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    // Add unread count for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId: conversation.id,
            userId,
          },
        });

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            createdAt: {
              gt: participant?.lastReadAt || new Date(0),
            },
          },
        });

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: { conversations: conversationsWithUnreadCount },
    });
  } catch (error) {
    console.error("Error getting user conversations:", error);
    next(new AppError("Failed to get conversations", 500));
  }
};

// Get messages for a conversation
export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      return next(
        new AppError("Not authorized to view this conversation", 403)
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
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
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    // Mark messages as read
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      data: { messages: messages.reverse() }, // Reverse to show oldest first
    });
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    next(new AppError("Failed to get messages", 500));
  }
};

// Send a message (REST endpoint - mainly for file uploads)
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = "TEXT" } = req.body;
    const userId = req.user!.id;

    // Verify user is participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      return next(
        new AppError(
          "Not authorized to send messages in this conversation",
          403
        )
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        messageType,
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

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Emit message via Socket.IO
    if (global.socketService) {
      global.socketService
        .getIO()
        .to(`conversation:${conversationId}`)
        .emit("new_message", message);
    }

    res.status(201).json({
      status: "success",
      data: { message },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    next(new AppError("Failed to send message", 500));
  }
};
