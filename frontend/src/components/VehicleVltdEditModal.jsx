import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehicleTaxEditModal({ show, onHide, record, onUpdated }) {
  const [form, setForm] = useState({
    vehicle_type: '',
    tax_mode: '',
    tax_from: '',
    tax_upto: '',
    amount: '', // --- ADD amount to state ---
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        vehicle_type: record.vehicle_type || '',
        tax_mode: record.tax_mode || '',
        tax_from: (record.tax_from || '').substring(0, 10),
        tax_upto: (record.tax_upto || '').substring(0, 10),
        amount: record.amount || '', // --- Set initial amount ---
      });
      setFile(null);
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
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) {
      formData.append('file', file);
    }
    formData.append('_method', 'PUT');

    try {
      await api.post(`/taxes/${record.id}`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
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
             <Col md={6}><Form.Group><Form.Label>Tax Mode *</Form.Label><Form.Select value={form.tax_mode} onChange={e => updateForm('tax_mode', e.target.value)} required><option value="">Select</option><option value="Quarterly">Quarterly</option><option value="HalfYearly">HalfYearly</option><option value="Yearly">Yearly</option><option value="OneTime">OneTime</option></Form.Select></Form.Group></Col>
             <Col md={6}><Form.Group><Form.Label>Vehicle Type (opt)</Form.Label><Form.Control value={form.vehicle_type} onChange={e => updateForm('vehicle_type', e.target.value)} placeholder="LMV / MC" /></Form.Group></Col>
             <Col md={6}><Form.Group><Form.Label>From *</Form.Label><Form.Control type="date" value={form.tax_from} onChange={e => updateForm('tax_from', e.target.value)} required /></Form.Group></Col>
             <Col md={6}><Form.Group><Form.Label>Upto *</Form.Label><Form.Control type="date" value={form.tax_upto} onChange={e => updateForm('tax_upto', e.target.value)} required /></Form.Group></Col>

            {/* --- ADD Amount field --- */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tax Amount (₹)</Form.Label>
                <Form.Control type="number" step="0.01" value={form.amount} onChange={e => updateForm('amount', e.target.value)} placeholder="e.g., 1500.00" />
              </Form.Group>
            </Col>

            <Col md={6}>
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
