import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { logoutUser } from '../helpers/user-api';
import toast from 'react-hot-toast'; // 🔥 import toast

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const headerStyle = {
    background: 'linear-gradient(to right, #0f1d4c, #002366)',
    color: 'white',
    padding: '7px',
  };

  const buttonStyle = {
    marginLeft: '10px',
    padding: '5px 10px',
    fontSize: '14px',
  };

  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      navigate('/');
      toast.success(response.message || 'Logged out successfully'); // ✅ toast instead of alert
    } catch (error) {
      console.error('Logout failed:', error.message);
      toast.error(error.message || 'Logout failed. Please try again.'); // ✅ error toast
    }
  };

  return (
    <div style={headerStyle}>
      <Container fluid>
        <Row className="align-items-center">
          <Col md={6} className="d-flex align-items-center">
            <Image
              src={logo}
              alt="SAIL Logo"
              height="60"
              className="me-3"
            />
            <div>
              <div className="fw-bold" style={{ fontSize: '16px' }}>भिलाई इस्पात संयंत्र</div>
              <div className="fw-bold" style={{ fontSize: '16px' }}>BHILAI STEEL PLANT</div>
              <div style={{ fontSize: '14px' }}>सेल SAIL</div>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '500' }}>
                  Safety Engineering Department
                </div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  Designed by Venkatpati Raju, Assistant Manager (Safety), 9407981839
                </div>
              </div>
              <div style={{ marginLeft: '15px' }}>
                {isHomePage && (
                  <>
                    <Button 
                      variant="outline-light" 
                      style={buttonStyle}
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="light" 
                      style={buttonStyle}
                      onClick={() => navigate('/signup')}
                    >
                      Signup
                    </Button>
                  </>
                )}
                {!isAuthPage && !isHomePage && (
                  <Button 
                    variant="outline-light" 
                    style={buttonStyle}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Header;
