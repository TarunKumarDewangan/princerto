import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function UserFormModal({ show, onHide, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '', // Field was missing
    password: '',
    role: 'manager',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setForm({
        name: '',
        email: '',
        phone: '', // Reset the field
        password: '',
        role: 'manager',
      });
      setError('');
    }
  }, [show]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/users', form);
      onCreated?.(data);
      onHide();
      toast.success(`User '${data.name}' created successfully as a ${data.role}.`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create user';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control value={form.name} onChange={e => update('name', e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
              </Form.Group>
            </Col>
            {/* THE FIX IS HERE: Added the Phone form group */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Password *</Form.Label>
                <Form.Control type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="Min. 8 characters" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Role *</Form.Label>
                <Form.Select value={form.role} onChange={e => update('role', e.target.value)}>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
