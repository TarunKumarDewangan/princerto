import { useEffect, useState } from 'react';
import { Modal, Button, Table, Form, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
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

export default function VehicleTaxModal({ show, onHide, vehicle, onShowEdit }) {
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
  const [file, setFile] = useState(null); // --- START OF NEW CODE --- (State for file)
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
      setForm({ vehicle_type:'', tax_mode:'', tax_from:'', tax_upto:'' });
      setFile(null); // Reset file state
    }
  }, [show, vehicle]);

  // --- START OF MODIFIED CODE --- (Handle form submission with FormData)
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');

    const formData = new FormData();
    formData.append('vehicle_type', form.vehicle_type);
    formData.append('tax_mode', form.tax_mode);
    formData.append('tax_from', form.tax_from);
    formData.append('tax_upto', form.tax_upto);
    if (file) {
      formData.append('file', file);
    }

    try {
      await api.post(`/vehicles/${vehicle.id}/taxes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setForm({ vehicle_type:'', tax_mode:'', tax_from:'', tax_upto:'' });
      setFile(null); // Clear file input
      e.target.reset(); // Reset the form fields visually

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
  // --- END OF MODIFIED CODE ---

  const handleDelete = async (taxId) => {
    if (window.confirm('Are you sure you want to delete this tax record?')) {
      try {
        await api.delete(`/taxes/${taxId}`);
        toast.success('Record deleted.');
        load(meta?.current_page || 1);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Delete failed.');
      }
    }
  };

  if (!vehicle) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Taxes — {vehicle.registration_no}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <div className="table-responsive mb-4">
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Tax Mode</th>
                <th>From</th>
                <th>Upto</th>
                <th>Document</th>
                <th>Actions</th>
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
                  {/* --- START OF NEW CODE --- (Show download link) */}
                  <td>
                    {t.file_path ? (
                      <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${t.file_path}`} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  {/* --- END OF NEW CODE --- */}
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onShowEdit(t)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
                  </td>
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
            {/* --- START OF NEW CODE --- (Add file input) */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Upload Document (Optional)</Form.Label>
                <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
              </Form.Group>
            </Col>
            {/* --- END OF NEW CODE --- */}
          </Row>
          <div className="text-end mt-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Tax'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
