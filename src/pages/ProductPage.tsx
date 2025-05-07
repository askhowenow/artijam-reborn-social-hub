
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Product Details</h1>
      <p>Placeholder for Product ID: {productId}</p>
      <p>This component will be implemented later.</p>
    </div>
  );
};

export default ProductPage;
