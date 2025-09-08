import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button, Table, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// --- START OF THE FIX (PART 1) ---
// The old `formatDate` function is completely removed, as it is no longer needed.
// The API now sends the date pre-formatted in the correct DD-MM-YYYY format.
// --- END OF THE FIX (PART 1) ---

const documentTypes = [
    'Learner License', 'Driving License', 'Insurance', 'PUCC',
    'Fitness', 'Permit', 'VLTd', 'Speed Gov.', 'Tax'
];

export default function ExpiryReportPage() {
  const [filters, setFilters] = useState({
    vehicle_no: '',
    start_date: '',
    end_date: '',
    owner_name: '',
    exact_date: '',
    doc_type: '',
  });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchExpiries = useCallback(async (page = 1, currentFilters = null) => {
    setLoading(true);
    setError('');

    try {
      const filtersToUse = currentFilters || filters;
      const params = { ...filtersToUse, page };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const { data } = await api.get('/reports/expiries', { params });

      const responseItems = Array.isArray(data.data) ? data.data : [];
      const responseMeta = {
        current_page: data.current_page || page,
        last_page: data.last_page || 1,
        per_page: data.per_page || 15,
        total: data.total || 0,
        from: data.from,
        to: data.to,
        prev_page_url: data.prev_page_url,
        next_page_url: data.next_page_url
      };

      setItems(responseItems);
      setMeta(responseMeta);
      setCurrentPage(page);

    } catch (err) {
      console.error('Fetch error:', err);
      const msg = err?.response?.data?.message || 'Failed to load expiry report.';
      setError(msg);
      toast.error(msg);
      setItems([]);
      setMeta(null);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpiries(1, filters);
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
    setCurrentPage(1);
    fetchExpiries(1, filters);
  };

  const handleReset = () => {
    const freshFilters = {
      vehicle_no: '', start_date: '', end_date: '',
      owner_name: '', exact_date: '', doc_type: '',
    };
    setFilters(freshFilters);
    setCurrentPage(1);
    fetchExpiries(1, freshFilters);
  };

  const goPage = (p) => {
    if (!p || p < 1 || !meta || p > meta.last_page || p === currentPage || loading) return;
    fetchExpiries(p, filters);
  };

  const getRowNumber = (index) => {
    if (!meta || !meta.from) {
      return (currentPage - 1) * (meta?.per_page || 15) + index + 1;
    }
    return meta.from + index;
  };

  return (
    <Container className="py-4">
      <h3 className="mb-3">Documents Expiry Report</h3>
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3 mb-3">
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
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Document Type</Form.Label>
                  <Form.Select
                    name="doc_type"
                    value={filters.doc_type}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
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
            </Row>
            <Row className="g-3">
                <Col md={3}>
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
                <Col md={3}>
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
                <Col md="auto" className="d-flex align-items-end">
                    <Button type="submit" disabled={loading} className="me-2">
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {process.env.NODE_ENV === 'development' && meta && (
        <Alert variant="info">
          <small>
            Debug: Page {currentPage}, Items: {items.length}, Total: {meta.total},
            From: {meta.from}, To: {meta.to}, Last Page: {meta.last_page}
          </small>
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Owner Name</th>
              <th>Doc. Type</th>
              <th>Identifier / No.</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center">
                  <Spinner size="sm" className="me-2" />
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  {currentPage > 1 ?
                    `No items found on page ${currentPage}. There may be a pagination issue with the backend.` :
                    'No expiring documents found for the selected filters.'
                  }
                </td>
              </tr>
            )}
            {!loading && items.length > 0 && items.map((item, index) => (
              <tr key={`${item.citizen_id || 'unknown'}-${item.type || 'unknown'}-${currentPage}-${index}`}>
                <td>{getRowNumber(index)}</td>
                <td>
                  {item.citizen_id ? (
                    <Link to={`/citizens/${item.citizen_id}`}>
                      {item.owner_name || 'N/A'}
                    </Link>
                  ) : (
                    item.owner_name || 'N/A'
                  )}
                </td>
                <td>
                  <Badge bg={item.type === 'Insurance' ? 'success' : 'warning'} text="dark">
                    {item.type || 'N/A'}
                  </Badge>
                </td>
                <td>{item.identifier || 'N/A'}</td>
                {/* --- START OF THE FIX (PART 2) --- */}
                {/* Display the pre-formatted 'expiry_date' string directly from the API */}
                <td>{item.expiry_date || '-'}</td>
                {/* --- END OF THE FIX (PART 2) --- */}
                <td>{/* Actions column is empty as requested */}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-end">
          <Pagination>
            <Pagination.First
              onClick={() => goPage(1)}
              disabled={currentPage === 1 || loading}
            />
            <Pagination.Prev
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            />

            {Array.from({ length: meta.last_page }, (_, i) => {
              const pageNum = i + 1;
              const shouldShow = meta.last_page <= 7 ||
                                Math.abs(pageNum - currentPage) <= 2 ||
                                pageNum === 1 ||
                                pageNum === meta.last_page;

              if (!shouldShow) {
                if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                  return <Pagination.Ellipsis key={`ellipsis-${pageNum}`} />;
                }
                return null;
              }

              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => goPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}

            <Pagination.Next
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === meta.last_page || loading}
            />
            <Pagination.Last
              onClick={() => goPage(meta.last_page)}
              disabled={currentPage === meta.last_page || loading}
            />
          </Pagination>
        </div>
      )}

      {meta && meta.total > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-muted">
            Showing {meta.from || ((currentPage - 1) * (meta.per_page || 15)) + 1} to{' '}
            {meta.to || Math.min(currentPage * (meta.per_page || 15), meta.total)} of{' '}
            {meta.total} entries
          </small>
          <small className="text-muted">
            Page {currentPage} of {meta.last_page || 1}
          </small>
        </div>
      )}
    </Container>
  );
}
