import { useEffect, useState, useCallback } from 'react';
import { Container, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

export default function DataExportPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingTable, setExportingTable] = useState(null);
  const [isZipping, setIsZipping] = useState(false);

  const fetchTableList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/export/tables');
      setTables(data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load table list.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTableList(); }, [fetchTableList]);

  const handleExport = async (tableName) => {
    setExportingTable(tableName);
    toast.info(`Exporting ${tableName}...`);
    try {
      const response = await api.get(`/export/table/${tableName}`, { responseType: 'blob' });

      let filename = `${tableName}.csv`;
      const cd = response.headers['content-disposition'];
      if (cd) {
        const m = cd.match(/filename="(.+)"/);
        if (m && m[1]) filename = m[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      toast.error(`Failed to export ${tableName}.`);
    } finally {
      setExportingTable(null);
    }
  };

  const handleExportAll = async () => {
    if (!window.confirm('This will generate a zip file containing a CSV for every table. Continue?')) return;
    setIsZipping(true);
    toast.info('Export process started... The download will begin shortly.');
    try {
      const response = await api.get('/export/all-as-zip', { responseType: 'blob' });

      let filename = 'full-data-export.zip';
      const cd = response.headers['content-disposition'];
      if (cd) {
        const m = cd.match(/filename="(.+)"/);
        if (m && m[1]) filename = m[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Data export download started!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Data export failed.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <Container className="py-4">
      <h3 className="mb-3">Data Export</h3>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Export Database Tables</Card.Title>
          <Button variant="primary" onClick={handleExportAll} disabled={isZipping}>
            {isZipping ? 'Zipping...' : 'Download All as ZIP'}
          </Button>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            Click the button next to a table name to download all of its data as a single CSV file.
          </Card.Text>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Table Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="3" className="text-center">
                      <Spinner animation="border" size="sm" />
                    </td>
                  </tr>
                )}
                {!loading && tables.length === 0 && (
                  <tr><td colSpan="3" className="text-center">No tables found.</td></tr>
                )}
                {!loading && tables.map((tableName, index) => (
                  <tr key={tableName}>
                    <td>{index + 1}</td>
                    <td><strong>{tableName}</strong></td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleExport(tableName)}
                        disabled={exportingTable === tableName}
                      >
                        {exportingTable === tableName ? 'Exporting…' : 'Download CSV'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
