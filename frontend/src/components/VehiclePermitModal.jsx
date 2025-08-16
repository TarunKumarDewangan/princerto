import { useEffect, useState } from 'react';
import { Modal, Button, Table, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

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

export default function VehiclePermitModal({ show, onHide, vehicle, onShowEdit }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({ permit_number: '', issue_date: '', expiry_date: '' });
  const [saving, setSaving] = useState(false);

  const load = async (page = 1) => {
    if (!vehicle) return;
    setLoading(true); setErr('');
    try {
      const { data } = await api.get(`/vehicles/${vehicle.id}/permits`, { params: { page } });
      setItems(data.data || []); setMeta(data.meta || null);
    } catch (e) {
      toast.error('Failed to load Permit records.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (show) {
      load(1);
      setForm({ permit_number: '', issue_date: '', expiry_date: '' });
    }
  }, [show, vehicle]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      await api.post(`/vehicles/${vehicle.id}/permits`, form);
      toast.success('Permit record added.'); load(1);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save record.';
      setErr(msg); toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Permit record?')) {
      try { await api.delete(`/permits/${id}`); toast.success('Record deleted.'); load(meta?.current_page || 1); }
      catch (e) { toast.error(e?.response?.data?.message || 'Delete failed.'); }
    }
  };

  if (!vehicle) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton><Modal.Title>Permit Details — {vehicle.registration_no}</Modal.Title></Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        <div className="table-responsive mb-4">
          <Table bordered hover size="sm">
            <thead><tr><th>#</th><th>Permit No.</th><th>Issue Date</th><th>Expiry Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="text-center"><Spinner size="sm" /></td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={5} className="text-center">No records found.</td></tr>}
              {!loading && items.map((item, i) => (
                <tr key={item.id}>
                  <td>{(meta?.from ?? 1) + i}</td>
                  <td>{item.permit_number}</td>
                  <td>{formatDate(item.issue_date)}</td>
                  <td>{formatDate(item.expiry_date)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onShowEdit(item)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <h5 className="mb-3">Add New Permit</h5>
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label>Permit Number *</Form.Label><Form.Control value={form.permit_number} onChange={e => updateForm('permit_number', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Issue Date *</Form.Label><Form.Control type="date" value={form.issue_date} onChange={e => updateForm('issue_date', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Expiry Date *</Form.Label><Form.Control type="date" value={form.expiry_date} onChange={e => updateForm('expiry_date', e.target.value)} required /></Form.Group></Col>
          </Row>
          <div className="text-end mt-3"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Permit'}</Button></div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
