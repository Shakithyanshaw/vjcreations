import React, { useEffect, useReducer, useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import EventDetailsPopup from '../components/EventDetailsPopup';
import '../style/AdminCalendarScreen.css';

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

export default function AdminCalendarScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo.token]);

  const upcomingOrders = orders?.filter((order) => {
    const eventDate = new Date(order.shippingAddress.date);
    return !order.isDelivered && eventDate >= new Date();
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const handleTileClick = (date) => {
    setSelectedDate(date); // Update selectedDate with Date object
    setShowDetailsPopup(true);
  };

  const handleCloseDetailsPopup = () => {
    setShowDetailsPopup(false);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasDelivery = upcomingOrders.some(
        (order) =>
          new Date(order.shippingAddress.date).toLocaleDateString() ===
          date.toLocaleDateString()
      );
      return hasDelivery ? <div className="event-dot"></div> : null;
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <Helmet>
        <title>Admin Event Calendar</title>
      </Helmet>
      <h1>Event Calendar</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="calendar-wrapper">
            <Calendar
              className="calendar"
              tileContent={tileContent}
              onClickDay={handleTileClick}
            />
          </div>
          <EventDetailsPopup
            show={showDetailsPopup}
            onClose={handleCloseDetailsPopup}
            selectedDate={selectedDate ? selectedDate.toLocaleDateString() : ''}
            orders={upcomingOrders}
          />
        </>
      )}
    </div>
  );
}
