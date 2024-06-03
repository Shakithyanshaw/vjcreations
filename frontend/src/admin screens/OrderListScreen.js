import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import '../style/print.css';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Order Deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="marginAll">
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <Row>
        <Col md={10}>
          <h1>Orders</h1>{' '}
        </Col>
        <Col md={2}>
          <Button
            className="btnPrint"
            type="button"
            varient="light"
            onClick={handlePrint}
          >
            Generate PDF
          </Button>
        </Col>
      </Row>

      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Table hover className="table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Customer</th>
              <th style={{ textAlign: 'center' }}>Ordered Packages</th>
              <th style={{ textAlign: 'center' }}>Order placed on</th>
              <th style={{ textAlign: 'center' }}>Total</th>
              <th style={{ textAlign: 'center' }}>Payment Method</th>
              <th style={{ textAlign: 'center' }}>Payment Details</th>
              <th style={{ textAlign: 'center' }}>Delivered on</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <tr key={order._id}>
                  <td style={{ textAlign: 'center' }}>
                    {order.user ? order.user.name : 'DELETED USER'}
                  </td>
                  <td>
                    <ul>
                      {order.orderItems.map((item) => (
                        <li key={item._id}>{item.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td>{order.totalPrice.toFixed(2)}</td>

                  <td style={{ textAlign: 'center' }}>
                    {order.paymentMethod === 'PayPal' ? (
                      <Badge pill bg="primary">
                        {order.paymentMethod}
                      </Badge>
                    ) : order.paymentMethod === 'Cash On Delivery' ? (
                      <Badge pill bg="secondary">
                        {order.paymentMethod}
                      </Badge>
                    ) : (
                      order.paymentMethod
                    )}
                  </td>
                  <td
                    style={{ textAlign: 'center' }}
                    className={order.isPaid ? '' : 'not-paid'}
                  >
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <Badge pill bg="danger">
                        Not paid
                      </Badge>
                    )}
                  </td>

                  <td
                    style={{ textAlign: 'center' }}
                    className={order.isDelivered ? '' : 'not-deliverd'}
                  >
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <Badge pill bg="info">
                        Not deliverd
                      </Badge>
                    )}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <Button
                      type="button"
                      variant="outline-success"
                      onClick={() => {
                        navigate(`/order/${order._id}`);
                      }}
                    >
                      Details
                    </Button>
                    <br></br>
                    &nbsp;
                    <Button
                      type="button"
                      variant="outline-danger"
                      onClick={() => deleteHandler(order)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
