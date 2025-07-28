import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../images/logo.png';



function Dashboard() {
  const [sessionName, setSessionName] = useState('');
  const navigate = useNavigate();

  const createSession = async () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        session_name: sessionName,
        started_by: 1,
      };
      const res = await axios.post('http://localhost:5000/api/session', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/scan/${res.data.session_id}`);
    } catch (error) {
      console.error(error);
      alert('Error creating session');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div>
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
      </header>

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create New Attendance Session</h2>
          <input
            style={styles.input}
            placeholder="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <button style={styles.buttonPrimary} onClick={createSession}>Start Scanning</button>
          <button style={styles.buttonSecondary} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'center' ,marginRight:'30px'},
  logo: { width: '500px', marginRight: '10px' },
  headerText: { fontSize: '2rem', margin: 0 },
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f2f2f2', padding: '20px' },
  card: { background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center',marginBottom:'50px' },
  title: { marginBottom: '20px', color: '#333' },
  input: { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' },
  buttonPrimary: { width: '100%', padding: '10px', margin: '10px 0', backgroundColor:'#0b3558', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' },
  buttonSecondary: { width: '100%', padding: '10px', backgroundColor: '#2196F3', color: '#f9f9f9', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }
};

export default Dashboard;

