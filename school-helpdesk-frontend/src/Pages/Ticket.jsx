import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

export default function TicketPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [ticket, setTicket] = useState(null);
    const [types, setTypes] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [message, setMessage] = useState("");

    const apiBase = "https://stpp-3qmk.onrender.com/api";

    // Fetch ticket details
    const fetchTicket = async () => {
        try {
            const res = await fetch(`${apiBase}/Ticket/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTicket(data);
            else setMessage(data.message || "Failed to fetch ticket");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch ticket");
        }
    };

    // Fetch ticket types
    const fetchTypes = async () => {
        try {
            const res = await fetch(`${apiBase}/TicketType`, {
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
            const res = await fetch(`${apiBase}/tickets/${id}/Comment`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setComments(data);
            else setMessage(data.message || "Failed to load comments");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch comments");
        }
    };

    useEffect(() => {
        fetchTicket();
        fetchTypes();
        fetchComments();
    }, [id]);

    // Save updates
    const handleSave = async () => {
        try {
            const res = await fetch(`${apiBase}/Ticket/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(ticket),
            });

            if (res.ok) setMessage("Ticket updated successfully!");
            else {
                const data = await res.json();
                setMessage(data.message || "Failed to update ticket");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error saving ticket");
        }
    };

    // Add a new comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`${apiBase}/tickets/${id}/Comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ticketId: id,
                    content: newComment,
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
            const res = await fetch(`${apiBase}/Comment/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchComments();
            else setMessage("Failed to delete comment");
        } catch (err) {
            console.error(err);
            setMessage("CORS or server error deleting comment");
        }
    };

    if (!ticket) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading ticket...</div>;

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", background: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
                <h2 style={{ color: "#2c3e50", cursor: "pointer" }} onClick={() => navigate("/admin-tickets")}>
                    ← Back to Tickets
                </h2>
            </header>

            {/* Ticket details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h2 style={{ color: "#2c3e50" }}>Edit Ticket</h2>

                <label>Title</label>
                <input
                    type="text"
                    value={ticket.title || ""}
                    onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
                    style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />

                <label>Description</label>
                <textarea
                    value={ticket.description || ""}
                    onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                    rows={4}
                    style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />

                <label>Status</label>
                <select
                    value={ticket.status || "Open"}
                    onChange={(e) => setTicket({ ...ticket, status: e.target.value })}
                    style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                </select>

                <label>Type</label>
                <select
                    value={ticket.typeId || ""}
                    onChange={(e) => setTicket({ ...ticket, typeId: e.target.value })}
                    style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                >
                    <option value="">Uncategorized</option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleSave}
                    style={{
                        background: "#1abc9c",
                        color: "white",
                        padding: "10px 15px",
                        borderRadius: 6,
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: 10,
                        alignSelf: "flex-start"
                    }}
                >
                    Save Changes
                </button>
            </div>

            {/* Comments */}
            <div style={{ marginTop: 40 }}>
                <h3 style={{ color: "#2c3e50" }}>Comments</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {comments.length === 0 && <p>No comments yet.</p>}
                    {comments.map((c) => (
                        <div key={c.id} style={{ background: "#f4f4f4", padding: 12, borderRadius: 6, position: "relative" }}>
                            <p style={{ margin: 0 }}>{c.content}</p>
                            <small style={{ color: "#666" }}>{new Date(c.createdAt).toLocaleString()}</small>
                            <button
                                onClick={() => handleDeleteComment(c.id)}
                                style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 10,
                                    border: "none",
                                    background: "transparent",
                                    color: "#e74c3c",
                                    cursor: "pointer"
                                }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 10 }}
                />
                <button
                    onClick={handleAddComment}
                    style={{
                        background: "#3498db",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Add Comment
                </button>
            </div>

            {/* Message modal */}
            {message && (
                <div
                    onClick={() => setMessage("")}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 10,
                            minWidth: 300,
                            textAlign: "center"
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                right: 20,
                                top: 20,
                                cursor: "pointer",
                                fontWeight: "bold",
                                color: "#999"
                            }}
                            onClick={() => setMessage("")}
                        >
                            ×
                        </span>
                        <p>{message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
