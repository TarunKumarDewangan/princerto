import { useState } from 'react';
import { Container, Card, Form, Button, Col, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function AskForServicePage() {
  const navigate = useNavigate();

  // State to manage the form's dynamic behavior
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState({});
  const [queryText, setQueryText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Reset sub-selections when category changes
    setSelectedServices({});
    setQueryText('');
  };

  const handleServiceChange = (e) => {
    const { name, checked } = e.target;
    setSelectedServices(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const servicesToSubmit = Object.keys(selectedServices).filter(key => selectedServices[key]);

    try {
      await api.post('/service-requests', {
        category: selectedCategory,
        services: servicesToSubmit,
        query: queryText,
      });

      toast.success('Your service request has been submitted successfully.');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit request.';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-3">Request a Service</h2>
      <Card>
        <Form onSubmit={handleSubmit}>
          <Card.Body>
            <Card.Title>How can we help you?</Card.Title>
            <Card.Text>
              Select a service category below to see available options. For specific data entry or corrections, please contact your local administrator.
            </Card.Text>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>Service Category</Form.Label>
              <Col sm={9}>
                <Form.Select value={selectedCategory} onChange={handleCategoryChange}>
                  <option value="">-- Select a category --</option>
                  <option value="dl">Driving License Services</option>
                  <option value="vehicle">Vehicle Services</option>
                  <option value="other">Other Inquiry</option>
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Driving License Services Section */}
            {selectedCategory === 'dl' && (
              <div className="p-3 border rounded bg-light">
                <h5>Driving License Services</h5>
                <p>Please select the service(s) you are interested in:</p>
                <Form.Group className="mb-3">
                  <Row>
                    <Col md={6}>
                    <Form.Check type="checkbox" name="change_dob" label="0. LEARNING LICENSE" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="renewal_dl" label="1. RENEWAL OF DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="additional_endorsement" label="3. ADDITIONAL ENDORSEMENT TO DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="change_address" label="5. CHANGE OF ADDRESS IN DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="replacement_dl" label="7. REPLACEMENT OF DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="hazardous_endorsement" label="9. ENDORSEMENT TO DRIVE HAZARDOUS MATERIAL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="dl_extract" label="11. DL EXTRACT" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="international_permit" label="13. ISSUE INTERNATIONAL DRIVING PERMIT" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="change_dob" label="15. CHANGE OF DATE OF BIRTH IN DL" onChange={handleServiceChange} />

                    </Col>
                    <Col md={6}>
                      <Form.Check type="checkbox" name="duplicate_dl" label="2. ISSUE OF DUPLICATE DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="psv_badge" label="4. ISSUE OF PSV BADGE TO A DRIVER" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="change_name" label="6. CHANGE OF NAME IN DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="change_photo" label="8. CHANGE OF PHOTO AND SIGNATURE IN DL" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="hill_endorsement" label="10. ENDORSEMENT TO DRIVE IN HILL REGION" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="aedl_defence" label="12. AEDL FOR DEFENCE DL HOLDER" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="surrender_cov" label="14. SURRENDER OF COV(S)/PSV BADGE(S)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="cov_conversion" label="16. COV CONVERSION" onChange={handleServiceChange} />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group>
                  <Form.Label><strong>Additional Information (Optional)</strong></Form.Label>
                  <Form.Control as="textarea" rows={4} value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="Please provide any extra details, like your DL number, application number, or specific questions." />
                </Form.Group>
              </div>
            )}

            {/* START: New Vehicle Services Section */}
            {selectedCategory === 'vehicle' && (
              <div className="p-3 border rounded bg-light">
                <h5>Vehicle Related Services</h5>
                <p>Please select the service(s) you are interested in:</p>
                <Form.Group className="mb-3">
                  <Row>
                    <Col md={4}>
                      <Form.Check type="checkbox" name="pay_tax" label="Pay Your Tax" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="transfer_ownership_seller" label="Transfer of Ownership (Seller)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="fitness_renewal" label="Fitness Renewal/Re-Apply" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="reassign_vehicle_vintage" label="Re-Assignment (Vintage Series)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="rc_particulars" label="RC Particulars" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="hypothecation_addition" label="Hypothecation Addition" onChange={handleServiceChange} />
                    </Col>
                    <Col md={4}>
                      <Form.Check type="checkbox" name="pay_fees_fine" label="Pay Balance Fees/Fine" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="transfer_ownership_buyer" label="Transfer of Ownership (Buyer)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="noc" label="Application for NOC" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="alteration" label="Alteration Of Vehicle" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="rc_cancellation" label="RC Cancellation" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="hypothecation_termination" label="Hypothecation Termination" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="mobile_update_rto" label="Update Mobile Number (RTO)" onChange={handleServiceChange} />
                    </Col>
                    <Col md={4}>
                      <Form.Check type="checkbox" name="duplicate_fitness" label="Duplicate Fitness Certificate" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="transfer_ownership_succession" label="Transfer of Ownership (Succession)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="renewal_registration" label="Renewal of Registration" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="conversion_vehicle" label="Conversion Of Vehicle" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="reassign_vehicle_state" label="Re-Assignment (State Series)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="duplicate_rc" label="Application for Duplicate RC" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="mobile_update_aadhaar" label="Mobile number Update (Aadhaar)" onChange={handleServiceChange} />
                      <Form.Check type="checkbox" name="withdrawal_application" label="Withdrawal of Application" onChange={handleServiceChange} />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group>
                  <Form.Label><strong>Additional Information (Optional)</strong></Form.Label>
                  <Form.Control as="textarea" rows={4} value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="Please provide any extra details, like your Vehicle Reg. No., Chassis No., or specific questions." />
                </Form.Group>
              </div>
            )}
            {/* END: New Vehicle Services Section */}

          </Card.Body>

          <Card.Footer className="text-end">
            <Button as={Link} to="/" variant="secondary" className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!selectedCategory || submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </Container>
  );
}
