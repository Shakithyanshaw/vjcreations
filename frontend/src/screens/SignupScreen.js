import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faCity,
  faMapMarkerAlt,
  faUnlockAlt,
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/SignupScreen.css';

export default function SignupScreen() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  // Validate name
  function validateName(name) {
    const regex = /^[a-zA-Z\s]+$/; // At least 2 characters, alphabets and spaces
    return regex.test(name);
  }
  // Validate email
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
    return regex.test(email);
  }
  // Validate mobile number
  function validateMobileNumber(number) {
    const regex = /^[0-9]{10}$/; // Exactly 10 digits
    return regex.test(number);
  }

  // Validate address (non-empty)
  //.../^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
  function validateAddress(address) {
    return address.trim() !== ''; // Check if the address is not empty
  }

  // Validate city
  function validateCity(city) {
    const regex = /^[a-zA-Z\s]{2,}$/; // At least 2 characters, alphabets and spaces
    return regex.test(city);
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);
    if (!validateName(name)) {
      toast.error('Name should only contain alphabets and spaces!');
      return;
    } else if (!validateEmail(email)) {
      toast.error('Email address is not valid!');
      return;
    } else if (!validateMobileNumber(mobileNo)) {
      toast.error('Phone number is not valid!');
      return;
    } else if (!validateAddress(address)) {
      toast.error("Address can't be empty!");
      return;
    } else if (!validateCity(city)) {
      toast.error(
        'City should be at least 2 characters and only contain alphabets and spaces!'
      );
      return;
    } else if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { data } = await Axios.post(`/api/users/signup`, {
        name,
        email,
        mobileNo,
        city,
        address,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
      toast.success('User created Successfully !');
    } catch (err) {
      toast.error(getError(err));
      //toast.error("Please enter valid details !");
    }
  };
  // Redirect if user is already signed in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="signup-background">
      <div className="signup-overlay">
        <Container className="small-container">
          <Helmet>
            <title>Sign Up</title>
          </Helmet>
          <h1 className="my-3 text-center">Sign Up</h1>
          <Form noValidate validated={validated} onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Name
              </Form.Label>
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid" className="invalidmessage">
                Please provide a valid Name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Email
              </Form.Label>
              <Form.Control
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" className="invalidmessage">
                Please provide a valid Email.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="mobileno">
              <Form.Label>
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                Mobile No
              </Form.Label>
              <Form.Control
                type="mobileno"
                required
                onChange={(e) => setMobileNo(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" className="invalidmessage">
                Please provide a valid Mobile No.
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="city">
                  <Form.Label>
                    <FontAwesomeIcon icon={faCity} className="mr-2" />
                    City
                  </Form.Label>
                  <Form.Control
                    type="city"
                    required
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    className="invalidmessage"
                  >
                    Please provide a valid city.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                    Address
                  </Form.Label>
                  <Form.Control
                    type="address"
                    required
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    className="invalidmessage"
                  >
                    Please provide a valid Address.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUnlockAlt} className="mr-2" />
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    className="invalidmessage"
                  >
                    Please provide a valid password.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4} className="mb-3">
                <Button type="submit" className="signup-button w-100">
                  Sign Up
                </Button>
              </Col>
              <Col
                md={8}
                className="mb-3 d-flex justify-content-end align-items-center"
              >
                <div>
                  Already have an account?{' '}
                  <Link
                    className="btnsignin"
                    to={`/signin?redirect=${redirect}`}
                  >
                    Sign-In
                  </Link>
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </div>
  );
}
