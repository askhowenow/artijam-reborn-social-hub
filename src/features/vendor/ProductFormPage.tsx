
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProductForm from '@/components/vendor/ProductForm';

const ProductFormPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Product Form | Artijam</title>
        <meta name="description" content="Create or edit your product with AR capabilities" />
      </Helmet>
      <ProductForm />
    </>
  );
};

export default ProductFormPage;
