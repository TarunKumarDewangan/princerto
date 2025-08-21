import { useEffect, useState, useCallback, Fragment } from 'react'; // Import Fragment
import { Link } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button, Table, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

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

const ExpandedRowDetails = ({ citizenId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/citizens/${citizenId}/all-details`);
        setDetails(data);
      } catch (e) {
        toast.error("Failed to load full details for citizen.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [citizenId]);

  if (loading) return <div className="p-3 text-center"><Spinner size="sm" /></div>;
  if (!details) return <div className="p-3 text-danger">Could not load details.</div>;

  return (
    <div className="p-3 bg-light">
      <h6>All Documents for {details.name}</h6>
      <Row>
        <Col md={6}>
          <strong>Learner Licenses</strong>
          {details.learner_licenses.length > 0 ? (
            <Table striped bordered size="sm" className="mt-2">
              <thead><tr><th>LL No</th><th>Expiry</th></tr></thead>
              <tbody>{details.learner_licenses.map(ll => <tr key={`ll-${ll.id}`}><td>{ll.ll_no}</td><td>{formatDate(ll.expiry_date)}</td></tr>)}</tbody>
            </Table>
          ) : <p className="small">- No records</p>}
        </Col>
        <Col md={6}>
          <strong>Driving Licenses</strong>
          {details.driving_licenses.length > 0 ? (
             <Table striped bordered size="sm" className="mt-2">
              <thead><tr><th>DL No</th><th>Expiry</th></tr></thead>
              <tbody>{details.driving_licenses.map(dl => <tr key={`dl-${dl.id}`}><td>{dl.dl_no}</td><td>{formatDate(dl.expiry_date)}</td></tr>)}</tbody>
            </Table>
          ) : <p className="small">- No records</p>}
        </Col>
      </Row>
      {details.vehicles.map(v => (
        <div key={`v-${v.id}`} className="mt-3">
          <strong>Vehicle: {v.registration_no}</strong>
          {v.insurances.length > 0 && <p className="small mb-0">Insurance expires: {formatDate(v.insurances[0].end_date)}</p>}
          {v.puccs.length > 0 && <p className="small mb-0">PUCC expires: {formatDate(v.puccs[0].valid_until)}</p>}
          {v.fitnesses.length > 0 && <p className="small mb-0">Fitness expires: {formatDate(v.fitnesses[0].expiry_date)}</p>}
        </div>
      ))}
    </div>
  );
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
  const [expandedRowId, setExpandedRowId] = useState(null);

  const fetchExpiries = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, page };
      const { data } = await api.get('/reports/expiries', { params });
      setItems(data.data || []);
      setMeta(data || {});
      setExpandedRowId(null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load expiry report.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      vehicle_no: '', start_date: '', end_date: '',
      owner_name: '', exact_date: '',
    });
  };

  const goPage = (p) => {
    if (!p || p < 1 || p > meta.last_page) return;
    fetchExpiries(p);
  };

  const handleToggleRow = (citizenId) => {
    if (expandedRowId === citizenId) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(citizenId);
    }
  };

  // Use a single useEffect to fetch data when the component mounts or filters change
  useEffect(() => {
    fetchExpiries(1);
  }, [filters]);

  return (
    <Container className="py-4">
      <h3 className="mb-3">Documents Expiry Report</h3>
      {/* --- START OF FIX: The filter card was missing --- */}
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
              <Col md="auto">
                <Button variant="outline-secondary" onClick={handleReset} disabled={loading}>Reset</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      {/* --- END OF FIX --- */}

      {error && <Alert variant="danger">{error}</Alert>}

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
            {loading && <tr><td colSpan={6} className="text-center"><Spinner size="sm" /></td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="text-center">No expiring documents found for the selected filters.</td></tr>}
            {!loading && items.map((item, index) => (
              // --- START OF FIX: Using Fragment and unique key ---
              <Fragment key={`item-fragment-${meta.from + index}`}>
                <tr>
                  <td>{meta.from + index}</td>
                  <td><Link to={`/citizens/${item.citizen_id}`}>{item.owner_name}</Link></td>
                  <td><Badge bg="warning" text="dark">{item.type}</Badge></td>
                  <td>{item.identifier}</td>
                  <td>{formatDate(item.expiry_date)}</td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => handleToggleRow(item.citizen_id)}>
                      {expandedRowId === item.citizen_id ? 'Hide All' : 'Show All'}
                    </Button>
                  </td>
                </tr>
                {expandedRowId === item.citizen_id && (
                  <tr>
                    <td colSpan={6}>
                      <ExpandedRowDetails citizenId={item.citizen_id} />
                    </td>
                  </tr>
                )}
              </Fragment>
              // --- END OF FIX ---
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
