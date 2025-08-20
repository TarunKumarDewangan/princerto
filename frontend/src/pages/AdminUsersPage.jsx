// import { useEffect, useMemo, useState, useCallback } from 'react';
// import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Pagination, ButtonGroup, Dropdown } from 'react-bootstrap';
// import api from '../services/apiClient';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-toastify';
// import UserFormModal from '../components/UserFormModal';
// import UserEditModal from '../components/UserEditModal';

// export default function AdminUsersPage() {
//   const { user: authUser } = useAuth();

//   const [q, setQ] = useState('');
//   const [role, setRole] = useState('');
//   const [perPage, setPerPage] = useState(10);
//   const [items, setItems] = useState([]);
//   const [meta, setMeta] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');
//   const [savingId, setSavingId] = useState(null);
//   const [showCreateUser, setShowCreateUser] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);

//   const fetchUsers = useCallback(async (page = 1) => {
//     setLoading(true);
//     setErr('');
//     try {
//       const { data } = await api.get('/admin/users', {
//         params: { q, role, per_page: perPage, page }
//       });
//       setItems(data.data || []);
//       setMeta(data.meta || null);
//     } catch (e) {
//       const msg = e?.response?.data?.message || 'Failed to load users';
//       setErr(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [q, role, perPage]);

//   useEffect(() => { fetchUsers(1); }, [fetchUsers]);

//   const goPage = (p) => { if (!meta || p < 1 || p > meta.last_page) return; fetchUsers(p); };

//   const changeRole = async (uid, newRole) => {
//     setSavingId(uid);
//     setErr('');
//     try {
//       await api.patch(`/admin/users/${uid}/role`, { role: newRole });
//       toast.success('Role updated');
//       fetchUsers(meta?.current_page || 1);
//     } catch (e) {
//       const msg = e?.response?.data?.message || 'Failed to update role';
//       setErr(msg);
//       toast.error(msg);
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const handleEdit = (user) => { setEditingUser(user); setShowEditModal(true); };
//   const handleDelete = async (user) => { if (window.confirm(`Are you sure you want to delete the user '${user.name}'?`)) { try { await api.delete(`/admin/users/${user.id}`); toast.success('User deleted.'); fetchUsers(meta?.current_page || 1); } catch (e) { toast.error(e?.response?.data?.message || 'Failed to delete user.'); } } };
//   const handleResetPassword = async (user) => { if (window.confirm(`Send a password reset link to ${user.email}?`)) { setSavingId(user.id); try { await api.post(`/admin/users/${user.id}/send-reset-link`); toast.success(`Password reset link sent to ${user.email}.`); } catch (e) { toast.error(e?.response?.data?.message || 'Failed to send reset link.'); } finally { setSavingId(null); } } };
//   const onUserCreated = () => { fetchUsers(1); };
//   const onUserUpdated = () => { fetchUsers(meta?.current_page || 1); };

//   return (
//     <Container className="py-4">
//       <Row className="mb-3 align-items-center">
//         <Col><h3 className="mb-0">Admin — Manage Users</h3></Col>
//         <Col className="text-end"><Button onClick={() => setShowCreateUser(true)}>+ Add User</Button></Col>
//       </Row>
//       <Card className="mb-3">
//         <Card.Body>
//           <Form onSubmit={(e) => { e.preventDefault(); fetchUsers(1); }}>
//             <Row className="g-2">
//               <Col md={4}><Form.Control placeholder="Search name / email / phone" value={q} onChange={e => setQ(e.target.value)} /></Col>
//               <Col md={3}><Form.Select value={role} onChange={e => setRole(e.target.value)}><option value="">All roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="user">User</option></Form.Select></Col>
//               <Col md={2}><Form.Select value={perPage} onChange={e => setPerPage(Number(e.target.value))}><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></Form.Select></Col>
//               <Col md="auto"><Button type="submit" disabled={loading}>Search</Button></Col>
//               <Col md="auto"><Button variant="outline-secondary" onClick={() => { setQ(''); setRole(''); fetchUsers(1); }} disabled={loading}>Reset</Button></Col>
//             </Row>
//           </Form>
//         </Card.Body>
//       </Card>

//       {err && <Alert variant="danger">{err}</Alert>}
//       <div className="table-responsive">
//         <Table bordered hover size="sm">
//           <thead><tr><th>#</th><th>Name / Email</th><th>Phone</th><th>Role</th><th>Change Role</th><th>Actions</th></tr></thead>
//           <tbody>
//             {loading && <tr><td colSpan={6} className="text-center">Loading...</td></tr>}
//             {!loading && items.length === 0 && <tr><td colSpan={6} className="text-center">No users</td></tr>}
//             {!loading && items.map((u, i) => {
//               // --- START OF THE FIX ---
//               // The useMemo hook was removed from inside the loop.
//               // We now use a simple constant for this logic, which is correct and efficient.
//               const canPerformAction = (() => {
//                 if (!authUser) return false;
//                 if (authUser.role === 'admin') return true; // Admins can do anything
//                 if (authUser.role === 'manager' && u.role === 'user') return true; // Managers can act on users
//                 return false;
//               })();
//               // --- END OF THE FIX ---

//               return (
//                 <tr key={u.id}>
//                   <td>{(meta?.from ?? 1) + i}</td>
//                   <td><div className="fw-semibold">{u.name}</div><div className="text-muted small">{u.email}</div></td>
//                   <td>{u.phone || '-'}</td>
//                   <td><Badge bg="light" text="dark">{u.role}</Badge></td>
//                   <td style={{ minWidth: 220 }}>
//                     <ButtonGroup size="sm">
//                       {authUser.role === 'admin' && <Button variant={u.role === 'admin' ? 'secondary' : 'outline-dark'} disabled={!canPerformAction || savingId === u.id || u.role === 'admin'} onClick={() => changeRole(u.id, 'admin')}>Admin</Button>}
//                       <Button variant={u.role === 'manager' ? 'secondary' : 'outline-dark'} disabled={!canPerformAction || savingId === u.id || u.role === 'manager'} onClick={() => changeRole(u.id, 'manager')}>Manager</Button>
//                       <Button variant={u.role === 'user' ? 'secondary' : 'outline-dark'} disabled={!canPerformAction || savingId === u.id || u.role === 'user'} onClick={() => changeRole(u.id, 'user')}>User</Button>
//                     </ButtonGroup>
//                   </td>
//                   <td>
//                     <Dropdown as={ButtonGroup}>
//                       <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(u)} disabled={!canPerformAction}>Edit</Button>
//                       <Dropdown.Toggle split variant="outline-secondary" size="sm" disabled={!canPerformAction} />
//                       <Dropdown.Menu>
//                         <Dropdown.Item onClick={() => handleResetPassword(u)} disabled={savingId === u.id}>{savingId === u.id ? 'Sending...' : 'Send Reset Link'}</Dropdown.Item>
//                         <Dropdown.Divider />
//                         <Dropdown.Item onClick={() => handleDelete(u)} className="text-danger">Delete User</Dropdown.Item>
//                       </Dropdown.Menu>
//                     </Dropdown>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </Table>
//       </div>

//       {meta && meta.last_page > 1 && (<div className="d-flex justify-content-between align-items-center"><div className="text-muted small">Showing {meta.from}–{meta.to} of {meta.total}</div><Pagination className="mb-0"><Pagination.Prev onClick={() => goPage(meta.current_page - 1)} disabled={meta.current_page <= 1} /><Pagination.Item active>{meta.current_page}</Pagination.Item><Pagination.Next onClick={() => goPage(meta.current_page + 1)} disabled={meta.current_page >= meta.last_page} /></Pagination></div>)}
//       <UserFormModal show={showCreateUser} onHide={() => setShowCreateUser(false)} onCreated={onUserCreated} />
//       <UserEditModal show={showEditModal} onHide={() => setShowEditModal(false)} userRecord={editingUser} onUpdated={onUserUpdated} />
//     </Container>
//   );
// }


import { useEffect, useMemo, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Pagination, ButtonGroup, Dropdown } from 'react-bootstrap';
import api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import UserFormModal from '../components/UserFormModal';
import UserEditModal from '../components/UserEditModal';
import SendMessageModal from '../components/SendMessageModal'; // --- START OF NEW CODE --- (1. Import)

export default function AdminUsersPage() {
  const { user: authUser } = useAuth();

  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- START OF NEW CODE --- (2. Add state for the new modal)
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [messagingCitizen, setMessagingCitizen] = useState(null);
  // --- END OF NEW CODE ---

  const fetchUsers = useCallback(async (page = 1) => {
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
  }, [q, role, perPage]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const goPage = (p) => { if (!meta || p < 1 || p > meta.last_page) return; fetchUsers(p); };

  const changeRole = async (uid, newRole) => {
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

  // --- START OF NEW CODE --- (Function to open the modal)
  const handleShowSendMessage = (user) => {
    if (!user.citizen_id) {
      toast.error("This user does not have a primary citizen profile to message.");
      return;
    }
    // The modal expects a "citizen" object. We create one from the user data.
    setMessagingCitizen({
      id: user.citizen_id,
      name: user.name,
      mobile: user.phone,
    });
    setShowSendMessage(true);
  };
  // --- END OF NEW CODE ---

  const handleEdit = (user) => { setEditingUser(user); setShowEditModal(true); };
  const handleDelete = async (user) => { if (window.confirm(`Are you sure you want to delete the user '${user.name}'?`)) { try { await api.delete(`/admin/users/${user.id}`); toast.success('User deleted.'); fetchUsers(meta?.current_page || 1); } catch (e) { toast.error(e?.response?.data?.message || 'Failed to delete user.'); } } };
  const handleResetPassword = async (user) => { if (window.confirm(`Send a password reset link to ${user.email}?`)) { setSavingId(user.id); try { await api.post(`/admin/users/${user.id}/send-reset-link`); toast.success(`Password reset link sent to ${user.email}.`); } catch (e) { toast.error(e?.response?.data?.message || 'Failed to send reset link.'); } finally { setSavingId(null); } } };
  const onUserCreated = () => { fetchUsers(1); };
  const onUserUpdated = () => { fetchUsers(meta?.current_page || 1); };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col><h3 className="mb-0">Admin — Manage Users</h3></Col>
        <Col className="text-end"><Button onClick={() => setShowCreateUser(true)}>+ Add User</Button></Col>
      </Row>
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={(e) => { e.preventDefault(); fetchUsers(1); }}>
            <Row className="g-2">
              <Col md={4}><Form.Control placeholder="Search name / email / phone" value={q} onChange={e => setQ(e.target.value)} /></Col>
              <Col md={3}><Form.Select value={role} onChange={e => setRole(e.target.value)}><option value="">All roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="user">User</option></Form.Select></Col>
              <Col md={2}><Form.Select value={perPage} onChange={e => setPerPage(Number(e.target.value))}><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></Form.Select></Col>
              <Col md="auto"><Button type="submit" disabled={loading}>Search</Button></Col>
              <Col md="auto"><Button variant="outline-secondary" onClick={() => { setQ(''); setRole(''); fetchUsers(1); }} disabled={loading}>Reset</Button></Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {err && <Alert variant="danger">{err}</Alert>}
      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead><tr><th>#</th><th>Name / Email</th><th>Phone</th><th>Role</th><th>Change Role</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center">Loading...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="text-center">No users</td></tr>}
            {!loading && items.map((u, i) => {
              const canPerformAction = (() => {
                if (!authUser) return false;
                if (authUser.role === 'admin') return true;
                if (authUser.role === 'manager' && u.role === 'user') return true;
                return false;
              })();

              return (
                <tr key={u.id}>
                  <td>{(meta?.from ?? 1) + i}</td>
                  <td><div className="fw-semibold">{u.name}</div><div className="text-muted small">{u.email}</div></td>
                  <td>{u.phone || '-'}</td>
                  <td><Badge bg="light" text="dark">{u.role}</Badge></td>
                  <td style={{ minWidth: 220 }}>
                    <ButtonGroup size="sm">
                      {authUser.role === 'admin' && <Button variant={u.role === 'admin' ? 'secondary' : 'outline-dark'} disabled={!canPerformAction || savingId === u.id || u.role === 'admin'} onClick={() => changeRole(u.id, 'admin')}>Admin</Button>}
                      <Button variant={u.role === 'manager' ? 'secondary' : 'outline-dark'} disabled={!canPerformAction || savingId === u.id || u.role === 'manager'} onClick={() => changeRole(u.id, 'manager')}>Manager</Button>
                      <Button variant={u.role === 'user' ? 'secondary' : 'outline-dark'} disabled={!canPerformAction || savingId === u.id || u.role === 'user'} onClick={() => changeRole(u.id, 'user')}>User</Button>
                    </ButtonGroup>
                  </td>
                  <td>
                    <Dropdown as={ButtonGroup}>
                      <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(u)} disabled={!canPerformAction}>Edit</Button>
                      <Dropdown.Toggle split variant="outline-secondary" size="sm" disabled={!canPerformAction} />
                      <Dropdown.Menu>
                        {/* --- START OF NEW CODE --- (3. Add the dropdown item) */}
                        <Dropdown.Item onClick={() => handleShowSendMessage(u)}>Send Message</Dropdown.Item>
                        {/* --- END OF NEW CODE --- */}
                        <Dropdown.Item onClick={() => handleResetPassword(u)} disabled={savingId === u.id}>{savingId === u.id ? 'Sending...' : 'Send Reset Link'}</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleDelete(u)} className="text-danger">Delete User</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {meta && meta.last_page > 1 && (<div className="d-flex justify-content-between align-items-center"><div className="text-muted small">Showing {meta.from}–{meta.to} of {meta.total}</div><Pagination className="mb-0"><Pagination.Prev onClick={() => goPage(meta.current_page - 1)} disabled={meta.current_page <= 1} /><Pagination.Item active>{meta.current_page}</Pagination.Item><Pagination.Next onClick={() => goPage(meta.current_page + 1)} disabled={meta.current_page >= meta.last_page} /></Pagination></div>)}
      <UserFormModal show={showCreateUser} onHide={() => setShowCreateUser(false)} onCreated={onUserCreated} />
      <UserEditModal show={showEditModal} onHide={() => setShowEditModal(false)} userRecord={editingUser} onUpdated={onUserUpdated} />

      {/* --- START OF NEW CODE --- (4. Render the modal) */}
      <SendMessageModal
        show={showSendMessage}
        onHide={() => setShowSendMessage(false)}
        citizen={messagingCitizen}
      />
      {/* --- END OF NEW CODE --- */}
    </Container>
  );
}
