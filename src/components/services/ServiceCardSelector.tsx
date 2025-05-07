
import React from 'react';
import { Service } from '@/hooks/use-services';
import ServiceCard from './ServiceCard';
import AccommodationServiceCard from './AccommodationServiceCard';
import TravelServiceCard from './TravelServiceCard';
import FoodServiceCard from './FoodServiceCard';
import AttractionServiceCard from './AttractionServiceCard';

interface ServiceCardSelectorProps {
  service: Service;
  onClick: () => void;
}

/**
 * A component that selects the appropriate service card type based on the service category
 */
const ServiceCardSelector: React.FC<ServiceCardSelectorProps> = ({ service, onClick }) => {
  // Normalize the category for comparison
  const category = service.category?.toLowerCase() || '';
  
  // Select the appropriate card component based on the service category
  if (category.includes('accommodations') || category.includes('accommodation')) {
    return <AccommodationServiceCard service={service} onClick={onClick} />;
  } else if (category.includes('travel') || category.includes('transportation')) {
    return <TravelServiceCard service={service} onClick={onClick} />;
  } else if (category.includes('food') || category.includes('restaurant') || category.includes('dining')) {
    return <FoodServiceCard service={service} onClick={onClick} />;
  } else if (category.includes('attractions') || category.includes('attraction') || category.includes('experience')) {
    return <AttractionServiceCard service={service} onClick={onClick} />;
  } else {
    // Default to the standard service card
    return <ServiceCard service={service} onClick={onClick} />;
  }
};

export default ServiceCardSelector;
