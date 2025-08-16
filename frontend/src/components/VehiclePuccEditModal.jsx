import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehiclePuccEditModal({ show, onHide, puccRecord, onUpdated }) {
  const [form, setForm] = useState({
    pucc_number: '',
    valid_from: '',
    valid_until: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (puccRecord) {
      setForm({
        pucc_number: puccRecord.pucc_number || '',
        valid_from: (puccRecord.valid_from || '').substring(0, 10),
        valid_until: (puccRecord.valid_until || '').substring(0, 10),
        status: puccRecord.status || 'active',
      });
      setError('');
    }
  }, [puccRecord]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puccRecord) return;

    setSaving(true);
    setError('');
    try {
      await api.put(`/puccs/${puccRecord.id}`, form);
      toast.success('PUCC record updated successfully.');
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

  if (!puccRecord) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit PUCC Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label>PUCC Number *</Form.Label><Form.Control value={form.pucc_number} onChange={e => updateForm('pucc_number', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Valid From *</Form.Label><Form.Control type="date" value={form.valid_from} onChange={e => updateForm('valid_from', e.target.value)} required /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Valid Until *</Form.Label><Form.Control type="date" value={form.valid_until} onChange={e => updateForm('valid_until', e.target.value)} required /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Status *</Form.Label><Form.Select value={form.status} onChange={e => updateForm('status', e.target.value)}><option value="active">Active</option><option value="expired">Expired</option></Form.Select></Form.Group></Col>
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
