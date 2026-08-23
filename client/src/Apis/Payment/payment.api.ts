import { fetchClient } from '../../lib/fetch-client';

export const paymentApi = {
  connectSetup: () => 
    fetchClient.post<{ url: string }>('/payments/connect-setup'),

  createCheckoutSession: (bookingId: string) => 
    fetchClient.post<{ url: string }>('/payments/checkout-session', { bookingId }),
};
