import { fetchClient, APIResponse } from '../../lib/fetch-client';

export const chatApi = {
  sendMessage: (payload: { traderId: string; message: string; conversationId?: string }) =>
    fetchClient.post<APIResponse<any>>('/chat/messages', payload),
};
