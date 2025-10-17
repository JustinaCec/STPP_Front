import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./global.css";
import logo from "../assets/logo.png";

export default function TicketTypesAdmin() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [types, setTypes] = useState([]);
    const [tickets, setTickets] = useState({});
    const [message, setMessage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ id: null, name: "" });

    const token = localStorage.getItem("token");

    const toggleMenu = () => setMenuOpen(!menuOpen);

    // Fetch all ticket types
    const fetchTypes = async () => {
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/TicketType", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTypes(data);
            else setMessage(data.message || "Failed to fetch types");
        } catch (error) {
            console.error(error);
            setMessage("Failed to fetch types");
        }
    };

    // Fetch tickets for a type
    const fetchTickets = async (typeId) => {
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allTickets = await res.json();
            if (res.ok) {
                const filtered = allTickets.filter((t) => t.typeId === typeId);
                setTickets((prev) => ({ ...prev, [typeId]: filtered }));
            } else {
                setMessage("Failed to fetch tickets");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to fetch tickets");
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // Delete a ticket type
    const handleDeleteType = async (id) => {
        if (!window.confirm("Delete this ticket type?")) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/TicketType/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setMessage("Ticket type deleted");
                setTypes(types.filter((t) => t.id !== id));
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete type");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to delete type");
        }
    };

    // Open modal for add/update
    const openModal = (type = { id: null, name: "" }) => {
        setModalData(type);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setModalData({ id: null, name: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = modalData.id ? "PUT" : "POST";
        const url = modalData.id
            ? `https://stpp-3qmk.onrender.com/api/TicketType/${modalData.id}`
            : "https://stpp-3qmk.onrender.com/api/TicketType";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id: modalData.id, name: modalData.name }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`Ticket type ${modalData.id ? "updated" : "added"} successfully`);
                fetchTypes();
                closeModal();
            } else {
                setMessage(data.message || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            setMessage("Operation failed");
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

            <main className="main-content">
                <section className="admin-panel">
                    <h2>Ticket Types Admin</h2>
                    <button className="btn" onClick={() => openModal()}><FaPlus /> Add Type</button>
                    {types.length === 0 ? <p>No ticket types found.</p> : (
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Tickets</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.map((type) => (
                                    <tr key={type.id}>
                                        <td>{type.name}</td>
                                        <td>
                                            <button className="btn" onClick={() => fetchTickets(type.id)}>
                                                View Tickets ({tickets[type.id]?.length || 0})
                                            </button>
                                            {tickets[type.id] && (
                                                <ul>
                                                    {tickets[type.id].map((t) => (
                                                        <li key={t.id}>{t.title}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn edit-btn" onClick={() => openModal(type)}>
                                                <FaEdit /> Edit
                                            </button>
                                            <button className="btn delete-btn" onClick={() => handleDeleteType(type.id)}>
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

            {modalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h3>{modalData.id ? "Update Type" : "Add Ticket Type"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Type Name"
                                value={modalData.name}
                                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                required
                            />
                            <button type="submit" className="btn">{modalData.id ? "Update" : "Add"}</button>
                        </form>
                    </div>
                </div>
            )}

            <MessageModal message={message} onClose={() => setMessage("")} />

            <footer className="footer">
                <p>&copy; 2025 MyApp | <Link to="#privacy">Privacy Policy</Link></p>
            </footer>
        </div>
    );
}
