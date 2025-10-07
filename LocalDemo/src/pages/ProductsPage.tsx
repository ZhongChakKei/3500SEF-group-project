import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../store/products';

const ProductsPage: React.FC = () => {
  const products = useProducts(s=>s.products);
  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.product_id}>
            <Link to={`/products/${p.product_id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ProductsPage;
