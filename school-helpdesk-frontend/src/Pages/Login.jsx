import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate for redirect
import "./global.css";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Login() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // ✅ Hook for navigation

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("https://stpp-3qmk.onrender.com/api/User/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Login successful!");

                // ✅ Save token to localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);

                // ✅ Redirect after short delay
                setTimeout(() => {
                    navigate("/admin");
                }, 1000);

                setEmail("");
                setPassword("");
            } else {
                setMessage(data.message || "Login failed!");
            }
        } catch (error) {
            console.error(error);
            setMessage("Login failed!");
        }
    };

    // Reusable message modal
    const MessageModal = ({ message, onClose }) => {
        if (!message) return null;
        return (
            <div className="modal" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="close" onClick={onClose}>
                        &times;
                    </span>
                    <p>{message}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="landing-page">
            {/* HEADER */}
            <header className="header">
                <div className="logo">
                    <img src={logo} alt="MyApp Logo" className="logo-img" />
                </div>
                <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
                    <Link to="/">Home</Link>
                    <Link to="/register">Register</Link>
                </nav>
                <div className="header-controls">
                    <div className="hamburger" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="main-content">
                <section className="auth-form">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit" className="btn">
                            Login
                        </button>
                    </form>
                </section>
            </main>

            {/* MESSAGE MODAL */}
            <MessageModal message={message} onClose={() => setMessage("")} />

            {/* FOOTER */}
            <footer className="footer">
                <p>
                    &copy; 2025 MyApp | <Link to="#">Privacy Policy</Link>
                </p>
            </footer>
        </div>
    );
}
