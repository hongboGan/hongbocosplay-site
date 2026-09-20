import { Link } from 'react-router-dom';
import { priceLabel, moqLabel, getCategory } from '../data/products.js';

export default function ProductCard({ product }) {
  const cat = getCategory(product.category);
  return (
    <Link className="card" to={`/product/${product.id}`}>
      <div className="card__media">
        <img
          src={product.image}
          alt={product.title}
          width={product.width || 900}
          height={product.height || 1125}
          loading="lazy"
          decoding="async"
        />
      </div>
      <span className="card__cat">{cat ? cat.name : product.category}</span>
      <span className="card__title">{product.title}</span>
      <span className="card__price">{priceLabel(product)}</span>
      <span className="card__moq">{moqLabel(product)}</span>
    </Link>
  );
}
