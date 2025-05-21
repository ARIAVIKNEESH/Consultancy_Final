import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5001/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("Signup Successful! Please login.");
                navigate("/");
            } else {
                alert("Signup Failed");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Sign Up</h2>
                <form onSubmit={handleSignup}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <a href="/">Login</a></p>
            </div>
        </div>
    );
};

export default Signup;
