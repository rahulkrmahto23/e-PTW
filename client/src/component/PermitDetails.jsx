import React from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";

const PermitDetails = ({ permit }) => {
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4>Permit #{permit.permitNumber}</h4>
        <Badge bg={permit.permitStatus === 'Approved' ? 'success' : 
                   permit.permitStatus === 'Pending' ? 'warning' : 'danger'}>
          {permit.permitStatus}
        </Badge>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Type:</strong> {permit.permitType}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>PO Number:</strong> {permit.poNumber}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Employee:</strong> {permit.employeeName}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Issue Date:</strong> {new Date(permit.issueDate).toLocaleDateString()}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Expiry Date:</strong> {new Date(permit.expiryDate).toLocaleDateString()}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Current Approval Level:</strong> {permit.currentLevel}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Description:</strong> {permit.description}
          </ListGroup.Item>
          {permit.requiredChanges && (
            <ListGroup.Item>
              <strong>Required Changes:</strong> {permit.requiredChanges}
            </ListGroup.Item>
          )}
          <ListGroup.Item>
            <strong>Created By:</strong> {permit.createdBy?.name || 'Unknown'}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default PermitDetails;