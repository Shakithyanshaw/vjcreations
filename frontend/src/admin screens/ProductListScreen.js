import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function ProductListScreen() {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm('Are you sure to create a Product?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('product created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        const response = await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (response.data.success) {
          toast.success('Product deleted successfully');
          dispatch({ type: 'DELETE_SUCCESS' });
        } else {
          throw new Error(response.data.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error.message);
        toast.error('Failed to delete product');
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="marginAll">
      <Row>
        <Col>
          <h2>Products</h2>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler}>
              Create Product
            </Button>{' '}
            <Button type="button" onClick={handlePrint}>
              Generate PDF
            </Button>
          </div>
        </Col>
      </Row>

      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Table hover className="table ">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Name</th>
                <th style={{ textAlign: 'center' }}>Price</th>
                <th style={{ textAlign: 'center' }}>Category</th>
                <th style={{ textAlign: 'center' }}>Type</th>
                <th style={{ textAlign: 'center' }}>Brand</th>
                <th style={{ textAlign: 'center' }}>Rating</th>
                <th style={{ textAlign: 'center' }}>Count in Stock</th>
                <th style={{ textAlign: 'center' }}>Last updated at</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.type}</td>
                  <td>{product.brand}</td>

                  <td style={{ textAlign: 'center' }}>
                    <Badge pill bg="warning">
                      {product.rating} <i class="fas fa-star fa-0.25x"></i>
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {product.countInStock}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Badge pill bg="success">
                      {product.updatedAt.substring(0, 10)}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      type="button"
                      variant="outline-success"
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                    >
                      Edit
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="outline-danger"
                      onClick={() => deleteHandler(product)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
