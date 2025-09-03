import { Router } from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
} from "../controllers/chat.controller";
import { protect } from "../middleware/auth";

const router = Router();

// All chat routes require authentication
router.use(protect);

// Get or create conversation for a property
router.post("/conversations/property/:propertyId", getOrCreateConversation);

// Get all conversations for the authenticated user
router.get("/conversations", getUserConversations);

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", getConversationMessages);

// Send a message (REST endpoint for file uploads, etc.)
router.post("/conversations/:conversationId/messages", sendMessage);

export default router;
