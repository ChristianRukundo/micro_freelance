import { Router } from 'express';
import messageController from './message.controller';
import { protect } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { taskIdParamSchema, getMessagesQuerySchema, createMessageSchema } from './message.validation';

const router = Router();

router.use(protect); // All routes below this require authentication

// Get messages for a specific task chat
router.get(
  '/tasks/:taskId',
  validateRequest({ params: taskIdParamSchema, query: getMessagesQuerySchema }),
  messageController.getMessagesForTask,
);

// Send a message to a specific task chat (REST endpoint - primarily for non-real-time fallback/initial load)
router.post(
  '/tasks/:taskId', 
  validateRequest({ params: taskIdParamSchema, body: createMessageSchema }),
  messageController.createMessage,
);

export default router;
