import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./global.css";
import logo from "../assets/logo.png";

export default function AdminPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    const toggleMenu = () => setMenuOpen(!menuOpen);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/User");
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setMessage(data.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Delete user
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/User/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage("User deleted successfully");
                setUsers(users.filter((u) => u.id !== id));
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete user");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to delete user");
        }
    };

    // Update user role
    const handleRoleChange = async (id, newRole) => {
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/User/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                setMessage("User updated successfully");
                setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to update user");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to update user");
        }
    };

    const MessageModal = ({ message, onClose }) => {
        if (!message) return null;
        return (
            <div className="modal" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="close" onClick={onClose}>&times;</span>
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
                <section className="admin-panel">
                    <h2>Admin Panel - Users</h2>
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.email}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn edit-btn"
                                                onClick={() =>
                                                    handleRoleChange(
                                                        user.id,
                                                        user.role === "Student" ? "Admin" : "Student"
                                                    )
                                                }
                                            >
                                                <FaEdit /> Update
                                            </button>
                                            <button
                                                className="btn delete-btn"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>

            <MessageModal message={message} onClose={() => setMessage("")} />

            <footer className="footer">
                <p>&copy; 2025 MyApp | <Link to="#privacy">Privacy Policy</Link></p>
            </footer>
        </div>
    );
}
