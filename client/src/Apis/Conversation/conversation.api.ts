import { fetchClient, APIResponse } from '../../lib/fetch-client';

export const conversationApi = {
  createConversation: (payload: { channel: string; traderId: string; externalId?: string; customerId?: string }) => 
    fetchClient.post<APIResponse<any>>('/conversations', payload),

  sendMessage: (conversationId: string, payload: { direction: string; senderId: string; content: string; bookingId?: string; externalId?: string }) => 
    fetchClient.post<APIResponse<any>>(`/conversations/${conversationId}/messages`, payload),

  getAllConversations: () => 
    fetchClient.get<APIResponse<any[]>>('/conversations'),

  getConversationById: (id: string) => 
    fetchClient.get<APIResponse<any>>(`/conversations/${id}`),

  getConversationMessages: (id: string) => 
    fetchClient.get<APIResponse<any[]>>(`/conversations/${id}/messages`),
};
