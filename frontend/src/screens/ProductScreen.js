import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: {
        reviews: [],
      },
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const addToCartHandler = async () => {
    if (!userInfo) {
      navigate('/signin');
      return;
    }
    const existItem = cart && cart.cartItems.find((x) => x.id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      console.log('Review submission response:', data); // Log the response data

      if (data.review) {
        // Check if data.review exists
        dispatch({
          type: 'CREATE_SUCCESS',
        });
        toast.success('Review submitted successfully');
        // Check if product.reviews exists before trying to unshift
        if (product.reviews) {
          product.reviews.unshift(data.review);
          product.numReviews = data.numReviews;
          product.rating = data.rating;
          console.log('Updated product after review submission:', product);
          dispatch({ type: 'REFRESH_PRODUCT', payload: product });
          window.scrollTo({
            behavior: 'smooth',
            top: reviewsRef.current.offsetTop,
          });
        }
      } else {
        toast.error('Failed to submit review: review data is missing');
      }
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  const bookServiceHandler = () => {
    if (!userInfo) {
      navigate('/signin');
      return;
    }

    if (product && product.type === 'service') {
      if (selectedDate && !isAvailable(selectedDate)) {
        toast.error('This service is not available on the selected date.');
        return;
      }

      const existItem =
        cart && cart.cartItems.find((x) => x.id === product._id);
      const quantity = existItem ? existItem.quantity + 1 : 1;
      ctxDispatch({
        type: 'CART_ADD_ITEM',
        payload: { ...product, quantity },
      });
      navigate('/cart');
    } else {
      console.error('Error: Product is not a service');
      toast.error('This item cannot be booked as it is not a service.');
    }
  };

  const renderActionButton = () => {
    if (!userInfo) {
      return (
        <MessageBox>
          Please <Link to="/signin">Sign In</Link> to proceed
        </MessageBox>
      );
    }

    if (product.type === 'product') {
      return (
        <div className="d-grid">
          <Button onClick={addToCartHandler}>Add to Cart</Button>
        </div>
      );
    } else if (product.type === 'service') {
      return (
        <div className="d-grid">
          <Button onClick={bookServiceHandler}>Book Now</Button>
        </div>
      );
    }
  };

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const isAvailable = (selectedDate) => {
    const currentDate = new Date();
    const nextSevenDates = [...Array(7)].map((_, index) => {
      const date = new Date();
      date.setDate(currentDate.getDate() + index);
      return date;
    });

    return nextSevenDates.some((date) => isSameDay(date, selectedDate));
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(price);
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div className="marginAll">
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>

            <ListGroup.Item>
              Price : {formatPrice(product.price)}
              {product.type === 'product' && (
                <span> (In Stock: {product.countInStock})</span>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {[product.image, ...(product.images || [])].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              Description: <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>{formatPrice(product.price)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Col>
                    {product.type === 'service' && (
                      <div>
                        <h5>Check Availability</h5>
                        <ReactDatePicker
                          style={{ width: '100px', fontSize: '14px' }}
                          selected={selectedDate}
                          onChange={handleDateChange}
                          minDate={new Date()}
                        />
                        {selectedDate && (
                          <div>
                            {isAvailable(selectedDate) ? (
                              <Badge bg="success">Available</Badge>
                            ) : (
                              <Badge bg="danger">Unavailable</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Col>
                  <Col>
                    {product.type === 'product' && (
                      <div>
                        {product.countInStock > 0 ? (
                          <Badge bg="success">Available</Badge>
                        ) : (
                          <Badge bg="danger">Unavailable</Badge>
                        )}
                      </div>
                    )}
                  </Col>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">{renderActionButton()}</div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <h2 ref={reviewsRef}>Reviews</h2>
          <div className="mb-3">
            {product.reviews && product.reviews.length === 0 && (
              <MessageBox>There is no review</MessageBox>
            )}
          </div>

          <ListGroup className="reviewproduct">
            {product.reviews &&
              product.reviews.map((review) => (
                <ListGroup.Item key={review._id}>
                  <strong>{review.name}</strong>
                  <Rating rating={review.rating} caption=" "></Rating>
                  <p>{review.createdAt.substring(0, 10)}</p>
                  <p>{review.comment}</p>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Col>
        <Col md={6}>
          <Card className="writereview">
            <div className="my-3">
              {userInfo ? (
                <form onSubmit={submitHandler}>
                  <h3>Write a customer review</h3>
                  <Form.Group className="mb-3" controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select
                      aria-label="Rating"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="1">1- Poor</option>
                      <option value="2">2- Fair</option>
                      <option value="3">3- Good</option>
                      <option value="4">4- Very good</option>
                      <option value="5">5- Excellent</option>
                    </Form.Select>
                  </Form.Group>
                  <FloatingLabel
                    controlId="floatingTextarea"
                    label="Comments"
                    className="mb-3"
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Leave a comment here"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </FloatingLabel>

                  <div className="mb-3">
                    <Button disabled={loadingCreateReview} type="submit">
                      Submit
                    </Button>
                    {loadingCreateReview && <LoadingBox></LoadingBox>}
                  </div>
                </form>
              ) : (
                <MessageBox>
                  Please{' '}
                  <Link to={`/signin?redirect=/product/${product.slug}`}>
                    Sign In
                  </Link>{' '}
                  to write a review
                </MessageBox>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProductScreen;
