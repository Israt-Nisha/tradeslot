import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { conversationValidationSchema } from './conversation.validation';
import { ConversationController } from './conversation.controller';

const router = express.Router();

const optionalAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization) {
    return auth()(req, res, next);
  }
  next();
};

router.post(
  '/',
  optionalAuth,
  validateRequest(conversationValidationSchema.createConversationValidationSchema),
  ConversationController.createOrGetConversation
);

router.get(
  '/',
  auth(),
  ConversationController.getAllConversations
);

router.get(
  '/:id',
  auth(),
  ConversationController.getConversationById
);

router.post(
  '/:id/messages',
  optionalAuth,
  validateRequest(conversationValidationSchema.createMessageValidationSchema),
  ConversationController.createMessage
);

router.get(
  '/:id/messages',
  auth(),
  ConversationController.getConversationMessages
);

export const ConversationRoutes = router;
