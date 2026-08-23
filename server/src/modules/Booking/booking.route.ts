import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { bookingValidationSchema } from './booking.validation';
import { BookingController } from './booking.controller';

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
  validateRequest(bookingValidationSchema.createBookingValidationSchema),
  BookingController.createBooking
);

router.get(
  '/',
  auth(),
  BookingController.getAllBookings
);

router.get(
  '/:id',
  auth(),
  BookingController.getBookingById
);

router.patch(
  '/:id',
  auth(),
  validateRequest(bookingValidationSchema.updateBookingValidationSchema),
  BookingController.updateBooking
);

router.delete(
  '/:id',
  auth(),
  BookingController.deleteBooking
);

router.get(
  '/public/:id',
  BookingController.getPublicBookingById
);

export const BookingRoutes = router;

