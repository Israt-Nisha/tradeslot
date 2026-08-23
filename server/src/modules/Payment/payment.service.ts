import status from 'http-status';
import { stripe } from '../../config/stripe.config';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { BookingStatus, PaymentStatus } from '../../../generated/prisma/client';

const initiateStripeConnect = async (traderId: string, origin: string) => {
  const trader = await prisma.traderProfile.findUnique({
    where: { id: traderId },
  });

  if (!trader) {
    throw new AppError(status.NOT_FOUND, 'Trader profile not found');
  }

  let stripeAccountId = trader.stripeAccountId;
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;

    await prisma.traderProfile.update({
      where: { id: traderId },
      data: { stripeAccountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${origin}/api/v1/payments/onboard-refresh?accountId=${stripeAccountId}&traderId=${traderId}`,
    return_url: `${origin}/api/v1/payments/onboard-return?accountId=${stripeAccountId}&traderId=${traderId}`,
    type: 'account_onboarding',
  });

  return accountLink.url;
};

const completeOnboarding = async (accountId: string, traderId: string) => {
  const account = await stripe.accounts.retrieve(accountId);
  if (account.details_submitted) {
    await prisma.traderProfile.update({
      where: { id: traderId },
      data: { stripeOnboarded: true },
    });
    return true;
  }
  return false;
};

const createCheckoutSession = async (bookingId: string, origin: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trader: true,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, 'Booking not found');
  }

  const trader = booking.trader;
  if (!trader.stripeAccountId || !trader.stripeOnboarded) {
    throw new AppError(
      status.BAD_REQUEST,
      'Trader has not set up or completed Stripe Connect onboarding'
    );
  }

  // Check if booking is already paid
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.SUCCEEDED) {
    throw new AppError(status.BAD_REQUEST, 'This booking has already been paid');
  }

  const amountInCents = Math.round(Number(booking.bookingFee) * 100);
  
  // Platform flat fee: £5.00
  const PLATFORM_FLAT_FEE = 5.00;
  // Ensure application fee doesn't exceed total booking fee
  const applicationFeeInCents = Math.min(
    amountInCents,
    Math.round(PLATFORM_FLAT_FEE * 100)
  );
  const applicationFeeDecimal = applicationFeeInCents / 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: booking.currency.toLowerCase(),
          product_data: {
            name: `Booking Flat Fee`,
            description: `Booking ID: ${booking.id}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_intent_data: {
      application_fee_amount: applicationFeeInCents,
      transfer_data: {
        destination: trader.stripeAccountId,
      },
      metadata: {
        bookingId: booking.id,
      },
    },
    success_url: `${origin}/api/v1/payments/success?bookingId=${booking.id}`,
    cancel_url: `${origin}/api/v1/payments/cancel?bookingId=${booking.id}`,
  });

  // Upsert pending payment record
  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      amount: booking.bookingFee,
      applicationFee: applicationFeeDecimal,
      currency: booking.currency,
      status: PaymentStatus.PENDING,
    },
    update: {
      amount: booking.bookingFee,
      applicationFee: applicationFeeDecimal,
      currency: booking.currency,
      status: PaymentStatus.PENDING,
    },
  });

  return session.url;
};

const handleWebhook = async (sig: string, rawBody: string | Buffer, webhookSecret: string) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const bookingId = session.metadata?.bookingId;
    const paymentIntentId = session.payment_intent as string;

    if (bookingId) {
      await processSuccessfulPayment(bookingId, paymentIntentId);
    }
  } else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const bookingId = paymentIntent.metadata?.bookingId;
    const paymentIntentId = paymentIntent.id;
    const latestChargeId = paymentIntent.latest_charge as string;

    if (bookingId) {
      await processSuccessfulPayment(bookingId, paymentIntentId, latestChargeId);
    }
  }
};

const processSuccessfulPayment = async (
  bookingId: string,
  paymentIntentId: string,
  chargeId?: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
    await prisma.$transaction([
      prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          amount: 50.00, // Fallback
          applicationFee: 5.00,
          currency: 'GBP',
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: chargeId,
          paidAt: new Date(),
        },
        update: {
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: chargeId,
          paidAt: new Date(),
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
        },
      }),
    ]);
  }
};

export const PaymentService = {
  initiateStripeConnect,
  completeOnboarding,
  createCheckoutSession,
  handleWebhook,
};
