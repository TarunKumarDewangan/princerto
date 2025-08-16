import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// --- START OF NEW DATA ---
const statesAndUTs = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
].sort();

const chhattisgarhDistricts = [
  "Balod", "Baloda Bazar", "Balrampur-Ramanujganj", "Bastar", "Bemetara", "Bijapur",
  "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurella-Pendra-Marwahi",
  "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker", "Khairagarh-Chhuikhadan-Gandai",
  "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur",
  "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur",
  "Rajnandgaon", "Sakti", "Sarangarh-Bilaigarh", "Sukma", "Surajpur", "Surguja"
].sort();
// --- END OF NEW DATA ---

export default function CitizenEditModal({ show, onHide, citizen, onUpdated }) {
  const [form, setForm] = useState({
    name: '',
    relation_type: '',
    relation_name: '',
    mobile: '',
    email: '',
    dob: '',
    address: '',
    state: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (citizen) {
      setForm({
        name: citizen.name || '',
        relation_type: citizen.relation_type || '',
        relation_name: citizen.relation_name || '',
        mobile: citizen.mobile || '',
        email: citizen.email || '',
        dob: (citizen.dob || '').substring(0, 10),
        address: citizen.address || '',
        state: citizen.state || '',
        city: citizen.city || '',
      });
    }
  }, [citizen]);

  const up = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!citizen) return;
    setSaving(true); setErr('');
    try {
      await api.put(`/citizens/${citizen.id}`, form);
      onUpdated?.();
      onHide();
      toast.success('Citizen details updated.');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save changes';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!citizen) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>Edit Citizen Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {err && <Alert variant="danger">{err}</Alert>}
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Name *</Form.Label><Form.Control value={form.name} onChange={e=>up('name', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Mobile *</Form.Label><Form.Control value={form.mobile} onChange={e=>up('mobile', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={e=>up('email', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Birth Date</Form.Label><Form.Control type="date" value={form.dob} onChange={e=>up('dob', e.target.value)} /></Form.Group></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Son/Wife/Daughter of</Form.Label>
                <Row>
                  <Col xs={5}><Form.Select value={form.relation_type} onChange={e => up('relation_type', e.target.value)}><option value="">Select...</option><option value="Son of">S/o</option><option value="Wife of">W/o</option><option value="Daughter of">D/o</option></Form.Select></Col>
                  <Col xs={7}><Form.Control placeholder="Relation's Name" value={form.relation_name} onChange={e => up('relation_name', e.target.value)} /></Col>
                </Row>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label>Address</Form.Label><Form.Control as="textarea" rows={2} value={form.address} onChange={e=>up('address', e.target.value)} /></Form.Group></Col>

            {/* --- START OF MODIFIED STATE/CITY FIELDS --- */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Select value={form.state} onChange={e => {
                  const newState = e.target.value;
                  up('state', newState);
                  if (newState !== 'Chhattisgarh') {
                    up('city', '');
                  }
                }}>
                  <option value="">-- Select State / UT --</option>
                  {statesAndUTs.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>City / District</Form.Label>
                {form.state === 'Chhattisgarh' ? (
                  <Form.Select value={form.city} onChange={e => up('city', e.target.value)}>
                    <option value="">-- Select District --</option>
                    {chhattisgarhDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </Form.Select>
                ) : (
                  <Form.Control value={form.city} onChange={e => up('city', e.target.value)} />
                )}
              </Form.Group>
            </Col>
            {/* --- END OF MODIFIED STATE/CITY FIELDS --- */}

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
