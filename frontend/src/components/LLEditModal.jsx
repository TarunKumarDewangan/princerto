import { useEffect, useState } from 'react';
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

export default function LLEditModal({ show, onHide, llRecord, onUpdated }) {
  const [form, setForm] = useState({
    ll_no: '',
    application_no: '',
    issue_date: '',
    expiry_date: '',
    vehicle_class: {},
    office: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (llRecord) {
      const selectedClasses = (llRecord.vehicle_class || '').split(', ').reduce((acc, className) => {
        if (className) acc[className] = true;
        return acc;
      }, {});

      setForm({
        ll_no: llRecord.ll_no || '',
        application_no: llRecord.application_no || '',
        issue_date: (llRecord.issue_date || '').substring(0, 10),
        expiry_date: (llRecord.expiry_date || '').substring(0, 10),
        vehicle_class: selectedClasses,
        office: llRecord.office || '',
      });
      setError('');
    }
  }, [llRecord]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (form.issue_date) {
      try {
        const issueDate = new Date(form.issue_date);
        issueDate.setMonth(issueDate.getMonth() + 6);
        issueDate.setDate(issueDate.getDate() - 2);
        const expiryDateString = issueDate.toISOString().split('T')[0];
        updateForm('expiry_date', expiryDateString);
      } catch (e) {
        console.error("Invalid issue date:", form.issue_date);
      }
    }
  }, [form.issue_date]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    updateForm('vehicle_class', { ...form.vehicle_class, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!llRecord) return;

    setSaving(true);
    setError('');
    try {
      const selectedClasses = Object.keys(form.vehicle_class).filter(key => form.vehicle_class[key]);
      const payload = { ...form, vehicle_class: selectedClasses.join(', ') };

      await api.put(`/ll/${llRecord.id}`, payload);
      toast.success('Learner License record updated.');
      onUpdated?.();
      onHide();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save changes.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }; // THE FIX IS HERE: Added the missing closing brace

  if (!llRecord) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Edit Learner License</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>LL No *</Form.Label><Form.Control value={form.ll_no} onChange={e => updateForm('ll_no', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Application No</Form.Label><Form.Control value={form.application_no} onChange={e => updateForm('application_no', e.target.value.toUpperCase())} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Issue Date</Form.Label><Form.Control type="date" value={form.issue_date} onChange={e=>updateForm('issue_date', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Expiry Date</Form.Label><Form.Control type="date" value={form.expiry_date} onChange={e=>updateForm('expiry_date', e.target.value)} /></Form.Group></Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Vehicle Class</Form.Label>
                <div className="p-2 border rounded bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {Object.keys(vehicleClassMap).map(key => (
                    <Form.Check
                      key={key}
                      type="checkbox"
                      id={`edit-ll-${key}`}
                      name={key}
                      label={`${key} (${vehicleClassMap[key]})`}
                      checked={!!form.vehicle_class[key]}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label>Office</Form.Label><Form.Select value={form.office} onChange={e=>updateForm('office', e.target.value)}><option value="">-- Select Office --</option>{officeList.map(o => <option key={o} value={o}>{o}</option>)}</Form.Select></Form.Group></Col>
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
