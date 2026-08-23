import { fetchClient, APIResponse } from '../../lib/fetch-client';

export const authApi = {
  registerTrader: (payload: any) => 
    fetchClient.post<APIResponse<any>>('/auth/register', payload),

  loginTrader: (payload: any) => 
    fetchClient.post<APIResponse<any>>('/auth/login', payload),

  getTraderSession: () => 
    fetchClient.get<APIResponse<any>>('/auth/session'),

  getAllTraders: () => 
    fetchClient.get<APIResponse<any[]>>('/auth/traders'),
};
