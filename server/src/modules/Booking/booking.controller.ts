import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { BookingService } from './booking.service';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  // If request is made by authenticated trader, default traderId to their profile ID
  if (req.user) {
    payload.traderId = req.user.id;
  }

  const result = await BookingService.createBooking(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await BookingService.getAllBookings(req.user.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await BookingService.getBookingById(req.user.id, req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await BookingService.updateBooking(req.user.id, req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Booking updated successfully',
    data: result,
  });
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const result = await BookingService.deleteBooking(req.user.id, req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
