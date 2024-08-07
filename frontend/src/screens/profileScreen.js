import React, { useContext, useReducer, useState } from 'react';
import { Store } from '../Store';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

// Reducer function to handle profile update states
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };

    default:
      return state;
  }
};

export default function ProfileScreen() {
  // Extract user info and dispatch from context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  // Initialize state variables for user profile details and form inputs
  const [name, setName] = useState(userInfo ? userInfo.name : '');
  const [email, setEmail] = useState(userInfo ? userInfo.email : '');
  const [mobileNo, setMobileNo] = useState(userInfo ? userInfo.mobileNo : '');
  const [city, setCity] = useState(userInfo ? userInfo.city : '');
  const [address, setAddress] = useState(userInfo ? userInfo.address : '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // State and dispatch for handling profile update status
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  // Handle form submission for profile update
  const submitHandler = async (e) => {
    e.preventDefault();
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    // If either password or confirm password is filled but the other is not, show an error
    if ((password && !confirmPassword) || (!password && confirmPassword)) {
      toast.error('Both password fields must be filled');
      return;
    }
    try {
      // Send updated profile data to the server
      const { data } = await axios.put(
        '/api/users/profile/update', // Update endpoint URL
        {
          name,
          email,
          mobileNo,
          city,
          address,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      // Dispatch action to update user info in context
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('User updated successfully');
    } catch (err) {
      dispatch({
        type: 'UPDATE_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div className="container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <Row>
        <Col md={7}>
          <h2 className="my-3">My Profile</h2>
        </Col>
        <Col md={5}>
          <h2 className="my-3">Edit Profile</h2>
        </Col>
      </Row>

      <Row>
        <Col md={7}>
          <Card>
            <Card.Title>
              <h5>My name : {name}</h5>
            </Card.Title>
            <Card.Body>
              <h5>Email Address : {email}</h5>
              <h5>Mobile No : {mobileNo}</h5>
              <h5>Address : {address}</h5>
              <h5>City : {city}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Mobile No</Form.Label>
              <Form.Control
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mb-3">
              <Button type="submit">Update</Button>
            </div>
          </form>
        </Col>
      </Row>
    </div>
  );
}
