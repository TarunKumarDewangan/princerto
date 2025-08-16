import { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/apiClient';

function StatCard({ title, value, to, variant = 'primary', children }) {
  const cardContent = (
    <Card className={`text-white bg-${variant} mb-3 text-center h-100`}>
      <Card.Body className="d-flex flex-column justify-content-center">
          {value !== undefined && <Card.Title as="h1">{value}</Card.Title>}
          <Card.Text className="lead">{title}</Card.Text>
          {children}
      </Card.Body>
    </Card>
  );

  if (to) {
    return <Link to={to} className="text-decoration-none">{cardContent}</Link>;
  }
  return <div>{cardContent}</div>;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [adminStats, setAdminStats] = useState(null);
  const [userStats, setUserStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdminOrManager = useMemo(() => user && ['admin', 'manager'].includes(user.role), [user]);
  // THE FIX IS HERE: Use the primary_citizen's ID for linking.
  const primaryCitizenId = useMemo(() => user?.primary_citizen?.id, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = isAdminOrManager ? '/dashboard/stats' : '/dashboard/user-stats';
        const { data } = await api.get(endpoint);
        if (isAdminOrManager) {
          setAdminStats(data);
        } else {
          setUserStats(data);
        }
      } catch (e) {
        const msg = e?.response?.data?.message || 'Failed to load dashboard data.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user, isAdminOrManager]);

  const renderAdminDashboard = () => (
    <>
      <h2 className="mb-4">Admin Dashboard</h2>
      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {adminStats && (
        <Row>
          <Col md={4}><StatCard title="Pending Service Requests" value={adminStats.pending_requests} to="/service-requests" variant="success" /></Col>
          <Col md={4}><StatCard title="Total Citizens" value={adminStats.total_citizens} to="/citizens" variant="primary" /></Col>
          <Col md={4}><StatCard title="Total Users" value={adminStats.total_users} to="/admin/users" variant="secondary" /></Col>
        </Row>
      )}
    </>
  );

  const renderUserDashboard = () => (
    <>
      <h2 className="mb-4">Welcome, {user?.name}!</h2>
      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}

      {!primaryCitizenId && !loading && (
        <Alert variant="warning">
          You haven't created your primary citizen profile yet.
          <Link to="/citizens" className="alert-link"> Click here to create it</Link> and see your license and vehicle details.
        </Alert>
      )}

      {userStats && (
        <Row>
          <Col md={6} lg={3} className="mb-3 d-flex"><StatCard title="My Service Requests" value={userStats.pending_requests_count} to="/my-requests" variant="success" /></Col>
          <Col md={6} lg={3} className="mb-3 d-flex"><StatCard title="Learning Licenses" value={userStats.ll_count} to={primaryCitizenId ? `/citizens` : null} variant="info" /></Col>
          <Col md={6} lg={3} className="mb-3 d-flex"><StatCard title="Driving Licenses" value={userStats.dl_count} to={primaryCitizenId ? `/citizens` : null} variant="warning" /></Col>
          <Col md={6} lg={3} className="mb-3 d-flex"><StatCard title="Registered Vehicles" value={userStats.vehicle_count} to={primaryCitizenId ? `/citizens` : null} variant="danger" /></Col>
        </Row>
      )}
    </>
  );

  return (
    <Container className="py-4">
      {isAdminOrManager ? renderAdminDashboard() : renderUserDashboard()}
    </Container>
  );
}
