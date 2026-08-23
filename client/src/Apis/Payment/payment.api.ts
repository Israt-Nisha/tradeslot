import { fetchClient, APIResponse } from '../../lib/fetch-client';

export const paymentApi = {
  connectSetup: () => 
    fetchClient.post<APIResponse<{ url: string }>>('/payments/connect-setup'),

  createCheckoutSession: (bookingId: string) => 
    fetchClient.post<APIResponse<{ url: string }>>('/payments/checkout-session', { bookingId }),
};
