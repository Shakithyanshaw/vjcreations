import { useContext } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import { Link, useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import { ListGroupItem } from 'react-bootstrap';
import Button from 'react-bootstrap/esm/Button';
import Card from 'react-bootstrap/Card';
import axios from 'axios';

export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  // Function to update the quantity of an item in the cart
  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is Unavailable');
      return;
    }
    // Dispatch action to update cart with new quantity
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  // Function to remove an item from the cart
  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  // Function to proceed to the checkout page
  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };
  // Function to format price to Sri Lankan Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(price);
  };

  return (
    <div className="marginAll">
      <Helmet>
        <title>Cart</title>
      </Helmet>
      <h2>My Cart</h2>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? ( // Check if cart is empty
            <MessageBox>
              Dear valuable customer, Your Cart is empty.
              <Link to="/">Go to Shopping</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroupItem key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                      <Link className="cardname" to={`/product/${item._id}`}>
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={3}>
                      {item.type === 'product' && (
                        <>
                          <Button
                            onClick={() =>
                              updateCartHandler(item, item.quantity - 1)
                            }
                            variant="light"
                            disabled={item.quantity === 1}
                          >
                            <i className="fas fa-minus-circle"></i>
                          </Button>{' '}
                          <span>{item.quantity}</span>{' '}
                          <Button
                            variant="light"
                            onClick={() =>
                              updateCartHandler(item, item.quantity + 1)
                            }
                            disabled={item.quantity === item.countInStock}
                          >
                            <i className="fas fa-plus-circle"></i>
                          </Button>
                        </>
                      )}
                    </Col>
                    <Col md={3}>{formatPrice(item.price)}</Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items) :{' '}
                    {formatPrice(
                      cartItems.reduce((a, c) => a + c.price * c.quantity, 0)
                    )}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={checkoutHandler}
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
