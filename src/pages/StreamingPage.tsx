
import React from 'react';
import { useParams } from 'react-router-dom';

const StreamingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Live Stream</h1>
      <p>Placeholder for Stream ID: {id}</p>
      <p>This component will be implemented later.</p>
    </div>
  );
};

export default StreamingPage;
