import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../images/logo.png';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name || !password) {
      alert('Please enter both name and password');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', { name, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftSection}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h1 style={styles.brandTitle}> Placement Department Login Portal</h1>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.formBox}>
          <h2 style={styles.title}>Login in to your account</h2>
          <input
            style={styles.input}
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },
  leftSection: {
    flex: 1,
    backgroundColor: '#0b3558',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '60px',
  },
  logo: {
    width: '680px',
    marginBottom: '25px',
  },
  brandTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginleft:'15px'
  },
  rightSection: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBox: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0b3558',
    color: '#fff',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
};

export default Login;



