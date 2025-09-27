// import { Routes, Route, Link } from 'react-router-dom';
// import { Container, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
// import PrivateRoute from './components/PrivateRoute';
// import HomePage from './pages/HomePage';
// import Dashboard from './pages/Dashboard';
// import CitizensPage from './pages/CitizensPage';
// import CitizenProfile from './pages/CitizenProfile';
// import AdminUsersPage from './pages/AdminUsersPage';
// import LLSearchPage from './pages/LLSearchPage';
// import DLSearchPage from './pages/DLSearchPage';
// import VehicleSearchPage from './pages/VehicleSearchPage';
// import AccountPage from './pages/AccountPage';
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import ResetPasswordPage from './pages/ResetPasswordPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import AskForServicePage from './pages/AskForServicePage';
// import ServiceRequestsPage from './pages/ServiceRequestsPage';
// import MyRequestsPage from './pages/MyRequestsPage';
// import UpdateProfileModal from './components/UpdateProfileModal';
// import GlobalSearch from './components/GlobalSearch';
// import { useAuth } from './contexts/AuthContext';
// import ToastContainerGlobal from './components/ToastContainerGlobal';
// import './pages/HomePage.css';
// import './components/GlobalSearch.css';
// import ExpiredDocumentsPage from './pages/ExpiredDocumentsPage';
// import ExpiryReportPage from './pages/ExpiryReportPage';
// import AdminPage from './pages/AdminPage';
// import DataExportPage from './pages/DataExportPage'; // --- START OF NEW CODE ---
// import DocumentInquiryPage from './pages/DocumentInquiryPage'; // --- ADD NEW IMPORT ---
// import AdminInquiriesPage from './pages/AdminInquiriesPage';
// import './Responsive.css';


// function Shell({ children }) {
//   const { user, logout, showProfileModal, hideProfileModal } = useAuth();
//   const isAdmin = user?.role === 'admin';
//   const isAdminOrManager = user && ['admin', 'manager'].includes(user.role);

//   return (
//     <>
//       <Navbar bg="light" expand="lg" className="border-bottom">
//         <Container>
//           <Navbar.Brand as={Link} to="/">Citizen Hub</Navbar.Brand>
//           <Navbar.Toggle />
//           <Navbar.Collapse>
//             <Nav className="me-auto">
//               {user ? (
//                 <>
//                   <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
//                   <Nav.Link as={Link} to="/citizens">Citizens</Nav.Link>
//                   <Nav.Link as={Link} to="/ask-for-service">Ask For Service</Nav.Link>
//                   <NavDropdown title="Search">
//                     <NavDropdown.Item as={Link} to="/search/ll">LL</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/search/dl">DL</NavDropdown.Item>
//                     <NavDropdown.Item as={Link} to="/search/vehicle">Vehicle</NavDropdown.Item>
//                     {isAdminOrManager && <NavDropdown.Divider />}
//                     {isAdminOrManager && <NavDropdown.Item as={Link} to="/reports/expiries">Expiry Report</NavDropdown.Item>}
//                   </NavDropdown>
//                   {isAdminOrManager && <Nav.Link as={Link} to="/service-requests">Service Requests</Nav.Link>}

//                   {isAdmin && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
//                 </>
//               ) : (
//                 <>
//                   <Nav.Link as={Link} to="/login">Login</Nav.Link>
//                   <Nav.Link as={Link} to="/register">Register</Nav.Link>
//                 </>
//               )}
//             </Nav>
//             <Nav className="ms-auto d-flex align-items-center">
//               {isAdminOrManager && <GlobalSearch />}
//               {user && (
//                 <NavDropdown title={user.name} id="basic-nav-dropdown" align="end" className="ms-2">
//                   <NavDropdown.ItemText>
//                     <div className="text-muted small"><strong>Mobile:</strong> {user.phone || 'N/A'}</div>
//                     <div><strong>Role:</strong> <Badge bg="secondary">{user.role}</Badge></div>
//                   </NavDropdown.ItemText>
//                   <NavDropdown.Divider />
//                   <NavDropdown.Item as={Link} to="/account">Account Settings</NavDropdown.Item>
//                   <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
//                 </NavDropdown>
//               )}
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>
//       {children}
//       <ToastContainerGlobal />
//       <UpdateProfileModal show={showProfileModal} onHide={hideProfileModal} />
//     </>
//   );
// }

// export default function App() {
//   return (
//     <Shell>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/ask-for-service" element={<AskForServicePage />} />

//         <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//         <Route path="/citizens" element={<PrivateRoute><CitizensPage /></PrivateRoute>} />
//         <Route path="/citizens/:id" element={<PrivateRoute><CitizenProfile /></PrivateRoute>} />
//         <Route
//           path="/citizens/:id/expired"
//           element={<PrivateRoute roles={['admin', 'manager']}><ExpiredDocumentsPage /></PrivateRoute>}
//         />
//         <Route
//           path="/reports/expiries"
//           element={<PrivateRoute roles={['admin', 'manager']}><ExpiryReportPage /></PrivateRoute>}
//         />

//         <Route path="/search/ll" element={<PrivateRoute><LLSearchPage /></PrivateRoute>} />
//         <Route path="/search/dl" element={<PrivateRoute><DLSearchPage /></PrivateRoute>} />
//         <Route path="/search/vehicle" element={<PrivateRoute><VehicleSearchPage /></PrivateRoute>} />

//         <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>} />
//         <Route path="/admin/users" element={<PrivateRoute roles={['admin', 'manager']}><AdminUsersPage /></PrivateRoute>} />
//         {/* --- START OF NEW CODE --- */}
//         <Route path="/admin/export" element={<PrivateRoute roles={['admin']}><DataExportPage /></PrivateRoute>} />
//         {/* --- END OF NEW CODE --- */}

//         <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//         <Route path="/reset-password" element={<ResetPasswordPage />} />
//         <Route path="/service-requests" element={<PrivateRoute roles={['admin', 'manager']}><ServiceRequestsPage /></PrivateRoute>} />
//         <Route path="/my-requests" element={<PrivateRoute><MyRequestsPage /></PrivateRoute>} />
//       </Routes>
//     </Shell>
//   );
// }


import { Routes, Route, Link } from 'react-router-dom';
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
import GlobalSearch from './components/GlobalSearch';
import { useAuth } from './contexts/AuthContext';
import ToastContainerGlobal from './components/ToastContainerGlobal';
import './pages/HomePage.css';
import './components/GlobalSearch.css';
import ExpiredDocumentsPage from './pages/ExpiredDocumentsPage';
import ExpiryReportPage from './pages/ExpiryReportPage';
import AdminPage from './pages/AdminPage';
import DataExportPage from './pages/DataExportPage';
import DocumentInquiryPage from './pages/DocumentInquiryPage';
import AdminInquiriesPage from './pages/AdminInquiriesPage';
import './Responsive.css';


function Shell({ children }) {
  const { user, logout, showProfileModal, hideProfileModal } = useAuth();
  const isAdmin = user?.role === 'admin';
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
                // This is the navigation for LOGGED-IN users
                <>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/citizens">Citizens</Nav.Link>
                  <Nav.Link as={Link} to="/ask-for-service">Ask For Service</Nav.Link>
                  <NavDropdown title="Search">
                    <NavDropdown.Item as={Link} to="/search/ll">LL</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/search/dl">DL</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/search/vehicle">Vehicle</NavDropdown.Item>
                    {isAdminOrManager && <NavDropdown.Divider />}
                    {isAdminOrManager && <NavDropdown.Item as={Link} to="/reports/expiries">Expiry Report</NavDropdown.Item>}
                  </NavDropdown>
                  {isAdminOrManager && (
                    <>
                      <Nav.Link as={Link} to="/service-requests">Service Requests</Nav.Link>
                      {/* --- START: ADDED LINK FOR ADMINS/MANAGERS --- */}
                      <Nav.Link as={Link} to="/admin/inquiries">Document Inquiries</Nav.Link>
                      {/* --- END: ADDED LINK FOR ADMINS/MANAGERS --- */}
                    </>
                  )}

                  {isAdmin && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
                </>
              ) : (
                // This is the navigation for GUESTS (not logged in)
                <>
                  {/* --- START: ADDED LINK FOR GUESTS --- */}
                  <Nav.Link as={Link} to="/document-inquiry">Document Inquiry</Nav.Link>
                  {/* --- END: ADDED LINK FOR GUESTS --- */}
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>
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
    <Shell>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ask-for-service" element={<AskForServicePage />} />
        {/* --- START: ADDED PUBLIC ROUTE --- */}
        <Route path="/document-inquiry" element={<DocumentInquiryPage />} />
        {/* --- END: ADDED PUBLIC ROUTE --- */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Private User Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/citizens" element={<PrivateRoute><CitizensPage /></PrivateRoute>} />
        <Route path="/citizens/:id" element={<PrivateRoute><CitizenProfile /></PrivateRoute>} />
        <Route path="/search/ll" element={<PrivateRoute><LLSearchPage /></PrivateRoute>} />
        <Route path="/search/dl" element={<PrivateRoute><DLSearchPage /></PrivateRoute>} />
        <Route path="/search/vehicle" element={<PrivateRoute><VehicleSearchPage /></PrivateRoute>} />
        <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/my-requests" element={<PrivateRoute><MyRequestsPage /></PrivateRoute>} />

        {/* Private Admin & Manager Routes */}
        <Route
          path="/citizens/:id/expired"
          element={<PrivateRoute roles={['admin', 'manager']}><ExpiredDocumentsPage /></PrivateRoute>}
        />
        <Route
          path="/reports/expiries"
          element={<PrivateRoute roles={['admin', 'manager']}><ExpiryReportPage /></PrivateRoute>}
        />
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['admin', 'manager']}><AdminUsersPage /></PrivateRoute>} />
        <Route path="/admin/export" element={<PrivateRoute roles={['admin']}><DataExportPage /></PrivateRoute>} />
        <Route path="/service-requests" element={<PrivateRoute roles={['admin', 'manager']}><ServiceRequestsPage /></PrivateRoute>} />

        {/* --- START: ADDED ADMIN/MANAGER ROUTE --- */}
        <Route
          path="/admin/inquiries"
          element={<PrivateRoute roles={['admin', 'manager']}><AdminInquiriesPage /></PrivateRoute>}
        />
        {/* --- END: ADDED ADMIN/MANAGER ROUTE --- */}

      </Routes>
    </Shell>
  );
}
