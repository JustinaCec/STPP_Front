import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./global.css";
import logo from "../assets/logo.png";

export default function AdminTicketsPage() {
    const [types, setTypes] = useState([]);
    const [tickets, setTickets] = useState({});
    const [message, setMessage] = useState("");
    const [modalData, setModalData] = useState(null); // For add/edit modal
    const [modalType, setModalType] = useState(null); // "ticket" or "type"

    const token = localStorage.getItem("token"); // Bearer token

    // Fetch all ticket types
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

    // Fetch all tickets and group by type (include uncategorized)
    const fetchTicketsByType = async () => {
        const newTickets = {};
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/Ticket", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                for (const t of data) {
                    const typeId = t.typeId || "uncategorized";
                    if (!newTickets[typeId]) newTickets[typeId] = [];
                    newTickets[typeId].push(t);
                }
            }
        } catch (err) {
            console.error(err);
        }
        setTickets(newTickets);
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    useEffect(() => {
        fetchTicketsByType();
    }, [types]);

    // DELETE type
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

    // DELETE ticket
    const handleDeleteTicket = async (id, typeId) => {
        if (!window.confirm("Delete this ticket?")) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setMessage("Ticket deleted successfully");
                const key = typeId || "uncategorized";
                setTickets({
                    ...tickets,
                    [key]: tickets[key].filter((t) => t.id !== id),
                });
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete ticket");
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to delete ticket");
        }
    };

    // OPEN/CLOSE MODAL
    const openModal = (type, data = null) => {
        setModalType(type);
        setModalData(data);
    };
    const closeModal = () => {
        setModalData(null);
        setModalType(null);
    };

    // SAVE MODAL DATA (create/update)
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
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        id: modalData.id,
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
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
            </header>

            {/* MAIN CONTENT */}
            <main
                className="main-content"
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "1rem",
                    justifyContent: "flex-start",
                }}
            >
                {/* TYPES */}
                {types.map((type) => (
                    <div
                        key={type.id}
                        style={{
                            background: "#1e1e1e",
                            padding: "1rem",
                            borderRadius: "8px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.3rem" }}>{type.name}</h3>
                                {type.description && (
                                    <p style={{ fontSize: "0.9rem", color: "#aaa", marginBottom: "0.5rem" }}>
                                        {type.description}
                                    </p>
                                )}
                            </div>
                            <div>
                                <button onClick={() => openModal("type", type)}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDeleteType(type.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

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
                                    onClick={() => openModal("ticket", t)}
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
                <div
                    key="uncategorized"
                    style={{
                        background: "#1e1e1e",
                        padding: "1rem",
                        borderRadius: "8px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>Uncategorized</h3>
                        <button onClick={() => openModal("ticket", { typeId: null })}>
                            <FaPlus /> Add Ticket
                        </button>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        {(tickets["uncategorized"] || []).map((t) => (
                            <div
                                key={t.id}
                                style={{
                                    background: "#2a2a2a",
                                    padding: "0.5rem",
                                    margin: "0.5rem 0",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                                onClick={() => openModal("ticket", t)}
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
                </div>
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

                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={modalData.name || ""}
                                        onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                        required
                                    /><br></br>

                                    <label>Description</label>
                                    <textarea
                                        value={modalData.description || ""}
                                        onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Enter description..."
                                    /><br></br>
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
                                    /><br></br>
                                    <textarea
                                        placeholder="Description"
                                        value={modalData.description || ""}
                                        onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                        rows={3}
                                    /><br></br>
                                    <select
                                        value={modalData.status || "Open"}
                                        onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                    </select><br></br>
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
        </div>
    );
}
