import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  return (
    <Container className="py-4">
      <h3 className="mb-3">Admin Panel</h3>
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>User Management</Card.Title>
              <Card.Text>View, create, edit, and manage all user accounts in the system.</Card.Text>
              <Button as={Link} to="/admin/users" variant="primary">Manage Users</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Data Export</Card.Title>
              <Card.Text>Go to the export dashboard to download database tables as CSV or a ZIP of everything.</Card.Text>
              <Button as={Link} to="/admin/export" variant="outline-secondary">Manage Exports</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
