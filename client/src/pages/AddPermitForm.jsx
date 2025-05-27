import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { createPermit, editPermitDetails } from "../helpers/permit-api";
import { getPermitTypeOptions, getPermitStatusOptions } from "../helpers/permit-api";

const AddPermitForm = ({ 
  defaultValues, 
  onClose = () => {}, 
  onPermitUpdated,
  isEdit = false,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    permitNumber: "",
    poNumber: "",
    employeeName: "",
    permitType: "",
    permitStatus: "Pending",
    location: "",
    remarks: "",
    issueDate: new Date(),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [permitTypeOptions, setPermitTypeOptions] = useState([]);
  const [permitStatusOptions, setPermitStatusOptions] = useState([]);

  useEffect(() => {
    // Load permit type and status options
    const loadOptions = async () => {
      try {
        const types = await getPermitTypeOptions();
        const statuses = await getPermitStatusOptions();
        setPermitTypeOptions(types);
        setPermitStatusOptions(statuses);
      } catch (error) {
        console.error("Failed to load permit options:", error);
        toast.error("Failed to load permit options");
      }
    };
    
    loadOptions();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        permitNumber: defaultValues.permitNumber || "",
        poNumber: defaultValues.poNumber || "",
        employeeName: defaultValues.employeeName || "",
        permitType: defaultValues.permitType || "",
        permitStatus: defaultValues.permitStatus || "Pending",
        location: defaultValues.location || "",
        remarks: defaultValues.remarks || "",
        issueDate: defaultValues.issueDate ? new Date(defaultValues.issueDate) : new Date(),
        expiryDate: defaultValues.expiryDate ? new Date(defaultValues.expiryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (date, name) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    // Clear error when date is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // If changing issue date and expiry date is before new issue date, update expiry date
    if (name === "issueDate" && formData.expiryDate <= date) {
      const newExpiryDate = new Date(date);
      newExpiryDate.setDate(date.getDate() + 7); // Add 7 days to issue date
      setFormData(prev => ({ ...prev, expiryDate: newExpiryDate }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.permitNumber.trim()) newErrors.permitNumber = "Permit number is required";
    if (!formData.poNumber.trim()) newErrors.poNumber = "PO number is required";
    if (!formData.employeeName.trim()) newErrors.employeeName = "Employee name is required";
    if (!formData.permitType) newErrors.permitType = "Permit type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    
    // Date validation
    if (!formData.issueDate) newErrors.issueDate = "Issue date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (formData.expiryDate <= formData.issueDate) {
      newErrors.expiryDate = "Expiry date must be after issue date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      let response;
      if (isEdit) {
        // Update existing permit
        response = await editPermitDetails(defaultValues._id, formData);
        toast.success(response.message || "Permit updated successfully!");
      } else {
        // Create new permit
        response = await createPermit(formData);
        toast.success(response.message || "Permit created successfully!");
      }
      
      if (onPermitUpdated) onPermitUpdated(response.permit);
      onClose();
    } catch (error) {
      console.error("Error submitting permit:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to submit permit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-3">
      <Card className="shadow p-4 border-0 rounded-4">
        <h4 className="mb-4 fw-bold text-primary">
          {isEdit ? "✏️ Edit Permit" : "➕ Create New Permit"}
        </h4>
        
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="permitNumber">
                <Form.Label>Permit Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="permitNumber"
                  value={formData.permitNumber}
                  onChange={handleChange}
                  placeholder="PT-2023-001"
                  required
                  disabled={isEdit}
                  isInvalid={!!errors.permitNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.permitNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="poNumber">
                <Form.Label>PO Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="poNumber"
                  value={formData.poNumber}
                  onChange={handleChange}
                  placeholder="PO-12345"
                  required
                  isInvalid={!!errors.poNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.poNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="employeeName">
                <Form.Label>Employee Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  isInvalid={!!errors.employeeName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.employeeName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="permitType">
                <Form.Label>Permit Type *</Form.Label>
                <Form.Select
                  name="permitType"
                  value={formData.permitType}
                  onChange={handleChange}
                  required
                  isInvalid={!!errors.permitType}
                >
                  <option value="">Select Permit Type</option>
                  {permitTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.permitType}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="permitStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="permitStatus"
                  value={formData.permitStatus}
                  onChange={handleChange}
                  disabled={!isEdit} // Only allow status change when editing
                >
                  {permitStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="location">
                <Form.Label>Location *</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Building A, Floor 3"
                  required
                  isInvalid={!!errors.location}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="issueDate">
                <Form.Label>Issue Date *</Form.Label>
                <DatePicker
                  selected={formData.issueDate}
                  onChange={(date) => handleDateChange(date, "issueDate")}
                  className={`form-control ${errors.issueDate ? 'is-invalid' : ''}`}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  required
                />
                {errors.issueDate && (
                  <div className="invalid-feedback d-block">
                    {errors.issueDate}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="expiryDate">
                <Form.Label>Expiry Date *</Form.Label>
                <DatePicker
                  selected={formData.expiryDate}
                  onChange={(date) => handleDateChange(date, "expiryDate")}
                  className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                  dateFormat="dd/MM/yyyy"
                  minDate={formData.issueDate}
                  required
                />
                {errors.expiryDate && (
                  <div className="invalid-feedback d-block">
                    {errors.expiryDate}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="remarks">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional notes or special instructions..."
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4 gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {isEdit ? "Updating..." : "Submitting..."}
                </>
              ) : (
                isEdit ? "Update Permit" : "Submit Permit"
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default AddPermitForm;