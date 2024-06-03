import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import Badge from 'react-bootstrap/esm/Badge';
import { useContext } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/profileScreen';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { getError } from './utils';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './admin screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './admin screens/ProductListScreen';
import ProductEditScreen from './admin screens/ProductEditScreen';
import OrderListScreen from './admin screens/OrderListScreen';
import UserListScreen from './admin screens/UserListScreen';
import UserEditScreen from './admin screens/UserEditScreen';
import SellerScreen from './admin screens/SellerScreen';
import logo from '../src/pics/logo.png';
import HomeScreen2 from './screens/HomeScreen2';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shipingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? 'd-flex flex-column site-container active-cont'
            : 'd-flex flex-column site-container'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>
              <LinkContainer to="/">
                <Navbar.Brand as={Link} to="/">
                  <img className="logo" src={logo} alt="Logo" />
                </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav ">
                <Nav className="me-auto w-100  justify-content-end">
                  <Link to="/services" className="nav-link">
                    <span className="text-light">Gift Shop</span>
                  </Link>

                  <Link to="/cart" className="nav-link">
                    <span className="text-light">Cart</span>
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>

                  {userInfo ? (
                    <NavDropdown
                      title={userInfo.name}
                      id="collasible-nav-dropdown"
                    >
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>
                          <span className="text-dark">User Profile</span>
                        </NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>
                          <span className="text-dark">Order History</span>
                        </NavDropdown.Item>
                      </LinkContainer>

                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        <span className="text-dark">Signout</span>
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      <span className="text-light">Signin</span>
                    </Link>
                  )}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/sellers">
                        <NavDropdown.Item>Sellers</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/support">
                        <NavDropdown.Item>Support</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <SearchBox />
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column navsearch'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column navsearch'
          }
        >
          <Nav className="flex-column text-white w-100 p-2 navsearch2">
            <Nav.Item>
              <strong>Our Services</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{ pathname: '/search', search: `?category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link className="navsearch2">{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/services" element={<HomeScreen2 />} />
              <Route
                path="/placeorder"
                element={
                  <ProtectedRoute>
                    <PlaceOrderScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orderhistory"
                element={<OrderHistoryScreen />}
              ></Route>
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipping"
                element={
                  <ProtectedRoute>
                    <ShippingAddressScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <PaymentMethodScreen />
                  </ProtectedRoute>
                }
              ></Route>

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/sellers"
                element={
                  <AdminRoute>
                    <SellerScreen />
                  </AdminRoute>
                }
              ></Route>
            </Routes>
          </Container>
        </main>
        <footer className="bg-dark text-light">
          <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
            <div className="me-5 d-none d-lg-block">
              <span>Get connected with us on social networks:</span>
            </div>

            <div>
              <a href="/" className="me-4 text-reset">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="/" className="me-4 text-reset">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="/" className="me-4 text-reset">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </section>
          <div className="text-center p-4">© 2022 Copyright: Shaki</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
