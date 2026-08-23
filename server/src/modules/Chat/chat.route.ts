import express from 'express';
import { ChatController } from './chat.controller';

const router = express.Router();

router.post('/messages', ChatController.processChatMessage);

export const ChatRoutes = router;
