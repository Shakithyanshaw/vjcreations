import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
//import Order from "../../../backend/models/OrderModel";
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
//import jsPDF from "jspdf";

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }

  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'LKR',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  async function paymentOrderHandler() {
    try {
      dispatch({ type: 'PAY_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/paycash`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'PAY_SUCCESS', payload: data });
      toast.success('Order is paid');
    } catch (err) {
      dispatch({ type: 'PAY_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  }

  const handlePrint = () => {
    window.print();
  };

  // Add console logs to debug values
  console.log('userInfo.isAdmin: ', userInfo.isAdmin);
  console.log('order.isPaid: ', order.isPaid);
  console.log('order.isDelivered: ', order.isDelivered);

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox varient="danger">{error}</MessageBox>
  ) : (
    <div className="marginAll">
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <Row>
        <Col md={10}>
          <h5 className="my-3">Order ID - {orderId}</h5>
        </Col>
        <Col md={2}>
          <Button
            className="btnPrint"
            type="button"
            varient="light"
            onClick={handlePrint}
          >
            Generate Invoice
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Shipping</Card.Title>
                  <Card.Text>
                    <strong>Name:</strong> {order.shippingAddress.fullName}{' '}
                    <br />
                    <strong>Address: </strong> {order.shippingAddress.address},
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode},
                    {order.shippingAddress.country}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date:</strong> {order.shippingAddress.date} <br />
                    <strong>Time:</strong> {order.shippingAddress.time}{' '}
                  </Card.Text>
                  {order.isDelivered ? (
                    <MessageBox variant="success">
                      Delivered at {order.deliveredAt}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Delivered</MessageBox>
                  )}
                  {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox></LoadingBox>}
                      <div className="d-grid">
                        <Button
                          className="deliverBtn"
                          type="button"
                          onClick={deliverOrderHandler}
                        >
                          Order Delivered
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Payment</Card.Title>
                  <Card.Text>
                    <strong>Method:</strong> {order.paymentMethod}
                  </Card.Text>
                  {order.isPaid ? (
                    <MessageBox variant="success">
                      Paid at {order.paidAt}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Paid</MessageBox>
                  )}

                  {order.paymentMethod === 'COD' &&
                  userInfo.isAdmin === true ? (
                    <Button
                      className="deliverBtn"
                      type="button"
                      onClick={paymentOrderHandler}
                    >
                      Cash Paied
                    </Button>
                  ) : (
                    <div class="alert" role="alert"></div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={7}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link
                          className="OrderProductName"
                          to={`/product/${item.slug}`}
                        >
                          {item.name}
                        </Link>
                      </Col>
                      <Col md={2}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>Rs{item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>Rs{order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>Rs{order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>Rs{order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>Rs{order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div className="paypalBtn">
                        <PayPalScriptProvider>
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                        </PayPalScriptProvider>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
