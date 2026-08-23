import { Request, Response } from 'express';
import status from 'http-status';
import { prisma } from '../../lib/prisma';
import catchAsync from '../../utils/catchAsync';
import config from '../../config';
import { ConversationService } from '../Conversation/conversation.service';
import { BookingService } from '../Booking/booking.service';
import { PaymentService } from '../Payment/payment.service';
import { PaymentController } from '../Payment/payment.controller';

const sendWhatsAppMessage = async (to: string, text: string) => {
  const token = config.whatsapp_access_token;
  const phoneNumberId = config.whatsapp_phone_number_id;

  if (!token || !phoneNumberId) {
    console.log(`[MOCK WHATSAPP OUTBOUND] To: ${to}, Message: ${text}`);
    return;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });
    const resData = await response.json();
    console.log('[WHATSAPP API RESPONSE]', resData);
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
  }
};

const whatsappVerify = catchAsync(async (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp_verify_token) {
    res.status(status.OK).send(challenge);
  } else {
    res.sendStatus(status.FORBIDDEN);
  }
});

const whatsappMessage = catchAsync(async (req: Request, res: Response) => {
  const { body: reqBody } = req;

  // Verify it is a valid whatsapp payload
  if (!reqBody.object || reqBody.object !== 'whatsapp_business_account') {
    res.sendStatus(status.BAD_REQUEST);
    return;
  }

  const entry = reqBody.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (!message) {
    // Delivery receipt or other webhook event, acknowledge and skip
    res.sendStatus(status.OK);
    return;
  }

  const from = message.from;
  const msgId = message.id;
  const textBody = message.text?.body;

  if (!textBody) {
    res.sendStatus(status.OK);
    return;
  }

  // Find or create conversation for WHATSAPP channel
  let conversation = await prisma.conversation.findFirst({
    where: {
      channel: 'WHATSAPP',
      externalId: from,
    },
    include: {
      messages: {
        orderBy: { sentAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    // Locate first active trader profile as default destination
    const trader = await prisma.traderProfile.findFirst({
      where: { isActive: true },
    });
    
    if (!trader) {
      res.sendStatus(status.OK);
      return;
    }

    conversation = await prisma.conversation.create({
      data: {
        channel: 'WHATSAPP',
        externalId: from,
        traderId: trader.id,
      },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });
  }

  // Store incoming message (Normalized via ConversationService)
  await ConversationService.createMessage(undefined, conversation.id, {
    direction: 'INBOUND',
    senderId: from,
    content: textBody,
    externalId: msgId,
  });

  // Load message logs to evaluate state
  const conversationMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { sentAt: 'asc' },
  });

  const botMessages = conversationMessages.filter((m) => m.direction === 'OUTBOUND');
  const clientMessages = conversationMessages.filter((m) => m.direction === 'INBOUND');

  let replyText = '';

  if (botMessages.length === 0) {
    replyText = 'Hi! Thank you for contacting TradeSlot. When would you like to schedule your booking? Please reply with date & time (e.g. 2026-08-24 10:00).';
  } else {
    const lastBotMessage = botMessages[botMessages.length - 1].content;

    if (lastBotMessage.includes('Please reply with date & time')) {
      const parsedDate = new Date(textBody);
      if (isNaN(parsedDate.getTime())) {
        replyText = "I couldn't understand that date & time. Please reply in format YYYY-MM-DD HH:MM (e.g. 2026-08-24 10:00).";
      } else {
        // Shared Booking Engine validation (Dry-Run conflicts check)
        const traderId = conversation.traderId;
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
    } else if (lastBotMessage.includes("Reply 'YES' to confirm.")) {
      if (textBody.trim().toUpperCase() === 'YES') {
        const len = clientMessages.length;
        if (len >= 6) {
          const dateStr = clientMessages[len - 6].content;
          const customerName = clientMessages[len - 5].content;
          const customerEmail = clientMessages[len - 4].content;
          const customerPhone = clientMessages[len - 3].content;
          const jobAddress = clientMessages[len - 2].content;

          try {
            const booking = await BookingService.createBooking({
              traderId: conversation.traderId,
              scheduledStart: new Date(dateStr).toISOString(),
              customerName,
              customerEmail,
              customerPhone,
              jobAddress,
              conversationId: conversation.id,
            });

            const origin = `${req.protocol}://${req.get('host')}`;
            const checkoutUrl = await PaymentService.createCheckoutSession(booking.id, origin);

            replyText = `Booking created successfully! To confirm the booking and secure the slot, please complete the flat fee payment of £${booking.bookingFee} here: ${checkoutUrl}`;
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

  // Store Bot Response
  await ConversationService.createMessage(undefined, conversation.id, {
    direction: 'OUTBOUND',
    senderId: 'whatsapp_agent_bot',
    content: replyText,
    externalId: `reply_${Date.now()}`,
  });

  // Outbound Message send callback
  await sendWhatsAppMessage(from, replyText);

  res.sendStatus(status.OK);
});

const stripeWebhook = PaymentController.handleWebhook;

export const WebhookController = {
  whatsappVerify,
  whatsappMessage,
  stripeWebhook,
};
