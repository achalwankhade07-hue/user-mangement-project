import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ActivityLog.css";
import { useNavigate } from "react-router-dom"; 

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/activity-log");
      setLogs(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="loading-text">Loading Activity Logs Table...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Logs:</h3>
        <p>{error}</p>
        <button onClick={fetchLogs} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="activity-table-container">
      
      <div className="table-top-bar">
        <button onClick={() => navigate("/dashboard")} className="btn-back">
          ← Back to Dashboard
        </button>
        <h2 className="table-title">Activity Logs Table</h2>
        <button onClick={fetchLogs} className="btn-refresh">
          🔄 Refresh Logs
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="no-logs-msg">No logs available in the database yet. Make some changes in Dashboard!</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-activity-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Performer</th>
                <th>Target User Email</th>
                <th>Action Type</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Specific Changes</th>
                <th>Timestamp (Real-Time)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const isVerified = log.verified === 1 || log.verified === "1" || log.verified === true || log.verified === "Yes";
                
                let finalChangesList = [];
                if (log.changes) {
                  if (Array.isArray(log.changes)) {
                    finalChangesList = log.changes;
                  } else {
                    finalChangesList = [String(log.changes)];
                  }
                }

                return (
                  <tr key={log.id || index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                    {/* 1. Serial Number (Latest entry on top) */}
                    <td><b>{index + 1}</b></td>
                    
                    {/* 2. Performer Details */}
                    <td>
                      <div className="cell-bold">{log.name}</div>
                      <div className="cell-sub">{log.email}</div>
                    </td>
                    
                    {/* 3. Target Email */}
                    <td><span className="email-badge">{log.targetUserEmail}</span></td>
                    
                    {/* 4. Action Text */}
                    <td><span className="action-text-cell">{log.action || "Updated"}</span></td>
                    
                    {/* 5. Status Badge */}
                    <td>
                      <span className={`status-pill ${log.status === "active" ? "pill-active" : "pill-inactive"}`}>
                        {log.status}
                      </span>
                    </td>
                    
                    {/* 6. Verified Status */}
                    <td>
                      <span className={`verified-indicator ${isVerified ? "text-green" : "text-red"}`}>
                        {isVerified ? "Verified ✔" : "NotVerified ✘"}
                      </span>
                    </td>

                   
                    {/* 10. Specific Changes Bullet Points */}
                    <td>
                      <ul className="table-changes-list">
                        {finalChangesList.length > 0 ? (
                          finalChangesList.map((change, idx) => (
                            <li key={idx}>{String(change)}</li>
                          ))
                        ) : (
                          <li className="no-mod-text">Saved without field change</li>
                        )}
                      </ul>
                    </td>
                    
                    <td className="timestamp-cell">
                      <span className="time-badge">{log.time}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;