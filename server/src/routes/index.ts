import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { WorkAreaRoutes } from '../modules/WorkArea/workArea.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { ConversationRoutes } from '../modules/Conversation/conversation.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
