import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSave, FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./global.css";

export default function TicketDetailsPage() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [types, setTypes] = useState([]);
    const [comments, setComments] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [newComment, setNewComment] = useState("");
    const [message, setMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentText, setEditedCommentText] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

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

    // Fetch ticket details
    const fetchTicket = async () => {
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setTicket(data);
                setEditedData(data);
            } else setMessage(data.message || "Failed to load ticket");
        } catch (err) {
            console.error(err);
            setMessage("Failed to load ticket");
        }
    };

    // Fetch ticket types
    const fetchTypes = async () => {
        try {
            const res = await fetch("https://stpp-3qmk.onrender.com/api/TicketType", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTypes(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch comments
    const fetchComments = async () => {
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/tickets/${id}/Comment`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setComments(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTicket();
        fetchTypes();
        fetchComments();
    }, [id]);

    // Save edited ticket
    const handleSaveTicket = async () => {
        try {
            const payload = {
                id: editedData.id,
                userId: userId,
                typeId: Number(editedData.typeId) || 0,
                title: editedData.title || "",
                description: editedData.description || "",
                status: editedData.status || "Open",
                comments: comments.map(c => ({
                    id: c.id,
                    ticketId: c.ticketId,
                    userId: c.userId || 0,
                    body: c.body || c.text || "",
                })),
            };

            const res = await fetch(`https://stpp-3qmk.onrender.com/api/Ticket/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage("Ticket updated successfully!");
                setEditing(false);
                fetchTicket();
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to update ticket");
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to update ticket");
        }
    };

    // Add new comment
    const handleAddComment = async () => {
        if (!newComment.trim() || !userId) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/tickets/${id}/Comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: 0,
                    ticketId: id,
                    userId: userId,
                    body: newComment,
                }),
            });
            if (res.ok) {
                setNewComment("");
                fetchComments();
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to add comment");
            }
        } catch (err) {
            console.error(err);
            setMessage("CORS or server error adding comment");
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/tickets/${id}/Comment/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    // Save edited comment
    const handleSaveComment = async (commentId) => {
        try {
            const res = await fetch(`https://stpp-3qmk.onrender.com/api/tickets/${id}/Comment/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: commentId,
                    ticketId: id,
                    userId: userId,
                    body: editedCommentText,
                }),
            });
            if (res.ok) {
                setEditingCommentId(null);
                setEditedCommentText("");
                fetchComments();
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to update comment");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error updating comment");
        }
    };
    const toggleMenu = () => setMenuOpen(!menuOpen);
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    if (!ticket) return <div style={{ padding: "2rem" }}>Loading...</div>;

    return (
        <div className="landing-page">
            {/* HEADER */}
            <header className="header">
                <div className="logo">
                    <img src={logo} alt="MyApp Logo" className="logo-img" />
                </div>

                <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>Users</Link>
                    <Link to="/tickets" onClick={() => setMenuOpen(false)}>Tickets</Link>
                    <button onClick={handleLogout} className="btn">Logout</button>
                </nav>

                <div className="header-controls">
                    <div className="hamburger" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </div>
                </div>
            </header>
        <div style={{ padding: "2rem", color: "white" }}>
            <button onClick={() => navigate(-1)} className="btn">
                <FaArrowLeft /> Back
            </button>

            <h2 style={{ marginTop: "1rem" }}>Ticket Details</h2>

            <div style={{ background: "#1e1e1e", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                {!editing ? (
                    <>
                        <h3>{ticket.title}</h3>
                        <p><strong>Status:</strong> {ticket.status}</p>
                        <p><strong>Type:</strong> {ticket.typeName || "Uncategorized"}</p>
                        <p><strong>Description:</strong></p>
                        <p>{ticket.description}</p>

                        <button onClick={() => setEditing(true)} style={{ marginTop: "0.5rem" }}>
                            <FaEdit /> Edit Ticket
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={editedData.title || ""}
                            onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                            placeholder="Title"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                        />
                        <textarea
                            value={editedData.description || ""}
                            onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                            rows={4}
                            placeholder="Description"
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                        />
                        <select
                            value={editedData.status}
                            onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                            style={{ marginBottom: "0.5rem" }}
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <select
                            value={editedData.typeId}
                            onChange={(e) => setEditedData({ ...editedData, typeId: Number(e.target.value) })}
                            style={{ marginBottom: "0.5rem" }}
                        >
                            <option value="">Uncategorized</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <div>
                            <button onClick={handleSaveTicket}><FaSave /> Save</button>
                            <button onClick={() => setEditing(false)} style={{ marginLeft: "0.5rem" }}>Cancel</button>
                        </div>
                    </>
                )}
            </div>

            <div style={{ marginTop: "2rem" }}>
                <h3>Comments</h3>
                <div style={{ background: "#1e1e1e", padding: "1rem", borderRadius: "8px", maxHeight: "300px", overflowY: "auto" }}>
                    {comments.length === 0 ? (
                        <p>No comments yet.</p>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} style={{ background: "#2a2a2a", margin: "0.5rem 0", padding: "0.5rem", borderRadius: "5px", position: "relative" }}>
                                {editingCommentId === c.id ? (
                                    <>
                                        <textarea
                                            value={editedCommentText}
                                            onChange={(e) => setEditedCommentText(e.target.value)}
                                            rows={2}
                                            style={{ width: "100%" }}
                                        />
                                        <button onClick={() => handleSaveComment(c.id)} style={{ marginRight: "0.5rem" }}>Save</button>
                                        <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <p>{c.body || c.text}</p>
                                        <button onClick={() => { setEditingCommentId(c.id); setEditedCommentText(c.body); }} style={{ marginRight: "0.5rem" }}>Edit</button>
                                        <button onClick={() => handleDeleteComment(c.id)}>Delete</button>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        placeholder="Write a comment..."
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                    <button onClick={handleAddComment}><FaPlus /> Add Comment</button>
                </div>
            </div>

            {message && (
                <div style={{ background: "#333", padding: "0.5rem 1rem", borderRadius: "5px", marginTop: "1rem" }}>
                    {message}
                </div>
            )}
            </div>{/* FOOTER */}
            <footer className="footer">
                <p>
                    &copy; 2025 MyApp | <Link to="#privacy">Privacy Policy</Link>
                </p>
            </footer></div>
    );
}
