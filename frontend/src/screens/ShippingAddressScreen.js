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

  const [isNewAddress, setIsNewAddress] = useState(!shippingAddress);

  const [fullName, setFullName] = useState(
    isNewAddress ? '' : shippingAddress.fullName || ''
  );
  const [address, setAddress] = useState(
    isNewAddress ? '' : shippingAddress.address || ''
  );
  const [city, setCity] = useState(
    isNewAddress ? '' : shippingAddress.city || ''
  );
  const [time, setTime] = useState(
    isNewAddress ? '' : shippingAddress.time || ''
  );
  const [date, setDate] = useState(
    isNewAddress
      ? new Date()
      : shippingAddress.date
      ? new Date(shippingAddress.date)
      : new Date()
  );

  const cities = ['Jaffna'];

  const [postalCode, setPostalCode] = useState(
    isNewAddress ? '' : shippingAddress.postalCode || ''
  );
  useEffect(() => {
    if (!userInfo) {
      navigate(`/signin?redirect=/shipping`);
    }
  }, [userInfo, navigate]);
  const [country, setCountry] = useState(
    isNewAddress ? '' : shippingAddress.country || ''
  );

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

  const handleNewAddressToggle = () => {
    setIsNewAddress(!isNewAddress);
    if (!isNewAddress) {
      // Clear form fields when switching to new address
      setFullName('');
      setAddress('');
      setCity('');
      setTime('');
      setDate(new Date());
      setPostalCode('');
      setCountry('');
    } else {
      // Set form fields with saved address when switching back to saved address
      setFullName(shippingAddress.fullName || '');
      setAddress(shippingAddress.address || '');
      setCity(shippingAddress.city || '');
      setTime(shippingAddress.time || '');
      setDate(
        shippingAddress.date ? new Date(shippingAddress.date) : new Date()
      );
      setPostalCode(shippingAddress.postalCode || '');
      setCountry(shippingAddress.country || '');
    }
  };

  return (
    <div className="marginAll">
      <Helmet>
        <title>Shipping Addres</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h2 className="my-3">Event Location</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="isNewAddress">
            <Form.Check
              type="checkbox"
              label="Use a new address"
              checked={isNewAddress}
              onChange={handleNewAddressToggle}
              style={{ marginRight: '10px' }}
            />
          </Form.Group>
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
              <Form.Group className="mb-3" controlId="city">
                <Form.Label>City</Form.Label>
                <Form.Select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="">Select a District</option>
                  {cities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
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

          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3" controlId="date">
                <Form.Label>Date</Form.Label>
                <DatePicker
                  selected={new Date(date)}
                  onChange={(date) => setDate(date.toISOString())}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3" controlId="time">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

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
