import { useEffect, useState } from 'react';
import { Modal, Button, Table, Form, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap'; // Added Spinner
import { toast } from 'react-toastify';
import api from '../services/apiClient';

// --- START OF NEW CODE ---
// Helper function to format dates, which we will use in the table
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString.substring(0, 10));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    if (isNaN(day)) return '-';
    return `${day}-${month}-${year}`;
  } catch (error) {
    return '-';
  }
};
// --- END OF NEW CODE ---

export default function VehicleTaxModal({ show, onHide, vehicle, onShowEdit }) { // Added onShowEdit prop
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
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get(`/vehicles/${vehicle.id}/taxes`, { params: { page } });
      setItems(data.data || []);
      setMeta(data.meta || null);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load taxes';
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      load(1);
      // Reset form when modal opens
      setForm({ vehicle_type:'', tax_mode:'', tax_from:'', tax_upto:'' });
    }
  }, [show, vehicle]); // Dependency on vehicle added

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      await api.post(`/vehicles/${vehicle.id}/taxes`, form);
      setForm({ vehicle_type:'', tax_mode:'', tax_from:'', tax_upto:'' });
      toast.success('Tax record added');
      load(1);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- START OF NEW CODE ---
  const handleDelete = async (taxId) => {
    if (window.confirm('Are you sure you want to delete this tax record?')) {
      try {
        await api.delete(`/taxes/${taxId}`);
        toast.success('Record deleted.');
        load(meta?.current_page || 1); // Refresh the list
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Delete failed.');
      }
    }
  };
  // --- END OF NEW CODE ---

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

        <div className="table-responsive mb-4">
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Tax Mode</th>
                <th>From</th>
                <th>Upto</th>
                <th>Vehicle Type (snap)</th>
                {/* --- START OF NEW CODE --- */}
                <th>Actions</th>
                {/* --- END OF NEW CODE --- */}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-center"><Spinner size="sm" /></td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} className="text-center">No records</td></tr>}
              {!loading && items.map((t, i)=>(
                <tr key={t.id}>
                  <td>{(meta?.from ?? 1) + i}</td>
                  <td>{t.tax_mode}</td>
                  <td>{formatDate(t.tax_from)}</td>
                  <td>{formatDate(t.tax_upto)}</td>
                  <td>{t.vehicle_type || '-'}</td>
                  {/* --- START OF NEW CODE --- */}
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onShowEdit(t)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
                  </td>
                  {/* --- END OF NEW CODE --- */}
                </tr>
              ))}
            </tbody>
          </Table>
          {meta && <div className="text-end small text-muted">Showing {meta.from}-{meta.to} of {meta.total}</div>}
        </div>

        <h5 className="mb-3">Add New Tax Record</h5>
        <Form onSubmit={submit}>
          <Row className="g-3">
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
          </Row>
          <div className="text-end mt-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Tax'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
