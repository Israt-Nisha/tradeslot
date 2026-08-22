import { BookingStatus } from '../../../generated/prisma/client';

export type TCreateBookingInput = {
  traderId: string;
  customerId?: string;
  workAreaId?: string;
  conversationId?: string;
  scheduledStart: string;
  jobDurationMinutes?: number;
  travelBufferMinutes?: number;
  bookingFee?: number;
  currency?: string;
  jobAddress?: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
};

export type TUpdateBookingInput = {
  scheduledStart?: string;
  jobDurationMinutes?: number;
  travelBufferMinutes?: number;
  status?: BookingStatus;
  jobAddress?: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
};
