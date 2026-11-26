import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; 

function DashboardPage() {
  const navigate = useNavigate(); 

  // Database Counts State
  const [totalCountries, setTotalCountries] = useState(0);
  const [totalStates, setTotalStates] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [totalSkills, setTotalSkills] = useState(0);
  const [totalLanguages, setTotalLanguages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/masters-count')
      .then(res => res.json())
      .then(data => {
        setTotalCountries(data.find(d => d.name === 'Countries')?.count || 0);
        setTotalStates(data.find(d => d.name === 'States')?.count || 0);
        setTotalCities(data.find(d => d.name === 'Cities')?.count || 0);
        setTotalSkills(data.find(d => d.name === 'Skills')?.count || 0);
        setTotalLanguages(data.find(d => d.name === 'Languages')?.count || 0);
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading dashboard statistics:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
        ⏳ Connecting to Live MySQL Database...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', padding: '20px', minHeight: '100vh' }}>
      
      {/* Top Navbar Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>📊 Analytics Dashboard</h3>
        <button 
          onClick={() => navigate("/user-access")} 
          style={{ padding: '10px 15px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Panel / Access Control
        </button>
      </div>
      
      {/* ================= 5 TOTAL METRIC CARDS ROW ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Total Countries Box */}
        <div 
          onClick={() => navigate("/country")} 
          title="Go to Country Master"
          style={{ backgroundColor: '#3498db', color: '#fff', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Countries</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>{totalCountries}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Live database entries ↗</div>
        </div>

        {/* Total States Box */}
        <div 
          onClick={() => navigate("/state")} 
          title="Go to State Master"
          style={{ backgroundColor: '#9b59b6', color: '#fff', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Total States</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>{totalStates}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Registered states count ↗</div>
        </div>

        {/* Total Cities Box */}
        <div 
          onClick={() => navigate("/city")} 
          title="Go to City Master"
          style={{ backgroundColor: '#ff9f43', color: '#fff', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Cities</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>{totalCities}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Mapped under states ↗</div>
        </div>

        {/* Registered Skills Box */}
        <div 
          onClick={() => navigate("/skills")} 
          title="Go to Skill Master"
          style={{ backgroundColor: '#2ecc71', color: '#fff', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Registered Skills</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>{totalSkills}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Skills inventory total ↗</div>
        </div>

        {/* Languages Supported Box */}
        <div 
          onClick={() => navigate("/language")} 
          title="Go to Language Master"
          style={{ backgroundColor: '#ec407a', color: '#fff', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Languages Supported</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>{totalLanguages}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Active localization systems ↗</div>
        </div>

      </div>


    </div>
  );
}

export default DashboardPage;