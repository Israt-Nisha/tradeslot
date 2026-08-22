import { z } from 'zod';
import { Channel, MessageDirection } from '../../../generated/prisma/client';

const createConversationValidationSchema = z.object({
  body: z.object({
    channel: z.nativeEnum(Channel),
    externalId: z.string().optional(),
    traderId: z.string().uuid('Invalid traderId format'),
    customerId: z.string().uuid('Invalid customerId format').optional(),
  }),
});

const createMessageValidationSchema = z.object({
  body: z.object({
    direction: z.nativeEnum(MessageDirection),
    senderId: z.string().min(1, 'Sender ID is required'),
    content: z.string().min(1, 'Content is required'),
    externalId: z.string().optional(),
    bookingId: z.string().uuid('Invalid bookingId format').optional(),
  }),
});

export const conversationValidationSchema = {
  createConversationValidationSchema,
  createMessageValidationSchema,
};
