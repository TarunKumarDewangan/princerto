import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehicleFitnessEditModal({ show, onHide, record, onUpdated }) {
  const [form, setForm] = useState({ certificate_number: '', issue_date: '', expiry_date: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        certificate_number: record.certificate_number || '',
        issue_date: (record.issue_date || '').substring(0, 10),
        expiry_date: (record.expiry_date || '').substring(0, 10),
      });
      setFile(null); // Reset file state when a new record is passed in
      setError('');
    }
  }, [record]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('certificate_number', form.certificate_number);
    formData.append('issue_date', form.issue_date);
    formData.append('expiry_date', form.expiry_date);
    if (file) {
      formData.append('file', file);
    }
    // Tell Laravel we are performing an update
    formData.append('_method', 'PUT');

    try {
      // Use POST for FormData, Laravel will treat it as PUT
      await api.post(`/fitnesses/${record.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Fitness record updated.');
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
        <Modal.Header closeButton><Modal.Title>Edit Fitness Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Certificate Number *</Form.Label>
                <Form.Control value={form.certificate_number} onChange={e => updateForm('certificate_number', e.target.value.toUpperCase())} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Issue Date *</Form.Label>
                <Form.Control type="date" value={form.issue_date} onChange={e => updateForm('issue_date', e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Expiry Date *</Form.Label>
                <Form.Control type="date" value={form.expiry_date} onChange={e => updateForm('expiry_date', e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Upload New Document (Optional)</Form.Label>
                <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
                {record.file_path && !file && (
                  <div className="small mt-1">
                    Current file: <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${record.file_path}`} target="_blank" rel="noopener noreferrer">View</a>
                  </div>
                )}
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
