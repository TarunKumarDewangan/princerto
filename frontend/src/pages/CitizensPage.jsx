import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Table, Badge, Alert, Pagination, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/apiClient';
import CitizenFormModal from '../components/CitizenFormModal';
import CitizenEditModal from '../components/CitizenEditModal';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString.substring(0, 10));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    if (isNaN(day)) return '-';
    return `${day}-${month}-${year}`;
  } catch (error) {
    return '-';
  }
};

export default function CitizensPage() {
  const { user } = useAuth();

  const canWrite = useMemo(() => user && ['admin', 'manager'].includes(user.role), [user]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  const [q, setQ] = useState('');
  const [mobile, setMobile] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState(null);

  const fetchList = async (page = 1, showToasts = false) => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/citizens', {
        params: { q, mobile, per_page: perPage, page }
      });
      setItems(data.data || []);
      setMeta(data.meta || null);
      if (showToasts) {
        const total = data?.meta?.total ?? (data?.data?.length || 0);
        toast.success(`Loaded ${total} record${total !== 1 ? 's' : ''}`);
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to load';
      setErr(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); }, []);

  const onCreated = () => { toast.success('Citizen created'); fetchList(1); };
  const goPage = (p) => { if (!meta || p < 1 || p > meta.last_page) return; fetchList(p); };
  const onReset = () => { setQ(''); setMobile(''); fetchList(1, true); };

  const handleEdit = (citizen) => {
    setEditingCitizen(citizen);
    setShowEditModal(true);
  };

  const handleDelete = async (citizen) => {
    if (window.confirm(`Are you sure you want to delete the profile for '${citizen.name}'? This cannot be undone.`)) {
      try {
        await api.delete(`/citizens/${citizen.id}`);
        toast.success('Citizen profile deleted.');
        fetchList(meta?.current_page || 1);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const onUpdated = () => {
    toast.success('Citizen updated successfully.');
    fetchList(meta?.current_page || 1);
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (mobile) params.append('mobile', mobile);
      const url = `/citizens/export?${params.toString()}`;
      const { data } = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `citizens_export_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Export downloaded');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Export failed');
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col><h3 className="mb-0">Citizen Profiles</h3></Col>
        <Col className="text-end">
          {/* --- START OF FIX --- */}
          {canWrite && (
            <Button as={Link} to="/reports/expiries" variant="outline-warning" className="me-2">
              Expiry Report
            </Button>
          )}
          {canWrite && (
            <Button variant="outline-secondary" className="me-2" onClick={exportCsv} disabled={loading}>
              Export CSV
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)}>+ New Profile</Button>
          {/* --- END OF FIX --- */}
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={(e) => { e.preventDefault(); fetchList(1, true); }}>
            <Row className="g-2">
              <Col md={4}><Form.Control placeholder="Search name / father / email" value={q} onChange={e => setQ(e.target.value)} /></Col>
              <Col md={3}><Form.Control placeholder="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} /></Col>
              <Col md={2}><Form.Select value={perPage} onChange={e => setPerPage(Number(e.target.value))}><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></Form.Select></Col>
              <Col md="auto"><Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Search'}</Button></Col>
              <Col md="auto"><Button variant="outline-secondary" onClick={onReset} disabled={loading}>Reset</Button></Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Name / Father</th>
              <th>Profile Type</th>
              <th>Mobile / Email</th>
              <th>DOB</th>
              <th>Address</th>
              <th>LL / DL / Veh</th>
              {canWrite && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={canWrite ? 8 : 7} className="text-center">Loading...</td></tr>)}
            {!loading && items.length === 0 && (<tr><td colSpan={canWrite ? 8 : 7} className="text-center">No records</td></tr>)}
            {!loading && items.map((c, idx) => (
              <tr key={c.id}>
                <td>{(meta?.from ?? 1) + idx}</td>
                <td>
                  <div className="fw-semibold">
                    <Link to={`/citizens/${c.id}`} className="text-decoration-none">{c.name}</Link>
                  </div>
                  <div className="text-muted small">{c.relation_name || '-'}</div>
                </td>
                <td>
                  {c.is_primary_profile_for_user ? (
                    <Badge bg="success">User</Badge>
                  ) : (
                    <div>
                      <Badge bg="secondary">Citizen</Badge>
                      <div className="text-muted small">By: {c.user?.name || 'N/A'}</div>
                    </div>
                  )}
                </td>
                <td><div>{c.mobile}</div><div className="text-muted small">{c.email || '-'}</div></td>
                <td>{formatDate(c.dob)}</td>
                <td className="small">{c.address || '-'}</td>
                <td>
                  <Badge bg="light" text="dark" className="me-1">LL {c.learner_licenses_count ?? 0}</Badge>
                  <Badge bg="light" text="dark" className="me-1">DL {c.driving_licenses_count ?? 0}</Badge>
                  <Badge bg="light" text="dark">Veh {c.vehicles_count ?? 0}</Badge>
                </td>
                {canWrite && (
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(c)}>Edit</Button>
                    {isAdmin && (
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c)}>Delete</Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">Showing {meta.from}–{meta.to} of {meta.total}</div>
          <Pagination className="mb-0">
            <Pagination.Prev onClick={() => goPage((meta.current_page || 1) - 1)} disabled={meta.current_page <= 1} />
            <Pagination.Item active>{meta.current_page}</Pagination.Item>
            <Pagination.Next onClick={() => goPage((meta.current_page || 1) + 1)} disabled={meta.current_page >= meta.last_page} />
          </Pagination>
        </div>
      )}

      <CitizenFormModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={onCreated} />

      <CitizenEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        citizen={editingCitizen}
        onUpdated={() => {
          setShowEditModal(false);
          onUpdated();
        }}
      />
    </Container>
  );
}
