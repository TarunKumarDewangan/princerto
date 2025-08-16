import { useEffect, useState } from 'react';
import { Modal, Button, Table, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function VehicleTaxModal({ show, onHide, vehicle }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    vehicle_type: '',
    tax_mode: '',
    tax_from: '',
    tax_upto: '',
  });
  const [saving, setSaving] = useState(false);

  const load = async (page = 1) => {
    if (!vehicle) return;
    setLoading(true); setErr('');
    try {
      const { data } = await api.get(`/vehicles/${vehicle.id}/taxes`, { params: { page } });
      setItems(data.data || []); setMeta(data.meta || null);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load taxes';
      setErr(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (show) load(1); }, [show]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      await api.post(`/vehicles/${vehicle.id}/taxes`, form);
      setForm({ vehicle_type:'', tax_mode:'', tax_from:'', tax_upto:'' });
      toast.success('Tax record added');
      load(1);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save';
      setErr(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  };

  if (!vehicle) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Taxes — {vehicle.registration_no}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <div className="mb-3">
          <strong>Vehicle Type:</strong> {vehicle.type || '-'} &nbsp;
          <Badge bg="light" text="dark">ID {vehicle.id}</Badge>
        </div>

        <div className="table-responsive mb-3">
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Tax Mode</th>
                <th>From</th>
                <th>Upto</th>
                <th>Vehicle Type (snap)</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="text-center">Loading...</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={5} className="text-center">No records</td></tr>}
              {!loading && items.map((t, i)=>(
                <tr key={t.id}>
                  <td>{(meta?.from ?? 1) + i}</td>
                  <td>{t.tax_mode}</td>
                  <td>{t.tax_from}</td>
                  <td>{t.tax_upto}</td>
                  <td>{t.vehicle_type || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {meta && <div className="text-end small text-muted">Showing {meta.from}-{meta.to} of {meta.total}</div>}
        </div>

        <Form onSubmit={submit}>
          <Row className="g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tax Mode *</Form.Label>
                <Form.Select value={form.tax_mode} onChange={e=>setForm(f=>({...f, tax_mode:e.target.value}))} required>
                  <option value="">Select</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="HalfYearly">HalfYearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="OneTime">OneTime</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>From *</Form.Label>
                <Form.Control type="date" value={form.tax_from} onChange={e=>setForm(f=>({...f, tax_from:e.target.value}))} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Upto *</Form.Label>
                <Form.Control type="date" value={form.tax_upto} onChange={e=>setForm(f=>({...f, tax_upto:e.target.value}))} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Vehicle Type (opt)</Form.Label>
                <Form.Control value={form.vehicle_type} onChange={e=>setForm(f=>({...f, vehicle_type:e.target.value}))} placeholder="LMV / MC" />
              </Form.Group>
            </Col>
            <Col md="auto" className="mt-2">
              <Button type="submit" disabled={saving}>Add</Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
