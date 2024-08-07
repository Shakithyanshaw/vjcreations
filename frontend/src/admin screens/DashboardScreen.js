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

// Reducer function to manage state transitions
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
  // useReducer hook to manage state
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const [currentDateTime, setCurrentDateTime] = useState(
    new Date().toLocaleString()
  );
  const { userInfo } = state;

  // useEffect to fetch data and set up interval for date-time update
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

  // Handler for printing the page
  const handlePrint = () => {
    window.print();
  };

  // Handlers for navigating to different admin pages
  const handleUser = () => {
    navigate(`/admin/users`);
  };
  const handleOrder = () => {
    navigate(`/admin/orders`);
  };
  const handleProducts = () => {
    navigate(`/admin/products`);
  };
  // State for managing active section in the dashboard
  const [activeSection, setActiveSection] = useState(null);
  // Handlers for toggling sections in the dashboard
  const handleMonthSale = () => {
    setActiveSection(activeSection === 'monthlySales' ? null : 'monthlySales');
  };

  const handleYearSale = () => {
    setActiveSection(activeSection === 'yearlySales' ? null : 'yearlySales');
  };

  const handleOrderCount = () => {
    setActiveSection(activeSection === 'dailyOrders' ? null : 'dailyOrders');
  };

  const handleOrderCountMonth = () => {
    setActiveSection(
      activeSection === 'monthlyOrders' ? null : 'monthlyOrders'
    );
  };

  const handleOrderCountYear = () => {
    setActiveSection(activeSection === 'yearlyOrders' ? null : 'yearlyOrders');
  };

  const handleOrderCity = () => {
    setActiveSection(activeSection === 'ordersByCity' ? null : 'ordersByCity');
  };

  const handleCustomerCity = () => {
    setActiveSection(
      activeSection === 'customersByCity' ? null : 'customersByCity'
    );
  };

  return (
    <div className="marginAll">
      <Row>
        <Col md={9}>
          <h2 className="dashboardCard">Welcome {userInfo.name} !</h2>
        </Col>
        <Col md={3}>
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
                  <>
                    <Chart
                      width="90%"
                      height="400px"
                      chartType="Bar"
                      loader={<div>Loading Chart...</div>}
                      data={[
                        ['Date', 'Sales'],
                        ...summary.dailyOrders
                          .slice(-7)
                          .map((x) => [x._id, x.sales]), // Slice the last 5 days of sales
                      ]}
                      options={{
                        colors: ['#FFA500'], // Set the color to orange
                      }}
                    />
                  </>
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
            <Col md={10}>
              {activeSection === 'monthlySales' && (
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
                        width="100%"
                        height="400px"
                        chartType="AreaChart"
                        loader={<div>Loading Chart...</div>}
                        data={[
                          ['Date', 'Sales'],
                          ...summary.monthlyOrders.map((x) => [x._id, x.sales]),
                        ]}
                        options={{
                          title: 'Monthly Sales',
                          colors: ['#FFA500'],
                          hAxis: {
                            title: 'Date',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          vAxis: {
                            title: 'Sales',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}

              {activeSection === 'yearlySales' && (
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
                        width="100%"
                        height="400px"
                        chartType="LineChart"
                        loader={<div>Loading Chart...</div>}
                        data={[
                          ['Date', 'Sales'],
                          ...summary.yearlyOrders.map((x) => [x._id, x.sales]),
                        ]}
                        options={{
                          title: 'Yearly Sales',
                          colors: ['#FFA500'],
                          hAxis: {
                            title: 'Date',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          vAxis: {
                            title: 'Sales',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}

              {activeSection === 'dailyOrders' && (
                <Col md={12} className="chartdesign">
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
                        width="100%"
                        height="400px"
                        chartType="BarChart"
                        loader={<div>Loading Chart...</div>}
                        data={[
                          ['Date', 'Orders'],
                          ...summary.dailyOrdersCount.map((x) => [
                            x._id,
                            x.orders,
                          ]),
                        ]}
                        options={{
                          title: 'Daily Orders',
                          colors: ['#FFA500'],
                          hAxis: {
                            title: 'Date',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          vAxis: {
                            title: 'Orders',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}

              {activeSection === 'monthlyOrders' && (
                <Col md={12} className="chartdesign">
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
                        width="100%"
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
                          title: 'Monthly Orders',
                          colors: ['#0cbedd'],
                          hAxis: {
                            title: 'Date',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          vAxis: {
                            title: 'Orders',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}

              {activeSection === 'yearlyOrders' && (
                <Col md={12} className="chartdesign">
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
                        width="100%"
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
                          title: 'Yearly Orders',
                          colors: ['#0cbedd'],
                          hAxis: {
                            title: 'Date',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          vAxis: {
                            title: 'Orders',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}

              {activeSection === 'ordersByCity' && (
                <Col md={12} className="chartdesign">
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
                        width="100%"
                        height="400px"
                        chartType="PieChart"
                        loader={<div>Loading Chart...</div>}
                        data={[
                          ['City', 'Orders'],
                          ...summary.ordersByCity.map((x) => [x._id, x.count]),
                        ]}
                        options={{
                          title: 'Orders by City',
                          colors: [
                            '#FFA500',
                            '#FF6347',
                            '#FFD700',
                            '#32CD32',
                            '#1E90FF',
                          ],
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}

              {activeSection === 'customersByCity' && (
                <Col md={12} className="chartdesign">
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
                        width="100%"
                        height="400px"
                        chartType="BarChart"
                        loader={<div>Loading Chart...</div>}
                        data={[
                          ['City', 'Customers'],
                          ...summary.usersByCity.map((x) => [
                            x._id,
                            x.numUsers,
                          ]),
                        ]}
                        options={{
                          title: 'Customers by City',
                          colors: ['#FFA500'],
                          hAxis: {
                            title: 'City',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          vAxis: {
                            title: 'Customers',
                            textStyle: { color: '#333' },
                            titleTextStyle: { color: '#333', fontSize: 18 },
                          },
                          legend: { position: 'bottom' },
                          backgroundColor: '#f9f9f9',
                        }}
                      />
                    )}
                  </div>
                </Col>
              )}
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
          </Row>
        </>
      )}
    </div>
  );
}
