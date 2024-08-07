import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Badge, Button, Table } from 'react-bootstrap';
import { Store } from '../Store';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { getError } from '../utils';

// Reducer function to handle state transitions
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  // useReducer to manage complex state transitions
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: [],
  });
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  // useEffect to fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo) return;
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/mine`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Sort orders based on createdAt date in descending order
        const sortedOrders = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: sortedOrders });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo]);
  // Determine current orders to display based on pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  // Function to handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Helmet>
        <title>Order History</title>
      </Helmet>

      <h1>My Orders</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : orders.length === 0 ? (
        <MessageBox>No orders found</MessageBox>
      ) : (
        <>
          <Table hover className="table">
            <thead>
              <tr>
                <th>Ordered Packages</th>
                <th>Date</th>
                <th>Event Location</th>
                <th>Total</th>
                <th>Paid on</th>
                <th>Delivered on</th>
                <th>Event Date</th>
                <th>Event Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <ul>
                      {order.orderItems.map((item) => (
                        <li key={item._id}>{item.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.shippingAddress.address}</td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                  <td className={order.isPaid ? '' : 'not-paid'}>
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <Badge pill bg="danger">
                        Not paid
                      </Badge>
                    )}
                  </td>
                  <td className={order.isDelivered ? '' : 'not-deliverd'}>
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <Badge pill bg="info">
                        Not delivered
                      </Badge>
                    )}
                  </td>
                  <td>
                    {new Date(order.shippingAddress.date).toLocaleDateString()}
                  </td>
                  <td>{order.shippingAddress.time}</td>
                  <td>
                    <Button
                      type="button"
                      variant="outline-success"
                      onClick={() => {
                        navigate(`/order/${order._id}`);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            itemsPerPage={ordersPerPage}
            totalItems={orders.length}
            paginate={paginate}
          />
        </>
      )}
    </div>
  );
}
// Pagination component
const Pagination = ({ itemsPerPage, totalItems, paginate }) => {
  const pageNumbers = [];
  // Calculate total number of pages
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
