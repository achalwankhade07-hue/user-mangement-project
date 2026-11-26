import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom"; 

const UserAccessPage = () => {
    const navigate = useNavigate(); 
    const location = useLocation(); 
    
    
    const { id, name } = location.state || {}; 

    const [checkedPages, setCheckedPages] = useState([]); 
    const [isSaving, setIsSaving] = useState(false); 
    
    const [allAvailablePages] = useState(['Users','Dashboard','Country', 'States', 'City', 'Skills', 'Languages']); 

    useEffect(() => {
        if (id) {
            fetchUserPermissions(id);
        }
    }, [id]);

    const fetchUserPermissions = async (userId) => {
        try {
            
            const response = await axios.get(`http://localhost:5000/api/get-permissions/${userId}`);
            if (response.data.success) {
                setCheckedPages(response.data.pages); 
            }
        } catch (error) {
            console.error("Error fetching user permissions", error);
        }
    };

    const handleCheckboxChange = (page) => {
        if (checkedPages.includes(page)) {
            setCheckedPages(checkedPages.filter(p => p !== page)); 
        } else {
            setCheckedPages([...checkedPages, page]); 
        }
    };

    const handleSavePermissions = async () => {
        if (!id) {
           // alert("User ID missing hai! Kisi user par click karke aaiye.");
            return;
        }
        setIsSaving(true);
        try {
            const response = await axios.post('http://localhost:5000/api/save-permissions', {
                userId: id,
                allowedPages: checkedPages
            });

            if (response.data.success) {
                alert(response.data.message); 
            }
        } catch (error) {
            console.error("Error saving permissions", error);
           // alert("Failed to save permissions.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
            
            <button 
                onClick={() => navigate("/dashboard")} 
                style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#0f6b0f', border: '1px solid #ccc', borderRadius: '4px' }}
            >
                ← Back to Dashboard
            </button>
            
            <h2 style={{ fontWeight: 'normal', margin: '0 0 20px 0' }}>User Access Control</h2>
            
            <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', padding: '12px 20px', display: 'inline-block', borderRadius: '4px', marginBottom: '20px' }}>
                <span style={{ color: '#555', fontWeight: '500' }}>Setting Module Access Rights for User ID: </span>
                <span style={{ color: id ? '#007bff' : 'red', fontWeight: 'bold' }}>
                    {id ? `#${id} ${name ? `(${name})` : ''}` : 'No User Selected! Dashboard se click karke aayein.'}
                </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#1a1a1a', color: '#fff', textAlign: 'left' }}>
                        <th style={{ padding: '12px 15px', fontWeight: '600', width: '50%' }}>Module Name</th>
                        <th style={{ padding: '12px 15px', fontWeight: '600', textAlign: 'center', width: '50%' }}>Allow Access (Show in Menu)</th>
                    </tr>
                </thead>
                <tbody>
                    {allAvailablePages.map((page, index) => (
                        <tr key={page} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '14px 15px', color: '#333', textTransform: 'capitalize' }}>
                                {page}
                            </td>
                            <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={checkedPages.includes(page)}
                                    onChange={() => handleCheckboxChange(page)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '25px' }}>
                <button 
                    onClick={handleSavePermissions} 
                    disabled={isSaving || !id}
                    style={{ 
                        width: '100%', 
                        background: (!id || isSaving) ? '#cccccc' : '#4caf50', 
                        color: 'white', 
                        padding: '14px', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '16px', 
                        cursor: (!id || isSaving) ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isSaving ? <span>⏳ Saving...</span> : <><span role="img" aria-label="lock">🔒</span> Save Permissions</>}
                </button>
            </div>
        </div>
    );
};

export default UserAccessPage;