import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import { loginUser } from '../helpers/user-api'; // Adjust path if needed
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        toast.success(response.message || 'Login successful! Redirecting...');

        // Save user data to storage based on "keep me logged in"
        const storage = keepLoggedIn ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify({
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          level: response.user.level
        }));

        setTimeout(() => {
          navigate('/permit'); // Redirect after toast
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  const backgroundStyle = {
    minHeight: '90vh',
    backgroundImage: 'url("/background.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const formBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  };

  return (
    <div style={backgroundStyle}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={formBoxStyle}>
        <div style={{ fontSize: '40px', color: '#0d6efd', marginBottom: '10px' }}>
          <FaUser />
        </div>
        <h4 className="mb-4">LOGIN e-PTW</h4>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formEmail">
            <InputGroup>
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              label="Keep me logged in"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
            />
            <a href="#" style={{ fontSize: '0.9rem' }}>Forgot Password?</a>
          </div>

          <Button variant="primary" type="submit" className="w-100 mb-3">
            Login
          </Button>

          <div style={{ fontSize: '0.9rem' }}>
            Don't have an account? <a href="/signup">Sign Up</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;