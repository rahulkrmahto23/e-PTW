import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Table, 
  Badge,
  Modal,
  Spinner,
  Alert,
  Dropdown
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { FiEdit2, FiTrash2, FiCheck, FiCornerUpLeft } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { searchPermits, deletePermit, approvePermit, returnPermit } from '../helpers/permit-api';
import PermitForm from './AddPermitForm';
import toast, { Toaster } from 'react-hot-toast';

const getStatusBadge = (status) => {
  const badgeClass = {
    'APPROVED': 'success',
    'PENDING': 'warning',
    'REJECTED': 'danger',
    'ASSIGNED': 'primary',
    'UNASSIGNED': 'secondary',
    'CLOSED': 'dark'
  }[status] || 'secondary';

  return <Badge bg={badgeClass}>{status}</Badge>;
};

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    poNumber: '',
    permitNumber: '',
    permitStatus: 'ALL',
    startDate: null,
    endDate: null
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(null);

  // Get user level from storage
  React.useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    if (userData) setUserLevel(userData.level);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setSearchParams(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const query = {};
      if (searchParams.poNumber) query.poNumber = searchParams.poNumber;
      if (searchParams.permitNumber) query.permitNumber = searchParams.permitNumber;
      if (searchParams.permitStatus !== 'ALL') query.permitStatus = searchParams.permitStatus;
      if (searchParams.startDate && searchParams.endDate) {
        query.issueDate = {
          $gte: searchParams.startDate,
          $lte: searchParams.endDate
        };
      }

      const response = await searchPermits(query);
      setSearchResults(response.permits);
    } catch (err) {
      setError(err.message || 'Failed to search permits');
      toast.error(err.message || 'Failed to search permits');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchParams({
      poNumber: '',
      permitNumber: '',
      permitStatus: 'ALL',
      startDate: null,
      endDate: null
    });
    setSearchResults([]);
    setError('');
  };

  const handleEditClick = (permit) => {
    setSelectedPermit({
      ...permit,
      _id: permit._id,
      issueDate: new Date(permit.issueDate),
      expiryDate: new Date(permit.expiryDate),
    });
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedPermit(null);
  };

  const handlePermitUpdated = async () => {
    await handleSearch(); // Refresh the search results
    handleModalClose();
    toast.success("Permit updated successfully!");
  };

  const handleDeleteClick = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this permit?"
    );
    if (!confirm) return;

    try {
      setActionLoading(`delete-${id}`);
      await deletePermit(id);
      await handleSearch(); // Refresh the search results
      toast.success("Permit deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete permit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (permitId, currentLevel, totalLevels) => {
    try {
      setActionLoading(`approve-${permitId}`);
      
      const isFinalApproval = currentLevel >= totalLevels;
      
      await approvePermit(permitId, currentLevel, isFinalApproval);
      await handleSearch();
      
      if (isFinalApproval) {
        toast.success("Permit fully approved and closed!");
      } else {
        toast.success(`Permit approved at level ${currentLevel} and moved to level ${currentLevel + 1}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve permit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (permitId, currentLevel) => {
    const requiredChanges = prompt("Please specify required changes:");
    if (!requiredChanges) return;

    try {
      setActionLoading(`return-${permitId}`);
      await returnPermit(permitId, requiredChanges, currentLevel);
      await handleSearch();
      toast.success("Permit returned for corrections!");
    } catch (err) {
      toast.error(err.message || "Failed to return permit");
    } finally {
      setActionLoading(null);
    }
  };

  const canTakeAction = (permit) => {
    if (!userLevel) return false;
    
    const isPending = permit.permitStatus === "PENDING";
    const isAtCurrentLevel = permit.currentLevel === userLevel;
    const hasApprovedPreviousLevels = permit.approvedLevels && permit.approvedLevels.includes(userLevel - 1);
    const isNotFinalApproval = permit.currentLevel < permit.totalLevels;
    
    return isPending && (isAtCurrentLevel || (userLevel > 1 && hasApprovedPreviousLevels)) && isNotFinalApproval;
  };

  const renderActionButtons = (permit) => {
    if (permit.permitStatus === "PENDING" && canTakeAction(permit)) {
      return (
        <Dropdown 
          show={actionDropdownOpen === permit._id}
          onToggle={(isOpen) => setActionDropdownOpen(isOpen ? permit._id : null)}
        >
          <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-actions">
            Take Action
          </Dropdown.Toggle>
          
          <Dropdown.Menu>
            <Dropdown.Item 
              onClick={() => handleApprove(permit._id, permit.currentLevel, permit.totalLevels)}
              disabled={actionLoading === `approve-${permit._id}`}
            >
              {actionLoading === `approve-${permit._id}` ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                <FiCheck className="me-2 text-success" />
              )}
              Approve
            </Dropdown.Item>
            
            <Dropdown.Item 
              onClick={() => handleReturn(permit._id, permit.currentLevel)}
              disabled={actionLoading === `return-${permit._id}`}
            >
              {actionLoading === `return-${permit._id}` ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                <FiCornerUpLeft className="me-2 text-warning" />
              )}
              Return for Correction
            </Dropdown.Item>
            
            <Dropdown.Divider />
            
            <Dropdown.Item 
              onClick={() => handleEditClick(permit)}
              disabled={actionLoading !== null}
            >
              <FiEdit2 className="me-2" />
              Edit Details
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleEditClick(permit)}
            disabled={actionLoading !== null}
            title="Edit permit"
          >
            <FiEdit2 />
          </Button>
          
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteClick(permit._id)}
            disabled={actionLoading === `delete-${permit._id}`}
            title="Delete permit"
          >
            {actionLoading === `delete-${permit._id}` ? (
              <Spinner size="sm" />
            ) : (
              <FiTrash2 />
            )}
          </Button>
        </div>
      );
    }
  };

  return (
    <Container className="py-5">
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="shadow-lg p-4 border-0 rounded-4">
        <h4 className="mb-4 text-primary fw-bold">🔍 Search Work Permit</h4>

        <Row className="mb-4 g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">PO Number</Form.Label>
              <Form.Control
                type="text"
                name="poNumber"
                placeholder="Enter PO Number"
                value={searchParams.poNumber}
                onChange={handleInputChange}
                className="rounded-3"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">Permit Number</Form.Label>
              <Form.Control
                type="text"
                name="permitNumber"
                placeholder="Enter Permit Number"
                value={searchParams.permitNumber}
                onChange={handleInputChange}
                className="rounded-3"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">Permit Status</Form.Label>
              <Form.Select
                name="permitStatus"
                value={searchParams.permitStatus}
                onChange={handleInputChange}
                className="rounded-3"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CLOSED">Closed</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">Permit Issue Date Range</Form.Label>
              <DatePicker
                selectsRange
                startDate={searchParams.startDate}
                endDate={searchParams.endDate}
                onChange={handleDateChange}
                isClearable
                className="form-control rounded-3"
                dateFormat="dd-MM-yyyy"
                placeholderText="Select date range"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4 g-3">
          <Col md={3}>
            <Button 
              variant="outline-secondary" 
              className="w-100 rounded-3"
              onClick={handleClear}
            >
              Clear Filter
            </Button>
          </Col>
          <Col md={6}>
            <Button 
              variant="primary" 
              className="w-100 rounded-3"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> Searching...
                </>
              ) : (
                <>
                  <FaSearch className="me-2" /> Search
                </>
              )}
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4">
            <h5 className="mb-3">Search Results</h5>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Permit No.</th>
                    <th>PO No.</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Current Level</th>
                    <th>Approval Progress</th>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((permit) => (
                    <tr key={permit._id}>
                      <td>{getStatusBadge(permit.permitStatus)}</td>
                      <td>
                        <div className="fw-semibold">{permit.permitNumber}</div>
                      </td>
                      <td>{permit.poNumber}</td>
                      <td>{permit.employeeName}</td>
                      <td>{permit.permitType}</td>
                      <td className="text-center">Level {permit.currentLevel}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {Array.from({ length: permit.totalLevels || 1 }, (_, i) => (
                            <div 
                              key={i} 
                              className={`me-1 ${(permit.approvedLevels || []).includes(i + 1) ? 'text-success' : 'text-muted'}`}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{new Date(permit.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(permit.expiryDate).toLocaleDateString()}</td>
                      <td>
                        {renderActionButtons(permit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {searchResults.length === 0 && !loading && !error && (
          <div className="text-center py-4 text-muted">
            No permits found. Try adjusting your search criteria.
          </div>
        )}
      </Card>

      <Modal show={showEditModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Permit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PermitForm
            defaultValues={selectedPermit}
            onClose={handleModalClose}
            onPermitUpdated={handlePermitUpdated}
            isEdit={true}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Search;