import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, { loading: false });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.06 * cart.itemsPrice);

  const getDiscountPercentage = (totalPrice) => {
    if (totalPrice >= 600000) return 10;
    if (totalPrice >= 300000) return 7;
    if (totalPrice >= 200000) return 5;
    if (totalPrice >= 100000) return 4;
    if (totalPrice >= 50000) return 2.5;
    if (totalPrice >= 0) return 1;
    return 0;
  };

  const discountPercentage = getDiscountPercentage(cart.itemsPrice);
  const discountAmount = round2((cart.itemsPrice * discountPercentage) / 100);
  cart.totalPrice =
    cart.itemsPrice + cart.shippingPrice + cart.taxPrice - discountAmount;

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
          discountAmount: discountAmount,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }

    if (cart.paymentMethod === 'PayPal' && cart.totalPrice > 0) {
      const loadPayPalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPayPalScript();
    }
  }, [cart, navigate, paypalDispatch, userInfo.token]);

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data: orderData } = await axios.post(
          '/api/orders',
          {
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
            discountAmount: discountAmount,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        ctxDispatch({ type: 'CART_CLEAR' });
        dispatch({ type: 'CREATE_SUCCESS' });
        localStorage.removeItem('cartItems');
        navigate(`/order/${orderData.order._id}`);
      } catch (err) {
        dispatch({ type: 'CREATE_FAIL' });
        toast.error(getError(err));
      }
    });
  };

  const onError = (err) => {
    toast.error(getError(err));
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const [hours, minutes] = timeString.split(':');
    date.setHours(hours, minutes);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(price);
  };

  return (
    <div className="marginAll">
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h3 className="my-3">My Order summary</h3>

      <Row>
        <Col md={8}>
          <Row>
            <Col md={6}>
              <Card className="mb-3 mt-5 bg-light text-dark">
                <Card.Body>
                  <Card.Title>Shipping / Event Details</Card.Title>
                  <Card.Text>
                    <strong>Name:</strong> {cart.shippingAddress.fullName}{' '}
                    <br />
                    <strong>Address: </strong> {cart.shippingAddress.address},
                    {cart.shippingAddress.city},{' '}
                    {cart.shippingAddress.postalCode},
                    {cart.shippingAddress.country}
                    <br />
                    <strong>Date & Time : </strong>{' '}
                    {formatDateTime(
                      cart.shippingAddress.date,
                      cart.shippingAddress.time
                    )}
                  </Card.Text>
                  <Link className="btn btn-info" to="/shipping">
                    Edit
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3 mt-5 bg-light text-dark">
                <Card.Body>
                  <Card.Title>Payment Method</Card.Title>
                  <Card.Text className="mt-5">
                    <strong>Method:</strong> {cart.paymentMethod}
                  </Card.Text>
                  <Link className="btn btn-info mt-2" to="/payment">
                    Edit
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col md={4}>
          <Card className="bg-light mt-5 text-dark">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>{formatPrice(cart.itemsPrice)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>{formatPrice(cart.shippingPrice)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>{formatPrice(cart.taxPrice)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Discount</Col>
                    <Col>- {formatPrice(discountAmount)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      <strong>{formatPrice(cart.totalPrice)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {cart.paymentMethod === 'PayPal' && !isPending && (
                  <ListGroup.Item>
                    <PayPalScriptProvider
                      options={{
                        'client-id': 'YOUR_CLIENT_ID',
                        currency: 'USD',
                      }}
                    >
                      <PayPalButtons
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: { value: cart.totalPrice },
                              },
                            ],
                          });
                        }}
                        onApprove={onApprove}
                        onError={onError}
                      ></PayPalButtons>
                    </PayPalScriptProvider>
                  </ListGroup.Item>
                )}
                {cart.paymentMethod === 'COD' && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button
                        type="button"
                        onClick={placeOrderHandler}
                        disabled={cart.cartItems.length === 0}
                      >
                        Place Order
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
                {loading && <LoadingBox></LoadingBox>}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Col md={8}>
        <Card className="mb-3 bg-light text-dark">
          <Card.Body>
            <Card.Title>Items</Card.Title>
            <ListGroup variant="flush">
              {cart.cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={7}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                      <Link
                        className="linkstyle ml-5"
                        to={`/product/${item.slug}`}
                      >
                        <strong>{item.name}</strong>
                      </Link>
                    </Col>
                    <Col md={2}>
                      <span>{item.quantity}</span>
                    </Col>
                    <Col md={3}>{formatPrice(item.price)}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Link className="btn btn-info" to="/cart">
              Edit
            </Link>
          </Card.Body>
        </Card>
      </Col>
    </div>
  );
}
