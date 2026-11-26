import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MasterActivityLog = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [logs, setLogs] = useState([]);

    // 1. YEH LINE ZAROORI HAI: Yeh URL se '?module=State Master' ko nikalegi
    const queryParams = new URLSearchParams(location.search);
    const moduleName = queryParams.get('module'); 

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                let url = 'http://localhost:5000/api/master-activity-log';
                if (moduleName) {
                    url += `?moduleName=${encodeURIComponent(moduleName)}`;
                }

                const response = await axios.get(url);
                setLogs(response.data);
            } catch (error) {
                console.error("Error fetching logs in frontend:", error);
            }
        };

        fetchLogs();
    }, [moduleName]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)}>← Back</button>
                {/* Dynamic Title: Jo page hoga wahi heading dikhegi */}
                <h2>{moduleName ? `${moduleName} Activity Log` : 'Master Activity Log'}</h2>
                <div></div>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f2f2f2' }}>
                        <th>ID</th>
                        <th>Admin Name</th>
                        <th>Admin Email</th>
                        <th>Module</th>
                        <th>Action Type</th>
                        <th>Changes Description</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length > 0 ? (
                        logs.map((log) => (
                            <tr key={log.id}>
                                <td>{log.id}</td>
                                <td>{log.admin_name}</td>
                                <td>{log.admin_email}</td>
                                <td><strong>{log.module}</strong></td>
                                <td style={{ 
                                    color: log.action_type === 'INSERT' ? 'green' : log.action_type === 'UPDATE' ? 'orange' : 'red',
                                    fontWeight: 'bold'
                                }}>
                                    {log.action_type}
                                </td>
                                <td>{log.changes}</td>
                                <td>
    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 
     log.created_at ? new Date(log.created_at).toLocaleString() : 
     log.date_time ? new Date(log.date_time).toLocaleString() : 
     'No Date Available'}
</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No Logs Found for this Module</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MasterActivityLog;