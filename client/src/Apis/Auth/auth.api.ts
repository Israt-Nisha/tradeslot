import { fetchClient } from '../../lib/fetch-client';

export const authApi = {
  registerTrader: (payload: any) => 
    fetchClient.post<any>('/auth/register', payload),

  loginTrader: (payload: any) => 
    fetchClient.post<any>('/auth/login', payload),

  getTraderSession: () => 
    fetchClient.get<any>('/auth/session'),
};
