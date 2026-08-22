import { Channel, MessageDirection } from '../../../generated/prisma/client';

export type TCreateConversationInput = {
  channel: Channel;
  externalId?: string;
  traderId: string;
  customerId?: string;
};

export type TCreateMessageInput = {
  direction: MessageDirection;
  senderId: string;
  content: string;
  externalId?: string;
  bookingId?: string;
};
