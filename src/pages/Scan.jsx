import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import logo from '../images/logo.png';

function Scan() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [scannedStudents, setScannedStudents] = useState([]);
  const [exported, setExported] = useState(false);
  const [showManualSection, setShowManualSection] = useState(false);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Manual section active + typing in input field
      if (showManualSection && e.target.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          handleManualScan();
        }
        return;
      }

      // Barcode scanner mode
      if (e.key === 'Enter') {
        handleScan(barcode.trim());
        setBarcode('');
      } else {
        setBarcode((prev) => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [barcode, showManualSection, manualId]);

  const handleScan = async (id) => {
    if (!id) return;

    if (scannedStudents.find((s) => s.student_usn === id)) {
      toast.warn('⚠️ Already Scanned');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/scan', {
        session_id: sessionId,
        id_number: id
      });
      setScannedStudents((prev) => [...prev, res.data]);
      toast.success(`✅ Scanned: ${res.data.student_usn}`);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.warn('⚠️ Student already scanned');
      } else if (err.response?.status === 404) {
        toast.error('❌ Student not found');
      } else {
        toast.error('❌ Scan error');
      }
    }
  };

  const handleExport = () => {
    if (scannedStudents.length === 0) {
      toast.warn('⚠️ No students to export');
      return;
    }

    const data = scannedStudents.map((s, i) => ({
      No: i + 1,
      Name: s.student_name,
      USN: s.student_usn,
      Department: s.student_department,
      Time: s.timestamp
    }));

    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'ScannedStudents');
    XLSX.writeFile(book, 'attendance.xlsx');

    setExported(true);
    toast.success('📄 Exported to Excel');
  };

  const handleEndSession = async () => {
    if (!exported && scannedStudents.length > 0) handleExport();

    try {
      await axios.put(`http://localhost:5000/api/end-session/${sessionId}`);
      toast.success('🛑 Session ended');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      toast.error('❌ Error ending session');
    }
  };

  const handleLogout = () => {
    if (!exported && scannedStudents.length > 0) handleExport();
    setTimeout(() => {
      localStorage.clear();
      navigate('/');
    }, 1500);
  };

  const toggleManualSection = () => setShowManualSection(prev => !prev);

  const handleManualScan = () => {
    const trimmed = manualId.trim();
    if (!trimmed) {
      toast.warn('Enter a valid ID or USN');
      return;
    }
    handleScan(trimmed);
    setManualId(''); // clear input after scan
  };

  const handleDeleteStudent = async (usn) => {
    try {
      await axios.delete('http://localhost:5000/api/attendance', {
        data: { session_id: sessionId, student_usn: usn }
      });

      setScannedStudents((prev) => prev.filter((s) => s.student_usn !== usn));
      toast.info(`🗑️ Deleted: ${usn}`);
    } catch (err) {
      toast.error('❌ Failed to delete attendance');
    }
  };

  return (
    <div>
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
      </header>

      <ToastContainer position="top-center" />

      <div style={styles.container}>
        <h1>Placement Department Barcode Attendance System</h1>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleEndSession} style={{ ...styles.button, backgroundColor: 'orange' }}>🛑 End Session</button>
          <button onClick={handleExport} style={{ ...styles.button, backgroundColor: 'green' }}>📄 Export</button>
          <button onClick={handleLogout} style={{ ...styles.button, backgroundColor: 'red' }}>🚪 Logout</button>
          <button onClick={toggleManualSection} style={{ ...styles.button, backgroundColor: 'gray' }}>
            ✍️ {showManualSection ? 'Hide' : 'Manual Entry'}
          </button>
        </div>

        {showManualSection && (
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter USN or ID"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', width: '250px' }}
            />
            <button onClick={handleManualScan} style={{ ...styles.button, backgroundColor: '#007BFF' }}>➕ Add</button>
          </div>
        )}

        <div>
          <h3>📝 Scanned Students</h3>
          {scannedStudents.length === 0 ? (
            <p>No students scanned yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>USN</th>
                  <th>Department</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scannedStudents.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.student_name}</td>
                    <td>{s.student_usn}</td>
                    <td>{s.student_department}</td>
                    <td>{s.timestamp}</td>
                    <td>
                      <button
                        style={{
                          backgroundColor: 'red',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleDeleteStudent(s.student_usn)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logo: { width: '500px', marginRight: '10px' },
  headerText: { fontSize: '2rem', margin: 0 },
  container: { textAlign: 'center', padding: '40px' },
  button: {
    margin: '5px',
    padding: '10px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  table: { margin: '20px auto', borderCollapse: 'collapse', width: '90%' },
  th: { border: '1px solid #ddd', padding: '8px' },
  td: { border: '1px solid #ddd', padding: '8px' }
};

export default Scan;



