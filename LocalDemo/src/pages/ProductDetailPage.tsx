import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../store/products';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const product = useProducts(s=>s.products.find(p=>p.product_id===id));
  if (!product) return <div>Not found. <Link to="/products">Back</Link></div>;
  return (
    <div>
      <h2>{product.title}</h2>
      <pre>{JSON.stringify(product, null, 2)}</pre>
      <Link to="/products">Back</Link>
    </div>
  );
};
export default ProductDetailPage;
