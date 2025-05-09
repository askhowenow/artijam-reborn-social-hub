
import { v4 as uuidv4 } from 'uuid';

// Generate client ID for guest cart
export const getGuestId = (): string => {
  let guestId = localStorage.getItem('guestCartId');
  
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem('guestCartId', guestId);
  }
  
  return guestId;
};
