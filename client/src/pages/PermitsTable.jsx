import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Form,
  Modal,
  Spinner,
  Alert,
  InputGroup,
  Pagination,
  Row,
  Col,
  Dropdown,
  Tab,
  Tabs
} from "react-bootstrap";
import { 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiCornerUpLeft,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiInfo
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PermitForm from "./AddPermitForm";
import PermitDetails from "../component/PermitDetails";
import { 
  getAllPermits, 
  approvePermit, 
  returnPermit, 
  editPermitDetails,
  deletePermit,
  getPermitStatusOptions,
  getPermitTypeOptions,
  getPendingPermits
} from "../helpers/permit-api";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getStatusBadge = (status) => {
  const variant = {
    'Pending': 'warning',
    'Approved': 'success',
    'Returned': 'danger',
    'Closed': 'secondary'
  }[status] || 'info';
  
  return <Badge bg={variant} className="text-capitalize">{status.toLowerCase()}</Badge>;
};

const PermitsTable = () => {
  const [permits, setPermits] = useState([]);
  const [pendingPermits, setPendingPermits] = useState([]);
  const [filteredPermits, setFilteredPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    permitNumber: '',
    poNumber: '',
    employeeName: '',
    permitType: '',
    permitStatus: '',
    fromDate: null,
    toDate: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' });

  const navigate = useNavigate();
  const statusOptions = getPermitStatusOptions();
  const typeOptions = getPermitTypeOptions();

  const fetchAllPermits = async () => {
    try {
      setLoading(true);
      const response = await getAllPermits();
      setPermits(response.permits);
      setFilteredPermits(response.permits);
    } catch (err) {
      setError(err.message || "Failed to fetch permits");
      toast.error(err.message || "Failed to fetch permits");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPermits = async () => {
    try {
      setPendingLoading(true);
      const response = await getPendingPermits();
      setPendingPermits(response.permits);
      
      const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (userData) setUserLevel(userData.level);
    } catch (err) {
      setError(err.message || "Failed to fetch pending permits");
      toast.error(err.message || "Failed to fetch pending permits");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPermits();
    fetchPendingPermits();
  }, []);

  useEffect(() => {
    let results = [...permits];
    
    // Apply filters
    if (filters.permitNumber) {
      results = results.filter(p => 
        p.permitNumber.toLowerCase().includes(filters.permitNumber.toLowerCase())
      );
    }
    if (filters.poNumber) {
      results = results.filter(p => 
        p.poNumber.toLowerCase().includes(filters.poNumber.toLowerCase())
      );
    }
    if (filters.employeeName) {
      results = results.filter(p => 
        p.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())
      );
    }
    if (filters.permitType) {
      results = results.filter(p => p.permitType === filters.permitType);
    }
    if (filters.permitStatus) {
      results = results.filter(p => p.permitStatus === filters.permitStatus);
    }
    if (filters.fromDate) {
      results = results.filter(p => new Date(p.issueDate) >= filters.fromDate);
    }
    if (filters.toDate) {
      results = results.filter(p => new Date(p.issueDate) <= filters.toDate);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      results.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredPermits(results);
    setCurrentPage(1);
  }, [permits, filters, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFilters(prev => ({ ...prev, [field]: date }));
  };

  const clearFilters = () => {
    setFilters({
      permitNumber: '',
      poNumber: '',
      employeeName: '',
      permitType: '',
      permitStatus: '',
      fromDate: null,
      toDate: null
    });
    setSortConfig({ key: 'issueDate', direction: 'desc' });
  };

  const handleSearchClick = () => navigate("/search");
  const handleAddPermitClick = () => navigate("/add-permit");

  const handleViewDetails = (permit) => {
    setSelectedPermit(permit);
    setShowDetailsModal(true);
  };

  const handleEditClick = (permit) => {
    setSelectedPermit({
      ...permit,
      issueDate: new Date(permit.issueDate),
      expiryDate: new Date(permit.expiryDate),
    });
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedPermit(null);
  };

  const handlePermitUpdated = async (updatedData) => {
    try {
      setActionLoading('updating');
      await editPermitDetails(selectedPermit._id, updatedData);
      await fetchAllPermits();
      await fetchPendingPermits();
      toast.success("Permit updated successfully!");
      handleModalClose();
    } catch (err) {
      toast.error(err.message || "Failed to update permit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (permitId, currentLevel) => {
    try {
      setActionLoading(`approve-${permitId}`);
      await approvePermit(permitId);
      await fetchAllPermits();
      await fetchPendingPermits();
      toast.success(`Permit approved at level ${currentLevel}`);
    } catch (err) {
      toast.error(err.message || "Failed to approve permit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (permitId) => {
    const requiredChanges = prompt("Please specify required changes:");
    if (!requiredChanges) return;

    try {
      setActionLoading(`return-${permitId}`);
      await returnPermit(permitId, requiredChanges);
      await fetchAllPermits();
      await fetchPendingPermits();
      toast.success("Permit returned for corrections!");
    } catch (err) {
      toast.error(err.message || "Failed to return permit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (permitId) => {
    if (!window.confirm("Are you sure you want to delete this permit?")) return;
    
    try {
      setActionLoading(`delete-${permitId}`);
      await deletePermit(permitId);
      await fetchAllPermits();
      await fetchPendingPermits();
      toast.success("Permit deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete permit");
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionButtons = (permit) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => handleViewDetails(permit)}
          title="View details"
        >
          <FiEye />
        </Button>
        
        {permit.permitStatus === "Pending" && permit.currentLevel === userLevel ? (
          <>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => handleApprove(permit._id, permit.currentLevel)}
              disabled={actionLoading === `approve-${permit._id}`}
              title="Approve permit"
            >
              {actionLoading === `approve-${permit._id}` ? (
                <Spinner size="sm" />
              ) : (
                <FiCheck />
              )}
            </Button>
            
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => handleReturn(permit._id)}
              disabled={actionLoading === `return-${permit._id}`}
              title="Return permit"
            >
              {actionLoading === `return-${permit._id}` ? (
                <Spinner size="sm" />
              ) : (
                <FiCornerUpLeft />
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleEditClick(permit)}
            disabled={actionLoading !== null}
            title="Edit permit"
          >
            <FiEdit2 />
          </Button>
        )}
        
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleDelete(permit._id)}
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
  };

  // Pagination logic
  const indexOfLastPermit = currentPage * perPage;
  const indexOfFirstPermit = indexOfLastPermit - perPage;
  const currentPermits = filteredPermits.slice(indexOfFirstPermit, indexOfLastPermit);
  const totalPages = Math.ceil(filteredPermits.length / perPage);

  if (loading || pendingLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading permits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center my-5">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="shadow-sm p-4 bg-light border-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2">
            <Button variant="outline-dark" onClick={handleSearchClick}>
              <FiSearch className="me-2" /> Search
            </Button>
            <Button 
              variant={showFilters ? "primary" : "outline-secondary"} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="me-2" /> Filters
            </Button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" onClick={clearFilters}>
              <FiRefreshCw /> Reset
            </Button>
            <Button variant="primary" onClick={handleAddPermitClick}>
              + Create New Permit
            </Button>
          </div>
        </div>

        {pendingPermits.length > 0 && (
  <Card className="mb-4">
    <Card.Header className="bg-warning bg-opacity-10">
      <h5 className="mb-0">
        <FiInfo className="me-2 text-warning" />
        Pending Approvals (Level {userLevel})
      </h5>
    </Card.Header>
    <Card.Body>
      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Permit Number</th>
              <th>Type</th>
              <th>Issued</th>
              <th>Employee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPermits.map((permit) => (
              <tr key={permit._id}>
                <td>{permit.permitNumber}</td>
                <td>{permit.permitType}</td>
                <td>{new Date(permit.issueDate).toLocaleDateString()}</td>
                <td>{permit.employeeName}</td>
                <td>
                  <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(permit._id, permit.currentLevel)}
                      disabled={actionLoading === `approve-${permit._id}`}
                    >
                      {actionLoading === `approve-${permit._id}` ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FiCheck className="me-1" /> Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleReturn(permit._id)}
                      disabled={actionLoading === `return-${permit._id}`}
                    >
                      {actionLoading === `return-${permit._id}` ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FiCornerUpLeft className="me-1" /> Return
                        </>
                      )}
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleViewDetails(permit)}
                    >
                      <FiEye className="me-1" /> Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card.Body>
  </Card>
)}


        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="all" title="All Permits">
            {showFilters && (
              <Card className="mb-4 p-3">
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Permit Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="permitNumber"
                        value={filters.permitNumber}
                        onChange={handleFilterChange}
                        placeholder="Filter by permit number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>PO Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="poNumber"
                        value={filters.poNumber}
                        onChange={handleFilterChange}
                        placeholder="Filter by PO number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Employee</Form.Label>
                      <Form.Control
                        type="text"
                        name="employeeName"
                        value={filters.employeeName}
                        onChange={handleFilterChange}
                        placeholder="Filter by employee"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Type</Form.Label>
                      <Form.Select
                        name="permitType"
                        value={filters.permitType}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Types</option>
                        {typeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="permitStatus"
                        value={filters.permitStatus}
                        onChange={handleFilterChange}
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      <DatePicker
                        selected={filters.fromDate}
                        onChange={(date) => handleDateChange(date, 'fromDate')}
                        className="form-control"
                        placeholderText="Select start date"
                        dateFormat="dd/MM/yyyy"
                        isClearable
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      <DatePicker
                        selected={filters.toDate}
                        onChange={(date) => handleDateChange(date, 'toDate')}
                        className="form-control"
                        placeholderText="Select end date"
                        dateFormat="dd/MM/yyyy"
                        isClearable
                        minDate={filters.fromDate}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card>
            )}

            {filteredPermits.length === 0 ? (
              <Alert variant="info" className="text-center">
                No permits found matching your criteria
              </Alert>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped bordered hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th onClick={() => handleSort('permitNumber')} style={{ cursor: 'pointer' }}>
                          Permit Number {sortConfig.key === 'permitNumber' && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </th>
                        <th onClick={() => handleSort('permitType')} style={{ cursor: 'pointer' }}>
                          Type {sortConfig.key === 'permitType' && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </th>
                        <th onClick={() => handleSort('permitStatus')} style={{ cursor: 'pointer' }}>
                          Status {sortConfig.key === 'permitStatus' && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </th>
                        <th>Current Level</th>
                        <th>Approval Progress</th>
                        <th onClick={() => handleSort('issueDate')} style={{ cursor: 'pointer' }}>
                          Issued {sortConfig.key === 'issueDate' && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </th>
                        <th onClick={() => handleSort('expiryDate')} style={{ cursor: 'pointer' }}>
                          Expires {sortConfig.key === 'expiryDate' && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </th>
                        <th onClick={() => handleSort('employeeName')} style={{ cursor: 'pointer' }}>
                          Employee {sortConfig.key === 'employeeName' && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          )}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPermits.map((permit) => (
                        <tr key={permit._id}>
                          <td>
                            <div className="fw-semibold">{permit.permitNumber}</div>
                            <div className="text-muted small">{permit.poNumber}</div>
                          </td>
                          <td>{permit.permitType}</td>
                          <td>{getStatusBadge(permit.permitStatus)}</td>
                          <td className="text-center">Level {permit.currentLevel}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {Array.from({ length: 4 }, (_, i) => (
                                <div 
                                  key={i} 
                                  className={`me-1 ${permit.currentLevel > i + 1 ? 'text-success' : 'text-muted'}`}
                                >
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>{new Date(permit.issueDate).toLocaleDateString()}</td>
                          <td>{new Date(permit.expiryDate).toLocaleDateString()}</td>
                          <td>{permit.employeeName}</td>
                          <td>
                            {renderActionButtons(permit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First 
                        onClick={() => setCurrentPage(1)} 
                        disabled={currentPage === 1} 
                      />
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1} 
                      />
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages} 
                      />
                      <Pagination.Last 
                        onClick={() => setCurrentPage(totalPages)} 
                        disabled={currentPage === totalPages} 
                      />
                    </Pagination>
                  </div>
                )}

                <div className="text-muted text-center mt-2">
                  Showing {indexOfFirstPermit + 1} to {Math.min(indexOfLastPermit, filteredPermits.length)} of {filteredPermits.length} permits
                </div>
              </>
            )}
          </Tab>
          <Tab eventKey="pending" title="My Pending Approvals">
            {pendingPermits.length === 0 ? (
              <Alert variant="info" className="text-center">
                No pending permits requiring your approval
              </Alert>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Permit Number</th>
                    <th>Type</th>
                    <th>Issued</th>
                    <th>Employee</th>
                    <th>Current Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPermits.map(permit => (
                    <tr key={permit._id}>
                      <td>{permit.permitNumber}</td>
                      <td>{permit.permitType}</td>
                      <td>{new Date(permit.issueDate).toLocaleDateString()}</td>
                      <td>{permit.employeeName}</td>
                      <td className="text-center">Level {permit.currentLevel}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(permit._id, permit.currentLevel)}
                            disabled={actionLoading === `approve-${permit._id}`}
                          >
                            {actionLoading === `approve-${permit._id}` ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <FiCheck className="me-1" /> Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleReturn(permit._id)}
                            disabled={actionLoading === `return-${permit._id}`}
                          >
                            {actionLoading === `return-${permit._id}` ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <FiCornerUpLeft className="me-1" /> Return
                              </>
                            )}
                          </Button>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleViewDetails(permit)}
                          >
                            <FiEye className="me-1" /> Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
        </Tabs>
      </Card>

      <Modal show={showEditModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Permit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PermitForm
            defaultValues={selectedPermit}
            onClose={handleModalClose}
            onSubmit={handlePermitUpdated}
            isEdit={true}
            isSubmitting={actionLoading === 'updating'}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showDetailsModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Permit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPermit && <PermitDetails permit={selectedPermit} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PermitsTable;