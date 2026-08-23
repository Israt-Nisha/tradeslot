import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notFound from './middlewares/notFound';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import router from './routes';
import { PaymentController } from './modules/Payment/payment.controller';

const app: Application = express();

// parsers
app.use(express.json());

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

app.use(cors());
app.use(cookieParser())

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from TradeSlot Application World!');
});

app.use(notFound)
app.use(globalErrorHandler)

export default app;
