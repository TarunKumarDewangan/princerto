import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function UpdateProfileModal({ show, onHide }) {
  const { user, loadMe } = useAuth();
  const [form, setForm] = useState({
    name: '',
    father_name: '',
    dob: '',
    email: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user, show]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/me', form);
      toast.success('Profile updated successfully!');
      loadMe();
      onHide();
    } catch (err) { // THE FIX IS HERE: Replaced the underscore with a curly brace.
      const msg = err?.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>Complete Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide your details to continue. Date of Birth is mandatory.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label>Full Name</Form.Label><Form.Control value={form.name} onChange={e => updateForm('name', e.target.value)} required /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label>Father's Name</Form.Label><Form.Control value={form.father_name} onChange={e => updateForm('father_name', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Date of Birth *</Form.Label><Form.Control type="date" value={form.dob} onChange={e => updateForm('dob', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label>Address</Form.Label><Form.Control as="textarea" rows={2} value={form.address} onChange={e => updateForm('address', e.target.value)} /></Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Update Later</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save and Continue'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
