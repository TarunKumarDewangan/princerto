import { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Pagination, Badge, Form, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

const StatusBadge = ({ status }) => {
  const variant = {
    new: 'primary',
    contacted: 'info',
    resolved: 'success',
  }[status] || 'secondary';
  return <Badge bg={variant}>{status}</Badge>;
};

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [isExporting, setIsExporting] = useState(false); // --- ADD NEW STATE FOR EXPORT BUTTON ---

    const fetchInquiries = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/admin/document-inquiries`, {
                params: { page, status: statusFilter }
            });
            setInquiries(data.data || []);
            setMeta(data.meta || null);
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to load inquiries.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries(1);
    }, [statusFilter]);

    const goPage = (p) => {
        if (!meta || p < 1 || p > meta.last_page) return;
        fetchInquiries(p);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const { data: updatedInquiry } = await api.patch(`/admin/document-inquiries/${id}/status`, { status: newStatus });
            setInquiries(prev => prev.map(req => (req.id === id ? updatedInquiry : req)));
            toast.success(`Inquiry marked as ${newStatus}.`);
        } catch (e) {
            toast.error('Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    // --- START: ADD NEW EXPORT HANDLER FUNCTION ---
    const handleExport = async () => {
        setIsExporting(true);
        toast.info('Generating CSV export... the download will begin shortly.');
        try {
            const response = await api.get('/admin/document-inquiries/export', {
                params: { status: statusFilter }, // Export will respect the current filter
                responseType: 'blob', // Important: tells axios to handle the response as a file
            });

            // Create a temporary link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from response headers if available, otherwise use a default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'document-inquiries.csv';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up the link element
            window.URL.revokeObjectURL(url); // Clean up the blob URL

        } catch (err) {
            toast.error('Failed to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };
    // --- END: ADD NEW EXPORT HANDLER FUNCTION ---

    return (
        <Container className="py-4">
            {/* --- START: MODIFIED HEADER TO INCLUDE THE BUTTON --- */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Document Inquiries</h2>
                <Button variant="outline-success" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? 'Exporting...' : 'Download as CSV'}
                </Button>
            </div>
            {/* --- END: MODIFIED HEADER --- */}

            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Filter by Status</Form.Label>
                        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {!loading && inquiries.length === 0 && (
                <Alert variant="info">No inquiries found for the selected filter.</Alert>
            )}
            {!loading && inquiries.length > 0 && (
                <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Submitted By</th>
                                <th>Mobile</th>
                                <th>Vehicle No.</th>
                                <th>Document Type(s)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((req, idx) => (
                                <tr key={req.id}>
                                    <td>{(meta ? meta.from : 1) + idx}</td>
                                    <td>{req.name || 'N/A'}</td>
                                    <td>{req.phone || 'N/A'}</td>
                                    <td>{req.vehicle_no || '-'}</td>
                                    <td>
                                        {Array.isArray(req.document_type)
                                            ? req.document_type.join(', ')
                                            : req.document_type}
                                    </td>
                                    <td><StatusBadge status={req.status} /></td>
                                    <td>
                                        <ButtonGroup size="sm">
                                            <Button variant="outline-primary" disabled={updatingId === req.id || req.status === 'new'} onClick={() => handleStatusUpdate(req.id, 'new')}>New</Button>
                                            <Button variant="outline-info" disabled={updatingId === req.id || req.status === 'contacted'} onClick={() => handleStatusUpdate(req.id, 'contacted')}>Contacted</Button>
                                            <Button variant="outline-success" disabled={updatingId === req.id || req.status === 'resolved'} onClick={() => handleStatusUpdate(req.id, 'resolved')}>Resolved</Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
            {meta && meta.last_page > 1 && (
                <div className="d-flex justify-content-end">
                    <Pagination>
                        <Pagination.Prev onClick={() => goPage(meta.current_page - 1)} disabled={meta.current_page === 1} />
                        <Pagination.Item active>{meta.current_page}</Pagination.Item>
                        <Pagination.Next onClick={() => goPage(meta.current_page + 1)} disabled={meta.current_page === meta.last_page} />
                    </Pagination>
                </div>
            )}
        </Container>
    );
}
