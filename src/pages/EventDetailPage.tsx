
import React from "react";
import { useParams } from "react-router-dom";
import EventDetail from "@/components/events/EventDetail";

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return <EventDetail />;
};

export default EventDetailPage;
