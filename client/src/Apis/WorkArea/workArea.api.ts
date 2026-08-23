import { fetchClient, APIResponse } from '../../lib/fetch-client';

export const workAreaApi = {
  createWorkArea: (payload: any) => 
    fetchClient.post<APIResponse<any>>('/work-areas', payload),

  getAllWorkAreas: () => 
    fetchClient.get<APIResponse<any[]>>('/work-areas'),

  getWorkAreaById: (id: string) => 
    fetchClient.get<APIResponse<any>>(`/work-areas/${id}`),

  updateWorkArea: (id: string, payload: any) => 
    fetchClient.patch<APIResponse<any>>(`/work-areas/${id}`, payload),

  deleteWorkArea: (id: string) => 
    fetchClient.delete<APIResponse<any>>(`/work-areas/${id}`),
};
