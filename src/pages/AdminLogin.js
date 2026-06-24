// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Added for a nice icon
import '../components/Admin.css';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple hardcoded check
        if (username === 'admin' && password === 'admin') {
            onLogin();
            navigate('/admin');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="admin-layout" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <div className="modal-box" style={{ position: 'relative', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/')} 
                    style={{ 
                        position: 'absolute', 
                        top: '15px', 
                        left: '15px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Site
                </button>

                <div className="modal-head" style={{ paddingTop: '40px' }}>
                    <h2 style={{ width: '100%', textAlign: 'center' }}>BWM Admin Login</h2>
                </div>

                <form onSubmit={handleSubmit} className="modal-form" style={{ padding: '20px' }}>
                    {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                    
                    <div className="input-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: '15px' }}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter password"
                        />
                    </div>

                    <button type="submit" className="btn-add-main" style={{ width: 'auto', marginTop: '25px', padding: '10px 20px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;