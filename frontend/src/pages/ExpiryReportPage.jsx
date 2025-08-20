import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button, Table, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// Helper to format dates for display
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString;
  }
};

export default function ExpiryReportPage() {
  const [filters, setFilters] = useState({
    vehicle_no: '',
    start_date: '',
    end_date: '',
    owner_name: '',
    exact_date: '',
  });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpiries = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, page };
      const { data } = await api.get('/reports/expiries', { params });
      setItems(data.data || []);
      setMeta(data || {});
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load expiry report.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpiries(1);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters(prev => {
        const newFilters = { ...prev, [name]: value };
        if (name === 'exact_date' && value !== '') {
            newFilters.start_date = '';
            newFilters.end_date = '';
        }
        if ((name === 'start_date' || name === 'end_date') && value !== '') {
            newFilters.exact_date = '';
        }
        return newFilters;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpiries(1);
  };

  const handleReset = () => {
    setFilters({
      vehicle_no: '',
      start_date: '',
      end_date: '',
      owner_name: '',
      exact_date: '',
    });
  };

  const goPage = (p) => {
    if (!p || p < 1 || p > meta.last_page) return;
    fetchExpiries(p);
  };

  return (
    <Container className="py-4">
      <h3 className="mb-3">Documents Expiry Report</h3>
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Owner Name</Form.Label>
                  <Form.Control
                    name="owner_name"
                    value={filters.owner_name}
                    onChange={handleFilterChange}
                    placeholder="Search by owner name..."
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Vehicle No.</Form.Label>
                  <Form.Control
                    name="vehicle_no"
                    value={filters.vehicle_no}
                    onChange={handleFilterChange}
                    placeholder="e.g., CG04AB1234"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Exact Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="exact_date"
                    value={filters.exact_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Expiry From</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Expiry Upto</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              {/* --- START OF MODIFIED CODE --- */}
              <Col md="auto">
                <Button type="submit" disabled={loading}>Search</Button>
              </Col>
              <Col md="auto">
                <Button variant="outline-secondary" onClick={handleReset} disabled={loading}>Reset</Button>
              </Col>
              {/* --- END OF MODIFIED CODE --- */}
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Owner Name</th>
              <th>Mobile</th>
              <th>Doc. Type</th>
              <th>Identifier / No.</th>
              <th>Expiry Date</th>
              {/* --- START OF NEW CODE --- */}
              <th>Actions</th>
              {/* --- END OF NEW CODE --- */}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center"><Spinner size="sm" /></td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={7} className="text-center">No expiring documents found for the selected filters.</td></tr>}
            {!loading && items.map((item, index) => (
              <tr key={`${item.type}-${item.identifier}-${index}`}>
                <td>{meta.from + index}</td>
                <td><Link to={`/citizens/${item.citizen_id}`}>{item.owner_name}</Link></td>
                <td>{item.owner_mobile || '-'}</td>
                <td><Badge bg="warning" text="dark">{item.type}</Badge></td>
                <td>{item.identifier}</td>
                <td>{formatDate(item.expiry_date)}</td>
                {/* --- START OF NEW CODE --- */}
                <td>
                  <Button as={Link} to={`/citizens/${item.citizen_id}`} variant="outline-secondary" size="sm">
                    View All Docs
                  </Button>
                </td>
                {/* --- END OF NEW CODE --- */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

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
