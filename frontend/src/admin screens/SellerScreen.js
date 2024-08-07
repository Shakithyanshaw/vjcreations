import React, { useReducer, useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Chart from 'react-google-charts';
import { useNavigate } from 'react-router-dom';

// Reducer function to handle different action types
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SellerScreen() {
  const navigate = useNavigate();
  // useReducer hook to manage the component state
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const { userInfo } = state;

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/seller', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div className="marginAll">
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row className="dashboardCard">
            <Col md={3}>
              <div className="my-3">
                <Row>
                  <Col md={8}>
                    <h4>Products count by Companies</h4>
                  </Col>
                  <Col md={4}></Col>
                </Row>

                {summary.productBrands.length === 0 ? (
                  <MessageBox>No Customers</MessageBox>
                ) : (
                  <Chart
                    width="90%"
                    height="300px"
                    chartType="PieChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ['Company', 'Products'],
                      ...summary.productBrands.map((x) => [x._id, x.count]),
                    ]}
                  ></Chart>
                )}
              </div>
            </Col>
            <Col md={9}>
              <div className="my-3">
                <Row>
                  <Col md={8}>
                    <h4>Products sales by Companies</h4>
                  </Col>
                  <Col md={4}></Col>
                </Row>

                {summary.productSalesByBrand.length === 0 ? (
                  <MessageBox>No Customers</MessageBox>
                ) : (
                  <Chart
                    width="90%"
                    height="300px"
                    chartType="Bar"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ['Company', 'Sales'],
                      ...summary.brandSales.map((x) => [x._id, x.totalSales]),
                    ]}
                    options={{
                      colors: ['#FFA500'],
                    }}
                  ></Chart>
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <Table hover responsive className="table-sm">
                <thead>
                  <tr>
                    <th>Company name</th>
                    <th>Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.ordersByBrand.map((brand) => (
                    <tr key={brand._id}>
                      <td>{brand._id}</td>
                      <td>LKR {brand.totalSales.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
