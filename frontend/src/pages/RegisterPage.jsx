import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    password_confirmation: '', // New field for confirmation
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // START: New Frontend Validation
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (form.phone.length !== 10 || !/^\d{10}$/.test(form.phone)) {
      setError('Mobile number must be exactly 10 digits.');
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }
    // END: New Frontend Validation

    setSubmitting(true);
    try {
      // We don't need to send password_confirmation to the backend
      const payload = {
        name: form.name,
        phone: form.phone,
        password: form.password,
      };

      await api.post('/register', payload);

      await login({ phone: form.phone, password: form.password });

      toast.success('Registration successful! Welcome.');
      nav('/dashboard'); // Navigate to the dashboard after successful login
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-3">Register</h3>
              <p className="text-muted">Already have an account? <Link to="/login">Sign In</Link></p>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3"><Form.Label>Full Name</Form.Label><Form.Control value={form.name} onChange={e => updateForm('name', e.target.value)} type="text" required /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Mobile Number</Form.Label><Form.Control value={form.phone} onChange={e => updateForm('phone', e.target.value)} type="tel" required maxLength={10} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control value={form.password} onChange={e => updateForm('password', e.target.value)} type="password" required placeholder="Min. 6 characters" /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Confirm Password</Form.Label><Form.Control value={form.password_confirmation} onChange={e => updateForm('password_confirmation', e.target.value)} type="password" required /></Form.Group>
                <Button type="submit" className="w-100" disabled={submitting}>{submitting ? 'Registering...' : 'Create Account'}</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
