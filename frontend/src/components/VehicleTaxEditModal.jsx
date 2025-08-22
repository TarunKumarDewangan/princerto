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
  const [file, setFile] = useState(null); // --- START OF NEW CODE --- (State for file)
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
      setFile(null); // Reset file on new record
      setError('');
    }
  }, [record]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // --- START OF MODIFIED CODE --- (Handle form submission with FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true);
    setError('');

    // To send a file, we need to use FormData
    const formData = new FormData();
    formData.append('vehicle_type', form.vehicle_type);
    formData.append('tax_mode', form.tax_mode);
    formData.append('tax_from', form.tax_from);
    formData.append('tax_upto', form.tax_upto);
    if (file) {
      formData.append('file', file);
    }
    // We must append _method to tell Laravel we are doing a PUT request
    formData.append('_method', 'PUT');

    try {
      // Use POST for FormData, but Laravel will treat it as PUT because of _method
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
  // --- END OF MODIFIED CODE ---

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
            {/* --- START OF NEW CODE --- (Add file input) */}
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
            {/* --- END OF NEW CODE --- */}
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
