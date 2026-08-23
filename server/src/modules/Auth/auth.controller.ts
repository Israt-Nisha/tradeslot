import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const registerTrader = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerTrader(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Trader registered successfully',
    data: result,
  });
});

const loginTrader = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginTrader(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Trader logged in successfully',
    data: result,
  });
});

const getSession = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getTraderSession(req.user!.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Session retrieved successfully',
    data: result,
  });
});

const getAllTraders = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getAllTraders();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Traders list retrieved successfully',
    data: result,
  });
});

export const AuthController = {
  registerTrader,
  loginTrader,
  getSession,
  getAllTraders,
};