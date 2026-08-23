import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { PaymentService } from './payment.service';
import config from '../../config';

const connectSetup = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized to access this resource');
  }

  const origin = `${req.protocol}://${req.get('host')}`;
  const url = await PaymentService.initiateStripeConnect(req.user.id, origin);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Stripe onboarding URL generated successfully',
    data: { url },
  });
});

const onboardReturn = catchAsync(async (req: Request, res: Response) => {
  const { accountId, traderId } = req.query;

  if (!accountId || !traderId) {
    throw new AppError(status.BAD_REQUEST, 'Missing accountId or traderId');
  }

  const completed = await PaymentService.completeOnboarding(
    accountId as string,
    traderId as string
  );

  if (completed) {
    res.send(`
      <html>
        <head>
          <title>Stripe Onboarding</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f5f6; }
            .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #30c275; margin-bottom: 10px; font-size: 24px; }
            p { color: #555; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Onboarding Completed!</h1>
            <p>Your Stripe Connect account has been successfully linked to TradeSlot.</p>
            <p>You can now close this tab and return to the application.</p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <head>
          <title>Stripe Onboarding</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f5f6; }
            .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #e15241; margin-bottom: 10px; font-size: 24px; }
            p { color: #555; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Onboarding Incomplete</h1>
            <p>It seems some details are still missing. Please try again or complete the setup inside your Stripe Dashboard.</p>
          </div>
        </body>
      </html>
    `);
  }
});

const onboardRefresh = catchAsync(async (req: Request, res: Response) => {
  const { accountId, traderId } = req.query;

  if (!accountId || !traderId) {
    throw new AppError(status.BAD_REQUEST, 'Missing accountId or traderId');
  }

  const origin = `${req.protocol}://${req.get('host')}`;
  const url = await PaymentService.initiateStripeConnect(traderId as string, origin);

  res.redirect(url);
});

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const origin = `${req.protocol}://${req.get('host')}`;

  const url = await PaymentService.createCheckoutSession(bookingId, origin);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Stripe Checkout Session URL generated successfully',
    data: { url },
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.stripe_webhook_secret;

  if (!sig || !webhookSecret) {
    throw new AppError(status.BAD_REQUEST, 'Missing stripe-signature or webhook secret configuration');
  }

  await PaymentService.handleWebhook(sig as string, req.body, webhookSecret);

  res.status(status.OK).json({ received: true });
});

const successRedirect = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.query;
  res.redirect(`http://localhost:3000/payment/success?bookingId=${bookingId}`);
});

const cancelRedirect = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.query;
  res.redirect(`http://localhost:3000/payment/cancel?bookingId=${bookingId}`);
});


export const PaymentController = {
  connectSetup,
  onboardReturn,
  onboardRefresh,
  createCheckoutSession,
  handleWebhook,
  successRedirect,
  cancelRedirect,
};
