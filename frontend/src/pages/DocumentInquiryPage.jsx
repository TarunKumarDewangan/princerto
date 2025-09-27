import { useState } from 'react';
import { Container, Card, Form, Button, Col, Row, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

const documentOptions = [
    'Insurance', 'Tax', 'Fitness', 'Permit',
    'SLD', 'PUCC'
];

export default function DocumentInquiryPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState({});

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedDocuments(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const documentsToSubmit = Object.keys(selectedDocuments).filter(key => selectedDocuments[key]);

        if (documentsToSubmit.length === 0) {
            toast.error('Please select at least one document type.');
            return;
        }

        setSubmitting(true);

        try {
            // This payload now correctly sends 'name' and 'phone'
            const payload = {
                name: name,
                phone: phone,
                document_type: documentsToSubmit,
                vehicle_no: vehicleNo,
            };
            await api.post('/document-inquiries', payload);
            toast.success('Your inquiry has been submitted! We will contact you shortly.');
            navigate('/');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to submit your inquiry.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: 600 }}>
            <Card className="shadow-sm">
                <Card.Header as="h4" className="text-center">Document Validity Inquiry</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>आपका नाम (Your Name)</Form.Label>
                                    <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>आपका मोबाइल नं (Your Mobile No.)</Form.Label>
                                    <Form.Control type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={10} />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>गाड़ी नंबर (Vehicle No.) <small className="text-muted">(Optional)</small></Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                        placeholder="e.g., CG04AB1234"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>क्या आप अपने दस्तावेज की वैधता या अन्य कोई जानकारी चाहते है। (Which document information do you need?)</Form.Label>
                                    <div className="p-3 border rounded bg-light">
                                        <Row>
                                            {documentOptions.map(doc => (
                                                <Col key={doc} xs={12} sm={6}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`doc-${doc}`}
                                                        name={doc}
                                                        label={doc}
                                                        checked={!!selectedDocuments[doc]}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-grid mt-4">
                            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Inquiry'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
