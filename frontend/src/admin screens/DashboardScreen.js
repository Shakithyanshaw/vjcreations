import React, { useReducer, useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import Button from 'react-bootstrap/Button';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Chart from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
//import Badge from 'react-bootstrap/Badge';

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

// Function to format price using Sri Lankan Rupees
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(price);
};

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const [currentDateTime, setCurrentDateTime] = useState(
    new Date().toLocaleString()
  );
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
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

    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, [userInfo]);

  const handlePrint = () => {
    window.print();
  };

  const handleUser = () => {
    navigate(`/admin/users`);
  };
  const handleOrder = () => {
    navigate(`/admin/orders`);
  };
  const handleProducts = () => {
    navigate(`/admin/products`);
  };

  const [showDiv, setShowDiv] = useState(false);
  const [showDivOrder, setShowDivOrder] = useState(false);
  const [showDivOrderMonth, setShowDivOrderMonth] = useState(false);
  const [showDivOrderYear, setShowDivOrderYear] = useState(false);
  const [showDivOrderCity, setShowDivOrderCity] = useState(false);
  const [showDivCustomerCity, setShowDivCustomerCity] = useState(false);
  const [showMonthSaleDiv, setShowMonthSaleDiv] = useState(false);

  const handleMonthSale = () => {
    setShowMonthSaleDiv(!showMonthSaleDiv);
  };
  const handleYearSale = () => {
    setShowDiv(!showDiv);
  };
  const handleOrderCount = () => {
    setShowDivOrder(!showDivOrder);
  };
  const handleOrderCountMonth = () => {
    setShowDivOrderMonth(!showDivOrderMonth);
  };
  const handleOrderCountYear = () => {
    setShowDivOrderYear(!showDivOrderYear);
  };

  const handleOrderCity = () => {
    setShowDivOrderCity(!showDivOrderCity);
  };

  const handleCustomerCity = () => {
    setShowDivCustomerCity(!showDivCustomerCity);
  };

  return (
    <div className="marginAll">
      <Row>
        <Col md={10}>
          <h2 className="dashboardCard">Welcome {userInfo.name} !</h2>
        </Col>
        <Col md={2}>
          <h6>{currentDateTime}</h6>
        </Col>
      </Row>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row className="dashboardCard">
            <Col md={3}>
              <Card className="cardDesign" onClick={handleUser}>
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <i className="fas fa-user fa-3x"></i>
                    </div>
                    <div className="col">
                      <Card.Text style={{ fontSize: '1.25rem' }}>
                        Customers
                      </Card.Text>
                      <Card.Title style={{ fontSize: '2rem' }}>
                        {summary?.users?.[0]?.numUsers || 0}
                      </Card.Title>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="cardDesign" onClick={handleOrder}>
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <i className="fas fa-money-check fa-3x"></i>
                    </div>
                    <div className="col">
                      <Card.Text style={{ fontSize: '1.25rem' }}>
                        Orders
                      </Card.Text>
                      <Card.Title style={{ fontSize: '2rem' }}>
                        {summary?.orders?.[0]?.numOrders || 0}
                      </Card.Title>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="cardDesign" onClick={handleProducts}>
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <i className="fas fa-list fa-3x"></i>
                    </div>
                    <div className="col">
                      <Card.Text style={{ fontSize: '1.25rem' }}>
                        Categories
                      </Card.Text>
                      <Card.Title style={{ fontSize: '2rem' }}>
                        {summary?.productCategories?.length || 0}
                      </Card.Title>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="cardDesign" onClick={handleOrder}>
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <i className="fas fa-wallet fa-3x"></i>
                    </div>
                    <div className="col">
                      <Card.Text style={{ fontSize: '1.25rem' }}>
                        Total Sales
                      </Card.Text>
                      <Card.Title style={{ fontSize: '1.5rem' }}>
                        {formatPrice(summary?.orders?.[0]?.totalSales || 0)}
                      </Card.Title>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Table hover className="mt-3">
                <thead>
                  <tr>
                    <th>Trending Products</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.topSellingProducts?.map((product) => (
                    <tr key={product._id}>
                      <td>{product.productName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            <Col md={6} className="chartdesign">
              <div className="my-3">
                <Row>
                  <Col md={8}>
                    <h3>Daily Sales</h3>
                  </Col>
                  <Col md={4}>
                    <Button
                      className="btnPrint"
                      type="button"
                      variant="light"
                      onClick={handlePrint}
                    >
                      Sales report
                    </Button>
                  </Col>
                </Row>

                {summary?.dailyOrders?.length === 0 ? (
                  <MessageBox>No Sale</MessageBox>
                ) : (
                  <Chart
                    width="90%"
                    height="400px"
                    chartType="Bar"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ['Date', 'Sales'],
                      ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                    ]}
                    options={{
                      colors: ['#FFA500'], // Set the color to orange
                    }}
                  ></Chart>
                )}
              </div>
            </Col>
            <Col md={3} className="chartdesign">
              <Card className="cardDesign" onClick={handleOrder}>
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col">
                      <Card.Text style={{ fontSize: '1rem' }}>
                        Sales (Cash on Delivery)
                      </Card.Text>
                      <Card.Title style={{ fontSize: '1.5rem' }}>
                        {formatPrice(
                          summary.CODorders && summary.users[0]
                            ? summary.CODorders[0].totalSales
                            : 0
                        )}
                      </Card.Title>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              <Card className="cardDesign" onClick={handleOrder}>
                <Card.Body>
                  <div className="row align-items-center">
                    <div className="col">
                      <Card.Text style={{ fontSize: '1rem' }}>
                        {' '}
                        Sales ( Paypal )
                      </Card.Text>
                      <Card.Title style={{ fontSize: '1.5rem' }}>
                        {formatPrice(
                          summary.Paypalorders && summary.users[0]
                            ? summary.Paypalorders[0].totalSales
                            : 0
                        )}
                      </Card.Title>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              <Row>
                <Col md={1}></Col>
                <Col md={5}>
                  <Card className="cardDesign" onClick={handleOrder}>
                    <Card.Body>
                      <div className="row align-items-center">
                        <div className="col">
                          <Card.Text style={{ fontSize: '1rem' }}>
                            {' '}
                            Undeliverd Orders
                          </Card.Text>
                          <Card.Title style={{ fontSize: '1.5rem' }}>
                            {summary.orders && summary.users[0]
                              ? summary.UndeliverdOrders[0].numDOrders
                              : 0}
                          </Card.Title>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={5}>
                  <Card className="cardDesign" onClick={handleOrder}>
                    <Card.Body>
                      <div className="row align-items-center">
                        <div className="col">
                          <Card.Text style={{ fontSize: '1rem' }}>
                            {' '}
                            Unsettled Orders
                          </Card.Text>
                          <Card.Title style={{ fontSize: '1.5rem' }}>
                            {summary.orders && summary.users[0]
                              ? summary.UnPaidOrders[0].numPOrders
                              : 0}
                          </Card.Title>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col md={10} className="chartdesign">
              <div className="my-3 dashboardCard">
                <h2>Categories</h2>
                {summary.productCategories.length === 0 ? (
                  <MessageBox>No Category</MessageBox>
                ) : (
                  <Chart
                    width="90%"
                    height="400px"
                    chartType="Bar"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ['Category', 'Products'],
                      ...summary.productCategories.map((x) => [x._id, x.count]),
                    ]}
                    options={{
                      colors: ['#0cbedd'], // Set the color to orange
                    }}
                  ></Chart>
                )}
              </div>
            </Col>
            <Col md={2} className="chartdesign">
              <div className="my-3">
                <Button className="btnSale" onClick={handleMonthSale}>
                  Monthly Sales
                </Button>
                <Button className="btnSale" onClick={handleYearSale}>
                  Yearly Sales
                </Button>
                <Button className="btnSale" onClick={handleOrderCount}>
                  Daily Orders
                </Button>
                <Button className="btnSale" onClick={handleOrderCountMonth}>
                  Monthly Orders
                </Button>
                <Button className="btnSale" onClick={handleOrderCountYear}>
                  Yearly Orders
                </Button>
                <Button className="btnSale" onClick={handleOrderCity}>
                  Orders by City
                </Button>
                <Button className="btnSale" onClick={handleCustomerCity}>
                  Customers by City
                </Button>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={7}>
              {showMonthSaleDiv && (
                <div>
                  <Col md={12} className="chartdesign">
                    <div className="my-3">
                      <Row>
                        <Col md={8}>
                          <h3>Monthly Sales</h3>
                        </Col>
                        <Col md={4}></Col>
                      </Row>

                      {summary.monthlyOrders.length === 0 ? (
                        <MessageBox>No Sale</MessageBox>
                      ) : (
                        <Chart
                          width="90%"
                          height="300px"
                          chartType="AreaChart"
                          loader={<div>Loading Chart...</div>}
                          data={[
                            ['Date', 'Sales'],
                            ...summary.monthlyOrders.map((x) => [
                              x._id,
                              x.sales,
                            ]),
                          ]}
                          options={{
                            colors: ['#FFA500'], // Set the color to orange
                          }}
                        ></Chart>
                      )}
                    </div>
                  </Col>
                </div>
              )}
            </Col>
            <Col md={5}>
              {showDiv && (
                <div>
                  <Col md={12} className="chartdesign">
                    <div className="my-3">
                      <Row>
                        <Col md={8}>
                          <h3>Yearly Sales</h3>
                        </Col>
                        <Col md={4}></Col>
                      </Row>

                      {summary.yearlyOrders.length === 0 ? (
                        <MessageBox>No Sale</MessageBox>
                      ) : (
                        <Chart
                          width="90%"
                          height="300px"
                          chartType="Line"
                          loader={<div>Loading Chart...</div>}
                          data={[
                            ['Date', 'Sales'],
                            ...summary.yearlyOrders.map((x) => [
                              x._id,
                              x.sales,
                            ]),
                          ]}
                        ></Chart>
                      )}
                    </div>
                  </Col>
                </div>
              )}
            </Col>
            <Col md={12}>
              {showDivOrder && (
                <div className="my-3">
                  <Row>
                    <Col md={8}>
                      <h3>Daily Orders</h3>
                    </Col>
                    <Col md={4}></Col>
                  </Row>

                  {summary.dailyOrders.length === 0 ? (
                    <MessageBox>No Orders</MessageBox>
                  ) : (
                    <Chart
                      width="90%"
                      height="400px"
                      chartType="Bar"
                      loader={<div>Loading Chart...</div>}
                      data={[
                        ['Date', 'Orders'],
                        ...summary.dailyOrdersCount.map((x) => [
                          x._id,
                          x.orders,
                        ]),
                      ]}
                      options={{
                        colors: ['#FFA500'], // Set the color to orange
                      }}
                    ></Chart>
                  )}
                </div>
              )}
            </Col>
            <Col md={6}>
              {showDivOrderMonth && (
                <div className="my-3">
                  <Row>
                    <Col md={8}>
                      <h3>Monthly Orders</h3>
                    </Col>
                    <Col md={4}></Col>
                  </Row>

                  {summary.monthlyOrderCount.length === 0 ? (
                    <MessageBox>No Orders</MessageBox>
                  ) : (
                    <Chart
                      width="90%"
                      height="400px"
                      chartType="LineChart"
                      loader={<div>Loading Chart...</div>}
                      data={[
                        ['Date', 'Orders'],
                        ...summary.monthlyOrderCount.map((x) => [
                          x._id,
                          x.orders,
                        ]),
                      ]}
                      options={{
                        colors: ['#0cbedd'],
                      }}
                    ></Chart>
                  )}
                </div>
              )}
            </Col>
            <Col md={6}>
              {showDivOrderYear && (
                <div className="my-3">
                  <Row>
                    <Col md={8}>
                      <h3>Yearly Orders</h3>
                    </Col>
                  </Row>

                  {summary.yearlyOrderCount.length === 0 ? (
                    <MessageBox>No Orders</MessageBox>
                  ) : (
                    <Chart
                      width="90%"
                      height="400px"
                      chartType="BarChart"
                      loader={<div>Loading Chart...</div>}
                      data={[
                        ['Date', 'Orders'],
                        ...summary.yearlyOrderCount.map((x) => [
                          x._id,
                          x.orders,
                        ]),
                      ]}
                      options={{
                        colors: ['#0cbedd'],
                      }}
                    ></Chart>
                  )}
                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              {showDivOrderCity && (
                <div className="my-3">
                  <Row>
                    <Col md={8}>
                      <h3>Orders by City</h3>
                    </Col>
                    <Col md={4}></Col>
                  </Row>

                  {summary.ordersByCity.length === 0 ? (
                    <MessageBox>No Orders</MessageBox>
                  ) : (
                    <Chart
                      width="90%"
                      height="400px"
                      chartType="PieChart"
                      loader={<div>Loading Chart...</div>}
                      data={[
                        ['City', 'Orders'],
                        ...summary.ordersByCity.map((x) => [x._id, x.count]),
                      ]}
                    ></Chart>
                  )}
                </div>
              )}
            </Col>
            <Col md={8}>
              {showDivCustomerCity && (
                <div className="my-3">
                  <Row>
                    <Col md={8}>
                      <h3>Customers by City</h3>
                    </Col>
                    <Col md={4}></Col>
                  </Row>

                  {summary.usersByCity.length === 0 ? (
                    <MessageBox>No Customers</MessageBox>
                  ) : (
                    <Chart
                      width="90%"
                      height="300px"
                      chartType="Bar"
                      loader={<div>Loading Chart...</div>}
                      data={[
                        ['City', 'Customers'],
                        ...summary.usersByCity.map((x) => [x._id, x.numUsers]),
                      ]}
                      options={{
                        colors: ['#FFA500'],
                      }}
                    ></Chart>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
