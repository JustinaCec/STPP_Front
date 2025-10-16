import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./global.css";

export default function Landing() {
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!menuOpen);

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
                <section className="hero">
                    <h1>Welcome to School Help Desk</h1>
                    <p>
                        This platform allows students and admins to manage support tickets,
                        track progress, and communicate effectively within the school system.
                    </p>
                    <p>
                        Use the navigation above to register or login and get started!
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn">Register</Link>
                        <Link to="/login" className="btn">Login</Link>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="footer">
                <p>
                    &copy; 2025 School Help Desk | <Link to="#privacy">Privacy Policy</Link>
                </p>
            </footer>
        </div>
    );
}
