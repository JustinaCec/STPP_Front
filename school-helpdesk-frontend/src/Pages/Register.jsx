import React, { useState } from "react";
import { Link } from "react-router-dom"; // <-- import Link
import "./global.css";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Register() {
    const [menuOpen, setMenuOpen] = useState(false);

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const role = "Student";

    // Message modal state
    const [message, setMessage] = useState("");

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        if (!acceptedTerms) {
            setMessage("You must accept the terms!");
            return;
        }

        try {
            const response = await fetch(
                "https://stpp-3qmk.onrender.com/api/User/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Registration successful!");
                // Clear form
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setAcceptedTerms(false);
            } else {
                setMessage(data.message || "Registration failed!");
            }
        } catch (error) {
            console.error(error);
            setMessage("Registration failed!");
        }
    };

    // Reusable modal for messages
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
                    <Link to="/login">Login</Link>
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
                    <h2>Register</h2>
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
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />{" "}
                            Accept Terms
                        </label>
                        <button type="submit" className="btn">
                            Register
                        </button>
                    </form>
                </section>
            </main>

            {/* MESSAGE MODAL */}
            <MessageModal message={message} onClose={() => setMessage("")} />

            {/* FOOTER */}
            <footer className="footer">
                <p>
                    &copy; 2025 MyApp | <Link to="#privacy">Privacy Policy</Link>
                </p>
            </footer>
        </div>
    );
}
