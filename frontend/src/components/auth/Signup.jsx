import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setCurrentUser } = useAuth();
    
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post("http://localhost:3000/signup", {
                email, password, username
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);
            setCurrentUser(res.data.userId);
            window.location.href = '/';
        } catch(err) {
            console.error(err);
            alert("Signup Failed");
        } finally {
            setLoading(false);
        }
    }

   return(
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <h2>Sign Up</h2>
        </div>

        <div className="login-box">
          <div>
            <label className="label">Username</label>
            <input autoComplete="off" className="input" type="text"
              value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input autoComplete="off" className="input" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input autoComplete="off" className="input" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="login-btn" disabled={loading} onClick={handleSignup}>
            {loading ? "Loading..." : "Signup"}
          </button>
        </div>

        <div className="pass-box">
          <p>Already have an account? <Link to="/auth">Login</Link></p>
        </div>
      </div>
    </div>
   ); 
}

export default Signup;