import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CountryMaster = () => {
    const navigate = useNavigate();
   // const [isLogOpen, setIsLogOpen] = useState(false);
    // States
    const [countries, setCountries] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [countryName, setCountryName] = useState('');
    const [editId, setEditId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const getActiveAdminDetails = () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                return {
                    name: parsed.name || parsed.username || 'Rani',
                    email: parsed.email || 'rani@gmail.com'
                };
            }
        } catch (err) {
            console.error("Error reading login session:", err);
        }
        return { name: 'Rani', email: 'rani@gmail.com' };
    };

    const fetchCountries = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/countries');
            if (Array.isArray(res.data)) {
                setCountries(res.data);
            } else {
                setCountries([]);
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
            setCountries([]);
        }
    };

    useEffect(() => { 
        fetchCountries(); 
    }, []);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const currentAdmin = getActiveAdminDetails(); 

    try {
        if (editId) {
            await axios.put(`http://localhost:5000/api/countries/${editId}`, { 
                country_name: countryName,
                admin_name: currentAdmin.name,
                admin_email: currentAdmin.email
            });
        } else {
            await axios.post('http://localhost:5000/api/countries', { 
                country_name: countryName,
                admin_name: currentAdmin.name,
                admin_email: currentAdmin.email
            });
        }
        setCountryName('');
        setEditId(null);
        setIsOpen(false);
        fetchCountries(); 
    } catch (error) {
        console.error("Error saving country:", error);
        
       
        if (error.response && error.response.data && error.response.data.message) {
            setErrorMessage(error.response.data.message);
        } else {
            setErrorMessage("Something went wrong. Please try again.");
        }
    }
};
    const handleEdit = (country) => {
        setEditId(country.id);
        setCountryName(country.country_name);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Kya aap is country ko delete karna chahte hain? Isse iske states aur cities bhi delete ho jayenge.")) {
            const currentAdmin = getActiveAdminDetails(); 
            
            try {
               
                await axios.delete(`http://localhost:5000/api/countries/${id}`, {
                    data: {
                        admin_name: currentAdmin.name,
                        admin_email: currentAdmin.email
                    }
                });
                fetchCountries(); 
            } catch (error) {
                console.error("Error deleting country:", error);
            }
        }
    };

   return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate('/dashboardpage')}>Back to Dashboard</button>
                <h2>Country Master</h2>
                <button onClick={() => { setIsOpen(true); setEditId(null); setCountryName(''); }}>+ Add Country</button>
            </div>
            
            <button onClick={() => navigate("/master-activity-log?module=Country Master")}>
                View Master Activity Log
            </button>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Country Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(countries) && countries.length > 0 ? (
                        countries.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.country_name}</td>
                                <td>
                                    <button onClick={() => handleEdit(c)} style={{ marginRight: '10px' }}>Edit</button>
                                    <button onClick={() => handleDelete(c.id)} style={{ color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>No Countries Found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Popup Box */}
            {isOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editId ? 'Edit Country' : 'Add Country'}</h3>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Enter Country Name" 
                                value={countryName} 
                                onChange={(e) => {
                                    setCountryName(e.target.value);
                                    setErrorMessage(''); 
                                }} 
                                required 
                                style={{ width: '90%', padding: '8px', marginBottom: '15px' }}
                            />
                            
                            {errorMessage && (
                                <p style={{ color: 'red', fontSize: '13px', marginTop: '-10px', marginBottom: '15px', textAlign: 'left', paddingLeft: '5%' }}>
                                    {errorMessage}
                                </p>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => {
                                    setIsOpen(false);
                                    setErrorMessage('');
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ background: 'green', color: '#fff' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div> 
    );
};

const modalOverlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 1000 
};

const modalContentStyle = { 
    background: '#fff', 
    padding: '20px', 
    borderRadius: '8px', 
    width: '300px', 
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
    textAlign: 'center'
};

export default CountryMaster;