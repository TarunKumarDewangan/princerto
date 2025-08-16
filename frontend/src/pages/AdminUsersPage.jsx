import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Pagination } from 'react-bootstrap';
import api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import UserFormModal from '../components/UserFormModal'; // Import the new modal

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [perPage, setPerPage] = useState(10);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [savingId, setSavingId] = useState(null);

  // State to control the visibility of the new user modal
  const [showCreateUser, setShowCreateUser] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/admin/users', {
        params: { q, role, per_page: perPage, page }
      });
      setItems(data.data || []);
      setMeta(data.meta || null);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load users';
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, []); // initial

  const goPage = (p) => {
    if (!meta) return;
    if (p < 1 || p > meta.last_page) return;
    fetchUsers(p);
  };

  const changeRole = async (uid, newRole) => {
    if (!isAdmin) return;
    setSavingId(uid);
    setErr('');
    try {
      await api.patch(`/admin/users/${uid}/role`, { role: newRole });
      toast.success('Role updated');
      fetchUsers(meta?.current_page || 1);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to update role';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const onUserCreated = () => {
    // Refresh the user list after a new user is created
    fetchUsers(1);
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col><h3 className="mb-0">Admin — Manage Users</h3></Col>
        <Col className="text-end">
          {/* Button to open the modal */}
          <Button onClick={() => setShowCreateUser(true)}>
            + Add User
          </Button>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={(e) => { e.preventDefault(); fetchUsers(1); }}>
            <Row className="g-2">
              <Col md={4}>
                <Form.Control placeholder="Search name / email / phone" value={q} onChange={e => setQ(e.target.value)} />
              </Col>
              <Col md={3}>
                <Form.Select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </Form.Select>
              </Col>
              <Col md="auto">
                <Button type="submit" disabled={loading}>Search</Button>
              </Col>
              <Col md="auto">
                <Button variant="outline-secondary" onClick={() => { setQ(''); setRole(''); fetchUsers(1); }} disabled={loading}>
                  Reset
                </Button>
              </Col>
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
              <th>Name / Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center">Loading...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={5} className="text-center">No users</td></tr>}
            {!loading && items.map((u, i) => (
              <tr key={u.id}>
                <td>{(meta?.from ?? 1) + i}</td>
                <td>
                  <div className="fw-semibold">{u.name}</div>
                  <div className="text-muted small">{u.email}</div>
                </td>
                <td>{u.phone || '-'}</td>
                <td>
                  <Badge bg="light" text="dark">{u.role}</Badge>
                </td>
                <td style={{ minWidth: 220 }}>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant={u.role === 'admin' ? 'secondary' : 'outline-dark'} disabled={savingId === u.id || u.role === 'admin'} onClick={() => changeRole(u.id, 'admin')}>Make Admin</Button>
                    <Button size="sm" variant={u.role === 'manager' ? 'secondary' : 'outline-dark'} disabled={savingId === u.id || u.role === 'manager'} onClick={() => changeRole(u.id, 'manager')}>Manager</Button>
                    <Button size="sm" variant={u.role === 'user' ? 'secondary' : 'outline-dark'} disabled={savingId === u.id || u.role === 'user'} onClick={() => changeRole(u.id, 'user')}>User</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">Showing {meta.from}–{meta.to} of {meta.total}</div>
          <Pagination className="mb-0">
            <Pagination.Prev onClick={() => { const p=(meta.current_page||1)-1; if(p>=1) fetchUsers(p); }} disabled={meta.current_page <= 1} />
            <Pagination.Item active>{meta.current_page}</Pagination.Item>
            <Pagination.Next onClick={() => { const p=(meta.current_page||1)+1; if(p<=meta.last_page) fetchUsers(p); }} disabled={meta.current_page >= meta.last_page} />
          </Pagination>
        </div>
      )}

      {/* Render the modal */}
      <UserFormModal
        show={showCreateUser}
        onHide={() => setShowCreateUser(false)}
        onCreated={onUserCreated}
      />
    </Container>
  );
}
