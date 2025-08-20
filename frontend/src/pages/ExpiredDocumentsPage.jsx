import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import api from '../services/apiClient';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return '-';
  // The backend already formats it, but this is a good fallback.
  return dateString;
};

export default function ExpiredDocumentsPage() {
  const { id } = useParams(); // Get citizen ID from the URL

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpiredDocs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/citizens/${id}/expired-documents`);
      setData(response.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load expired documents.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpiredDocs();
  }, [fetchExpiredDocs]);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center my-5"><Spinner animation="border" /></div>;
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    if (!data) {
      return <Alert variant="info">No data found.</Alert>;
    }

    const { citizen, expired_documents } = data;

    return (
      <Card>
        <Card.Header as="h5">Expired Document Report for {citizen.name}</Card.Header>
        <Card.Body>
          {expired_documents.length === 0 ? (
            <Alert variant="success" className="mb-0">
              No expired documents found for this citizen.
            </Alert>
          ) : (
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Document Type</th>
                  <th>Identifier / Number</th>
                  <th>Expiry Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {expired_documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td><Badge bg="danger">{doc.type}</Badge></td>
                    <td>{doc.identifier}</td>
                    <td>{formatDate(doc.expiry_date)}</td>
                    <td>{doc.details}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Link to={`/citizens/${id}`} className="text-decoration-none">&larr; Back to Citizen Profile</Link>
      </div>
      {renderContent()}
    </Container>
  );
}
