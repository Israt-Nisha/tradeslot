import express from 'express';
import { WebhookController } from './webhook.controller';

const router = express.Router();

router.get('/whatsapp', WebhookController.whatsappVerify);
router.post('/whatsapp', WebhookController.whatsappMessage);
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  WebhookController.stripeWebhook
);

export const WebhookRoutes = router;
