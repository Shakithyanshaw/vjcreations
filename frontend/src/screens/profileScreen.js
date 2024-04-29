import React, { useContext, useReducer, useState } from 'react';
import { Store } from '../Store';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

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
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [mobileNo, setMobileNo] = useState(userInfo.mobileNo);
  const [city, setCity] = useState(userInfo.city);
  const [address, setAddress] = useState(userInfo.address);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/api/users/profile',
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
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('User updated successfully');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
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
                type="mobileno"
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
                    type="city"
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
