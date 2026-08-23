import status from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { MessageDirection } from '../../../generated/prisma/client';
import { TCreateConversationInput, TCreateMessageInput } from './conversation.interface';

const createOrGetConversation = async (payload: TCreateConversationInput) => {
  // Verify trader profile exists
  const trader = await prisma.traderProfile.findUnique({
    where: { id: payload.traderId },
  });

  if (!trader) {
    throw new AppError(status.NOT_FOUND, 'Trader profile not found');
  }

  if (payload.externalId) {
    const existing = await prisma.conversation.findUnique({
      where: {
        traderId_channel_externalId: {
          traderId: payload.traderId,
          channel: payload.channel,
          externalId: payload.externalId,
        },
      },
      include: {
        customer: true,
      },
    });

    if (existing) {
      return existing;
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      traderId: payload.traderId,
      channel: payload.channel,
      externalId: payload.externalId || null,
      customerId: payload.customerId || null,
    },
    include: {
      customer: true,
    },
  });

  return conversation;
};

const getAllConversations = async (traderId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: { traderId },
    include: {
      customer: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations;
};

const getConversationById = async (traderId: string, id: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!conversation) {
    throw new AppError(status.NOT_FOUND, 'Conversation not found');
  }

  if (conversation.traderId !== traderId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this conversation');
  }

  return conversation;
};

const createMessage = async (
  traderId: string | undefined,
  conversationId: string,
  payload: TCreateMessageInput
) => {
  // Find conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError(status.NOT_FOUND, 'Conversation not found');
  }

  // If request is authenticated as trader, verify ownership
  if (traderId && conversation.traderId !== traderId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this conversation');
  }

  let customerId = conversation.customerId;

  // If inbound message and no customerId linked to conversation yet, resolve/create customer
  if (payload.direction === MessageDirection.INBOUND && !customerId) {
    // Try to find customer profile by phone/senderId
    let customerProfile = await prisma.customerProfile.findFirst({
      where: { phone: payload.senderId },
    });

    if (!customerProfile) {
      // Check if user exists with the same phone number
      const existingUser = await prisma.user.findFirst({
        where: { phone: payload.senderId },
        include: { customerProfile: true },
      });

      if (existingUser) {
        if (existingUser.customerProfile) {
          customerProfile = existingUser.customerProfile;
        } else {
          // User exists but has no customer profile, create it
          customerProfile = await prisma.customerProfile.create({
            data: {
              userId: existingUser.id,
              name: existingUser.name || `Customer ${payload.senderId}`,
              phone: payload.senderId,
            },
          });
        }
      } else {
        // Create user and profile
        const user = await prisma.user.create({
          data: {
            name: `Customer ${payload.senderId}`,
            phone: payload.senderId,
            role: 'CUSTOMER',
            customerProfile: {
              create: {
                name: `Customer ${payload.senderId}`,
                phone: payload.senderId,
              },
            },
          },
          include: {
            customerProfile: true,
          },
        });
        customerProfile = user.customerProfile!;
      }
    }


    // Link customer to conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { customerId: customerProfile.id },
    });

    customerId = customerProfile.id;
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId,
      bookingId: payload.bookingId || null,
      traderId: payload.direction === MessageDirection.OUTBOUND ? conversation.traderId : null,
      customerId: payload.direction === MessageDirection.INBOUND ? customerId : null,
      channel: conversation.channel,
      direction: payload.direction,
      senderId: payload.senderId,
      content: payload.content,
      externalId: payload.externalId || null,
    },
  });

  // Touch conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
};

const getConversationMessages = async (traderId: string, conversationId: string) => {
  // Validate ownership first
  await getConversationById(traderId, conversationId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: 'asc' },
  });

  return messages;
};

export const ConversationService = {
  createOrGetConversation,
  getAllConversations,
  getConversationById,
  createMessage,
  getConversationMessages,
};
