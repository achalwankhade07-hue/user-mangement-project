import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || "Email not provided";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [passError, setPassError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&]).{6,}$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = location.state?.email || "";

    if (!email) {
      alert("Email missing! Please verify OTP first.");
      return;
    }

    let valid = true;
    if (!name.trim()) {
      setNameError("Please enter name");
      valid = false;
    } else {
      setNameError("");
    }

    if (!password) {
      setPassError("Please enter password");
      valid = false;
    } else if (!strongPassword.test(password)) {
      setPassError("Password must have Uppercase, Lowercase, Number & Special Character");
      valid = false;
    } else {
      setPassError("");
    }

    if (!valid) return;

    
    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: password, 
    };

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/register-final", userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/login");
    } catch (error) {
      console.log("Register Error:", error.response?.data || error);
      alert("Failed to save data ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Complete Your Profile</h2>
      <p>Email: <b>{emailFromState}</b></p>

      <form onSubmit={handleRegister} autoCorrect="off" spellCheck="false">
        {/* Name Input - Unique name and autoComplete="none" to stop autofill */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            name="user_full_name_unique" 
            placeholder="Enter Name"
            autoComplete="none" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
          {nameError && <p style={{ color: "red", fontSize: "12px" }}>{nameError}</p>}
        </div>

        <div style={{ marginBottom: "10px", position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="user_password_unique"
            placeholder="Enter Strong Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", paddingRight: "50px", boxSizing: "border-box" }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "5px",
              top: "5px",
              bottom: "5px",
              padding: "0 10px",
              cursor: "pointer",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {passError && <p style={{ color: "red", fontSize: "12px", textAlign: "left" }}>{passError}</p>}

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "10px",
            cursor: "pointer"
          }}
        >
          {loading ? "Registering..." : "Register Now"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;