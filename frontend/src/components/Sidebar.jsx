import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    
    // Default permissions (Sab 0 matlab disabled)
    const [permissions, setPermissions] = useState({
        can_view_country: 0,
        can_view_state: 0,
        can_view_city: 0,
        can_view_language: 0,
        can_view_skills: 0
    });

    // Login ke baad jo userId localStorage me save hui thi use nikalenge
    const currentUserId = localStorage.getItem('userId') || 1; 

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/my-permissions/${currentUserId}`);
                if (res.data.success) {
                    setPermissions(res.data.permissions);
                }
            } catch (err) {
                console.error("Sidebar permissions load karne me dikkat aayi:", err);
            }
        };
        fetchPermissions();
    }, [currentUserId]);

    // Active link highlight karne ke liye helper class
    const linkClass = (path) => `
        flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors
        ${location.pathname === path ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}
    `;

    return (
        <div className="w-64 h-screen bg-gray-950 text-white flex flex-col p-4 border-r border-gray-800">
            <div className="text-xl font-bold mb-6 border-b border-gray-800 pb-4 text-center tracking-wide text-blue-400">
                Admin Panel
            </div>
            
            <nav className="flex flex-col gap-1.5 flex-1">
                
                {/* 1. Country Link */}
                {permissions.can_view_country === 1 && (
                    <Link to="/countries" className={linkClass('/countries')}>
                        <span>🌐</span> Country Master
                    </Link>
                )}

                {/* 2. State Link */}
                {permissions.can_view_state === 1 && (
                    <Link to="/states" className={linkClass('/states')}>
                        <span>🗺️</span> State Master
                    </Link>
                )}

                {/* 3. City Link */}
                {permissions.can_view_city === 1 && (
                    <Link to="/cities" className={linkClass('/cities')}>
                        <span>🏢</span> City Master
                    </Link>
                )}

                {/* 4. Language Link */}
                {permissions.can_view_language === 1 && (
                    <Link to="/languages" className={linkClass('/languages')}>
                        <span>🗣️</span> Language Master
                    </Link>
                )}

                {/* 5. Skills Link */}
                {permissions.can_view_skills === 1 && (
                    <Link to="/skills" className={linkClass('/skills')}>
                        <span>🛠️</span> Skills Master
                    </Link>
                )}
                
            </nav>

            {/* Admin Setting Link (Yeh hamesha dikhega ya fir ispe alag role check laga sakte hain) */}
            <div className="border-t border-gray-800 pt-4">
                <Link to="/user-access" className="flex items-center gap-3 p-3 bg-blue-950/40 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-900/50 transition-colors">
                    <span>⚙️</span> User Access Setup
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;