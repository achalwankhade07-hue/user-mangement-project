import React, { useState, useEffect,user } from "react";
import axios from "axios";
//import jsPDF from 'jspdf';
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
//import UserPrintButton from './UserPrintButton';
import * as XLSX from "xlsx";


// ==========================================
// 1. PRINT TEMPLATE FUNCTION 
// ==========================================
const openPrintWindow = (user) => {
  if (!user) return;

  // LocalStorage Sync
  localStorage.setItem("print_user_data", JSON.stringify(user));

  const userDob = (user.dob || user.date_of_birth)
    ? String(user.dob || user.date_of_birth).split('T')[0]
    : 'N/A';

  const userSkills = Array.isArray(user.skills)
    ? user.skills.join(', ')
    : (user.skills || 'N/A');

  const userLanguages = Array.isArray(user.languages || user.language)
    ? (user.languages || user.language).join(', ')
    : (user.languages || user.language || 'N/A');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Users Information Sheet - ${user.name || 'User Data'}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 30px; color: #000; background: #fff; }
          .sheet-container { max-width: 750px; margin: auto; border: 1px solid #ccc; padding: 25px; }
          .main-title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 25px; }
          .header-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
          .meta-line { border-bottom: 1px solid #000; display: inline-block; min-width: 180px; text-align: center; }
          .section-header { background-color: #555; color: #fff; text-align: center; font-weight: bold; padding: 6px; font-size: 14px; margin: 15px 0; text-transform: uppercase; }
          .field-row { display: flex; margin-bottom: 10px; font-size: 14px; align-items: flex-end; }
          .field-label { width: 140px; font-weight: bold; }
          .field-value { flex: 1; border-bottom: 1px solid #000; padding-bottom: 2px; padding-left: 5px; }
          .grid-2 { display: flex; gap: 20px; }
          .grid-2 > div { flex: 1; }
          @media print { body { padding: 0; } .sheet-container { border: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          <h1 class="main-title">Users Information Sheet</h1>
          <div class="header-meta">
            <div>Company Name: <span class="meta-line">My Application</span></div>
            <div>Date: <span class="meta-line">${new Date().toLocaleDateString()}</span></div>
          </div>

          <div class="section-header">Users Information</div>

          <div class="field-row">
            <div class="field-label">User ID:</div>
            <div class="field-value">${user.id || 'N/A'}</div>
          </div>

          <div class="field-row">
            <div class="field-label">Full Name:</div>
            <div class="field-value">${user.name || 'N/A'}</div>
          </div>

          <div class="grid-2">
            <div class="field-row">
              <div class="field-label">Email:</div>
              <div class="field-value">${user.email || 'N/A'}</div>
            </div>
            <div class="field-row">
              <div class="field-label">Mobile Number:</div>
              <div class="field-value">${user.mobile_number || user.mobile || 'N/A'}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field-row">
              <div class="field-label">Status:</div>
              <div class="field-value">${user.status || 'N/A'}</div>
            </div>
            <div class="field-row">
              <div class="field-label">DOB:</div>
              <div class="field-value">${userDob}</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-label">Gender:</div>
            <div class="field-value">${user.gender || 'N/A'}</div>
          </div>

          <div class="section-header">Additional Profile Details</div>

          <div class="field-row">
            <div class="field-label">Skills:</div>
            <div class="field-value">${userSkills}</div>
          </div>

          <div class="field-row">
            <div class="field-label">Languages:</div>
            <div class="field-value">${userLanguages}</div>
          </div>

          <div class="field-row">
            <div class="field-label">Address:</div>
            <div class="field-value">${user.address || 'N/A'}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
    </html>
  `;

const blob = new Blob([htmlContent], { type: "text/html" });

  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, "_blank"); 
};
// Master Sidebar List
const masterNavItems = [
  { icon: "🏠", label: "Dashboard", path: "/dashboardpage", key: "DashboardPage" },
  { icon: "👤", label: "Users",         path: "/dashboard",     key: "Users" },
  { icon: "🌍", label: "Country",       path: "/country",       key: "Country" },
  { icon: "🗺️", label: "State",         path: "/state",         key: "State" },
  { icon: "🏙️", label: "City",          path: "/city",          key: "City" },
  { icon: "🌐", label: "Language",      path: "/language",      key: "Language" },
  { icon: "🛠️", label: "Skills",        path: "/skills",        key: "Skills" },
];

// Country, State  City  interconnected Data Object
const locationData = {
  "India": {
    states: ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat"],
    cities: {
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
      "Delhi": ["New Delhi", "Dwarka", "Rohini"],
      "Karnataka": ["Bangalore", "Mysore", "Hubli"],
      "Telangana": ["Hyderabad", "Warangal"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara"]
    }
  },
  "United States": {
    states: ["California", "New York", "Texas"],
    cities: {
      "California": ["Los Angeles", "San Francisco", "San Diego"],
      "New York": ["New York City", "Buffalo", "Rochester"],
      "Texas": ["Houston", "Austin", "Dallas"]
    }
  },
  "United Kingdom": {
    states: ["England", "Scotland", "Wales"],
    cities: {
      "England": ["London", "Manchester", "Birmingham"],
      "Scotland": ["Edinburgh", "Glasgow"],
      "Wales": ["Cardiff", "Swansea"]
    }
  }
};

function Dashboard() {
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({ 
    name: "", email: "", password: "", 
    title: "", dob: "", mobile: "", gender: "", state: "", city: "", address: "",
    country: "", skills: [], language: "", upload_files: [], editor_content: ""
  });

  const [editUserData, setEditUserData] = useState({ 
    id: "", name: "", email: "", password: "", profile_pic: null,
    title: "", dob: "", mobile: "", gender: "", state: "", city: "", address: "",
    country: "", skills: [], language: "", upload_files: [], editor_content: ""
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
 // const [, setSelectedUserForPrint] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showEditReqs, setShowEditReqs] = useState(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEditPasswordFocused, setIsEditPasswordFocused] = useState(false);

  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [search, setSearch] = useState("");

  const [isBlockedByAdmin, setIsBlockedByAdmin] = useState(false);
  const [duplicateEmailMsg, setDuplicateEmailMsg] = useState("");
  const [accessDeniedMsg, setAccessDeniedMsg] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allowedPages, setAllowedPages] = useState([]);

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,12}$/;
  const skillsOptions = ["HTML", "CSS", "JavaScript", "React", "Node.js", "MySQL", "MongoDB", "Python"];

  // Fetch Permissions & Dynamic Sidebar (No Force Redirect)
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (loggedUser && loggedUser.id) {
        try {
          const response = await axios.get(`http://localhost:5000/api/get-permissions/${loggedUser.id}`);
          if (response.data.success) {
            setAllowedPages(response.data.pages);
            
          }
        } catch (error) {
          console.error("Sidebar permissions fetch failed:", error);
        }
      }
    };
    fetchUserPermissions();
  }, [loggedUser]);

  const navItems = masterNavItems.filter(item => {
  return allowedPages.some(page => {
    if (!page) return false;
    
    const cleanPage = page.toString().toLowerCase().trim();
    const cleanKey = item.key.toString().toLowerCase().trim();
    const cleanLabel = item.label.toString().toLowerCase().trim();
    const cleanPath = item.path.toString().toLowerCase().trim().replace("/", ""); 

    return (
      cleanPage === cleanKey || 
      cleanPage === cleanLabel ||
      cleanKey.includes(cleanPage) || 
      cleanPage.includes(cleanKey) ||
      cleanPath === cleanPage
    );
  });
});

  const handleLogoutAction = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Live Block Status Checker
  useEffect(() => {
    const checkStatusFromServer = async () => {
      if (loggedUser && loggedUser.id) {
        try {
          const res = await axios.get(`http://localhost:5000/user-status/${loggedUser.id}`);
          if (res.data.status === "inactive") {
            setAccessDeniedMsg("🚫 Your account is deactivated! Please contact admin.");
            setIsBlockedByAdmin(true);
            setTimeout(() => { handleLogoutAction(); }, 3000);
          }
        } catch (err) { console.error("Auto-logout check failed:", err); }
      }
    };
    const interval = setInterval(checkStatusFromServer, 5000);
    return () => clearInterval(interval);
  }, [loggedUser]);

  const getRequirements = (pw) => {
    const password = pw || "";
    return [
      { label: "Minimum 8 characters",   met: password.length >= 8 },
      { label: "Maximum 12 characters",  met: password.length <= 12 && password.length > 0 },
      { label: "1 Uppercase & 1 Lowercase", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { label: "At least 1 number",      met: /[0-9]/.test(password) },
      { label: "1 special symbol",       met: /[!@#$%^&*]/.test(password) },
    ];
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Handlers for ADD USER
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "country") {
        updated.state = "";
        updated.city = "";
      } else if (name === "state") {
        updated.city = "";
      }
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (name === "email") setDuplicateEmailMsg("");
  };

  const handleAddSkillDropdown = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !newUser.skills.includes(selectedValue)) {
      setNewUser(prev => ({ ...prev, skills: [...prev.skills, selectedValue] }));
    }
    e.target.value = "";
  };

  const removeAddSkillTag = (skillToRemove) => {
    setNewUser(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleAddFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewUser(prev => ({ ...prev, upload_files: [...prev.upload_files, ...selectedFiles] }));
  };

  const removeAddFile = (indexToRemove) => {
    setNewUser(prev => ({ ...prev, upload_files: prev.upload_files.filter((_, idx) => idx !== indexToRemove) }));
  };

  // Handlers for EDIT USER
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_pic") {
      setEditUserData(prev => ({ ...prev, profile_pic: files[0] }));
    } else {
      setEditUserData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === "country") {
          updated.state = "";
          updated.city = "";
        } else if (name === "state") {
          updated.city = "";
        }
        return updated;
      });
    }
    if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleEditSkillDropdown = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !editUserData.skills.includes(selectedValue)) {
      setEditUserData(prev => ({ ...prev, skills: [...prev.skills, selectedValue] }));
    }
    e.target.value = "";
  };

  const removeEditSkillTag = (skillToRemove) => {
    setEditUserData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setEditUserData(prev => ({ ...prev, upload_files: [...prev.upload_files, ...selectedFiles] }));
  };

  const removeEditFile = (indexToRemove) => {
    setEditUserData(prev => ({ ...prev, upload_files: prev.upload_files.filter((_, idx) => idx !== indexToRemove) }));
  };

  // Add User Database Submit
  const addUser = async (e) => {
    if (e) e.preventDefault();
    let validationErrors = {};
    if (!newUser.name.trim()) validationErrors.name = "Please enter name";
    if (!newUser.email.trim()) {
      validationErrors.email = "Please enter email";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!newUser.password) {
      validationErrors.password = "Please enter password";
    } else if (!strongPassword.test(newUser.password)) {
      validationErrors.password = "Password does not meet requirements below";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const formData = new FormData();
      Object.keys(newUser).forEach(key => {
        if (key === 'skills') {
          formData.append(key, JSON.stringify(newUser.skills));
        } else if (key === 'upload_files') {
          newUser.upload_files.forEach(file => formData.append("upload_files", file));
        } else {
          formData.append(key, newUser[key]);
        }
      });
      formData.append('status', 'active');
      const res = await axios.post("http://localhost:5000/add-user", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setNewUser({ name:"",email:"",password:"",title:"",dob:"",mobile:"",gender:"",state:"",city:"",address:"",country:"",skills:[],language:"",upload_files:[],editor_content:"" });
        setErrors({});
        setDuplicateEmailMsg("");
        setShowPopup(false);
        fetchUsers();
      } else {
        setDuplicateEmailMsg("This email already exists! Try another.");
      }
    } catch (error) { setDuplicateEmailMsg("Email already exists or Server Error"); }
  };

  // Load User Data into Edit Form
  const editUser = (user) => {
    let formattedDate = "";
    if (user.dob) {
      const d = new Date(user.dob);
      formattedDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    let userSkills = [];
    if (user.skills) {
      try { userSkills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills; }
      catch (e) { userSkills = []; }
    }
    setEditUserData({ 
      id: user.id, name: user.name||"", email: user.email||"", password: "", profile_pic: null,
      title: user.title||"", dob: formattedDate, mobile: user.mobile||"", gender: user.gender||"",
      state: user.state||"", city: user.city||"", address: user.address||"", country: user.country||"", skills: userSkills,
      language: user.language||"", upload_files: [], editor_content: user.editor_content||""
    });
    setEditErrors({});
    setShowEditPopup(true);
  };

  // Update User Details Database Submit
  const updateUser = async (e) => {
    if (e) e.preventDefault();
    let validationEditErrors = {};
    if (!editUserData.name||!editUserData.name.toString().trim()) validationEditErrors.name = "Please enter name";
    if (!editUserData.email||!editUserData.email.toString().trim()) {
      validationEditErrors.email = "Please enter email";
    } else if (!/\S+@\S+\.\S+/.test(editUserData.email)) {
      validationEditErrors.email = "Invalid email format";
    }
    if (editUserData.password && !strongPassword.test(editUserData.password)) {
      validationEditErrors.password = "Weak password (Check requirements below)";
    }
    setEditErrors(validationEditErrors);
    if (Object.keys(validationEditErrors).length > 0) return;

    try {
      const formData = new FormData();
      formData.append("name", editUserData.name);
      formData.append("email", editUserData.email);
      formData.append("title", editUserData.title);
      formData.append("dob", editUserData.dob);
      formData.append("mobile", editUserData.mobile);
      formData.append("gender", editUserData.gender);
      formData.append("state", editUserData.state);
      formData.append("city", editUserData.city);
      formData.append("address", editUserData.address);
      formData.append("country", editUserData.country);
      formData.append("skills", JSON.stringify(editUserData.skills));
      formData.append("language", editUserData.language);
      formData.append("editor_content", editUserData.editor_content);
      if (editUserData.password && editUserData.password.trim() !== "") formData.append("password", editUserData.password);
      if (editUserData.profile_pic) formData.append("profile_pic", editUserData.profile_pic);
      editUserData.upload_files.forEach(file => formData.append("upload_files", file));
      
      const res = await axios.put(`http://localhost:5000/update-user/${editUserData.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setShowEditPopup(false);
        fetchUsers();
      }
    } catch (err) { console.error("Update failed", err); alert("Database Error: Update failed"); }
  };

  const handleCancelAdd = (e) => {
    e.preventDefault();
    setShowPopup(false);
    setNewUser({ name:"",email:"",password:"",title:"",dob:"",mobile:"",gender:"",state:"",city:"",address:"",country:"",skills:[],language:"",upload_files:[],editor_content:"" });
    setErrors({});
    setDuplicateEmailMsg("");
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    setShowEditPopup(false);
    setEditErrors({});
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await axios.put(`http://localhost:5000/toggle-status/${user.id}`, { status: newStatus });
      fetchUsers();
    } catch (err) { alert("Failed to update status"); }
  };

  const exportToExcel = () => {
    if (filteredUsers.length === 0) { 
      alert("Excel me export karne ke liye koi data nahi hai!");
      return; 
    }
    const excelData = filteredUsers.map((user, index) => ({
      "Sr. No.": index + 1,
      "Name": user.name || "N/A",
      "Email": user.email || "N/A",
      "Title": user.title || "N/A",
      "Mobile": user.mobile || "N/A",
      "DOB": user.dob ? new Date(user.dob).toLocaleDateString() : "N/A",
      "Gender": user.gender || "N/A",
      "Country": user.country || "N/A",
      "State": user.state || "N/A",
      "City": user.city || "N/A",
      "Language": user.language || "N/A",
      "Address": user.address || "N/A",
      "Status": user.status === "active" ? "Active" : "Inactive",
      "Verified": user.isVerified === 1 ? "Verified" : "Not Verified",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users Data");
    XLSX.writeFile(workbook, "Users_Dashboard_Data.xlsx");
  };

  const filteredUsers = users
    .filter((user) => user.name && user.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.toLowerCase().startsWith(search.toLowerCase()) ? -1 : 1);

  const addReqs = getRequirements(newUser.password);
  const addProgress = (addReqs.filter(r => r.met).length / addReqs.length) * 100;
  const editReqs = getRequirements(editUserData.password);
  const editProgress = (editReqs.filter(r => r.met).length / editReqs.length) * 100;

  const sidebarWidth = sidebarOpen ? "220px" : "60px";

    
  //const UserRow = ({ user }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>

      {/* ==================== SIDEBAR ==================== */}
      <div style={{
        width: sidebarWidth, minHeight: "100vh", background: "#1e2a3a",
        display: "flex", flexDirection: "column", transition: "width 0.3s",
        overflow: "hidden", position: "fixed", top: 0, left: 0, zIndex: 100,
        boxShadow: "2px 0 8px rgba(0,0,0,0.2)"
      }}>
        
        <div style={{ padding: "15px 12px", borderBottom: "1px solid #2d3f52", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "60px" }}>
          {sidebarOpen && <span style={{ color: "#fff", fontWeight: "700", fontSize: "15px", whiteSpace: "nowrap" }}>⚡ Admin Panel</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "#2d3f52", border: "none", color: "#fff", cursor: "pointer", padding: "6px 9px", borderRadius: "5px", fontSize: "13px", flexShrink: 0 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {sidebarOpen && (
          <div style={{ padding: "15px 12px", borderBottom: "1px solid #2d3f52", display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={loggedUser?.profile_pic ? `http://localhost:5000/upload/${loggedUser.profile_pic}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="profile"
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #3b82f6" }}
            />
            <div>
              <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}>{loggedUser?.name || "User"}</div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>Admin</div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: "10px 0" }}>
          {navItems.map((item) => (
            <div 
              key={item.key} 
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: sidebarOpen ? "12px 18px" : "12px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                cursor: "pointer", color: "#cbdff4", fontSize: "14px",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#2d3f52"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
              title={!sidebarOpen ? item.label : ""}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div onClick={handleLogoutAction}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: sidebarOpen ? "14px 18px" : "14px 0",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            cursor: "pointer", color: "#f87171", borderTop: "1px solid #2d3f52", fontSize: "13px",
          }}
          onMouseEnter={e => e.currentTarget.style.background="#2d3f52"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
          title={!sidebarOpen ? "Logout" : ""}
        >
          <span style={{ fontSize: "18px" }}>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div style={{ marginLeft: sidebarWidth, flex: 1, padding: "20px", transition: "margin-left 0.3s" }}>

        {isBlockedByAdmin && (
          <div className="overlay" style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.85)" }}>
            <div className="popup-box" style={{ textAlign: "center", borderTop: "5px solid red" }}>
              <h2 style={{ color: "red" }}>🚫 Access Denied</h2>
              <p style={{ fontSize: "18px", margin: "20px 0" }}>
                <strong>{accessDeniedMsg}</strong>
              </p>
            </div>
          </div>
        )}


{/* 👑 ONLY SUPERADMIN CODE */}
{user && user.role === 'superadmin' && (
    <div style={{ marginTop: '25px', padding: '15px', border: '2px solid #ff4d4d', backgroundColor: '#fff5f5', borderRadius: '6px' }}>
        <h3 style={{ color: '#cc0000', margin: '0 0 10px 0' }}>👑 Superadmin Panel</h3>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            {/* 1. Manage Countries Link */}
            <button 
                onClick={() => navigate('/country-master')} 
                style={{ background: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                🌐 Go to Country Master
            </button>

            {/* 2. Manage Admins Link */}
            <button 
                onClick={() => navigate('/manage-admins')} 
                style={{ background: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                👥 Manage All Admins
            </button>
        </div>
    </div>
)}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>User Dashboard</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f1f1f1", padding: "8px 15px", borderRadius: "25px" }}>
            <img 
              src={loggedUser?.profile_pic ? `http://localhost:5000/upload/${loggedUser.profile_pic}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
              alt="profile" 
              style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} 
            />
            <span style={{ fontWeight: "bold" }}>{loggedUser?.name || "User"}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "8px", width: "200px" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => { setNewUser({ name:"",email:"",password:"",title:"",dob:"",mobile:"",gender:"",state:"",city:"",address:"",country:"",skills:[],language:"",upload_files:[],editor_content:"" }); setErrors({}); setShowPopup(true); }} style={{ background: "green", color: "white", padding: "10px", cursor: "pointer", border: "none" }}>+ Add User</button>
            <button onClick={exportToExcel} style={{ background: "#217346", color: "white", padding: "10px", cursor: "pointer", border: "none", borderRadius: "4px", fontWeight: "bold" }}>📊 Export to Excel</button>
            <button onClick={() => navigate("/activity-log")} style={{ background: "#007bff", color: "white", padding: "10px", cursor: "pointer", border: "none" }}>Activity Log</button>
            <button onClick={handleLogoutAction} style={{ background: "red", color: "white", padding: "10px", cursor: "pointer", border: "none" }}>Logout</button>
          </div>
        </div>

<table border="1" cellPadding="10" style={{ marginTop: "0", width: "100%", borderCollapse: "collapse" }}>
  <thead>
    <tr>
      <th>Id</th>
      <th>Name</th>
      <th>Email</th>
      <th>Edit</th>
      <th>Status</th>
      <th>Verified</th>
      <th>User Access</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {filteredUsers.map((user, index) => (
      <tr key={user.id}>
        <td>{index + 1}</td>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <button onClick={() => editUser(user)}>✏️</button>
        </td>
        <td>
          <button
            onClick={() => toggleStatus(user)}
            style={{
              background: user.status === "active" ? "#28a745" : "#dc3545",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "80px",
            }}
          >
            {user.status === "active" ? "Active" : "Inactive"}
          </button>
        </td>
        <td>
          <button
            style={{
              background: user.isVerified === 1 ? "green" : "red",
              color: "white",
              border: "none",
              padding: "5px 8px",
              cursor: "pointer",
            }}
          >
            {user.isVerified === 1 ? "Verified ✔" : "Not Verified ✖"}
          </button>
        </td>
        <td style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/UserAccessPage", { state: { id: user.id, name: user.name } })}
            style={{
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚙️</span> User Access
          </button>
        </td>
        {/* Action Column - Print Button Added Here */}
      
<td style={{ textAlign: "center" }}>
  <button
    type="button"
    onClick={() =>window.open (`http://localhost:5000/api/generate-pdf/${user.id || user._id}`, '_blank')}
    style={{
      backgroundColor: "#0284c7",
      color: "white",
      padding: "8px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    🖨️ Print Data
  </button>
</td>

</tr>
  ))}
</tbody>
</table>
  
  
      {/* ==================== ADD POPUP ==================== */}
      {showPopup && (
        <div className="overlay">
          <div className="popup-box" style={{ maxHeight: "90vh", overflowY: "auto", position: "relative", width: "750px", padding: "25px" }}>
            <button onClick={handleCancelAdd} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            <h3>Add New User</h3>
            {duplicateEmailMsg && <p style={{ color: "red", background: "#fee", padding: "8px", borderRadius: "4px", fontSize: "13px" }}>⚠️ {duplicateEmailMsg}</p>}

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <select name="title" value={newUser.title} onChange={handleAddChange} style={{ width: "30%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}>
                  <option value="">Select Title</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              </div>

              <div>
                <div className="input-box" style={{ marginBottom: errors.name ? "5px" : "15px" }}>
                  <input name="name" type="text" placeholder=" " value={newUser.name} onChange={handleAddChange} style={{ borderColor: errors.name ? "red" : "#ccc" }} />
                  <label>Enter Name</label>
                </div>
                {errors.name && <p style={{ color: "red", fontSize: "11px", textAlign: "left", margin: "0 0 10px 5px" }}>{errors.name}</p>}
              </div>

              <div>
                <div className="input-box" style={{ marginBottom: errors.email ? "5px" : "15px" }}>
                  <input name="email" type="text" placeholder=" " value={newUser.email} onChange={handleAddChange} style={{ borderColor: (errors.email || duplicateEmailMsg) ? "red" : "#ccc" }} />
                  <label>Enter Email</label>
                </div>
                {errors.email && <p style={{ color: "red", fontSize: "11px", textAlign: "left", margin: "0 0 10px 5px" }}>{errors.email}</p>}
              </div>

              <div className="input-box" style={{ marginBottom: "15px" }}>
                <input name="mobile" type="text" placeholder=" " value={newUser.mobile} onChange={handleAddChange} />
                <label>Mobile Number</label>
              </div>

              <div className="input-box" style={{ marginBottom: "15px" }}>
                <input name="dob" type="date" placeholder=" " value={newUser.dob} onChange={handleAddChange} />
                <label>Date of Birth</label>
              </div>

              <div style={{ textAlign: "left", marginBottom: "15px", paddingLeft: "5px", display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ color: "#666", fontSize: "14px" }}>Gender: </label>
                <input type="radio" name="gender" value="Male" onChange={handleAddChange} /> Male
                <input type="radio" name="gender" value="Female" onChange={handleAddChange} /> Female
              </div>

              {/* Connected Country Selection */}
              <div>
                <label style={{ display: "block", fontSize: "12px", textAlign: "left", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Country</label>
                <select name="country" value={newUser.country} onChange={handleAddChange} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="">Select Country</option>
                  {Object.keys(locationData).map((country, idx) => (<option key={idx} value={country}>{country}</option>))}
                </select>
              </div>

              {/* Connected State Selection */}
              <div>
                <label style={{ display: "block", fontSize: "12px", textAlign: "left", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>State</label>
                <select name="state" value={newUser.state} onChange={handleAddChange} disabled={!newUser.country} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="">Select State</option>
                  {newUser.country && locationData[newUser.country]?.states.map((st, idx) => (<option key={idx} value={st}>{st}</option>))}
                </select>
              </div>

              {/* Connected City Selection */}
              <div>
                <label style={{ display: "block", fontSize: "12px", textAlign: "left", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>City</label>
                <select name="city" value={newUser.city} onChange={handleAddChange} disabled={!newUser.state} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="">Select City</option>
                  {newUser.state && locationData[newUser.country]?.cities[newUser.state]?.map((ct, idx) => (<option key={idx} value={ct}>{ct}</option>))}
                </select>
              </div>

              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Skills</label>
                {newUser.skills.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {newUser.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: "#007bff", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        {skill} <b onClick={() => removeAddSkillTag(skill)} style={{ cursor: "pointer", color: "#ffc107", fontSize: "13px" }}>✖</b>
                      </span>
                    ))}
                  </div>
                )}
                <select onChange={handleAddSkillDropdown} defaultValue="" style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="" disabled>-- Choose Skills --</option>
                  {skillsOptions.map((skill, idx) => (
                    <option key={idx} value={skill} disabled={newUser.skills.includes(skill)}>
                      {skill} {newUser.skills.includes(skill) ? "(Selected)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: "left", gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Language</label>
                <div style={{ display: "flex", gap: "20px", alignItems: "center", padding: "5px 0" }}>
                  {["English", "Hindi", "Marathi"].map((lang, idx) => (
                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontSize: "14px" }}>
                      <input type="radio" name="language" value={lang} checked={newUser.language === lang} onChange={handleAddChange} /> {lang}
                    </label>
                  ))}
                </div>
              </div>

              <div className="input-box" style={{ gridColumn: "span 2", marginBottom: "15px" }}>
                <textarea name="address" placeholder=" " value={newUser.address} onChange={handleAddChange}></textarea>
                <label>Address</label>
              </div>

              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Upload Files</label>
                <div style={{ display: "flex", border: "1px solid #ccc", borderRadius: "4px", overflow: "hidden", height: "40px", alignItems: "center", background: "#fff" }}>
                  <label style={{ background: "#eee", padding: "0 15px", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid #ccc", cursor: "pointer", fontSize: "13px", color: "#555" }}>
                    Choose Files
                    <input type="file" name="upload_files" multiple onChange={handleAddFileChange} style={{ display: "none" }} />
                  </label>
                  <span style={{ paddingLeft: "10px", color: "#777", fontSize: "13px" }}>
                    {newUser.upload_files.length > 0 ? `${newUser.upload_files.length} file(s) selected` : "No file chosen"}
                  </span>
                </div>
                {newUser.upload_files.length > 0 && (
                  <div style={{ marginTop: "10px", background: "#f9f9f9", padding: "10px", borderRadius: "4px", border: "1px solid #eee" }}>
                    <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "13px" }}>
                      {newUser.upload_files.map((file, idx) => (
                        <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                          <span>📄 {file.name}</span>
                          <button type="button" onClick={() => removeAddFile(idx)} style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>✖</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Editor file</label>
                <JoditEditor value={newUser.editor_content} onChange={newContent => setNewUser(prev => ({ ...prev, editor_content: newContent }))} />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <div className="label-row">
                  <span className="info-icon" onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} style={{ cursor: "pointer" }}>ⓘ</span>
                  {showInfo && (
                    <div className="tooltip-box">
                      • Maximum 12 characters <br />
                      • Minimum 8 characters <br />
                      • Uppercase & lowercase <br />
                      • At least 1 number <br />
                      • 1 special symbol
                    </div>
                  )}
                </div>
                <div className="input-box" style={{ marginBottom: errors.password ? "5px" : "15px" }}>
                  <input name="password" type="password" placeholder=" " value={newUser.password} autoComplete="new-password" onChange={handleAddChange} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} style={{ borderColor: errors.password ? "red" : "#ccc" }} />
                  <label>Enter Password</label>
                </div>
                {errors.password && <p style={{ color: "red", fontSize: "11px", textAlign: "left", margin: "0 0 10px 5px" }}>{errors.password}</p>}
                
                {(isPasswordFocused || newUser.password.length > 0) && (
                  <div style={{ textAlign: "left", marginTop: "5px", padding: "10px", background: "#f9f9f9", borderRadius: "5px" }}>
                    <div style={{ width: "100%", height: "8px", background: "#e0e0e0", borderRadius: "5px", marginBottom: "10px" }}>
                      <div style={{ width: `${addProgress}%`, height: "100%", background: addProgress === 100 ? "green" : "orange", transition: "0.3s" }}></div>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "11px" }}>
                      {addReqs.map((req, idx) => (
                        <li key={idx} style={{ color: req.met ? "green" : "red", display: "flex", alignItems: "center", gap: "5px" }}>
                          {req.met ? "✔" : "✖"} {req.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end", gridColumn: "span 2" }}>
                <button style={{ background: "#28a745", color: "white", padding: "6px 15px", fontSize: "14px", cursor: "pointer", border: "none", borderRadius: "4px" }} onClick={addUser}>Add</button>
                <button style={{ background: "#dc3545", color: "white", padding: "6px 15px", fontSize: "14px", cursor: "pointer", border: "none", borderRadius: "4px" }} onClick={handleCancelAdd}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT POPUP ==================== */}
      {showEditPopup && (
        <div className="overlay">
          <div className="popup-box" style={{ maxHeight: "90vh", overflowY: "auto", position: "relative", width: "750px", padding: "25px" }}>
            <button onClick={handleCancelEdit} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            <h3>Edit User Details</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <select name="title" value={editUserData.title} onChange={handleEditChange} style={{ width: "30%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}>
                  <option value="">Select Title</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              </div>

              <div>
                <div className="input-box" style={{ marginBottom: editErrors.name ? "5px" : "15px" }}>
                  <input name="name" type="text" placeholder=" " value={editUserData.name} onChange={handleEditChange} style={{ borderColor: editErrors.name ? "red" : "#ccc" }} />
                  <label>Enter Name</label>
                </div>
                {editErrors.name && <p style={{ color: "red", fontSize: "11px", textAlign: "left", margin: "0 0 10px 5px" }}>{editErrors.name}</p>}
              </div>

              <div>
                <div className="input-box" style={{ marginBottom: editErrors.email ? "5px" : "15px" }}>
                  <input name="email" type="text" placeholder=" " value={editUserData.email} onChange={handleEditChange} style={{ borderColor: editErrors.email ? "red" : "#ccc" }} />
                  <label>Enter Email</label>
                </div>
                {editErrors.email && <p style={{ color: "red", fontSize: "11px", textAlign: "left", margin: "0 0 10px 5px" }}>{editErrors.email}</p>}
              </div>

              <div className="input-box" style={{ marginBottom: "15px" }}>
                <input name="mobile" type="text" placeholder=" " value={editUserData.mobile} onChange={handleEditChange} />
                <label>Mobile Number</label>
              </div>

              <div className="input-box" style={{ marginBottom: "15px" }}>
                <input name="dob" type="date" placeholder=" " value={editUserData.dob} onChange={handleEditChange} />
                <label>Date of Birth</label>
              </div>

              <div style={{ textAlign: "left", marginBottom: "15px", paddingLeft: "5px", display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ color: "#666", fontSize: "14px" }}>Gender: </label>
                <input type="radio" name="gender" value="Male" checked={editUserData.gender === "Male"} onChange={handleEditChange} /> Male
                <input type="radio" name="gender" value="Female" checked={editUserData.gender === "Female"} onChange={handleEditChange} /> Female
              </div>

              {/* Connected Country Selection for Edit */}
              <div>
                <label style={{ display: "block", fontSize: "12px", textAlign: "left", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Country</label>
                <select name="country" value={editUserData.country} onChange={handleEditChange} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="">Select Country</option>
                  {Object.keys(locationData).map((country, idx) => (<option key={idx} value={country}>{country}</option>))}
                </select>
              </div>

              {/* Connected State Selection for Edit */}
              <div>
                <label style={{ display: "block", fontSize: "12px", textAlign: "left", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>State</label>
                <select name="state" value={editUserData.state} onChange={handleEditChange} disabled={!editUserData.country} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="">Select State</option>
                  {editUserData.country && locationData[editUserData.country]?.states.map((st, idx) => (<option key={idx} value={st}>{st}</option>))}
                </select>
              </div>

              {/* Connected City Selection for Edit */}
              <div>
                <label style={{ display: "block", fontSize: "12px", textAlign: "left", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>City</label>
                <select name="city" value={editUserData.city} onChange={handleEditChange} disabled={!editUserData.state} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="">Select City</option>
                  {editUserData.state && locationData[editUserData.country]?.cities[editUserData.state]?.map((ct, idx) => (<option key={idx} value={ct}>{ct}</option>))}
                </select>
              </div>

              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Skills</label>
                {editUserData.skills && editUserData.skills.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {editUserData.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: "#007bff", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        {skill} <b onClick={() => removeEditSkillTag(skill)} style={{ cursor: "pointer", color: "#ffc107", fontSize: "13px" }}>✖</b>
                      </span>
                    ))}
                  </div>
                )}
                <select onChange={handleEditSkillDropdown} defaultValue="" style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "43px", background: "#fff" }}>
                  <option value="" disabled>-- Choose Skills --</option>
                  {skillsOptions.map((skill, idx) => (
                    <option key={idx} value={skill} disabled={editUserData.skills && editUserData.skills.includes(skill)}>
                      {skill} {editUserData.skills && editUserData.skills.includes(skill) ? "(Selected)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: "left", gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Language</label>
                <div style={{ display: "flex", gap: "20px", alignItems: "center", padding: "5px 0" }}>
                  {["English", "Hindi", "Marathi"].map((lang, idx) => (
                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontSize: "14px" }}>
                      <input type="radio" name="language" value={lang} checked={editUserData.language === lang} onChange={handleEditChange} /> {lang}
                    </label>
                  ))}
                </div>
              </div>

              <div className="input-box" style={{ gridColumn: "span 2", marginBottom: "15px" }}>
                <textarea name="address" placeholder=" " value={editUserData.address} onChange={handleEditChange}></textarea>
                <label>Address</label>
              </div>

              {/* Profile Picture Upload Field with restrictions */}
              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Profile Picture</label>
                <div style={{ display: "flex", border: "1px solid #ccc", borderRadius: "4px", overflow: "hidden", height: "40px", alignItems: "center", background: "#fff" }}>
                  <label style={{ background: "#eee", padding: "0 15px", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid #ccc", cursor: "pointer", fontSize: "13px", color: "#555" }}>
                    Browse
                    <input type="file" name="profile_pic" onChange={handleEditChange} style={{ display: "none" }} />
                  </label>
                  <span style={{ paddingLeft: "10px", color: "#777", fontSize: "13px" }}>
                    {editUserData.profile_pic ? editUserData.profile_pic.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Upload Files</label>
                <div style={{ display: "flex", border: "1px solid #ccc", borderRadius: "4px", overflow: "hidden", height: "40px", alignItems: "center", background: "#fff" }}>
                  <label style={{ background: "#eee", padding: "0 15px", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid #ccc", cursor: "pointer", fontSize: "13px", color: "#555" }}>
                    Choose Files
                    <input type="file" name="upload_files" multiple onChange={handleEditFileChange} style={{ display: "none" }} />
                  </label>
                  <span style={{ paddingLeft: "10px", color: "#777", fontSize: "13px" }}>
                    {editUserData.upload_files.length > 0 ? `${editUserData.upload_files.length} file(s) selected` : "No file chosen"}
                  </span>
                </div>
                {editUserData.upload_files.length > 0 && (
                  <div style={{ marginTop: "10px", background: "#f9f9f9", padding: "10px", borderRadius: "4px", border: "1px solid #eee" }}>
                    <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "13px" }}>
                      {editUserData.upload_files.map((file, idx) => (
                        <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                          <span>📄 {file.name}</span>
                          <button type="button" onClick={() => removeEditFile(idx)} style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>✖</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: "span 2", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#dd4b39", marginBottom: "5px", fontWeight: "500" }}>Editor file</label>
                <JoditEditor value={editUserData.editor_content} onChange={newContent => setEditUserData(prev => ({ ...prev, editor_content: newContent }))} />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <div className="label-row">
                  <span className="info-icon" onMouseEnter={() => setShowEditReqs(true)} onMouseLeave={() => setShowEditReqs(false)} style={{ cursor: "pointer" }}>ⓘ</span>
                  {showEditReqs && (
                    <div className="tooltip-box">
                      • Maximum 12 characters <br />
                      • Minimum 8 characters <br />
                      • Uppercase & lowercase <br />
                      • At least 1 number <br />
                      • 1 special symbol
                    </div>
                  )}
                </div>
                <div className="input-box" style={{ marginBottom: editErrors.password ? "5px" : "15px" }}>
                  <input name="password" type="password" placeholder=" " value={editUserData.password} autoComplete="new-password" onChange={handleEditChange} onFocus={() => setIsEditPasswordFocused(true)} onBlur={() => setIsEditPasswordFocused(false)} style={{ borderColor: editErrors.password ? "red" : "#ccc" }} />
                  <label>Enter New Password (Optional)</label>
                </div>
                
                {(isEditPasswordFocused || editUserData.password.length > 0) && (
                  <div style={{ textAlign: "left", marginTop: "5px", padding: "10px", background: "#f9f9f9", borderRadius: "5px" }}>
                    <div style={{ width: "100%", height: "8px", background: "#e0e0e0", borderRadius: "5px", marginBottom: "10px" }}>
                      <div style={{ width: `${editProgress}%`, height: "100%", background: editProgress === 100 ? "green" : "orange", transition: "0.3s" }}></div>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "11px" }}>
                      {editReqs.map((req, idx) => (
                        <li key={idx} style={{ color: req.met ? "green" : "red", display: "flex", alignItems: "center", gap: "5px" }}>
                          {req.met ? "✔" : "✖"} {req.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {editErrors.password && <p style={{ color: "red", fontSize: "12px", margin: "5px 0" }}>{editErrors.password}</p>}
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button style={{ background: "#28a745", color: "white", padding: "6px 15px", fontSize: "14px", cursor: "pointer", border: "none", borderRadius: "4px" }} onClick={updateUser}>Update</button>
              <button style={{ background: "#dc3545", color: "white", padding: "6px 15px", fontSize: "14px", cursor: "pointer", border: "none", borderRadius: "4px" }} onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
</div>
    </div>
  );
}

    
  


export default Dashboard;    