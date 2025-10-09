import React, { useState } from "react";
import "./global.css";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Landing() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <div className="landing-page" style={{ width: "100%", minWidth: "100vw" }}>
            {/* HEADER */}
            <header className="header">
                <div className="logo">
                    <img src={logo} alt="MyApp Logo" className="logo-img" />
                </div>
                <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#contact">Contact</a>
                    <a href="#login">Login</a>
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
                    <h2>Register or Login</h2>
                    <form>
                        <input type="text" placeholder="Username" required />
                        <input type="email" placeholder="Email" required />
                        <input type="password" placeholder="Password" required />
                        <select>
                            <option value="">Select Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <label>
                            <input type="checkbox" /> Accept Terms
                        </label>
                        <button type="submit" className="btn">
                            Register
                        </button>
                    </form>
                </section>
            </main>


            {/* MODAL */}
            {modalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>
                            &times;
                        </span>
                        <h2>About MyApp</h2>
                        <p>This is a responsive landing page with a fixed dark theme.</p>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="footer">
                <p>
                    &copy; 2025 MyApp | <a href="#privacy">Privacy Policy</a>
                </p>
            </footer>
        </div>
    );
}
