import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CityMaster = () => {
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]); 
    const [isOpen, setIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); 
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [cityName, setCityName] = useState('');
    const [editId, setEditId] = useState(null);

    // Actual logged-in user ka data nikalne ke liye function
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
        return { name: 'Rani', email: 'rani@gmail.com' }; // Backup default
    };

    // Initial Data Load karne ke liye
    const fetchInitialData = async () => {
        try {
            const resCities = await axios.get('http://localhost:5000/api/cities');
            const resCountries = await axios.get('http://localhost:5000/api/countries');
            
            if (Array.isArray(resCities.data)) setCities(resCities.data);
            else setCities([]);

            if (Array.isArray(resCountries.data)) setCountries(resCountries.data);
            else setCountries([]);
        } catch (error) {
            console.error("Error fetching initial city data:", error);
            setCities([]);
            setCountries([]);
        }
    };

    useEffect(() => { 
        fetchInitialData(); 
    }, []);

    // Country badalne par uske States load karne ke liye
    const handleCountryChange = async (countryId) => {
        setSelectedCountry(countryId);
        setSelectedState(''); 
        if (countryId) {
            try {
                const res = await axios.get(`http://localhost:5000/api/countries/${countryId}/states`);
                if (Array.isArray(res.data)) setStates(res.data);
                else setStates([]);
            } catch (error) {
                console.error("Error fetching dependent states:", error);
                setStates([]);
            }
        } else {
            setStates([]);
        }
    };

    // Form Submit (Add / Edit) Handle karne ke liye
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); 
        
        if (!selectedState || !cityName.trim()) {
            setErrorMessage("State aur City dono choose karna zaroori hai!");
            return;
        }

        const currentAdmin = getActiveAdminDetails();

        const data = { 
            state_id: selectedState, 
            city_name: cityName.trim(),
            admin_name: currentAdmin.name,
            admin_email: currentAdmin.email
        };
        
        try {
            if (editId) {
                // Update City Route
                await axios.put(`http://localhost:5000/api/cities/${editId}`, data);
                //alert("City successfully update ho gaya!");
                setEditId(null);
            } else {
                // Add City Route
                const response = await axios.post('http://localhost:5000/api/add-city', data);
                if (response.data && response.data.success) {
                    //alert("City successfully add ho gayi!");
                }
            }
            
            // Success hone par state reset aur modal close
            setCityName(''); 
            setSelectedCountry('');
            setSelectedState('');
            setStates([]);
            setIsOpen(false);
            setErrorMessage('');

            // Data Refresh
            fetchInitialData();

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message); 
            } else if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Kuch galti hui hai, dobara koshish karein!");
            }
            console.error("Error saving city:", error);
        }
    };

    // Edit Button ke click par form fill karne ke liye
    const handleEdit = async (city) => {
        try {
            setEditId(city.id);
            setSelectedCountry(city.country_id || '');
            
            // Edit mode me states fetch hone tak dropdown select error na aaye isliye sync lagaya
            if (city.country_id) {
                const res = await axios.get(`http://localhost:5000/api/countries/${city.country_id}/states`);
                if (Array.isArray(res.data)) {
                    setStates(res.data);
                } else {
                    setStates([]);
                }
            } else {
                setStates([]);
            }
            
            setSelectedState(city.state_id || '');
            setCityName(city.city_name);
            setErrorMessage(''); 
            setIsOpen(true);
        } catch (error) {
            console.error("Error setting up edit form:", error);
        }
    };

    // Delete handling
    const handleDelete = async (id) => {
        if (window.confirm("Kya aap is city ko delete karna chahte hain?")) {
            const currentAdmin = getActiveAdminDetails();
            
            try {
                await axios.delete(`http://localhost:5000/api/cities/${id}`, {
                    data: {
                        admin_name: currentAdmin.name,
                        admin_email: currentAdmin.email
                    }
                });
                fetchInitialData(); 
            } catch (error) {
                console.error("Error deleting city:", error);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate('/dashboardpage')}>Back to Dashboard</button>
                <h2>City Master</h2>
                <button onClick={() => { 
                    setIsOpen(true); 
                    setEditId(null); 
                    setCityName(''); 
                    setSelectedCountry(''); 
                    setSelectedState(''); 
                    setStates([]); 
                    setErrorMessage('');
                }}>
                    + Add City
                </button>
            </div>
            
            <button 
                onClick={() => navigate("/master-activity-log?module=City Master")}
            >
                View Master Activity Log
            </button>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>ID</th>
                        <th>Country Name</th>
                        <th>State Name</th>
                        <th>City Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(cities) && cities.length > 0 ? (
                        cities.map((ct) => (
                            <tr key={ct.id}>
                                <td>{ct.id}</td>
                                <td>{ct.country_name}</td>
                                <td>{ct.state_name}</td>
                                <td>{ct.city_name}</td>
                                <td>
                                    <button onClick={() => handleEdit(ct)} style={{ marginRight: '10px' }}>Edit</button>
                                    <button onClick={() => handleDelete(ct.id)} style={{ color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>No Cities Found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Popup Box Modal */}
            {isOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editId ? 'Edit City' : 'Add City'}</h3>
                        <form onSubmit={handleSubmit}>
                            
                            {/* Country Dropdown */}
                            <select 
                                value={selectedCountry} 
                                onChange={(e) => handleCountryChange(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
                            >
                                <option value="">Select Country</option>
                                {Array.isArray(countries) && countries.map(c => (
                                    <option key={c.id} value={c.id}>{c.country_name}</option>
                                ))}
                            </select>

                            {/* State Dropdown */}
                            <select 
                                value={selectedState} 
                                onChange={(e) => setSelectedState(e.target.value)} 
                                required
                                disabled={!selectedCountry}
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
                            >
                                <option value="">Select State</option>
                                {Array.isArray(states) && states.map(s => (
                                    // Yahan state ke context/table column parameters match kiye
                                    <option key={s.id} value={s.id}>{s.state_name || s.name}</option>
                                ))}
                            </select>

                            {/* City Input */}
                            <input 
                                type="text" 
                                placeholder="Enter City Name" 
                                value={cityName} 
                                onChange={(e) => setCityName(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
                            />
                            
                            {/* Error Alert Message Area */}
                            {errorMessage && (
                                <div style={{ color: "red", fontSize: "14px", marginBottom: "15px", fontWeight: "500", display: 'block' }}>
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                                <button type="submit" style={{ background: 'green', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#fff', padding: '20px', borderRadius: '8px', width: '320px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)' };

export default CityMaster;