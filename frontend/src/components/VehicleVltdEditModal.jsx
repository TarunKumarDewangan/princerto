import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehicleVltdEditModal({ show, onHide, record, onUpdated }) {
  const [form, setForm] = useState({ certificate_number: '', issue_date: '', expiry_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        certificate_number: record.certificate_number || '',
        issue_date: (record.issue_date || '').substring(0, 10),
        expiry_date: (record.expiry_date || '').substring(0, 10),
      });
      setError('');
    }
  }, [record]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true); setError('');
    try {
      await api.put(`/vltds/${record.id}`, form);
      toast.success('VLT a record updated.');
      onUpdated?.(); onHide();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save changes.';
      setError(msg); toast.error(msg);
    } finally { setSaving(false); }
  };

  if (!record) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit VLT a Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label>Certificate Number *</Form.Label><Form.Control value={form.certificate_number} onChange={e => updateForm('certificate_number', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Issue Date *</Form.Label><Form.Control type="date" value={form.issue_date} onChange={e => updateForm('issue_date', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Expiry Date *</Form.Label><Form.Control type="date" value={form.expiry_date} onChange={e => updateForm('expiry_date', e.target.value)} required /></Form.Group></Col>
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
