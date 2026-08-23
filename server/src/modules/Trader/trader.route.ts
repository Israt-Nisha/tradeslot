import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { WorkAreaController } from '../WorkArea/workArea.controller';
import { workAreaValidationSchema } from '../WorkArea/workArea.validation';

const router = express.Router();

router.post(
  '/work-area',
  auth(),
  validateRequest(workAreaValidationSchema.createWorkAreaValidationSchema),
  WorkAreaController.createWorkArea
);

router.get(
  '/work-area/:date',
  auth(),
  WorkAreaController.getWorkAreaByDate
);

router.put(
  '/work-area/:date',
  auth(),
  validateRequest(workAreaValidationSchema.updateWorkAreaValidationSchema),
  WorkAreaController.updateWorkAreaByDate
);

export const TraderRoutes = router;
