import { useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from 'react';

import axios from 'axios';

import './Registration.css';

import { Link } from "react-router-dom";





const Registration = () => {

  const navigate = useNavigate();



  const [email, setEmail] = useState('');

  const [error, setError] = useState('');

  const [otp, setOtp] = useState('');

  const [isOtpSent, setIsOtpSent] = useState(false);

  const [timer, setTimer] = useState(60);

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    let interval;

    if (isOtpSent && timer > 0) {

      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);

    }

    return () => clearInterval(interval);

  }, [isOtpSent, timer]);



 const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/send-otp', { 
        email, 
        type: "registration" 
      });

      if (response.status === 200) {
        setIsOtpSent(true);
        setTimer(60);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async (e) => {

    e.preventDefault();

    setLoading(true);



    try {

      const response = await axios.post('http://localhost:5000/verify-otp', { email, otp });



      if (response.status === 200) {

       // alert("OTP Verified Successfully!");

        navigate('/register-Page', { state: { email } });

      }

    } catch (error) {

      alert("Invalid OTP");

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="reg-container">

      <div className="reg-card fade-in">

        <h2 className="form-title">Create Account</h2>

        <p className="form-subtitle">Verify your email to continue</p>



        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>



          <div className="input-field">

            <label>Email Address</label>



            <input

              type="email"

              placeholder="name@example.com"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              disabled={isOtpSent}

            />



            {error && <p style={{ color: "red" }}>{error}</p>}

          </div>



          {isOtpSent && (

            <div className="input-field fade-in">

              <label>Enter 6-digit OTP</label>



              <input

                type="text"

                placeholder="X X X X X X"

                maxLength="6"

                value={otp}

                onChange={(e) => setOtp(e.target.value)}

                required

              />



              <p className="timer">

                Resend OTP in <span>00:{timer < 10 ? `0${timer}` : timer}</span>

              </p>

             

            </div>

          )}



          <button type="submit" className="primary-btn" disabled={loading}>

            {loading ? "Processing..." : isOtpSent ? "Verify Your OTP" : "Send OTP"}

          </button>



          {isOtpSent && (

            <button type="button" className="back-link" onClick={() => setIsOtpSent(false)}>

              Edit Email

            </button>

          )}



<p>

  Already have an account? <Link to="/Login">Login</Link>

</p>







        </form>

      </div>

    </div>

  );

};



export default Registration; 