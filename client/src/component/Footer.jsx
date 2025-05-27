import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="steel-footer text-white py-4">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              © {new Date().getFullYear()} e-PTW. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a href="#privacy" className="footer-link me-3">
              Privacy Policy
            </a>
            <a href="#terms" className="footer-link">
              Terms of Service
            </a>
          </Col>
        </Row>
      </Container>

      {/* Footer Styling */}
      <style jsx>{`
        .steel-footer {
          background-color: #2c3e50;
          border-top: 1px solid #3d566e;
        }
        .footer-link {
          color: #dcdde1;
          text-decoration: none;
        }
        .footer-link:hover {
          color: #1e90ff;
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
