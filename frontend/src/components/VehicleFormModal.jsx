import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

const vehicleTypes = ["MCWG", "LMV", "LGV", "MGV", "TRANS(HGV)", "E-Rikshaw/E-Cart", "Road Roller", "Construction Equipment Vehicle", "Adapted Vehicle", "Agriculture Trailer", "Agriculture Tractor"];

export default function VehicleFormModal({ show, onHide, citizenId, onCreated }) {
  const [form, setForm] = useState({
    registration_no: '',
    type: '',
    make_model: '',
    chassis_no: '',
    engine_no: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  // Reset form when modal is shown
  useEffect(() => {
    if (show) {
      setForm({
        registration_no: '',
        type: '',
        make_model: '',
        chassis_no: '',
        engine_no: '',
      });
      setErr('');
    }
  }, [show]);

  const up = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/citizens/${citizenId}/vehicles`, form);
      onCreated?.(data);
      onHide();
      toast.success('Vehicle added');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>Add Vehicle</Modal.Title></Modal.Header>
        <Modal.Body>
          {err && <Alert variant="danger">{err}</Alert>}
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Registration No *</Form.Label><Form.Control value={form.registration_no} onChange={e=>up('registration_no', e.target.value.toUpperCase())} required placeholder="CG04AB1234" /></Form.Group></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select value={form.type} onChange={e => up('type', e.target.value)}>
                  <option value="">-- Select Type --</option>
                  {vehicleTypes.map(vt => <option key={vt} value={vt}>{vt}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label>Make & Model</Form.Label><Form.Control value={form.make_model} onChange={e=>up('make_model', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Chassis No</Form.Label><Form.Control value={form.chassis_no} onChange={e=>up('chassis_no', e.target.value.toUpperCase())} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Engine No</Form.Label><Form.Control value={form.engine_no} onChange={e=>up('engine_no', e.target.value.toUpperCase())} /></Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting?'Saving...':'Save'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
