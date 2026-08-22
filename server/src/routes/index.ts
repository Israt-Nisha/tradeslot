import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { WorkAreaRoutes } from '../modules/WorkArea/workArea.route';
import { BookingRoutes } from '../modules/Booking/booking.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
