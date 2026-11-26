import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SkillMaster = () => {
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [skillName, setSkillName] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); 
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
        return { name: 'Rani', email: 'rani@gmail.com' }; // Backup Default
    };

    const fetchSkills = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/skills');
            setSkills(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error fetching skills:", error);
            setSkills([]);
        }
    };

    useEffect(() => { 
        fetchSkills(); 
    }, []);

    // Form Submit (Add aur Edit dono ke liye)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!skillName.trim()) {
            setErrorMessage("Skill name khaali nahi ho sakta!");
            return;
        }

        const currentAdmin = getActiveAdminDetails();

        const data = {
            skill_name: skillName.trim(),
            admin_name: currentAdmin.name,
            admin_email: currentAdmin.email
        };

        try {
            if (editId) {
                // UPDATE SKILL
                await axios.put(`http://localhost:5000/api/skills/${editId}`, data);
                alert("Skill successfully update ho gayi!");
                setEditId(null);
            } else {
                // ADD NEW SKILL
                await axios.post('http://localhost:5000/api/skills', data);
                alert("Skill successfully add ho gayi!");
            }

            // State Reset & Modal Close
            setSkillName('');
            setIsOpen(false);
            setErrorMessage('');
            fetchSkills(); // List Refresh karein

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message); 
            } else if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Kuch galti hui hai, dobara koshish karein!");
            }
            console.error("Error saving skill:", error);
        }
    };

    // Edit button click handler
    const handleEdit = (skill) => {
        setEditId(skill.id);
        setSkillName(skill.skill_name);
        setErrorMessage('');
        setIsOpen(true);
    };

    // Delete handler (Logs data ke sath)
    const handleDelete = async (id) => {
        if (window.confirm("Kya aap is skill ko delete karna chahte hain?")) {
            const currentAdmin = getActiveAdminDetails();
            try {
                // Backend ko logs ke liye admin details headers/body me bhejna
                await axios.delete(`http://localhost:5000/api/skills/${id}`, {
                    data: {
                        admin_name: currentAdmin.name,
                        admin_email: currentAdmin.email
                    }
                });
              //  alert("Skill successfully delete ho gayi!");
                fetchSkills();
            } catch (error) {
                console.error("Error deleting skill:", error);
              //  alert("Skill delete karne me problem aayi.");
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate('/dashboardpage')}>Back to Dashboard</button>
                <h2>Skill Master</h2>
                <button onClick={() => { 
                    setIsOpen(true); 
                    setEditId(null); 
                    setSkillName(''); 
                    setErrorMessage('');
                }}>
                    + Add Skill
                </button>
            </div>

            {/* Activity Log Button */}
<button 
    onClick={() => navigate("/master-activity-log?moduleName=Skill Master&module=Skill Master")}
    style={{ marginBottom: '15px', padding: '6px 12px', cursor: 'pointer' }}
>
    View Master Activity Log
</button>

            {/* Skills Table */}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ width: '20%' }}>ID</th>
                        <th style={{ width: '60%' }}>Skill Name</th>
                        <th style={{ width: '20%' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {skills.length > 0 ? (
                        skills.map((sk) => (
                            <tr key={sk.id}>
                                <td>{sk.id}</td>
                                <td>{sk.skill_name}</td>
                                <td>
                                    <button onClick={() => handleEdit(sk)} style={{ marginRight: '10px' }}>Edit</button>
                                    <button onClick={() => handleDelete(sk.id)} style={{ color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>No Skills Found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pop-up Modal */}
            {isOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editId ? 'Edit Skill' : 'Add Skill'}</h3>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Enter Skill Name" 
                                value={skillName} 
                                onChange={(e) => setSkillName(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
                            />

                            {/* Error Message UI */}
                            {errorMessage && (
                                <div style={{ color: "red", fontSize: "14px", marginBottom: "15px", fontWeight: "500", display: 'block' }}>
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                                <button type="submit" style={{ background: 'green', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                    Save
                                </button>
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

export default SkillMaster;