import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { authValidationSchema } from './auth.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  validateRequest(authValidationSchema.registerValidationSchema),
  AuthController.registerTrader
);

router.post(
  '/login',
  validateRequest(authValidationSchema.loginValidationSchema),
  AuthController.loginTrader
);

router.get(
  '/session',
  auth(),
  AuthController.getSession
);

router.get(
  '/traders',
  AuthController.getAllTraders
);

export const AuthRoutes = router;

