
export type EventStatus = 'draft' | 'published' | 'canceled' | 'completed';
export type TicketType = 'free' | 'paid' | 'donation' | 'reserved';

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  type: TicketType;
  salesStartDate: string;
  salesEndDate: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: Location;
  organizerId: string;
  organizerName?: string;
  featuredImage?: string;
  ticketTiers: TicketTier[];
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  capacity?: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  tierId: string;
  userId: string;
  purchaseDate: string;
  price: number;
  currency: string;
  status: 'valid' | 'used' | 'canceled' | 'expired';
  qrCode?: string;
  attendeeName?: string;
  attendeeEmail?: string;
}

export interface UseEventsOptions {
  filterByStatus?: EventStatus[];
  filterByOrganizer?: string;
  filterByDate?: {
    start?: string;
    end?: string;
  };
}

export interface UseEventsResult {
  events: Event[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'ticketTiers'>) => Promise<Event>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  publishEvent: (id: string) => Promise<Event>;
  cancelEvent: (id: string) => Promise<Event>;
}

export interface UseTicketsOptions {
  eventId?: string;
  userId?: string;
}

export interface UseTicketsResult {
  tickets: Ticket[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  purchaseTicket: (ticketData: Omit<Ticket, 'id' | 'purchaseDate' | 'status' | 'qrCode'>) => Promise<Ticket>;
  cancelTicket: (id: string) => Promise<void>;
  validateTicket: (id: string) => Promise<boolean>;
  generateQrCode: (id: string) => Promise<string>;
  sendTicketByEmail: (id: string, email: string) => Promise<void>;
}
