import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function UserEditModal({ show, onHide, userRecord, onUpdated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', branch_id: '' });
  const [branches, setBranches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userRecord) {
      setForm({
        name: userRecord.name || '',
        email: userRecord.email || '',
        phone: userRecord.phone || '',
        branch_id: userRecord.branch_id || '',
      });
      setError('');
    }
    if (show) {
      const fetchBranches = async () => {
        try {
          const { data } = await api.get('/admin/branches');
          setBranches(data);
        } catch (e) {
          toast.error('Could not load branch list.');
        }
      };
      fetchBranches();
    }
  }, [userRecord, show]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userRecord) return;

    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (userRecord.role !== 'manager') {
        payload.branch_id = null;
      }
      await api.put(`/admin/users/${userRecord.id}`, payload);
      toast.success('User details updated successfully.');
      onUpdated?.();
      onHide();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save changes.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!userRecord) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit User</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label>Name *</Form.Label><Form.Control value={form.name} onChange={e => updateForm('name', e.target.value)} required /></Form.Group></Col>

            {/* --- START OF THE FIX --- */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Phone *</Form.Label>
                <Form.Control value={form.phone} onChange={e => updateForm('phone', e.target.value)} required />
              </Form.Group>
            </Col>
            {/* --- END OF THE FIX --- */}

            {userRecord.role === 'manager' && (
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Branch (Optional)</Form.Label>
                  <Form.Select value={form.branch_id} onChange={e => updateForm('branch_id', e.target.value)}>
                    <option value="">-- No specific branch (Sees all data) --</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Text>Assigning a branch will restrict this manager's view.</Form.Text>
                </Form.Group>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
