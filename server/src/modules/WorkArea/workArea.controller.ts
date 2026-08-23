import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WorkAreaService } from './workArea.service';
import AppError from '../../errors/AppError';

const createWorkArea = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.createWorkArea(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Work area created successfully',
    data: result,
  });
});

const getAllWorkAreas = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.getAllWorkAreas(req.user!.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Work areas retrieved successfully',
    data: result,
  });
});

const getWorkAreaById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.getWorkAreaById(req.user!.id, req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Work area retrieved successfully',
    data: result,
  });
});

const updateWorkArea = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.updateWorkArea(req.user!.id, req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Work area updated successfully',
    data: result,
  });
});

const deleteWorkArea = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.deleteWorkArea(req.user!.id, req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Work area deleted successfully',
    data: result,
  });
});

const getWorkAreaByDate = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.getWorkAreaByDate(req.user!.id, req.params.date as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Work area retrieved successfully',
    data: result,
  });
});

const updateWorkAreaByDate = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }
  const result = await WorkAreaService.updateWorkAreaByDate(req.user!.id, req.params.date as string, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Work area updated successfully',
    data: result,
  });
});

export const WorkAreaController = {
  createWorkArea,
  getAllWorkAreas,
  getWorkAreaById,
  updateWorkArea,
  deleteWorkArea,
  getWorkAreaByDate,
  updateWorkAreaByDate,
};

