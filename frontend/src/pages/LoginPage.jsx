import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const id = loginId.trim();
      const isEmail = id.includes('@');

      const credentials = {
        password,
        login_identifier: id, // <-- always send this to satisfy backend
      };
      if (isEmail) {
        credentials.email = id;
      } else {
        credentials.phone = id;
      }

      await login(credentials, redirectTo);
      toast.success('Welcome!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
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
              <h3 className="mb-3">Login</h3>
              <p>Don't have an account? <Link to="/register">Register</Link></p>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number or Email</Form.Label>
                  <Form.Control
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    type="text"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                  />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={submitting}>
                  {submitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
