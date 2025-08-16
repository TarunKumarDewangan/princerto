import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './HomePage.css'; // We will create this CSS file next for styling

// A reusable component for the service icon panels
function ServicePanel({ title, to }) {
  return (
    <Link to={to} className="text-decoration-none">
      <Card className="service-panel text-center mb-4">
        <Card.Body>
          {/* In a real app, you would have unique icons here */}
          <div className="icon-placeholder mb-2"></div>
          <Card.Text>{title}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  const drivingLicenseServices = [
    "RENEWAL OF DL", "ISSUE OF DUPLICATE DL", "ADDITIONAL ENDORSEMENT TO DL",
    "ISSUE OF PSV BADGE TO A DRIVER", "CHANGE OF ADDRESS IN DL", "CHANGE OF NAME IN DL",
    "REPLACEMENT OF DL", "CHANGE OF PHOTO AND SIGNATURE IN DL",
    "ENDORSEMENT TO DRIVE HAZARDOUS MATERIAL", "ENDORSEMENT TO DRIVE IN HILL REGION",
    "DL EXTRACT", "AEDL FOR DEFENCE DL HOLDER", "ISSUE INTERNATIONAL DRIVING PERMIT",
    "SURRENDER OF COV(S)/PSV BADGE(S)", "CHANGE OF DATE OF BIRTH IN DL", "COV CONVERSION"
  ];

  const vehicleServices = [
    "Pay Your Tax", "Transfer of Ownership (Seller)", "Transfer of Ownership (Buyer)",
    "Transfer of Ownership (Succession)", "Fitness Renewal/Re-Apply",
    "Pay Balance Fees/Fine", "Application for NOC", "Duplicate Fitness Certificate",
    "Renewal of Registration", "Conversion Of Vehicle", "Re-Assignment (Vintage Series)",
    "Re-Assignment (State Series)", "Alteration Of Vehicle", "RC Particulars",
    "RC Cancellation", "Hypothecation Addition", "Hypothecation Termination",
    "Update Mobile Number (RTO)", "Application for Duplicate RC",
    "Mobile number Update (Aadhaar)", "Withdrawal of Application"
  ];

  return (
    <div className="homepage-wrapper py-5">
      <Container>
        <h1 className="text-center mb-4 section-title">Online Services</h1>

        <h3 className="mb-3 sub-section-title">Driving License Related Services</h3>
        <Row>
          {drivingLicenseServices.map((service, index) => (
            <Col key={index} xs={6} sm={4} md={3} lg={2}>
              <ServicePanel title={service} to="/ask-for-service" />
            </Col>
          ))}
        </Row>

        <hr className="my-5" />

        <h3 className="mb-3 sub-section-title">Vehicle Related Services</h3>
        <Row>
          {vehicleServices.map((service, index) => (
            <Col key={index} xs={6} sm={4} md={3} lg={2}>
              <ServicePanel title={service} to="/ask-for-service" />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
