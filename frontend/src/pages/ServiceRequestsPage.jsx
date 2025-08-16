import { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Pagination, Badge, Form, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// Helper to render status badges with different colors
const StatusBadge = ({ status }) => {
  const variant = {
    pending: 'warning',
    contacted: 'info',
    completed: 'success',
  }[status] || 'secondary';

  return <Badge bg={variant}>{status}</Badge>;
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/service-requests`, {
        params: { page, status: statusFilter }
      });
      setRequests(data.data || []);
      setMeta(data.meta || null);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load service requests.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, [statusFilter]);

  const goPage = (p) => {
    if (!meta || p < 1 || p > meta.last_page) return;
    fetchRequests(p);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { data: updatedRequest } = await api.patch(`/service-requests/${id}/status`, { status: newStatus });
      setRequests(prev => prev.map(req => (req.id === id ? updatedRequest : req)));
      toast.success(`Request marked as ${newStatus}.`);
    } catch (e) {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-3">Service Requests</h2>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {!loading && requests.length === 0 && (
        <Alert variant="info">No service requests found for the selected filter.</Alert>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-responsive">
          <Table striped bordered hover size="sm">
            <thead>
              <tr><th>#</th><th>Submitted By</th><th>Mobile</th><th>Category</th><th>Services</th><th>Query</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={req.id}>
                  <td>{(meta ? meta.from : 1) + idx}</td>
                  <td>{req.user?.name || 'N/A'}</td>
                  <td>{req.user?.phone || 'N/A'}</td>
                  <td>{req.category.toUpperCase()}</td>
                  <td>{req.services && req.services.length > 0 ? req.services.join(', ') : 'N/A'}</td>
                  <td>{req.query || 'N/A'}</td>
                  <td><StatusBadge status={req.status} /></td>
                  <td>
                    <ButtonGroup size="sm">
                      {/* THE NEW BUTTON IS HERE */}
                      <Button variant="outline-warning" disabled={updatingId === req.id || req.status === 'pending'} onClick={() => handleStatusUpdate(req.id, 'pending')}>Pending</Button>
                      <Button variant="outline-info" disabled={updatingId === req.id || req.status === 'contacted'} onClick={() => handleStatusUpdate(req.id, 'contacted')}>Contacted</Button>
                      <Button variant="outline-success" disabled={updatingId === req.id || req.status === 'completed'} onClick={() => handleStatusUpdate(req.id, 'completed')}>Completed</Button>
                    </ButtonGroup>
                  </td>
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
