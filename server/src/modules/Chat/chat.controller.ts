import { Request, Response } from 'express';
import status from 'http-status';
import { prisma } from '../../lib/prisma';
import catchAsync from '../../utils/catchAsync';
import { ConversationService } from '../Conversation/conversation.service';
import { BookingService } from '../Booking/booking.service';
import { PaymentService } from '../Payment/payment.service';

const processChatMessage = catchAsync(async (req: Request, res: Response) => {
  const { traderId, message, conversationId } = req.body;

  if (!traderId || !message) {
    res.status(status.BAD_REQUEST).json({
      success: false,
      message: 'traderId and message are required',
    });
    return;
  }

  // 1. Resolve or create Web Chat conversation
  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });
  }

  if (!conversation) {
    // Look up trader
    const trader = await prisma.traderProfile.findUnique({
      where: { id: traderId },
    });

    if (!trader) {
      res.status(status.NOT_FOUND).json({
        success: false,
        message: 'Trader not found',
      });
      return;
    }

    conversation = await prisma.conversation.create({
      data: {
        channel: 'WEB_CHAT',
        traderId: traderId,
        externalId: `web_chat_${Date.now()}`,
      },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });
  }

  // 2. Store incoming client message (Normalized)
  await ConversationService.createMessage(undefined, conversation.id, {
    direction: 'INBOUND',
    senderId: 'customer_web_chat',
    content: message,
  });

  // 3. Load all conversation messages to run state machine
  const conversationMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { sentAt: 'asc' },
  });

  const botMessages = conversationMessages.filter((m) => m.direction === 'OUTBOUND');
  const clientMessages = conversationMessages.filter((m) => m.direction === 'INBOUND');

  let replyText = '';
  let checkoutUrl: string | null = null;
  let isActionable = false;

  if (botMessages.length === 0) {
    replyText = 'Hi! Thank you for contacting TradeSlot Booking Assistant. When would you like to schedule your booking? Please reply with date & time (e.g. 2026-08-24 10:00).';
  } else {
    const lastBotMessage = botMessages[botMessages.length - 1].content;

    if (lastBotMessage.includes('Please reply with date & time')) {
      const parsedDate = new Date(message);
      if (isNaN(parsedDate.getTime())) {
        replyText = "I couldn't understand that date & time. Please reply in format YYYY-MM-DD HH:MM (e.g. 2026-08-24 10:00).";
      } else {
        // Shared Booking Engine validation (Dry-Run conflicts check)
        const minTime = new Date(parsedDate.getTime() - 24 * 60 * 60000);
        const maxTime = new Date(parsedDate.getTime() + 24 * 60 * 60000);

        const existingBookings = await prisma.booking.findMany({
          where: {
            traderId,
            status: { not: 'CANCELLED' },
            scheduledStart: { gte: minTime, lte: maxTime },
          },
        });

        const duration = 60;
        const buffer = 30;
        const scheduledEnd = new Date(parsedDate.getTime() + duration * 60000);
        const proposedBlockEnd = new Date(scheduledEnd.getTime() + buffer * 60000);

        let conflict = false;
        for (const b of existingBookings) {
          const existingStart = b.scheduledStart;
          const existingBlockEnd = new Date(b.scheduledEnd.getTime() + b.travelBufferMinutes * 60000);
          if (parsedDate < existingBlockEnd && existingStart < proposedBlockEnd) {
            conflict = true;
            break;
          }
        }

        if (conflict) {
          replyText = 'Sorry, that time slot is unavailable due to scheduling conflicts. Please choose another date & time.';
        } else {
          replyText = `Great, ${parsedDate.toLocaleString()} is available! What is your full name?`;
        }
      }
    } else if (lastBotMessage.includes('What is your full name?')) {
      replyText = 'Thank you! What is your email address?';
    } else if (lastBotMessage.includes('What is your email address?')) {
      replyText = 'Got it! What is your phone number?';
    } else if (lastBotMessage.includes('What is your phone number?')) {
      replyText = 'Thanks! Please send your job site address.';
    } else if (lastBotMessage.includes('Please send your job site address.')) {
      replyText = "Perfect! Would you like to confirm the booking? Reply 'YES' to confirm.";
      isActionable = true;
    } else if (lastBotMessage.includes("Reply 'YES' to confirm.")) {
      if (message.trim().toUpperCase() === 'YES') {
        const len = clientMessages.length;
        if (len >= 6) {
          const dateStr = clientMessages[len - 6].content;
          const customerName = clientMessages[len - 5].content;
          const customerEmail = clientMessages[len - 3].content;
          const customerPhone = clientMessages[len - 2].content;
          const jobAddress = clientMessages[len - 1].content;

          try {
            const booking = await BookingService.createBooking({
              traderId,
              scheduledStart: new Date(dateStr).toISOString(),
              customerName,
              customerEmail,
              customerPhone,
              jobAddress,
              conversationId: conversation.id,
            });

            const origin = `${req.protocol}://${req.get('host')}`;
            checkoutUrl = await PaymentService.createCheckoutSession(booking.id, origin);

            replyText = `Booking created successfully! To confirm the booking and secure the slot, please complete the flat fee payment of £${booking.bookingFee} here.`;
          } catch (err: any) {
            replyText = `Failed to create booking: ${err.message || 'Unknown error'}. Please start over by replying with date & time.`;
          }
        } else {
          replyText = 'Something went wrong tracking your responses. Please start over by replying with date & time.';
        }
      } else {
        replyText = 'Booking cancelled. Reply with date & time to start over.';
      }
    } else {
      replyText = 'Hi! Please reply with date & time (e.g. 2026-08-24 10:00) to start a new booking request.';
    }
  }

  // 4. Store Bot Response
  await ConversationService.createMessage(undefined, conversation.id, {
    direction: 'OUTBOUND',
    senderId: 'chatbot_system',
    content: replyText,
  });

  res.status(status.OK).json({
    success: true,
    data: {
      conversationId: conversation.id,
      reply: replyText,
      isActionable,
      checkoutUrl,
    },
  });
});

export const ChatController = {
  processChatMessage,
};
