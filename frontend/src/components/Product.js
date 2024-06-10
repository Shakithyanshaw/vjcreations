import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import Rating from './Rating';
// import axios from 'axios';
// import { Store } from '../Store';

function Product(props) {
  const { product } = props;
  const navigate = useNavigate();

  const sendDetailsToHomeScreen = () => {
    if (product.type === 'product') {
      navigate('/', { state: { product } });
    } else if (product.type === 'service') {
      navigate('/services', { state: { product } });
    }
  };

  const handleViewMore = () => {
    if (product.type === 'product') {
      navigate(`/product/${product.slug}`, { state: { product } });
    } else if (product.type === 'service') {
      navigate(`/product/${product.slug}`, { state: { product } });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(price);
  };

  return (
    <Card>
      <Link to={`/product/${product.slug}`} onClick={sendDetailsToHomeScreen}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{
            maxWidth: '287px',
            maxHeight: '177px',
            objectFit: 'cover',
          }}
        />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`} onClick={sendDetailsToHomeScreen}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>{formatPrice(product.price)}</Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Un-Available
          </Button>
        ) : (
          <Button onClick={handleViewMore}>View More</Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Product;
