import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [time, setTime] = useState(shippingAddress.time || '');
  const [date, setDate] = useState(shippingAddress.date || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  useEffect(() => {
    if (!userInfo) {
      navigate(`/signin?redirect=/shipping`);
    }
  }, [userInfo, navigate]);
  const [country, setCountry] = useState(shippingAddress.country || '');

  const submitHandler = (e) => {
    e.preventDefault();

    const currentDate = new Date();

    // Check if the selected date is in the past
    if (date < currentDate) {
      alert('You cannot choose a past date.');
      return;
    }

    // Check if the selected time is in the past
    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    selectedDateTime.setHours(hours);
    selectedDateTime.setMinutes(minutes);

    if (selectedDateTime < currentDate) {
      alert('You cannot choose a past time.');
      return;
    }
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        date,
        time,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        date,
        time,
      })
    );
    navigate('/payment');
  };

  return (
    <div className="marginAll">
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h2 className="my-3">Address</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="address">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="postalCode">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3" controlId="date">
                <Form.Label>Date</Form.Label>
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={9}>
              <Form.Group className="mb-3" controlId="time">
                <Form.Label>Expected Time</Form.Label>
                <Form.Control
                  value={time}
                  pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] (am|pm)$"
                  title="Please enter a time in the format hh:mm am/pm"
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>

          <div className="mb-3">
            <Button variant="dark" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
