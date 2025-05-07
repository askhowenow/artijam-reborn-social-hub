
import React from 'react';
import { Service } from '@/hooks/use-services';
import AccommodationBookingForm from './AccommodationBookingForm';
import TravelBookingForm from './TravelBookingForm';
import FoodBookingForm from './FoodBookingForm';
import AttractionBookingForm from './AttractionBookingForm';

interface BookingFormSelectorProps {
  service: Service;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

/**
 * A component that selects the appropriate booking form based on the service category
 */
const BookingFormSelector: React.FC<BookingFormSelectorProps> = ({ service, onSubmit, isSubmitting }) => {
  // Normalize the category for comparison
  const category = service.category?.toLowerCase() || '';
  
  // Select the appropriate form component based on the service category
  if (category.includes('accommodations') || category.includes('accommodation')) {
    return <AccommodationBookingForm service={service} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  } else if (category.includes('travel') || category.includes('transportation')) {
    return <TravelBookingForm service={service} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  } else if (category.includes('food') || category.includes('restaurant') || category.includes('dining')) {
    return <FoodBookingForm service={service} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  } else if (category.includes('attractions') || category.includes('attraction') || category.includes('experience')) {
    return <AttractionBookingForm service={service} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  } else {
    // Default case - we could implement a generic booking form here, but for now we'll just show a message
    return (
      <div className="text-center p-8">
        <p>Booking form for {service.category || 'this service'} is not available yet.</p>
        <p className="text-sm text-gray-500 mt-2">Please contact the vendor directly to book this service.</p>
      </div>
    );
  }
};

export default BookingFormSelector;
