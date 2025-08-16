import { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/apiClient';
import { toast } from 'react-toastify';

export default function LLSearchPage() {
  const [llNo, setLlNo] = useState('');
  const [appNo, setAppNo] = useState('');
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchList = async (page = 1) => {
    setLoading(true); setErr('');
    try {
      const { data } = await api.get('/search/ll', { params: { ll_no: llNo, application_no: appNo, page } });
      setItems(data.data || []); setMeta(data.meta || null);
      if ((data.data || []).length === 0) toast.info('No results');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to search';
      setErr(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <Container className="py-4">
      <h3 className="mb-3">Search — Learner License</h3>

      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={(e)=>{e.preventDefault(); fetchList(1);}}>
            <Row className="g-2">
              <Col md={4}>
                <Form.Control placeholder="LL No" value={llNo} onChange={e=>setLlNo(e.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Control placeholder="Application No" value={appNo} onChange={e=>setAppNo(e.target.value)} />
              </Col>
              <Col md="auto">
                <Button type="submit" disabled={loading}>Search</Button>
              </Col>
              <Col md="auto">
                <Button variant="outline-secondary" disabled={loading}
                  onClick={()=>{ setLlNo(''); setAppNo(''); setItems([]); setMeta(null); }}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>LL No</th>
              <th>Application No</th>
              <th>Citizen</th>
              <th>Mobile</th>
              <th>Go</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center">Loading...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="text-center">No results</td></tr>}
            {!loading && items.map((r, i)=>(
              <tr key={r.id}>
                <td>{(meta?.from ?? 1)+i}</td>
                <td>{r.ll_no}</td>
                <td>{r.application_no || '-'}</td>
                <td>{r.citizen?.name || '-'}</td>
                <td>{r.citizen?.mobile || '-'}</td>
                <td><Link to={`/citizens/${r.citizen_id}`}>Open Citizen</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {meta && <div className="text-end small text-muted">Showing {meta.from}–{meta.to} of {meta.total}</div>}
    </Container>
  );
}
