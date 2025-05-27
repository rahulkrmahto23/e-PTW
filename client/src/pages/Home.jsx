import React from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import home from "../assets/home.jpg";

const HomePage = () => {
  return (
    <div
      className="steel-hero-section text-white d-flex align-items-center"
      style={{ minHeight: "90vh", backgroundColor: "#2c3e50" }}
    >
      <Container>
        <Row className="align-items-center flex-column-reverse flex-md-row">
          {/* Text Section */}
          <Col md={6} className="text-center text-md-start mt-4 mt-md-0">
            <h1 className="mb-4">
              Welcome to{" "}
              <span className="highlight">
                e-PTW (Electronic Permit to Work)
              </span>{" "}
              - <span className="highlight"> a smart, digital solution</span>{" "}
              for managing work permits safely and efficiently.
            </h1>
            <p className="mb-4">
              It streamlines the approval process, ensuring real-time tracking,
              compliance, and accountability. Enhance workplace safety and
              reduce delays with our user-friendly and secure platform.
            </p>
            <Form className="d-flex flex-column flex-sm-row align-items-stretch">
              <Form.Control
                type="email"
                placeholder="Enter your email address..."
                className="me-sm-2 mb-2 mb-sm-0"
              />
              <Button variant="primary">Get Started</Button>
            </Form>
          </Col>

          {/* Illustration */}
          <Col md={6} className="text-center">
            <img
              src={home}
              alt="People Illustration"
              className="img-fluid"
              style={{ maxHeight: "400px" }}
            />
          </Col>
        </Row>
      </Container>

      {/* Extra styles for "steel" theme */}
      <style jsx>{`
        .steel-hero-section {
          background: linear-gradient(to right, #2c3e50, #4b6584);
        }
        .highlight {
          color: #1e90ff;
        }
        h1 {
          font-weight: 700;
        }
        p {
          color: #dcdde1;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
