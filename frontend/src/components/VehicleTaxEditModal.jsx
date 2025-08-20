import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehicleTaxEditModal({ show, onHide, record, onUpdated }) {
  const [form, setForm] = useState({
    vehicle_type: '',
    tax_mode: '',
    tax_from: '',
    tax_upto: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        vehicle_type: record.vehicle_type || '',
        tax_mode: record.tax_mode || '',
        tax_from: (record.tax_from || '').substring(0, 10),
        tax_upto: (record.tax_upto || '').substring(0, 10),
      });
      setError('');
    }
  }, [record]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/taxes/${record.id}`, form);
      toast.success('Tax record updated successfully.');
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

  if (!record) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit Tax Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
             <Col md={6}>
              <Form.Group>
                <Form.Label>Tax Mode *</Form.Label>
                <Form.Select value={form.tax_mode} onChange={e => updateForm('tax_mode', e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="HalfYearly">HalfYearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="OneTime">OneTime</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vehicle Type (opt)</Form.Label>
                <Form.Control value={form.vehicle_type} onChange={e => updateForm('vehicle_type', e.target.value)} placeholder="LMV / MC" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>From *</Form.Label>
                <Form.Control type="date" value={form.tax_from} onChange={e => updateForm('tax_from', e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Upto *</Form.Label>
                <Form.Control type="date" value={form.tax_upto} onChange={e => updateForm('tax_upto', e.target.value)} required />
              </Form.Group>
            </Col>
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
