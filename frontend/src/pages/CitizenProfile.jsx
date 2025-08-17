import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab, Alert, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/apiClient';
import LLFormModal from '../components/LLFormModal';
import DLFormModal from '../components/DLFormModal';
import VehicleFormModal from '../components/VehicleFormModal';
import VehicleTaxModal from '../components/VehicleTaxModal';
import CitizenEditModal from '../components/CitizenEditModal';
import LLEditModal from '../components/LLEditModal';
import DLEditModal from '../components/DLEditModal';
import VehicleEditModal from '../components/VehicleEditModal';
import VehicleInsuranceModal from '../components/VehicleInsuranceModal';
import VehicleInsuranceEditModal from '../components/VehicleInsuranceEditModal';
import VehiclePuccModal from '../components/VehiclePuccModal';
import VehiclePuccEditModal from '../components/VehiclePuccEditModal';
import VehicleFitnessModal from '../components/VehicleFitnessModal';
import VehicleFitnessEditModal from '../components/VehicleFitnessEditModal';
import VehicleVltdModal from '../components/VehicleVltdModal';
import VehicleVltdEditModal from '../components/VehicleVltdEditModal';
import VehiclePermitModal from '../components/VehiclePermitModal';
import VehiclePermitEditModal from '../components/VehiclePermitEditModal';
import VehicleSpeedGovernorModal from '../components/VehicleSpeedGovernorModal';
import VehicleSpeedGovernorEditModal from '../components/VehicleSpeedGovernorEditModal';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString.substring(0, 10));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    if (isNaN(day)) return '-';
    return `${day}-${month}-${year}`;
  } catch (error) {
    return '-';
  }
};

export default function CitizenProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const canWrite = useMemo(() => user && ['admin','manager'].includes(user.role), [user]);
  const isAdmin  = user?.role === 'admin';

  const [citizen, setCitizen] = useState(null);
  const [err, setErr] = useState('');
  const [activeTab, setActiveTab] = useState('ll');
  const [ll, setLl] = useState({ data: [], meta: null });
  const [dl, setDl] = useState({ data: [], meta: null });
  const [veh, setVeh] = useState({ data: [], meta: null });
  const [allDetails, setAllDetails] = useState(null);
  const [loadingAllDetails, setLoadingAllDetails] = useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState('all');

  const [showLL, setShowLL] = useState(false);
  const [showDL, setShowDL] = useState(false);
  const [showVeh, setShowVeh] = useState(false);
  const [editingLL, setEditingLL] = useState(null);
  const [showLLEdit, setShowLLEdit] = useState(false);
  const [editingDL, setEditingDL] = useState(null);
  const [showDLEdit, setShowDLEdit] = useState(false);
  const [editingVeh, setEditingVeh] = useState(null);
  const [showVehEdit, setShowVehEdit] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);
  const [insuranceVehicle, setInsuranceVehicle] = useState(null);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [showInsuranceEdit, setShowInsuranceEdit] = useState(false);
  const [showPucc, setShowPucc] = useState(false);
  const [puccVehicle, setPuccVehicle] = useState(null);
  const [editingPucc, setEditingPucc] = useState(null);
  const [showPuccEdit, setShowPuccEdit] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [taxVehicle, setTaxVehicle] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showFitness, setShowFitness] = useState(false);
  const [fitnessVehicle, setFitnessVehicle] = useState(null);
  const [editingFitness, setEditingFitness] = useState(null);
  const [showFitnessEdit, setShowFitnessEdit] = useState(false);
  const [showVltd, setShowVltd] = useState(false);
  const [vltdVehicle, setVltdVehicle] = useState(null);
  const [editingVltd, setEditingVltd] = useState(null);
  const [showVltdEdit, setShowVltdEdit] = useState(false);
  const [showPermit, setShowPermit] = useState(false);
  const [permitVehicle, setPermitVehicle] = useState(null);
  const [editingPermit, setEditingPermit] = useState(null);
  const [showPermitEdit, setShowPermitEdit] = useState(false);
  const [showSpeedGovernor, setShowSpeedGovernor] = useState(false);
  const [speedGovernorVehicle, setSpeedGovernorVehicle] = useState(null);
  const [editingSpeedGovernor, setEditingSpeedGovernor] = useState(null);
  const [showSpeedGovernorEdit, setShowSpeedGovernorEdit] = useState(false);

  const loadPageData = useCallback(async (page = 1) => {
    setErr('');
    try {
      await Promise.all([
        (async () => { try { const { data } = await api.get(`/citizens/${id}`); setCitizen(data); } catch (e) { toast.error('Failed to load citizen details.'); } })(),
        (async () => { try { const { data } = await api.get(`/citizens/${id}/ll`, { params: { page } }); setLl({ data: data.data || [], meta: data.meta || null }); } catch (e) { toast.error('Failed to refresh Learner Licenses.'); } })(),
        (async () => { try { const { data } = await api.get(`/citizens/${id}/dl`, { params: { page } }); setDl({ data: data.data || [], meta: data.meta || null }); } catch (e) { toast.error('Failed to refresh Driving Licenses.'); } })(),
        (async () => { try { const { data } = await api.get(`/citizens/${id}/vehicles`, { params: { page } }); setVeh({ data: data.data || [], meta: data.meta || null }); } catch (e) { toast.error('Failed to refresh Vehicles.'); } })(),
      ]);
    } catch (e) {
      setErr('An error occurred while loading page data.');
    }
  }, [id]);

  const refreshAllDetails = useCallback(async () => {
    if (!id) return;
    setLoadingAllDetails(true);
    try {
      const { data } = await api.get(`/citizens/${id}/all-details`);
      setAllDetails(data);
    } catch (error) {
      toast.error('Failed to refresh complete details.');
    } finally {
      setLoadingAllDetails(false);
    }
  }, [id]);

  useEffect(() => {
    loadPageData();
  }, [id, loadPageData]);

  const handleTabSelect = async (key) => {
    setActiveTab(key);
    if (key === 'all') {
      setSelectedVehicleId('all');
      if (!allDetails) {
        refreshAllDetails();
      }
    }
  };

  const deleteCitizen = async () => { if (!isAdmin) return; if (window.confirm('Delete this citizen and all related records?')) { try { await api.delete(`/citizens/${id}`); toast.success('Citizen deleted'); nav('/citizens'); } catch (e) { toast.error(e?.response?.data?.message || 'Delete failed'); } } };
  const handleLLEdit = (record) => { setEditingLL(record); setShowLLEdit(true); };
  const handleLLDelete = async (recordId) => { if (window.confirm('Delete this Learner License record?')) { try { await api.delete(`/ll/${recordId}`); toast.success('Record deleted.'); loadPageData(); refreshAllDetails(); } catch (e) { toast.error(e?.response?.data?.message || 'Delete failed.'); } } };
  const handleDLEdit = (record) => { setEditingDL(record); setShowDLEdit(true); };
  const handleDLDelete = async (recordId) => { if (window.confirm('Delete this Driving License record?')) { try { await api.delete(`/dl/${recordId}`); toast.success('Record deleted.'); loadPageData(); refreshAllDetails(); } catch (e) { toast.error(e?.response?.data?.message || 'Delete failed.'); } } };
  const handleVehEdit = (record) => { setEditingVeh(record); setShowVehEdit(true); };
  const handleVehDelete = async (recordId) => { if (window.confirm('Delete this Vehicle record?')) { try { await api.delete(`/vehicles/${recordId}`); toast.success('Record deleted.'); loadPageData(); refreshAllDetails();} catch (e) { toast.error(e?.response?.data?.message || 'Delete failed.'); } } };
  const handleShowInsurance = (vehicle) => { setInsuranceVehicle(vehicle); setShowInsurance(true); };
  const handleShowInsuranceEdit = (insuranceRecord) => { setEditingInsurance(insuranceRecord); setShowInsuranceEdit(true); };
  const handleShowPucc = (vehicle) => { setPuccVehicle(vehicle); setShowPucc(true); };
  const handleShowPuccEdit = (puccRecord) => { setEditingPucc(puccRecord); setShowPuccEdit(true); };
  const handleShowFitness = (vehicle) => { setFitnessVehicle(vehicle); setShowFitness(true); };
  const handleShowFitnessEdit = (record) => { setEditingFitness(record); setShowFitnessEdit(true); };
  const handleShowVltd = (vehicle) => { setVltdVehicle(vehicle); setShowVltd(true); };
  const handleShowVltdEdit = (record) => { setEditingVltd(record); setShowVltdEdit(true); };
  const handleShowPermit = (vehicle) => { setPermitVehicle(vehicle); setShowPermit(true); };
  const handleShowPermitEdit = (record) => { setEditingPermit(record); setShowPermitEdit(true); };
  const handleShowSpeedGovernor = (vehicle) => { setSpeedGovernorVehicle(vehicle); setShowSpeedGovernor(true); };
  const handleShowSpeedGovernorEdit = (record) => { setEditingSpeedGovernor(record); setShowSpeedGovernorEdit(true); };

  if (err) return <Container className="py-4"><Alert variant="danger">{err}</Alert></Container>;
  if (!citizen) return <Container className="py-4 text-center"><Spinner /></Container>;

  const vehiclesToDisplay = allDetails?.vehicles?.filter(v =>
    selectedVehicleId === 'all' || v.id === parseInt(selectedVehicleId)
  ) || [];

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center"><Col><Link to="/citizens" className="text-decoration-none">&larr; Back to list</Link></Col><Col className="text-end">{canWrite && <Button size="sm" className="me-2" onClick={()=>setShowEdit(true)}>Edit</Button>}{isAdmin && <Button size="sm" variant="outline-danger" onClick={deleteCitizen}>Delete</Button>}</Col></Row>
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h4 className="mb-1">{citizen.name}</h4>
              <div className="text-muted">{citizen.relation_type && citizen.relation_name ? `${citizen.relation_type}: ${citizen.relation_name}` : 'Relation: -'}</div>
              <div className="mt-2"><strong>Mobile:</strong> {citizen.mobile}&nbsp;&nbsp;<strong>Email:</strong> {citizen.email || '-'}</div>
              <div className="mt-1"><strong>Birth Date:</strong> {formatDate(citizen.dob)}&nbsp;&nbsp;<strong>Age:</strong> {citizen.age ? `${citizen.age} years` : '-'}</div>
              <div className="mt-1"><strong>Address:</strong> {citizen.address || '-'}</div>
              <div className="mt-1"><strong>City:</strong> {citizen.city || '-'}&nbsp;&nbsp;<strong>State:</strong> {citizen.state || '-'}</div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0"><Badge bg="light" text="dark" className="me-1">LL {citizen.learner_licenses_count ?? 0}</Badge><Badge bg="light" text="dark" className="me-1">DL {citizen.driving_licenses_count ?? 0}</Badge><Badge bg="light" text="dark">Veh {citizen.vehicles_count ?? 0}</Badge></Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
        <Tab eventKey="ll" title="Learner Licenses"><div className="d-flex justify-content-between align-items-center mb-2"><div className="fw-semibold">LL Records</div>{canWrite && <Button size="sm" onClick={()=>setShowLL(true)}>+ Add LL</Button>}</div><div className="table-responsive"><Table bordered hover size="sm"><thead><tr><th>#</th><th>LL No</th><th>Application No</th><th>Issue</th><th>Expiry</th><th>Class</th><th>Office</th>{canWrite && <th>Actions</th>}</tr></thead><tbody>{ll.data.length > 0 ? ( ll.data.map((r, i) => ( <tr key={r.id}><td>{(ll.meta?.from ?? 1) + i}</td><td>{r.ll_no}</td><td>{r.application_no || '-'}</td><td>{formatDate(r.issue_date)}</td><td>{formatDate(r.expiry_date)}</td><td>{r.vehicle_class || '-'}</td><td>{r.office || '-'}</td>{canWrite && (<td><Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleLLEdit(r)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={() => handleLLDelete(r.id)}>Delete</Button></td>)}</tr>))) : (<tr><td colSpan={canWrite ? 8 : 7} className="text-center">No records</td></tr>)}</tbody></Table></div></Tab>
        <Tab eventKey="dl" title="Driving Licenses"><div className="d-flex justify-content-between align-items-center mb-2"><div className="fw-semibold">DL Records</div>{canWrite && <Button size="sm" onClick={()=>setShowDL(true)}>+ Add DL</Button>}</div><div className="table-responsive"><Table bordered hover size="sm"><thead><tr><th>#</th><th>DL No</th><th>Application No</th><th>Issue</th><th>Expiry</th><th>Class</th><th>Office</th>{canWrite && <th>Actions</th>}</tr></thead><tbody>{dl.data.length > 0 ? ( dl.data.map((r, i) => ( <tr key={r.id}><td>{(dl.meta?.from ?? 1) + i}</td><td>{r.dl_no}</td><td>{r.application_no || '-'}</td><td>{formatDate(r.issue_date)}</td><td>{formatDate(r.expiry_date)}</td><td>{r.vehicle_class || '-'}</td><td>{r.office || '-'}</td>{canWrite && (<td><Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleDLEdit(r)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={() => handleDLDelete(r.id)}>Delete</Button></td>)}</tr>))) : (<tr><td colSpan={canWrite ? 8 : 7} className="text-center">No records</td></tr>)}</tbody></Table></div></Tab>
        <Tab eventKey="veh" title="Vehicles"><div className="d-flex justify-content-between align-items-center mb-2"><div className="fw-semibold">Vehicle Records</div>{canWrite && <Button size="sm" onClick={()=>setShowVeh(true)}>+ Add Vehicle</Button>}</div><div className="table-responsive"><Table bordered hover size="sm"><thead><tr><th>#</th><th>Registration</th><th>Type</th><th>Make/Model</th><th>Chassis</th><th>Engine</th><th>Actions</th></tr></thead><tbody>{veh.data.length > 0 ? ( veh.data.map((r, i) => ( <tr key={r.id}><td>{(veh.meta?.from ?? 1) + i}</td><td>{r.registration_no}</td><td>{r.type || '-'}</td><td>{r.make_model || '-'}</td><td>{r.chassis_no || '-'}</td><td>{r.engine_no || '-'}</td><td><div className="d-flex flex-wrap"><Button size="sm" variant="outline-dark" className="me-1 mb-1" onClick={()=>{ setTaxVehicle(r); setShowTax(true); }}>Taxes</Button><Button size="sm" variant="outline-info" className="me-1 mb-1" onClick={() => handleShowInsurance(r)}>Insurance</Button><Button size="sm" variant="outline-success" className="me-1 mb-1" onClick={() => handleShowPucc(r)}>PUCC</Button><Button size="sm" variant="outline-secondary" className="me-1 mb-1" onClick={() => handleShowFitness(r)}>Fitness</Button><Button size="sm" variant="outline-secondary" className="me-1 mb-1" onClick={() => handleShowVltd(r)}>VLT a</Button><Button size="sm" variant="outline-secondary" className="me-1 mb-1" onClick={() => handleShowPermit(r)}>Permit</Button><Button size="sm" variant="outline-secondary" className="me-1 mb-1" onClick={() => handleShowSpeedGovernor(r)}>Speed Gov.</Button>{canWrite && <Button size="sm" variant="outline-primary" className="me-1 mb-1" onClick={() => handleVehEdit(r)}>Edit</Button>}{canWrite && <Button size="sm" variant="outline-danger" className="mb-1" onClick={() => handleVehDelete(r.id)}>Delete</Button>}</div></td></tr>))) : (<tr><td colSpan={7} className="text-center">No records</td></tr>)}</tbody></Table></div></Tab>

        <Tab eventKey="all" title="All Details">
          {loadingAllDetails && <div className="text-center my-4"><Spinner animation="border" /></div>}
          {allDetails && (
            <div>
              <Card className="mb-3"><Card.Header as="h5" className="d-flex justify-content-between align-items-center">Owner Information{canWrite && <Button variant="outline-primary" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>}</Card.Header><Card.Body><div className="mt-2"><strong>Mobile:</strong> {allDetails.mobile}&nbsp;&nbsp;<strong>Email:</strong> {allDetails.email || '-'}</div><div className="mt-1"><strong>Birth Date:</strong> {formatDate(allDetails.dob)}&nbsp;&nbsp;<strong>Age:</strong> {allDetails.age ? `${allDetails.age} years` : '-'}</div><div className="mt-1"><strong>Address:</strong> {allDetails.address || '-'}</div><div className="mt-1"><strong>City:</strong> {allDetails.city || '-'}&nbsp;&nbsp;<strong>State:</strong> {allDetails.state || '-'}</div></Card.Body></Card>
              <Card className="mb-3"><Card.Header as="h5" className="d-flex justify-content-between align-items-center">Learner Licenses<Button variant="outline-secondary" size="sm" onClick={() => setActiveTab('ll')}>Manage LL</Button></Card.Header><Card.Body>{allDetails.learner_licenses.length > 0 ? (<Table striped bordered size="sm"><thead><tr><th>LL No</th><th>App No</th><th>Issue</th><th>Expiry</th><th>Class</th></tr></thead><tbody>{allDetails.learner_licenses.map(item => (<tr key={item.id}><td>{item.ll_no}</td><td>{item.application_no || '-'}</td><td>{formatDate(item.issue_date)}</td><td>{formatDate(item.expiry_date)}</td><td>{item.vehicle_class || '-'}</td></tr>))}</tbody></Table>) : <p>No learner license records found.</p>}</Card.Body></Card>
              <Card className="mb-3"><Card.Header as="h5" className="d-flex justify-content-between align-items-center">Driving Licenses<Button variant="outline-secondary" size="sm" onClick={() => setActiveTab('dl')}>Manage DL</Button></Card.Header><Card.Body>{allDetails.driving_licenses.length > 0 ? (<Table striped bordered size="sm"><thead><tr><th>DL No</th><th>App No</th><th>Issue</th><th>Expiry</th><th>Class</th></tr></thead><tbody>{allDetails.driving_licenses.map(item => (<tr key={item.id}><td>{item.dl_no}</td><td>{item.application_no || '-'}</td><td>{formatDate(item.issue_date)}</td><td>{formatDate(item.expiry_date)}</td><td>{item.vehicle_class || '-'}</td></tr>))}</tbody></Table>) : <p>No driving license records found.</p>}</Card.Body></Card>

              <h5 className="mt-4 mb-3">Vehicles</h5>
              {allDetails.vehicles.length > 1 && (<Row className="mb-3"><Col md={4}><Form.Group><Form.Label>Filter by Vehicle</Form.Label><Form.Select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}><option value="all">Show All Vehicles</option>{allDetails.vehicles.map(v => (<option key={v.id} value={v.id}>{v.registration_no}</option>))}</Form.Select></Form.Group></Col></Row>)}

              {vehiclesToDisplay.length > 0 ? (
                vehiclesToDisplay.map(v => (
                  <Card key={v.id} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center"><strong>{v.registration_no}</strong> — {v.make_model || 'N/A'}{canWrite && <Button variant="outline-primary" size="sm" onClick={() => handleVehEdit(v)}>Edit Vehicle</Button>}</Card.Header>
                    <Card.Body>
                      <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>Insurance</h6><Button size="sm" variant="outline-secondary" onClick={() => handleShowInsurance(v)}>Manage</Button></div>{v.insurances.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>Policy #</th><th>Company</th><th>Type</th><th>Valid Upto</th><th>Status</th><th></th></tr></thead><tbody>{v.insurances.map(i => <tr key={i.id}><td>{i.policy_number}</td><td>{i.company_name}</td><td>{i.insurance_type}</td><td>{formatDate(i.end_date)}</td><td><Badge bg={i.status === 'active' ? 'success' : 'danger'}>{i.status}</Badge></td><td className="text-end"><Button size="sm" variant="link" onClick={() => handleShowInsuranceEdit(i)}>Edit</Button></td></tr>)}</tbody></Table> : <small>No insurance records.</small>}</div>
                      <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>PUCC</h6><Button size="sm" variant="outline-secondary" onClick={() => handleShowPucc(v)}>Manage</Button></div>{v.puccs.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>PUCC #</th><th>Valid From</th><th>Valid Until</th><th>Status</th><th></th></tr></thead><tbody>{v.puccs.map(p => <tr key={p.id}><td>{p.pucc_number}</td><td>{formatDate(p.valid_from)}</td><td>{formatDate(p.valid_until)}</td><td><Badge bg={p.status === 'active' ? 'success' : 'danger'}>{p.status}</Badge></td><td className="text-end"><Button size="sm" variant="link" onClick={() => handleShowPuccEdit(p)}>Edit</Button></td></tr>)}</tbody></Table> : <small>No PUCC records.</small>}</div>
                      <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>Fitness</h6><Button size="sm" variant="outline-secondary" onClick={() => handleShowFitness(v)}>Manage</Button></div>{v.fitnesses.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>Certificate #</th><th>Issue Date</th><th>Expiry Date</th><th></th></tr></thead><tbody>{v.fitnesses.map(f => <tr key={f.id}><td>{f.certificate_number}</td><td>{formatDate(f.issue_date)}</td><td>{formatDate(f.expiry_date)}</td><td className="text-end"><Button size="sm" variant="link" onClick={() => handleShowFitnessEdit(f)}>Edit</Button></td></tr>)}</tbody></Table> : <small>No fitness records.</small>}</div>
                      <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>Tax</h6><Button size="sm" variant="outline-secondary" onClick={() => { setTaxVehicle(v); setShowTax(true); }}>Manage</Button></div>{v.taxes.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>Mode</th><th>From</th><th>Upto</th></tr></thead><tbody>{v.taxes.map(t => <tr key={t.id}><td>{t.tax_mode}</td><td>{formatDate(t.tax_from)}</td><td>{formatDate(t.tax_upto)}</td></tr>)}</tbody></Table> : <small>No tax records.</small>}</div>
                      <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>Permit</h6><Button size="sm" variant="outline-secondary" onClick={() => handleShowPermit(v)}>Manage</Button></div>{v.permits.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>Permit #</th><th>Issue Date</th><th>Expiry Date</th><th></th></tr></thead><tbody>{v.permits.map(p => <tr key={p.id}><td>{p.permit_number}</td><td>{formatDate(p.issue_date)}</td><td>{formatDate(p.expiry_date)}</td><td className="text-end"><Button size="sm" variant="link" onClick={() => handleShowPermitEdit(p)}>Edit</Button></td></tr>)}</tbody></Table> : <small>No permit records.</small>}</div>
                      <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>Speed Governor</h6><Button size="sm" variant="outline-secondary" onClick={() => handleShowSpeedGovernor(v)}>Manage</Button></div>{v.speed_governors.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>Certificate #</th><th>Issue Date</th><th>Expiry Date</th><th></th></tr></thead><tbody>{v.speed_governors.map(s => <tr key={s.id}><td>{s.certificate_number}</td><td>{formatDate(s.issue_date)}</td><td>{formatDate(s.expiry_date)}</td><td className="text-end"><Button size="sm" variant="link" onClick={() => handleShowSpeedGovernorEdit(s)}>Edit</Button></td></tr>)}</tbody></Table> : <small>No speed governor records.</small>}</div>
                      <div className="border rounded p-3" style={{backgroundColor: '#f8f9fa'}}><div className="d-flex justify-content-between align-items-center mb-2"><h6>VLTd</h6><Button size="sm" variant="outline-secondary" onClick={() => handleShowVltd(v)}>Manage</Button></div>{v.vltds.length > 0 ? <Table responsive striped size="sm" className="mb-0"><thead><tr><th>Certificate #</th><th>Issue Date</th><th>Expiry Date</th><th></th></tr></thead><tbody>{v.vltds.map(vl => <tr key={vl.id}><td>{vl.certificate_number}</td><td>{formatDate(vl.issue_date)}</td><td>{formatDate(vl.expiry_date)}</td><td className="text-end"><Button size="sm" variant="link" onClick={() => handleShowVltdEdit(vl)}>Edit</Button></td></tr>)}</tbody></Table> : <small>No VLTd records.</small>}</div>
                    </Card.Body>
                  </Card>
                ))
              ) : <p>No vehicle records found.</p>}
            </div>
          )}
        </Tab>
      </Tabs>

      <CitizenEditModal show={showEdit} onHide={()=>setShowEdit(false)} citizen={citizen} onUpdated={() => { loadPageData(); refreshAllDetails(); }} />
      <LLEditModal show={showLLEdit} onHide={()=>setShowLLEdit(false)} llRecord={editingLL} onUpdated={() => { setShowLLEdit(false); loadPageData(); refreshAllDetails(); }} />
      <DLEditModal show={showDLEdit} onHide={()=>setShowDLEdit(false)} dlRecord={editingDL} onUpdated={() => { setShowDLEdit(false); loadPageData(); refreshAllDetails(); }} />
      <VehicleEditModal show={showVehEdit} onHide={()=>setShowVehEdit(false)} vehicleRecord={editingVeh} onUpdated={() => { setShowVehEdit(false); loadPageData(); refreshAllDetails(); }} />
      <VehicleInsuranceEditModal show={showInsuranceEdit} onHide={() => { setShowInsuranceEdit(false); }} insuranceRecord={editingInsurance} onUpdated={() => {setShowInsuranceEdit(false); refreshAllDetails();}} />
      <VehiclePuccEditModal show={showPuccEdit} onHide={() => { setShowPuccEdit(false);}} puccRecord={editingPucc} onUpdated={() => {setShowPuccEdit(false); refreshAllDetails();}} />
      <VehicleFitnessEditModal show={showFitnessEdit} onHide={() => { setShowFitnessEdit(false); }} record={editingFitness} onUpdated={() => {setShowFitnessEdit(false); refreshAllDetails();}} />
      <VehicleVltdEditModal show={showVltdEdit} onHide={() => { setShowVltdEdit(false); }} record={editingVltd} onUpdated={() => {setShowVltdEdit(false); refreshAllDetails();}} />
      <VehiclePermitEditModal show={showPermitEdit} onHide={() => { setShowPermitEdit(false);}} record={editingPermit} onUpdated={() => {setShowPermitEdit(false); refreshAllDetails();}} />
      <VehicleSpeedGovernorEditModal show={showSpeedGovernorEdit} onHide={() => { setShowSpeedGovernorEdit(false); }} record={editingSpeedGovernor} onUpdated={() => {setShowSpeedGovernorEdit(false); refreshAllDetails();}} />
      <LLFormModal show={showLL} onHide={()=>setShowLL(false)} citizenId={id} onCreated={() => { loadPageData(); refreshAllDetails(); }} />
      <DLFormModal show={showDL} onHide={()=>setShowDL(false)} citizenId={id} onCreated={() => { loadPageData(); refreshAllDetails(); }} />
      <VehicleFormModal show={showVeh} onHide={()=>setShowVeh(false)} citizenId={id} onCreated={() => { loadPageData(); refreshAllDetails(); }} />
      <VehicleTaxModal show={showTax} onHide={() => {setShowTax(false); refreshAllDetails();}} vehicle={taxVehicle} />
      <VehicleInsuranceModal show={showInsurance} onHide={() => setShowInsurance(false)} vehicle={insuranceVehicle} onShowEdit={handleShowInsuranceEdit} />
      <VehiclePuccModal show={showPucc} onHide={() => setShowPucc(false)} vehicle={puccVehicle} onShowEdit={handleShowPuccEdit} />
      <VehicleFitnessModal show={showFitness} onHide={() => setShowFitness(false)} vehicle={fitnessVehicle} onShowEdit={handleShowFitnessEdit} />
      <VehicleVltdModal show={showVltd} onHide={() => setShowVltd(false)} vehicle={vltdVehicle} onShowEdit={handleShowVltdEdit} />
      <VehiclePermitModal show={showPermit} onHide={() => setShowPermit(false)} vehicle={permitVehicle} onShowEdit={handleShowPermitEdit} />
      <VehicleSpeedGovernorModal show={showSpeedGovernor} onHide={() => setShowSpeedGovernor(false)} vehicle={speedGovernorVehicle} onShowEdit={handleShowSpeedGovernorEdit} />
    </Container>
  );
}
