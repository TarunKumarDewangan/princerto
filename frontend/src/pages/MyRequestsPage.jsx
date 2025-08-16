import { useEffect, useState } from 'react';
// THE FIX IS HERE: Add 'Button' to the import list
import { Container, Table, Alert, Spinner, Pagination, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// Helper to render status badges with different colors
const StatusBadge = ({ status }) => {
  const variant = {
    pending: 'warning',
    completed: 'success',
    rejected: 'danger',
  }[status] || 'secondary';

  return <Badge bg={variant}>{status}</Badge>;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyRequests = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/my-service-requests?page=${page}`);
      setRequests(data.data || []);
      setMeta(data.meta || null);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load your requests.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests(1);
  }, []);

  const goPage = (p) => {
    if (!meta || p < 1 || p > meta.last_page) return;
    fetchMyRequests(p);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Service Requests</h2>
        <Button as={Link} to="/ask-for-service">Request a New Service</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}

      {!loading && requests.length === 0 && (
        <Alert variant="info">You have not submitted any service requests yet.</Alert>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-responsive">
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Services Requested</th>
                <th>Your Query</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={req.id}>
                  <td>{(meta ? meta.from : 1) + idx}</td>
                  <td>{req.category.toUpperCase()}</td>
                  <td>
                    {req.services && req.services.length > 0
                      ? req.services.join(', ')
                      : 'N/A'}
                  </td>
                  <td>{req.query || 'N/A'}</td>
                  <td><StatusBadge status={req.status} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-end">
          <Pagination>
            <Pagination.Prev onClick={() => goPage(meta.current_page - 1)} disabled={meta.current_page === 1} />
            <Pagination.Item active>{meta.current_page}</Pagination.Item>
            <Pagination.Next onClick={() => goPage(meta.current_page + 1)} disabled={meta.current_page === meta.last_page} />
          </Pagination>
        </div>
      )}
    </Container>
  );
}
