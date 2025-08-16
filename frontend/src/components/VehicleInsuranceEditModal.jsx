import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehicleInsuranceEditModal({ show, onHide, insuranceRecord, onUpdated }) {
  const [form, setForm] = useState({
    insurance_type: '',
    company_name: '',
    policy_number: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (insuranceRecord) {
      setForm({
        insurance_type: insuranceRecord.insurance_type || '',
        company_name: insuranceRecord.company_name || '',
        policy_number: insuranceRecord.policy_number || '',
        start_date: (insuranceRecord.start_date || '').substring(0, 10),
        end_date: (insuranceRecord.end_date || '').substring(0, 10),
        status: insuranceRecord.status || 'active',
      });
      setError('');
    }
  }, [insuranceRecord]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!insuranceRecord) return;

    setSaving(true);
    setError('');
    try {
      await api.put(`/insurances/${insuranceRecord.id}`, form);
      toast.success('Insurance record updated successfully.');
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

  if (!insuranceRecord) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit Insurance Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Insurance Company *</Form.Label><Form.Control value={form.company_name} onChange={e => updateForm('company_name', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Policy Number *</Form.Label><Form.Control value={form.policy_number} onChange={e => updateForm('policy_number', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Insurance Type *</Form.Label><Form.Select value={form.insurance_type} onChange={e => updateForm('insurance_type', e.target.value)}><option value="">-- Select --</option><option value="Comprehensive">Comprehensive</option><option value="Third Party">Third Party</option></Form.Select></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Status *</Form.Label><Form.Select value={form.status} onChange={e => updateForm('status', e.target.value)}><option value="active">Active</option><option value="expired">Expired</option></Form.Select></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Start Date *</Form.Label><Form.Control type="date" value={form.start_date} onChange={e => updateForm('start_date', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>End Date *</Form.Label><Form.Control type="date" value={form.end_date} onChange={e => updateForm('end_date', e.target.value)} required /></Form.Group></Col>
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
