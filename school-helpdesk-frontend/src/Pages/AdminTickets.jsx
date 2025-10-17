import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./global.css";
import logo from "../assets/logo.png";

export default function TicketTypesAdmin() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [message, setMessage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ name: "" });

    const toggleMenu = () => setMenuOpen(!menuOpen);

    // Fetch all ticket types
    const fetchTicketTypes = async () => {
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/TicketTypes");
            const data = await res.json();
            if (res.ok) setTicketTypes(data);
            else setMessage(data.message || "Failed to fetch ticket types");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch ticket types");
        }
    };

    useEffect(() => {
        fetchTicketTypes();
    }, []);

    // Fetch tickets for a specific type
    const fetchTickets = async (typeId) => {
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Tickets/byType/${typeId}`);
            const data = await res.json();
            if (res.ok) setTickets(data);
            else setMessage(data.message || "Failed to fetch tickets");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch tickets");
        }
    };

    // Open modal for add/edit
    const openModal = (type = null) => {
        setModalData(type ? { id: type.id, name: type.name } : { name: "" });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    // Add or update ticket type
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = modalData.id ? "PUT" : "POST";
            const url = modalData.id
                ? `https://stpp-3qmk.onrender.com/api/TicketTypes/${modalData.id}`
                : "https://stpp-3qmk.onrender.com/api/TicketTypes";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: modalData.name }),
            });

            if (res.ok) {
                setMessage(modalData.id ? "Ticket type updated" : "Ticket type added");
                fetchTicketTypes();
                closeModal();
            } else {
                const data = await res.json();
                setMessage(data.message || "Operation failed");
            }
        } catch (err) {
            console.error(err);
            setMessage("Operation failed");
        }
    };

    // Delete ticket type
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ticket type?")) return;

        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/TicketTypes/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage("Ticket type deleted");
                setTicketTypes(ticketTypes.filter((t) => t.id !== id));
                if (selectedType?.id === id) setTickets([]);
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete ticket type");
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to delete ticket type");
        }
    };

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
                    <Link to="/admin/users">Users</Link>
                    <Link to="/admin/ticket-types">Ticket Types</Link>
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
                    <h2>Ticket Types</h2>
                    <button className="btn" onClick={() => openModal()}>
                        <FaPlus /> Add New Type
                    </button>

                    {ticketTypes.length === 0 ? (
                        <p>No ticket types found.</p>
                    ) : (
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Tickets Count</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticketTypes.map((type) => (
                                    <tr key={type.id}>
                                        <td>{type.name}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={() => {
                                                    setSelectedType(type);
                                                    fetchTickets(type.id);
                                                }}
                                            >
                                                View Tickets
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn edit-btn"
                                                onClick={() => openModal(type)}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                className="btn delete-btn"
                                                onClick={() => handleDelete(type.id)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Display tickets for selected type */}
                    {selectedType && tickets.length > 0 && (
                        <div style={{ marginTop: "2rem" }}>
                            <h3>Tickets for "{selectedType.name}"</h3>
                            <ul>
                                {tickets.map((t) => (
                                    <li key={t.id}>{t.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            </main>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>
                            &times;
                        </span>
                        <h3>{modalData.id ? "Edit Ticket Type" : "Add Ticket Type"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Type Name"
                                value={modalData.name}
                                onChange={(e) =>
                                    setModalData({ ...modalData, name: e.target.value })
                                }
                                required
                            />
                            <button className="btn" type="submit">
                                {modalData.id ? "Update" : "Add"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <MessageModal message={message} onClose={() => setMessage("")} />
        </div>
    );
}
