import { fetchClient, APIResponse } from '../../lib/fetch-client';

export const bookingApi = {
  createBooking: (payload: any) => 
    fetchClient.post<APIResponse<any>>('/bookings', payload),

  getAllBookings: () => 
    fetchClient.get<APIResponse<any[]>>('/bookings'),

  getBookingById: (id: string) => 
    fetchClient.get<APIResponse<any>>(`/bookings/${id}`),

  updateBooking: (id: string, payload: any) => 
    fetchClient.patch<APIResponse<any>>(`/bookings/${id}`, payload),

  deleteBooking: (id: string) => 
    fetchClient.delete<APIResponse<any>>(`/bookings/${id}`),

  getPublicBookingById: (id: string) =>
    fetchClient.get<APIResponse<any>>(`/bookings/public/${id}`),
};

