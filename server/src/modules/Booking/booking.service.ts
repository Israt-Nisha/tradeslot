import status from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { BookingStatus } from '../../../generated/prisma/client';
import { TCreateBookingInput, TUpdateBookingInput } from './booking.interface';

const createBooking = async (payload: TCreateBookingInput) => {
  // 1. Verify trader exists
  const trader = await prisma.traderProfile.findUnique({
    where: { id: payload.traderId },
  });

  if (!trader) {
    throw new AppError(status.NOT_FOUND, 'Trader profile not found');
  }

  // 2. Resolve durations, buffers, and fee defaults
  const duration = payload.jobDurationMinutes ?? trader.defaultJobDurationMinutes;
  const buffer = payload.travelBufferMinutes ?? trader.defaultTravelBufferMinutes;
  const fee = payload.bookingFee ?? Number(trader.defaultBookingFee);
  const currency = payload.currency ?? 'GBP';

  const scheduledStart = new Date(payload.scheduledStart);
  const scheduledEnd = new Date(scheduledStart.getTime() + duration * 60000);

  // 3. Scheduling conflict validation (with travel buffer)
  // Retrieve bookings of the same trader within +/- 24 hours of start time
  const minTime = new Date(scheduledStart.getTime() - 24 * 60 * 60000);
  const maxTime = new Date(scheduledStart.getTime() + 24 * 60 * 60000);

  const existingBookings = await prisma.booking.findMany({
    where: {
      traderId: payload.traderId,
      status: { not: BookingStatus.CANCELLED },
      scheduledStart: {
        gte: minTime,
        lte: maxTime,
      },
    },
  });

  const proposedBlockEnd = new Date(scheduledEnd.getTime() + buffer * 60000);

  for (const b of existingBookings) {
    const existingStart = b.scheduledStart;
    const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 60000);

    // Overlap condition: ProposedStart < ExistingBlockEnd AND ExistingStart < ProposedBlockEnd
    if (scheduledStart < existingBlockEnd && existingStart < proposedBlockEnd) {
      throw new AppError(
        status.CONFLICT,
        'The requested time slot is unavailable due to a scheduling conflict (including travel buffer)'
      );
    }
  }

  // 4. Validate workArea if provided
  if (payload.workAreaId) {
    const workArea = await prisma.workArea.findUnique({
      where: { id: payload.workAreaId },
    });
    if (!workArea || workArea.traderId !== payload.traderId) {
      throw new AppError(status.BAD_REQUEST, 'Invalid workAreaId provided for this trader');
    }
  }

  // 5. Create booking
  const booking = await prisma.booking.create({
    data: {
      traderId: payload.traderId,
      customerId: payload.customerId || null,
      workAreaId: payload.workAreaId || null,
      conversationId: payload.conversationId || null,
      scheduledStart,
      scheduledEnd,
      status: BookingStatus.PENDING,
      jobAddress: payload.jobAddress || null,
      notes: payload.notes || null,
      customerName: payload.customerName || null,
      customerPhone: payload.customerPhone || null,
      customerEmail: payload.customerEmail || null,
      jobDurationMinutes: duration,
      travelBufferMinutes: buffer,
      bookingFee: fee,
      currency,
    },
    include: {
      trader: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      workArea: true,
    },
  });

  return booking;
};

const getAllBookings = async (traderId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { traderId },
    include: {
      customer: true,
      workArea: true,
      payment: true,
    },
    orderBy: { scheduledStart: 'asc' },
  });

  return bookings;
};

const getBookingById = async (traderId: string, id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      workArea: true,
      conversation: true,
      payment: true,
    },
  });


  if (!booking) {
    throw new AppError(status.NOT_FOUND, 'Booking not found');
  }

  if (booking.traderId !== traderId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this booking');
  }

  return booking;
};

const updateBooking = async (traderId: string, id: string, payload: TUpdateBookingInput) => {
  const existing = await getBookingById(traderId, id);

  const start = payload.scheduledStart ? new Date(payload.scheduledStart) : existing.scheduledStart;
  const duration = payload.jobDurationMinutes ?? existing.jobDurationMinutes;
  const buffer = payload.travelBufferMinutes ?? existing.travelBufferMinutes;
  const end = new Date(start.getTime() + duration * 60000);

  // If time fields were modified, check conflicts again
  if (payload.scheduledStart || payload.jobDurationMinutes || payload.travelBufferMinutes) {
    const minTime = new Date(start.getTime() - 24 * 60 * 60000);
    const maxTime = new Date(start.getTime() + 24 * 60 * 60000);

    const otherBookings = await prisma.booking.findMany({
      where: {
        traderId,
        id: { not: id },
        status: { not: BookingStatus.CANCELLED },
        scheduledStart: {
          gte: minTime,
          lte: maxTime,
        },
      },
    });

    const proposedBlockEnd = new Date(end.getTime() + buffer * 60000);

    for (const b of otherBookings) {
      const existingStart = b.scheduledStart;
      const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 60000);

      if (start < existingBlockEnd && existingStart < proposedBlockEnd) {
        throw new AppError(
          status.CONFLICT,
          'The requested time slot is unavailable due to a scheduling conflict (including travel buffer)'
        );
      }
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      scheduledStart: start,
      scheduledEnd: end,
      jobDurationMinutes: duration,
      travelBufferMinutes: buffer,
      status: payload.status,
      jobAddress: payload.jobAddress,
      notes: payload.notes,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
    },
    include: {
      customer: true,
      workArea: true,
    },
  });

  return updatedBooking;
};

const deleteBooking = async (traderId: string, id: string) => {
  // Check existence and ownership
  await getBookingById(traderId, id);

  // Cancel booking instead of hard-deleting
  const cancelledBooking = await prisma.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED },
  });

  return cancelledBooking;
};

const getPublicBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      trader: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, 'Booking not found');
  }

  return {
    id: booking.id,
    scheduledStart: booking.scheduledStart,
    scheduledEnd: booking.scheduledEnd,
    customerName: booking.customerName,
    traderName: booking.trader.user?.name || booking.trader.businessName || 'Trader',
    status: booking.status,
  };
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getPublicBookingById,
};

