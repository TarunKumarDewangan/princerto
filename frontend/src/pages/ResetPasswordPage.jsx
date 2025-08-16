import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmail(params.get('email') || '');
    setToken(params.get('token') || '');
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Missing token'); return; }
    setSaving(true);
    try {
      await api.post('/password/reset', {
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success('Password updated. Please log in.');
      nav('/login');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card>
        <Card.Body>
          <h4 className="mb-3">Reset Password</h4>
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={form.password} onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" value={form.password_confirmation} onChange={(e)=>setForm(f=>({...f, password_confirmation:e.target.value}))} required />
            </Form.Group>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Reset Password'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
