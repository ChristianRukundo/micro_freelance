// File: backend/src/modules/messaging/message.controller.ts
import { Request, Response, NextFunction } from 'express';
import messageService from './message.service';
import { taskIdParamSchema, getMessagesQuerySchema, createMessageSchema } from './message.validation';
import { z } from 'zod';
import { logger } from '@shared/utils/logger'; // <--- Import logger
import AppError from '@shared/utils/appError';

class MessageController {
  public async getMessagesForTask(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, unknown, z.infer<typeof getMessagesQuerySchema>>,
    res: Response,
    next: NextFunction,
  ) {
    const { taskId } = req.params;
    const { page, limit } = req.query;
    const userId = req.user?.id; // Authenticated user ID

    logger.debug(`REST API: Request to get messages for taskId: ${taskId} by userId: ${userId}.`, {
      taskId,
      userId,
      page,
      limit,
    });

    try {
      if (!userId) {
        // Should be caught by auth middleware, but a safeguard
        logger.warn('REST API: Unauthorized attempt to fetch messages (userId missing from request).', { taskId });
        return next(new AppError('User not authenticated.', 401));
      }
      const messagesData = await messageService.getMessagesForTask(userId, taskId, page, limit);
      res.status(200).json({ success: true, data: messagesData });
      logger.info(`REST API: Successfully fetched messages for taskId: ${taskId}.`, {
        taskId,
        userId,
        messagesCount: messagesData.messages.length,
      });
    } catch (error) {
      logger.error(`REST API: Error fetching messages for taskId: ${taskId} by userId: ${userId}.`, {
        taskId,
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      next(error);
    }
  }

  public async createMessage(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, z.infer<typeof createMessageSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    const { taskId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.id; // Authenticated user ID

    logger.debug(`REST API: Request to create message for taskId: ${taskId} by senderId: ${senderId}.`, {
      taskId,
      senderId,
      contentPreview: content.substring(0, 50),
    });

    try {
      if (!senderId) {
        // Safeguard
        logger.warn('REST API: Unauthorized attempt to create message (senderId missing from request).', { taskId });
        return next(new AppError('User not authenticated.', 401));
      }
      const newMessage = await messageService.createMessage(senderId, taskId, content);
      res.status(201).json({ success: true, message: 'Message sent successfully.', data: newMessage });
      logger.info(`REST API: Message created successfully for taskId: ${taskId}.`, {
        taskId,
        senderId,
        messageId: newMessage.id,
      });
    } catch (error) {
      logger.error(`REST API: Error creating message for taskId: ${taskId} by senderId: ${senderId}.`, {
        taskId,
        senderId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      next(error);
    }
  }
}

export default new MessageController();
