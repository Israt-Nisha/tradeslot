import { fetchClient } from '../../lib/fetch-client';

export const bookingApi = {
  createBooking: (payload: any) => 
    fetchClient.post<any>('/bookings', payload),

  getAllBookings: () => 
    fetchClient.get<any[]>('/bookings'),

  getBookingById: (id: string) => 
    fetchClient.get<any>(`/bookings/${id}`),

  updateBooking: (id: string, payload: any) => 
    fetchClient.patch<any>(`/bookings/${id}`, payload),

  deleteBooking: (id: string) => 
    fetchClient.delete<any>(`/bookings/${id}`),
};
