import "./Login.css";
import React, { useState } from "react";
import { Link,} from "react-router-dom";
import axios from "axios";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{6,}$/;

function Login() {
  
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(""); 
  const [passError, setPassError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Please enter email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPassError("Please enter password");
      isValid = false;
    } else {
      setPassError(passwordRegex.test(password) ? "" : "Weak password");
    }

    if (!isValid) return;

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        const user = res.data.user;

        if (user.status === "inactive") {
          setErrorMessage("🚫 Your account is blocked by Admin!");
          setShowVerifyLink(false);
          return;
        }

        if (user.isVerified === 0) {
          setErrorMessage("⚠️ Your account is not verified yet!");
          setShowVerifyLink(true); 
          return;
        }

        localStorage.setItem("isAuth", "true");
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/dashboard";

      } else {
        
        if (res.data.isVerified === 0) {
           setErrorMessage("⚠️ Account not verified!");
           setShowVerifyLink(true); 
        } else {
           setErrorMessage(res.data.message);
           setShowVerifyLink(false); 
        }
      }
    } catch (error) {
      if (error.response?.data?.isVerified === 0) {
        setErrorMessage("⚠️ Account not verified!");
        setShowVerifyLink(true);
      } else {
        setErrorMessage(error.response?.data?.message || "Login Failed ❌");
        setShowVerifyLink(false);
      }
    }
  };

  const openVerifyModal = () => {
    setVerifyEmail(email); 
    setShowModal(true);
  };

  const handleSendOtp = async () => {
    if (!verifyEmail) return setModalMessage("Please enter email");
    
    setModalMessage("Sending OTP...");
    
    try {
        const res = await axios.post("http://localhost:5000/send-otp", { email: verifyEmail });
        if (res.data.success) {
            setIsOtpSent(true);
            setModalMessage("OTP sent successfully! ✅"); 
        }
    } catch (err) {
        setModalMessage(err.response?.data?.message || "Error sending OTP ❌");
    }
};
const handleVerifyOtp = async () => {
    try {
        const res = await axios.post("http://localhost:5000/verify-otp", { 
            email: verifyEmail, 
            otp 
        });

        if (res.data.success) {
            
            localStorage.setItem("isAuth", "true");
            localStorage.setItem("user", JSON.stringify(res.data.user));

            
            setShowModal(false);

           
           window.location.href = "/dashboard";
        }
    } catch (err) {
        setModalMessage(err.response?.data?.message || "Invalid OTP ❌");
    }
};
  return (
    <div className="container">
      <h2 style={{ textAlign: "center" }}>Login Page</h2>

      <form className="form" onSubmit={handleLogin}>
        <div className="input-box">
          <input
            type="email"
            placeholder=""
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              setErrorMessage(""); 
              setShowVerifyLink(false);
            }}
          />
          <label>Enter Email ID</label>
        </div>
        {emailError && <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>}

        <br /><br />
        
        <div className="input-box">
          <input
            type="password"
            placeholder=""
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              setErrorMessage(""); 

              if (value && !passwordRegex.test(value)) {
                setPassError("Weak password");
              } else {
                setPassError("");
              }
            }}
          />
          <label>Enter Password</label>
        </div>
        {passError && <p style={{ color: "red", fontSize: "12px" }}>{passError}</p>}

        {errorMessage && (
          <p style={{ color: "red", fontSize: "14px", marginTop: "10px", fontWeight: "bold", textAlign: "center" }}>
            {errorMessage}
          </p>
        )}

       
        {showVerifyLink && (
          <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
             Not verified? <span style={{ color: "blue", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }} onClick={openVerifyModal}>Verify Here</span>
          </p>
        )}

        <br />

        <button type="submit" className="button">
          Login
        </button>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Don't have an account? <Link to="/register">Registration</Link>
        </p>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Account Verification</h3>
            <p style={{ fontSize: "12px", color: "gray" }}>Enter your registered email to get OTP</p>
            
            <input 
              className="modal-input"
              type="email" 
              placeholder="Enter Email" 
              value={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.value)} 
            />
            
            {!isOtpSent ? (
              <button className="modal-btn" onClick={handleSendOtp}>Send OTP</button>
            ) : (
              <>
                <input 
                  className="modal-input"
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)} 
                />
                <button className="modal-btn verify-btn" onClick={handleVerifyOtp}>Verify & Login</button>
              </>
            )}
            
            {modalMessage && <p style={{ fontSize: "13px", marginTop: "10px" }}>{modalMessage}</p>}
            
            <button className="close-btn" onClick={() => {
                setShowModal(false);
                setModalMessage("");
                setIsOtpSent(false);
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;