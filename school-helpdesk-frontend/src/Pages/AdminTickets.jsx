import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaBars, FaTimes } from "react-icons/fa";
import "./global.css";
import logo from "../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";

export default function AdminTicketsPage() {
    const [types, setTypes] = useState([]);
    const [tickets, setTickets] = useState({});
    const [uncategorized, setUncategorized] = useState([]);
    const [message, setMessage] = useState("");
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState(null);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const token = localStorage.getItem("token");

    // FETCH TYPES
    const fetchTypes = async () => {
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/TicketType", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTypes(data);
            else setMessage(data.message || "Failed to fetch types");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch types");
        }
    };

    // FETCH TICKETS
    const fetchTicketsByType = async () => {
        const newTickets = {};
        const uncategorizedTickets = [];

        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/Ticket", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allTickets = await res.json();

            for (const t of allTickets) {
                if (!t.typeId) uncategorizedTickets.push(t);
                else {
                    if (!newTickets[t.typeId]) newTickets[t.typeId] = [];
                    newTickets[t.typeId].push(t);
                }
            }
            setTickets(newTickets);
            setUncategorized(uncategorizedTickets);
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch tickets");
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    useEffect(() => {
        fetchTicketsByType();
    }, [types]);

    // DELETE TYPE
    const handleDeleteType = async (id) => {
        if (!window.confirm("Delete this type?")) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/TicketType/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setMessage("Type deleted successfully");
                setTypes(types.filter((t) => t.id !== id));
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete type");
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to delete type");
        }
    };

    // DELETE TICKET
    const handleDeleteTicket = async (id, typeId) => {
        if (!window.confirm("Delete this ticket?")) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setMessage("Ticket deleted successfully");
                if (typeId) {
                    setTickets({
                        ...tickets,
                        [typeId]: tickets[typeId].filter((t) => t.id !== id),
                    });
                } else {
                    setUncategorized(uncategorized.filter((t) => t.id !== id));
                }
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
    const openModal = (type, data = null) => {
        if (type === "ticket") {
            setModalData({
                id: data?.id || 0,
                userId: data?.userId || 0,
                typeId: data?.typeId || 0,
                title: data?.title || "",
                description: data?.description || "",
                status: data?.status || "Open",
                comments: data?.comments || [],
            });
        } else if (type === "type") {
            setModalData({
                id: data?.id || 0,
                name: data?.name || "",
                description: data?.description || "",
            });
        }
        setModalType(type);
    };

    const closeModal = () => {
        setModalData(null);
        setModalType(null);
    };

    // SAVE (ADD/EDIT)
    const saveModal = async (e) => {
        e.preventDefault();
        try {
            if (modalType === "type") {
                const method = modalData.id ? "PUT" : "POST";
                const url = modalData.id
                    ? `https://stpp-3qmk.onrender.com/api/TicketType/${modalData.id}`
                    : "https://stpp-3qmk.onrender.com/api/TicketType";

                const res = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: modalData.name,
                        description: modalData.description,
                    }),
                });
                if (res.ok) {
                    setMessage("Type saved successfully");
                    fetchTypes();
                    closeModal();
                }
            } else if (modalType === "ticket") {
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
                    fetchTicketsByType();
                    closeModal();
                }
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to save");
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
                    <img src={logo} alt="Logo" className="logo-img" />
                </div>

                <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>Users</Link>
                    <button
                        onClick={() => { openModal("type", {}); setMenuOpen(false); }}
                        className="btn"
                        style={{ marginRight: "1rem" }}
                    >
                        <FaPlus /> Create Type
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

            {/* GRID */}
            <main
                className="main-content"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem",
                    padding: "1rem",
                }}
            >
                {types.map((type) => (
                    <div
                        key={type.id}
                        style={{
                            background: "#1e1e1e",
                            padding: "1rem",
                            borderRadius: "10px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h3>{type.name}</h3>
                            <div>
                                <button onClick={() => openModal("type", type)}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDeleteType(type.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{type.description}</p>

                        <button
                            style={{ marginTop: "0.5rem" }}
                            onClick={() => openModal("ticket", { typeId: type.id })}
                        >
                            <FaPlus /> Add Ticket
                        </button>

                        <div style={{ marginTop: "1rem" }}>
                            {(tickets[type.id] || []).map((t) => (
                                <div
                                    key={t.id}
                                    style={{
                                        background: "#2a2a2a",
                                        padding: "0.5rem",
                                        margin: "0.5rem 0",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => navigate(`/ticket/${t.id}`)}
                                >
                                    {t.title}
                                    <button
                                        style={{ float: "right" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTicket(t.id, type.id);
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* UNCATEGORIZED SECTION */}
                {uncategorized.length > 0 && (
                    <div
                        style={{
                            background: "#252525",
                            padding: "1rem",
                            borderRadius: "10px",
                        }}
                    >
                        <h3>Uncategorized</h3>
                        {uncategorized.map((t) => (
                            <div
                                key={t.id}
                                style={{
                                    background: "#2a2a2a",
                                    padding: "0.5rem",
                                    margin: "0.5rem 0",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate(`/ticket/${t.id}`)}
                            >
                                {t.title}
                                <button
                                    style={{ float: "right" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTicket(t.id, null);
                                    }}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL */}
            {modalData && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>
                            &times;
                        </span>
                        <form onSubmit={saveModal}>
                            {modalType === "type" && (
                                <>
                                    <h3>{modalData.id ? "Edit Type" : "Add Type"}</h3>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={modalData.name || ""}
                                        onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                        required
                                    /><br />
                                    <textarea
                                        placeholder="Description"
                                        value={modalData.description || ""}
                                        onChange={(e) =>
                                            setModalData({ ...modalData, description: e.target.value })
                                        }
                                        rows={3}
                                    /><br />
                                </>
                            )}
                            {modalType === "ticket" && (
                                <>
                                    <h3>{modalData.id ? "Edit Ticket" : "Add Ticket"}</h3>
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={modalData.title || ""}
                                        onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                                        required
                                    /><br />
                                    <textarea
                                        placeholder="Description"
                                        value={modalData.description || ""}
                                        onChange={(e) =>
                                            setModalData({ ...modalData, description: e.target.value })
                                        }
                                        rows={3}
                                    /><br />
                                </>
                            )}
                            <button type="submit" className="btn">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
