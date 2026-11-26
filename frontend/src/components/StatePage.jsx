import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StateMaster = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [stateName, setStateName] = useState('');
    const [editId, setEditId] = useState(null);

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

    const fetchData = async () => {
        try {
            const resStates = await axios.get('http://localhost:5000/api/states');
            const resCountries = await axios.get('http://localhost:5000/api/countries');
            
            if (Array.isArray(resStates.data)) {
                setStates(resStates.data);
            } else {
                setStates([]);
            }

            if (Array.isArray(resCountries.data)) {
                setCountries(resCountries.data);
            } else {
                setCountries([]);
            }
        } catch (error) {
            console.error("Error fetching states or countries:", error);
            setStates([]);
            setCountries([]);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); 
        
        if (!selectedCountry || !stateName.trim()) {
            setErrorMessage("Country aur State dono zaroori hain!");
            return;
        }

        const currentAdmin = getActiveAdminDetails(); 

        
        const data = { 
            country_id: selectedCountry, 
            state_name: stateName.trim(),
            admin_name: currentAdmin.name,
            admin_email: currentAdmin.email
        };
        
        try {
            if (editId) {
                await axios.put(`http://localhost:5000/api/states/${editId}`, data);
                //alert("State successfully update ho gaya!");
                setEditId(null); 
            } else {
                const response = await axios.post('http://localhost:5000/api/add-states', data);
                if (response.data && response.data.success) {
                  //  alert("State successfully add ho gaya!"); 
                }
            }
            
            
            setStateName(''); 
            setSelectedCountry('');
            setIsOpen(false);
            fetchData(); 

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message); 
            } else if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Kuch galti hui hai, dobara koshish karein!");
            }
            console.error("Error saving state:", error);
        }
    };

    const handleEdit = (state) => {
        setEditId(state.id);
        setSelectedCountry(state.country_id || '');
        setStateName(state.state_name);
        setErrorMessage(''); 
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("State delete karne se iski saari cities bhi delete ho jayengi? Kya aap sure hain?")) {
            const currentAdmin = getActiveAdminDetails(); 
            
            try {
                
                await axios.delete(`http://localhost:5000/api/states/${id}`, {
                    data: {
                        admin_name: currentAdmin.name,
                        admin_email: currentAdmin.email
                    }
                });
                //alert("State successfully delete ho gaya!");
                fetchData(); 
            } catch (error) {
                console.error("Error deleting state:", error);
                alert("State delete nahi ho paya.");
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate('/dashboardpage')}>Back to Dashboard</button>
                <h2>State Master</h2>
                <button onClick={() => { setIsOpen(true); setEditId(null); setStateName(''); setSelectedCountry(''); setErrorMessage(''); }}>+ Add State</button>
            </div>
            
            {/* StateMaster.jsx ke andar is button ko aise update karein */}
<button onClick={() => navigate("/master-activity-log?module=State Master")}>
    View Master Activity Log
</button>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Country Name</th>
                        <th>State Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(states) && states.length > 0 ? (
                        states.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.country_name}</td>
                                <td>{s.state_name}</td>
                                <td>
                                    <button onClick={() => handleEdit(s)} style={{ marginRight: '10px' }}>Edit</button>
                                    <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No States Found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Popup Box */}
            {isOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editId ? 'Edit State' : 'Add State'}</h3>
                        <form onSubmit={handleSubmit}>
                            <select 
                                value={selectedCountry} 
                                onChange={(e) => setSelectedCountry(e.target.value)} 
                                required
                                style={{ width: '96%', padding: '8px', marginBottom: '15px' }}
                            >
                                <option value="">Select Country</option>
                                {Array.isArray(countries) && countries.map(c => (
                                    <option key={c.id} value={c.id}>{c.country_name}</option>
                                ))}
                            </select>
                            <input 
                                type="text" 
                                placeholder="Enter State Name" 
                                value={stateName} 
                                onChange={(e) => setStateName(e.target.value)} 
                                required 
                                style={{ width: '90%', padding: '8px', marginBottom: '15px' }}
                            />
                            
                            {/* Error validation message */}
                            {errorMessage && (
                              <div style={{ color: "red", fontSize: "14px", marginBottom: "15px", fontWeight: "500" }}>
                                ⚠️ {errorMessage}
                              </div>
                            )}
                 
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                                <button type="submit" style={{ background: 'green', color: '#fff' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContentStyle = { background: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)' };

export default StateMaster;