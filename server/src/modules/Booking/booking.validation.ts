import { z } from 'zod';
import { BookingStatus } from '../../../generated/prisma/client';

const createBookingValidationSchema = z.object({
  body: z.object({
    traderId: z.string().uuid('Invalid traderId format'),
    customerId: z.string().uuid('Invalid customerId format').optional(),
    workAreaId: z.string().uuid('Invalid workAreaId format').optional(),
    conversationId: z.string().uuid('Invalid conversationId format').optional(),
    scheduledStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid scheduledStart format. Must be a valid date string',
    }),
    jobDurationMinutes: z.number().int().positive().optional(),
    travelBufferMinutes: z.number().int().nonnegative().optional(),
    bookingFee: z.number().positive().optional(),
    currency: z.string().optional(),
    jobAddress: z.string().optional(),
    notes: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  }),
});

const updateBookingValidationSchema = z.object({
  body: z.object({
    scheduledStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid scheduledStart format. Must be a valid date string',
    }).optional(),
    jobDurationMinutes: z.number().int().positive().optional(),
    travelBufferMinutes: z.number().int().nonnegative().optional(),
    status: z.nativeEnum(BookingStatus).optional(),
    jobAddress: z.string().optional(),
    notes: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  }),
});

export const bookingValidationSchema = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
};
