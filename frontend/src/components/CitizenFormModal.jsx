import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

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

export default function CitizenFormModal({ show, onHide, onCreated }) {
  const { user } = useAuth();
  const [profileType, setProfileType] = useState('other');
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      const initialProfileType = user?.primary_citizen ? 'other' : 'self';
      setProfileType(initialProfileType);
      setError('');
    }
  }, [show, user]);

  useEffect(() => {
    if (profileType === 'self' && user) {
      setForm({
        name: user.name || '',
        mobile: user.phone || '',
        email: '', dob: '', address: '', state: '', city: '', relation_name: '', relation_type: '',
      });
    } else {
      setForm({
        name: '', relation_type: '', relation_name: '', mobile: '', email: '', dob: '', address: '', state: '', city: '',
      });
    }
  }, [profileType, user]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, is_self: profileType === 'self' };
      const { data } = await api.post('/citizens', payload);
      onCreated?.(data);
      onHide();
      toast.success('Citizen profile created successfully.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create profile.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>New Citizen Profile</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {!user.primary_citizen && (
            <>
              <Form.Group className="mb-4">
                <Form.Label as="legend" column sm={12}>Who is this profile for?</Form.Label>
                <Col sm={12}>
                  <Form.Check type="radio" label="Myself (Create my primary profile)" name="profileType" value="self" checked={profileType === 'self'} onChange={(e) => setProfileType(e.target.value)} />
                  <Form.Check type="radio" label="Another Person (Owner/License Holder)" name="profileType" value="other" checked={profileType === 'other'} onChange={(e) => setProfileType(e.target.value)} />
                </Col>
              </Form.Group>
              <hr />
            </>
          )}

          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Name *</Form.Label><Form.Control value={form.name} onChange={e => update('name', e.target.value)} required disabled={profileType === 'self'} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Mobile Number *</Form.Label><Form.Control value={form.mobile} onChange={e => update('mobile', e.target.value)} required disabled={profileType === 'self'} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={e => update('email', e.target.value)} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Birth Date</Form.Label><Form.Control type="date" value={form.dob} onChange={e => update('dob', e.target.value)} /></Form.Group></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Son/Wife/Daughter of</Form.Label>
                <Row>
                  <Col xs={5}><Form.Select value={form.relation_type} onChange={e => update('relation_type', e.target.value)}><option value="">Select...</option><option value="Son of">S/o</option><option value="Wife of">W/o</option><option value="Daughter of">D/o</option></Form.Select></Col>
                  <Col xs={7}><Form.Control placeholder="Relation's Name" value={form.relation_name} onChange={e => update('relation_name', e.target.value)} /></Col>
                </Row>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label>Address</Form.Label><Form.Control as="textarea" rows={2} value={form.address} onChange={e => update('address', e.target.value)} /></Form.Group></Col>

            {/* --- START OF MODIFIED STATE/CITY FIELDS --- */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Select value={form.state} onChange={e => {
                  const newState = e.target.value;
                  update('state', newState);
                  // If the new state is not Chhattisgarh, reset the city field.
                  if (newState !== 'Chhattisgarh') {
                      update('city', '');
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
                  <Form.Select value={form.city} onChange={e => update('city', e.target.value)}>
                    <option value="">-- Select District --</option>
                    {chhattisgarhDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </Form.Select>
                ) : (
                  <Form.Control value={form.city} onChange={e => update('city', e.target.value)} />
                )}
              </Form.Group>
            </Col>
            {/* --- END OF MODIFIED STATE/CITY FIELDS --- */}

          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Profile'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
