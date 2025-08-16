import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import CitizensPage from './pages/CitizensPage';
import CitizenProfile from './pages/CitizenProfile';
import AdminUsersPage from './pages/AdminUsersPage';
import LLSearchPage from './pages/LLSearchPage';
import DLSearchPage from './pages/DLSearchPage';
import VehicleSearchPage from './pages/VehicleSearchPage';
import AccountPage from './pages/AccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AskForServicePage from './pages/AskForServicePage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import UpdateProfileModal from './components/UpdateProfileModal';
import GlobalSearch from './components/GlobalSearch'; // Import the new search component
import { useAuth } from './contexts/AuthContext';
import ToastContainerGlobal from './components/ToastContainerGlobal';
import './pages/HomePage.css';
import './components/GlobalSearch.css'; // Import the new CSS

function Shell({ children }) {
  const { user, logout, showProfileModal, hideProfileModal } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isAdminOrManager = user && ['admin', 'manager'].includes(user.role);

  return (
    <>
      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/">Citizen Hub</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              {user ? (
                <>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/citizens">Citizens</Nav.Link>
                  {isUser && <Nav.Link as={Link} to="/ask-for-service">Ask For Service</Nav.Link>}
                  <NavDropdown title="Search">
                    <NavDropdown.Item as={Link} to="/search/ll">LL</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/search/dl">DL</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/search/vehicle">Vehicle</NavDropdown.Item>
                  </NavDropdown>
                  {isAdminOrManager && <Nav.Link as={Link} to="/service-requests">Service Requests</Nav.Link>}
                  {isAdmin && <Nav.Link as={Link} to="/admin/users">Admin</Nav.Link>}
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>

            {/* START: Global Search and User Dropdown */}
            <Nav className="ms-auto d-flex align-items-center">
              {isAdminOrManager && <GlobalSearch />}

              {user && (
                <NavDropdown title={user.name} id="basic-nav-dropdown" align="end" className="ms-2">
                  <NavDropdown.ItemText>
                    <div className="text-muted small"><strong>Mobile:</strong> {user.phone || 'N/A'}</div>
                    <div><strong>Role:</strong> <Badge bg="secondary">{user.role}</Badge></div>
                  </NavDropdown.ItemText>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/account">Account Settings</NavDropdown.Item>
                  <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
            {/* END: Global Search and User Dropdown */}

          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
      <ToastContainerGlobal />
      <UpdateProfileModal show={showProfileModal} onHide={hideProfileModal} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          <Route path="/citizens" element={<PrivateRoute><CitizensPage /></PrivateRoute>} />
          <Route path="/citizens/:id" element={<PrivateRoute><CitizenProfile /></PrivateRoute>} />
          <Route path="/search/ll" element={<PrivateRoute><LLSearchPage /></PrivateRoute>} />
          <Route path="/search/dl" element={<PrivateRoute><DLSearchPage /></PrivateRoute>} />
          <Route path="/search/vehicle" element={<PrivateRoute><VehicleSearchPage /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/ask-for-service" element={<PrivateRoute><AskForServicePage /></PrivateRoute>} />
          <Route path="/service-requests" element={<PrivateRoute roles={['admin', 'manager']}><ServiceRequestsPage /></PrivateRoute>} />
          <Route path="/my-requests" element={<PrivateRoute><MyRequestsPage /></PrivateRoute>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
