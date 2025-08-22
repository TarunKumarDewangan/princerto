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

export default function VehicleSpeedGovernorModal({ show, onHide, vehicle, onShowEdit }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({ certificate_number: '', issue_date: '', expiry_date: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async (page = 1) => {
    if (!vehicle) return;
    setLoading(true); setErr('');
    try {
      const { data } = await api.get(`/vehicles/${vehicle.id}/speed-governors`, { params: { page } });
      setItems(data.data || []); setMeta(data.meta || null);
    } catch (e) {
      toast.error('Failed to load Speed Governor records.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (show) {
      load(1);
      setForm({ certificate_number: '', issue_date: '', expiry_date: '' });
      setFile(null);
    }
  }, [show, vehicle]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) {
      formData.append('file', file);
    }

    try {
      await api.post(`/vehicles/${vehicle.id}/speed-governors`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Speed Governor record added.');
      e.target.reset();
      setFile(null);
      load(1);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save record.';
      setErr(msg); toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Speed Governor record?')) {
      try { await api.delete(`/speed-governors/${id}`); toast.success('Record deleted.'); load(meta?.current_page || 1); }
      catch (e) { toast.error(e?.response?.data?.message || 'Delete failed.'); }
    }
  };

  if (!vehicle) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton><Modal.Title>Speed Governor Details — {vehicle.registration_no}</Modal.Title></Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        <div className="table-responsive mb-4">
          <Table bordered hover size="sm">
            <thead><tr><th>#</th><th>Certificate No.</th><th>Issue Date</th><th>Expiry Date</th><th>Document</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-center"><Spinner size="sm" /></td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} className="text-center">No records found.</td></tr>}
              {!loading && items.map((item, i) => (
                <tr key={item.id}>
                  <td>{(meta?.from ?? 1) + i}</td>
                  <td>{item.certificate_number}</td>
                  <td>{formatDate(item.issue_date)}</td>
                  <td>{formatDate(item.expiry_date)}</td>
                  <td>
                    {item.file_path ? (
                      <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${item.file_path}`} target="_blank" rel="noopener noreferrer">View</a>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onShowEdit(item)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <h5 className="mb-3">Add New Speed Governor Certificate</h5>
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label>Certificate Number *</Form.Label><Form.Control value={form.certificate_number} onChange={e => updateForm('certificate_number', e.target.value.toUpperCase())} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Issue Date *</Form.Label><Form.Control type="date" value={form.issue_date} onChange={e => updateForm('issue_date', e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Expiry Date *</Form.Label><Form.Control type="date" value={form.expiry_date} onChange={e => updateForm('expiry_date', e.target.value)} required /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label>Upload Document (Optional)</Form.Label><Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} /></Form.Group></Col>
          </Row>
          <div className="text-end mt-3"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Record'}</Button></div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
