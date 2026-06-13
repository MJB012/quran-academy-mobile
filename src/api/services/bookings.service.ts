import { api, unwrap } from '../client';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingParty {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
}

export interface Booking {
  id: string;
  studentId: string | BookingParty;
  teacherId: string | BookingParty;
  date: string;
  timeSlot: string;
  durationMins: number;
  subject: string;
  status: BookingStatus;
  totalAmount: number;
}

export function bookingPartyName(party: string | BookingParty | undefined): string {
  if (!party) return '';
  if (typeof party === 'string') return '';
  return `${party.firstName} ${party.lastName}`.trim();
}

export interface CreateBookingInput {
  teacherId: string;
  date: string;
  timeSlot: string;
  durationMins: number;
  subject: string;
}

export const BookingsService = {
  async create(input: CreateBookingInput): Promise<Booking> {
    return unwrap<Booking>(api.post('/bookings', input));
  },

  async list(status?: BookingStatus): Promise<Booking[]> {
    return unwrap<Booking[]>(api.get('/bookings', { params: status ? { status } : undefined }));
  },

  async get(id: string): Promise<Booking> {
    return unwrap<Booking>(api.get(`/bookings/${id}`));
  },

  async cancel(id: string): Promise<Booking> {
    return unwrap<Booking>(api.patch(`/bookings/${id}/cancel`));
  },
};
