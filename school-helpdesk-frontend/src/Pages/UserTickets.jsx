import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaBars, FaTimes } from "react-icons/fa";
import "./global.css";
import logo from "../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";

export default function UserTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [message, setMessage] = useState("");
    const [modalData, setModalData] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Extract userId from JWT token
    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUserId(payload.id);
            } catch (err) {
                console.error("Failed to parse token:", err);
            }
        }
    }, [token]);

    // Fetch user's tickets
    const fetchTickets = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) setTickets(data);
            else setMessage(data.message || "Failed to fetch tickets");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch tickets");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [userId]);

    // DELETE TICKET
    const handleDeleteTicket = async (id) => {
        if (!window.confirm("Delete this ticket?")) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setMessage("Ticket deleted successfully");
                setTickets(tickets.filter((t) => t.id !== id));
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete ticket");
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to delete ticket");
        }
    };

    // OPEN MODAL
    const openModal = (data = null) => {
        setModalData({
            id: data?.id || 0,
            userId: userId,
            title: data?.title || "",
            description: data?.description || "",
            status: data?.status || "Open",
        });
    };

    const closeModal = () => setModalData(null);

    // SAVE (ADD/EDIT TICKET)
    const saveModal = async (e) => {
        e.preventDefault();
        try {
            const method = modalData.id ? "PUT" : "POST";
            const url = modalData.id
                ? `https://stpp-3qmk.onrender.com/api/Ticket/${modalData.id}`
                : "https://stpp-3qmk.onrender.com/api/Ticket";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(modalData),
            });

            if (res.ok) {
                setMessage("Ticket saved successfully");
                fetchTickets();
                closeModal();
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to save ticket");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);

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
                    <img src={logo} alt="Logo" className="logo-img" />
                </div>

                <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
                    <Link to="/user" onClick={() => setMenuOpen(false)}>My Tickets</Link>
                    <button onClick={() => { openModal(); setMenuOpen(false); }} className="btn">
                        <FaPlus /> Create Ticket
                    </button>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn">
                        Logout
                    </button>
                </nav>

                <div className="header-controls">
                    <div className="hamburger" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </div>
                </div>
            </header>

            {/* TICKETS GRID */}
            <main
                className="main-content"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem",
                    padding: "1rem",
                }}
            >
                {tickets.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            background: "#1e1e1e",
                            padding: "1rem",
                            borderRadius: "10px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h3>{t.title}</h3>
                            <div>
                                <button onClick={() => navigate(`/ticket/${t.id}`)}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDeleteTicket(t.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{t.description}</p>
                    </div>
                ))}
            </main>

            {/* MODAL */}
            {modalData && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>&times;</span>
                        <form onSubmit={saveModal}>
                            <h3>{modalData.id ? "Edit Ticket" : "Add Ticket"}</h3>
                            <input
                                type="text"
                                placeholder="Title"
                                value={modalData.title}
                                onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                                required
                            /><br />
                            <textarea
                                placeholder="Description"
                                value={modalData.description}
                                onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                rows={3}
                            /><br />
                            <button type="submit" className="btn">Save</button>
                        </form>
                    </div>
                </div>
            )}

            <MessageModal message={message} onClose={() => setMessage("")} />

            {/* FOOTER */}
            <footer className="footer">
                <p>&copy; 2025 MyApp | <Link to="#privacy">Privacy Policy</Link></p>
            </footer>
        </div>
    );
}
