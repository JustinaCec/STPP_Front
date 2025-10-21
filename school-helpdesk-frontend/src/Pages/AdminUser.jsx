import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./global.css";
import logo from "../assets/logo.png";

export default function AdminPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [editUser, setEditUser] = useState(null); // user being edited

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const token = localStorage.getItem("token");

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/User", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
            else setMessage(data.message || "Failed to fetch users");
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
                headers: { "Authorization": `Bearer ${token}` },
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

    // Save updated user data
    const handleSaveEdit = async () => {
        if (!editUser) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/User/${editUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: editUser.email,
                    password: editUser.password || undefined,
                    role: editUser.role,
                }),
            });

            if (res.ok) {
                setMessage("User updated successfully");
                setEditUser(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to update user");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to update user");
        }
    };

    // Modal for editing user
    const EditUserModal = ({ user, onClose }) => {
        if (!user) return null;
        return (
            <div className="modal" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="close" onClick={onClose}>&times;</span>
                    <h3>Edit User</h3>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={user.email}
                        onChange={(e) => setEditUser({ ...user, email: e.target.value })}
                    /><br></br>
                    <label>New Password (optional):</label>
                    <input
                        type="password"
                        placeholder="Leave blank to keep same"
                        onChange={(e) => setEditUser({ ...user, password: e.target.value })}
                    /><br></br>
                    <label>Role:</label>
                    <select
                        value={user.role}
                        onChange={(e) => setEditUser({ ...user, role: e.target.value })}
                    >
                        <option value="Student">Student</option>
                        <option value="Admin">Admin</option>
                    </select><br></br>
                    <button className="btn save-btn" onClick={handleSaveEdit}>Save</button>
                </div>
            </div>
        );
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
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };
    return (
        <div className="landing-page">
            {/* HEADER */}
            {/* HEADER */}
            <header
                className="header"
            >
                <div className="logo">
                    <img src={logo} alt="Logo" className="logo-img" />
                </div>
                <div>
                    <Link to="/tickets">Tickets</Link>
                    <button onClick={handleLogout} className="btn">
                        Logout
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="main-content-text">
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
                                        <td>{user.role}</td>
                                        <td>
                                            <button
                                                className="btn edit-btn"
                                                onClick={() => setEditUser(user)}
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

            <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
            <MessageModal message={message} onClose={() => setMessage("")} />

            <footer className="footer">
                <p>&copy; 2025 MyApp | <Link to="#privacy">Privacy Policy</Link></p>
            </footer>
        </div>
    );
}
