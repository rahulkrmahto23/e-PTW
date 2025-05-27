import React, { useState, useEffect } from 'react';
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
  InputGroup
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaSearch, FaFilter, FaTimes, FaHistory } from 'react-icons/fa';
import { FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import { searchPermits, deletePermit } from '../helpers/permit-api';
import PermitForm from './AddPermitForm';
import toast, { Toaster } from 'react-hot-toast';
import { getPermitStatusOptions } from '../helpers/permit-api';

const getStatusBadge = (status) => {
  const badgeClass = {
    'APPROVED': 'success',
    'PENDING': 'warning',
    'REJECTED': 'danger',
    'RETURNED': 'info',
    'CLOSED': 'secondary'
  }[status] || 'primary';

  return <Badge bg={badgeClass} className="text-capitalize">{status.toLowerCase()}</Badge>;
};

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    permitNumber: '',
    poNumber: '',
    employeeName: '',
    permitType: '',
    permitStatus: '',
    issueDateFrom: null,
    issueDateTo: null,
    expiryDateFrom: null,
    expiryDateTo: null
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [userLevel, setUserLevel] = useState(null);

  useEffect(() => {
    // Get user level from storage
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

  const handleDateChange = (date, field) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare query object
      const query = {};
      if (searchParams.permitNumber) query.permitNumber = { $regex: searchParams.permitNumber, $options: 'i' };
      if (searchParams.poNumber) query.poNumber = { $regex: searchParams.poNumber, $options: 'i' };
      if (searchParams.employeeName) query.employeeName = { $regex: searchParams.employeeName, $options: 'i' };
      if (searchParams.permitType) query.permitType = searchParams.permitType;
      if (searchParams.permitStatus) query.permitStatus = searchParams.permitStatus;
      
      // Date range queries
      if (searchParams.issueDateFrom) query.issueDate = { ...query.issueDate, $gte: searchParams.issueDateFrom };
      if (searchParams.issueDateTo) query.issueDate = { ...query.issueDate, $lte: searchParams.issueDateTo };
      if (searchParams.expiryDateFrom) query.expiryDate = { ...query.expiryDate, $gte: searchParams.expiryDateFrom };
      if (searchParams.expiryDateTo) query.expiryDate = { ...query.expiryDate, $lte: searchParams.expiryDateTo };

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
      permitNumber: '',
      poNumber: '',
      employeeName: '',
      permitType: '',
      permitStatus: '',
      issueDateFrom: null,
      issueDateTo: null,
      expiryDateFrom: null,
      expiryDateTo: null
    });
    setSearchResults([]);
    setError('');
  };

  const handleQuickSearch = (status) => {
    setSearchParams(prev => ({
      ...prev,
      permitStatus: status
    }));
    setTimeout(handleSearch, 100);
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
    const confirm = window.confirm("Are you sure you want to delete this permit?");
    if (!confirm) return;

    try {
      setDeleting(id);
      await deletePermit(id);
      await handleSearch(); // Refresh the search results
      toast.success("Permit deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete permit");
    } finally {
      setDeleting(null);
    }
  };

  const statusOptions = getPermitStatusOptions();

  return (
    <Container className="py-4">
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">🔍 Permit Search</h4>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              {showAdvancedSearch ? <FaTimes /> : <FaFilter />}
              <span className="ms-2">{showAdvancedSearch ? 'Hide Filters' : 'Advanced Filters'}</span>
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Permit Number</Form.Label>
                <Form.Control
                  type="text"
                  name="permitNumber"
                  placeholder="Search by permit number"
                  value={searchParams.permitNumber}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>PO Number</Form.Label>
                <Form.Control
                  type="text"
                  name="poNumber"
                  placeholder="Search by PO number"
                  value={searchParams.poNumber}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="permitStatus"
                  value={searchParams.permitStatus}
                  onChange={handleInputChange}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {showAdvancedSearch && (
            <>
              <Row className="mb-3 g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Employee Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="employeeName"
                      placeholder="Search by employee name"
                      value={searchParams.employeeName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Permit Type</Form.Label>
                    <Form.Select
                      name="permitType"
                      value={searchParams.permitType}
                      onChange={handleInputChange}
                    >
                      <option value="">All Types</option>
                      <option value="Hot Work">Hot Work</option>
                      <option value="Cold Work">Cold Work</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Height Work">Height Work</option>
                      <option value="Confined Space">Confined Space</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3 g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Issue Date Range</Form.Label>
                    <div className="d-flex gap-2">
                      <DatePicker
                        selected={searchParams.issueDateFrom}
                        onChange={(date) => handleDateChange(date, 'issueDateFrom')}
                        selectsStart
                        startDate={searchParams.issueDateFrom}
                        endDate={searchParams.issueDateTo}
                        placeholderText="From"
                        className="form-control"
                      />
                      <DatePicker
                        selected={searchParams.issueDateTo}
                        onChange={(date) => handleDateChange(date, 'issueDateTo')}
                        selectsEnd
                        startDate={searchParams.issueDateFrom}
                        endDate={searchParams.issueDateTo}
                        minDate={searchParams.issueDateFrom}
                        placeholderText="To"
                        className="form-control"
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Expiry Date Range</Form.Label>
                    <div className="d-flex gap-2">
                      <DatePicker
                        selected={searchParams.expiryDateFrom}
                        onChange={(date) => handleDateChange(date, 'expiryDateFrom')}
                        selectsStart
                        startDate={searchParams.expiryDateFrom}
                        endDate={searchParams.expiryDateTo}
                        placeholderText="From"
                        className="form-control"
                      />
                      <DatePicker
                        selected={searchParams.expiryDateTo}
                        onChange={(date) => handleDateChange(date, 'expiryDateTo')}
                        selectsEnd
                        startDate={searchParams.expiryDateFrom}
                        endDate={searchParams.expiryDateTo}
                        minDate={searchParams.expiryDateFrom}
                        placeholderText="To"
                        className="form-control"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          <div className="d-flex justify-content-end gap-2 mb-4">
            <Button 
              variant="outline-secondary" 
              onClick={handleClear}
              disabled={loading}
            >
              <FaTimes className="me-2" /> Clear
            </Button>
            <Button 
              variant="primary" 
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
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => handleQuickSearch('PENDING')}
            >
              Pending Permits
            </Button>
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={() => handleQuickSearch('APPROVED')}
            >
              Approved Permits
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => handleQuickSearch('REJECTED')}
            >
              Rejected Permits
            </Button>
            <Button 
              variant="outline-warning" 
              size="sm"
              onClick={() => handleQuickSearch('')}
            >
              All Permits
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {searchResults.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover className="mt-3">
                <thead className="table-dark">
                  <tr>
                    <th>Status</th>
                    <th>Permit No.</th>
                    <th>PO No.</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((permit) => (
                    <tr key={permit._id}>
                      <td>{getStatusBadge(permit.permitStatus)}</td>
                      <td className="fw-semibold">{permit.permitNumber}</td>
                      <td>{permit.poNumber}</td>
                      <td>{permit.employeeName}</td>
                      <td>{permit.permitType}</td>
                      <td>{permit.location}</td>
                      <td>{new Date(permit.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(permit.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditClick(permit)}
                            disabled={permit.permitStatus === 'APPROVED' && userLevel > 1}
                            title={permit.permitStatus === 'APPROVED' && userLevel > 1 ? 
                              "Approved permits can only be edited by administrators" : "Edit permit"}
                          >
                            <FiEdit2 />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(permit._id)}
                            disabled={deleting === permit._id || (permit.permitStatus === 'APPROVED' && userLevel > 1)}
                            title={permit.permitStatus === 'APPROVED' && userLevel > 1 ? 
                              "Approved permits can only be deleted by administrators" : "Delete permit"}
                          >
                            {deleting === permit._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-5 text-muted">
                <FaHistory size={48} className="mb-3" />
                <h5>No permits found</h5>
                <p>Try adjusting your search criteria</p>
              </div>
            )
          )}
        </Card.Body>
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