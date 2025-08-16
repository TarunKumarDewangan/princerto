import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

const vehicleClassMap = {
  "MCWOG": "Motorcycle Without Gear",
  "MCWG": "Motorcycle With Gear",
  "LMV": "Light Motor Vehicle",
  "TRANS": "Transport Vehicle",
  "E-Rikshaw": "E-Rikshaw",
  "E-Cart": "E-Cart",
  "Road Roller": "Road Roller",
  "Articulated Vehicle": "Articulated Vehicle",
  "Agricultural Tractor": "Agricultural Tractor",
  "Construction Equipment Vehicle": "Construction Equipment Vehicle",
};
const officeList = ["CG-04: Raipur", "CG-05: Dhamtari", "CG-06: Mahasamund", "CG-07: Durg", "CG-08: Rajnandgaon", "CG-09: Kabirdham (Kawardha)", "CG-10: Bilaspur", "CG-11: Janjgir-Champa", "CG-12: Korba", "CG-13: Raigarh", "CG-14: Jashpur", "CG-15: Surguja (Ambikapur)", "CG-16: Koriya (Baikunthpur)", "CG-17: Bastar (Jagdalpur)", "CG-18: Dantewada", "CG-19: Kanker", "CG-20: Bijapur", "CG-21: Narayanpur", "CG-22: Baloda Bazar", "CG-23: Gariaband", "CG-24: Balod", "CG-25: Bemetara", "CG-26: Sukma", "CG-27: Kondagaon", "CG-28: Mungeli", "CG-29: Surajpur", "CG-30: Balrampur-Ramanujganj", "CG-31: Gaurela-Pendra-Marwahi"];

export default function DLFormModal({ show, onHide, citizenId, onCreated }) {
  const [form, setForm] = useState({
    dl_no: '',
    application_no: '',
    issue_date: '',
    expiry_date: '',
    vehicle_class: {},
    office: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  // Reset form when modal is shown
  useEffect(() => {
    if (show) {
      setForm({
        dl_no: '',
        application_no: '',
        issue_date: '',
        expiry_date: '',
        vehicle_class: {},
        office: '',
      });
      setErr('');
    }
  }, [show]);

  const up = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (form.issue_date) {
      try {
        const issueDate = new Date(form.issue_date);
        issueDate.setFullYear(issueDate.getFullYear() + 20);
        const expiryDateString = issueDate.toISOString().split('T')[0];
        up('expiry_date', expiryDateString);
      } catch (e) {
        console.error("Invalid issue date for DL:", form.issue_date);
      }
    }
  }, [form.issue_date]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    up('vehicle_class', { ...form.vehicle_class, [name]: checked });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const selectedClasses = Object.keys(form.vehicle_class).filter(key => form.vehicle_class[key]);
      const payload = { ...form, vehicle_class: selectedClasses.join(', ') };

      const { data } = await api.post(`/citizens/${citizenId}/dl`, payload);
      onCreated?.(data);
      onHide();
      toast.success('DL record added');
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
        <Modal.Header closeButton><Modal.Title>Add Driving License</Modal.Title></Modal.Header>
        <Modal.Body>
          {err && <Alert variant="danger">{err}</Alert>}
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>DL No *</Form.Label><Form.Control value={form.dl_no} onChange={e=>up('dl_no', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Application No</Form.Label><Form.Control value={form.application_no} onChange={e=>up('application_no', e.target.value.toUpperCase())} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Issue Date</Form.Label><Form.Control type="date" value={form.issue_date} onChange={e=>up('issue_date', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Expiry Date</Form.Label><Form.Control type="date" value={form.expiry_date} onChange={e=>up('expiry_date', e.target.value)} /></Form.Group></Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Vehicle Class</Form.Label>
                <div className="p-2 border rounded bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {Object.keys(vehicleClassMap).map(key => (
                    <Form.Check
                      key={key}
                      type="checkbox"
                      id={`add-dl-${key}`}
                      name={key}
                      label={`${key} (${vehicleClassMap[key]})`}
                      checked={!!form.vehicle_class[key]}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label>Office</Form.Label><Form.Select value={form.office} onChange={e=>up('office', e.target.value)}><option value="">-- Select Office --</option>{officeList.map(o => <option key={o} value={o}>{o}</option>)}</Form.Select></Form.Group></Col>
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
