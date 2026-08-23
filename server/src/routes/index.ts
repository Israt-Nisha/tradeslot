import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { WorkAreaRoutes } from '../modules/WorkArea/workArea.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { ConversationRoutes } from '../modules/Conversation/conversation.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { TraderRoutes } from '../modules/Trader/trader.route';
import { WebhookRoutes } from '../modules/Webhook/webhook.route';
import { ChatRoutes } from '../modules/Chat/chat.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/work-areas',
    route: WorkAreaRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
  {
    path: '/conversations',
    route: ConversationRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/trader',
    route: TraderRoutes,
  },
  {
    path: '/webhooks',
    route: WebhookRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
];


moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

