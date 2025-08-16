import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  // Use a generic state for the login identifier (can be phone or email)
  const [loginId, setLoginId] = useState('admin@site.local'); // Default to admin for convenience
  const [password, setPassword] = useState('Admin@123'); // Default to admin pass for convenience
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Determine if the loginId is an email or a phone number
      const isEmail = loginId.includes('@');

      // Construct the credentials object based on the input type
      const credentials = {
        password: password,
      };

      if (isEmail) {
        credentials.email = loginId;
      } else {
        credentials.phone = loginId;
      }

      // The login function in AuthContext already handles sending this object
      await login(credentials);

      toast.success('Welcome!');
      nav('/');
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
                    onChange={e => setLoginId(e.target.value)}
                    type="text" // Use text type to allow both numbers and email characters
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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
