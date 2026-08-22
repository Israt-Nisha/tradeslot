import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { workAreaValidationSchema } from './workArea.validation';
import { WorkAreaController } from './workArea.controller';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(workAreaValidationSchema.createWorkAreaValidationSchema),
  WorkAreaController.createWorkArea
);

router.get(
  '/',
  auth(),
  WorkAreaController.getAllWorkAreas
);

router.get(
  '/:id',
  auth(),
  WorkAreaController.getWorkAreaById
);

router.patch(
  '/:id',
  auth(),
  validateRequest(workAreaValidationSchema.updateWorkAreaValidationSchema),
  WorkAreaController.updateWorkArea
);

router.delete(
  '/:id',
  auth(),
  WorkAreaController.deleteWorkArea
);

export const WorkAreaRoutes = router;
