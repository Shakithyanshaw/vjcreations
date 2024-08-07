import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Pagination from 'react-bootstrap/Pagination';
import Chatbox from '../components/Chatbox';
import Modal from 'react-bootstrap/Modal';
import { FaComments } from 'react-icons/fa';

// Reducer function to handle state transitions
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  // useReducer to manage complex state transitions
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [showChatbox, setShowChatbox] = useState(false);
  // useEffect to fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  // Filter products to show only those with type 'service'
  const filteredProducts = products.filter(
    (product) => product.type === 'service'
  );

  // Sort filtered products alphabetically by name
  filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

  // Pagination logic to determine current products to show
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  // Function to handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // Functions to handle chatbox visibility
  const handleShowChatbox = () => setShowChatbox(true);
  const handleCloseChatbox = () => setShowChatbox(false);

  return (
    <div>
      <Helmet>
        <title>VJ-Creations</title>
      </Helmet>
      <div className="chatbox-icon" onClick={handleShowChatbox}>
        <FaComments size={32} />
      </div>

      <Modal show={showChatbox} onHide={handleCloseChatbox} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chat with us</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Chatbox />
        </Modal.Body>
      </Modal>
      <h1>Our Services</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <Row>
              {currentProducts.map((product) => (
                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                  <Product product={product}></Product>
                </Col>
              ))}
            </Row>
            <Pagination>
              {[
                ...Array(
                  Math.ceil(filteredProducts.length / productsPerPage)
                ).keys(),
              ].map((x) => (
                <Pagination.Item
                  key={x + 1}
                  active={x + 1 === currentPage}
                  onClick={() => paginate(x + 1)}
                >
                  {x + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
