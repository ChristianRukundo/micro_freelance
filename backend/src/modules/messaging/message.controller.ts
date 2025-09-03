import { Request, Response, NextFunction } from 'express';
import messageService from './message.service';
import { taskIdParamSchema, getMessagesQuerySchema, createMessageSchema } from './message.validation';
import { z } from 'zod';

class MessageController {
  public async getMessagesForTask(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, unknown, z.infer<typeof getMessagesQuerySchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params;
      const { page, limit } = req.query;
      const messagesData = await messageService.getMessagesForTask(req.user!.id, taskId, page, limit);
      res.status(200).json({ success: true, data: messagesData });
    } catch (error) {
      next(error);
    }
  }

  public async createMessage(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, z.infer<typeof createMessageSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      const newMessage = await messageService.createMessage(req.user!.id, taskId, content);
      res.status(201).json({ success: true, message: 'Message sent successfully.', data: newMessage });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
