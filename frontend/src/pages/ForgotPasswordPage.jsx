import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/password/forgot', { email });
      toast.success('If the email exists, a reset link has been sent.');
      setEmail('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send reset link');
    } finally {
      setSending(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card>
        <Card.Body>
          <h4 className="mb-3">Forgot Password</h4>
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </Form.Group>
            <Button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Reset Link'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
