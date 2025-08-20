import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function SendMessageModal({ show, onHide, citizen }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const payload = { message };
      await api.post(`/citizens/${citizen.id}/send-message`, payload);
      toast.success(`Message sent to ${citizen.name}.`);
      onHide(); // Close the modal on success
      setMessage(''); // Reset message for next time
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send message.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // Don't render anything if the citizen prop is not provided
  if (!citizen) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Send Message to {citizen.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>
            The message will be sent via WhatsApp to the citizen's registered mobile number: <strong>{citizen.mobile}</strong>
          </p>
          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Type your message here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
