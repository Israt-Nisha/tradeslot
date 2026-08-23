import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { paymentValidationSchema } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  '/connect-setup',
  auth(),
  PaymentController.connectSetup
);

router.get(
  '/onboard-return',
  PaymentController.onboardReturn
);

router.get(
  '/onboard-refresh',
  PaymentController.onboardRefresh
);

router.post(
  '/checkout-session',
  validateRequest(paymentValidationSchema.createCheckoutSessionValidationSchema),
  PaymentController.createCheckoutSession
);

router.get(
  '/success',
  PaymentController.successRedirect
);

router.get(
  '/cancel',
  PaymentController.cancelRedirect
);

export const PaymentRoutes = router;
