import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// The new list of vehicle types you provided
const vehicleTypes = ["MCWG", "LMV", "LGV", "MGV", "TRANS(HGV)", "E-Rikshaw/E-Cart", "Road Roller", "Construction Equipment Vehicle", "Adapted Vehicle", "Agriculture Trailer", "Agriculture Tractor"];

export default function VehicleEditModal({ show, onHide, vehicleRecord, onUpdated }) {
  const [form, setForm] = useState({
    registration_no: '',
    type: '',
    make_model: '',
    chassis_no: '',
    engine_no: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicleRecord) {
      setForm({
        registration_no: vehicleRecord.registration_no || '',
        type: vehicleRecord.type || '',
        make_model: vehicleRecord.make_model || '',
        chassis_no: vehicleRecord.chassis_no || '',
        engine_no: vehicleRecord.engine_no || '',
      });
      setError('');
    }
  }, [vehicleRecord]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleRecord) return;

    setSaving(true);
    setError('');
    try {
      await api.put(`/vehicles/${vehicleRecord.id}`, form);
      toast.success('Vehicle record updated.');
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

  if (!vehicleRecord) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit Vehicle</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Registration No *</Form.Label><Form.Control value={form.registration_no} onChange={e => updateForm('registration_no', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select value={form.type} onChange={e => updateForm('type', e.target.value)}>
                  <option value="">-- Select Type --</option>
                  {vehicleTypes.map(vt => <option key={vt} value={vt}>{vt}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label>Make & Model</Form.Label><Form.Control value={form.make_model} onChange={e => updateForm('make_model', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Chassis No</Form.Label><Form.Control value={form.chassis_no} onChange={e => updateForm('chassis_no', e.target.value.toUpperCase())} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Engine No</Form.Label><Form.Control value={form.engine_no} onChange={e => updateForm('engine_no', e.target.value.toUpperCase())} /></Form.Group></Col>
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
