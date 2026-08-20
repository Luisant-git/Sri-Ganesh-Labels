import React, { useState, useEffect } from 'react';
import { getTopProducts } from '../api/dashboardApi';

const TopSellingProducts = ({ scrollRef }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const data = await getTopProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  return (
    <div className="products-scroller" ref={scrollRef}>
      {products.map((product, index) => (
        <div key={index} className="product-card">
          <div className="product-image-bg">
            <img src={product.image} alt={product.name} />
          </div>
          <h4>{product.name}</h4>
          <p>{product.sold} Pcs</p>
        </div>
      ))}
    </div>
  );
};

export default TopSellingProducts;