import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import "./global.css";

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

    // --- Fetch ticket ---
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

    // --- Fetch types ---
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

    // --- Fetch comments ---
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

    // --- Save ticket ---
    const handleSave = async () => {
        try {
            const ticketData = {
                id: ticket.id,
                userId: ticket.userId || 0,
                typeId: ticket.typeId || 0,
                title: ticket.title || "",
                description: ticket.description || "",
                status: ticket.status || "Open",
                comments: comments.map((c) => ({
                    id: c.id,
                    ticketId: c.ticketId,
                    userId: c.userId,
                    body: c.body || c.content || "",
                })),
            };

            const res = await fetch(`${apiBase}/Ticket/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(ticketData),
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

    // --- Add comment ---
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

    // --- Delete comment ---
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

    if (!ticket) return <div>Loading ticket...</div>;

    return (
        <div className="ticket-page">
            <header className="header">
                <h2 onClick={() => navigate("/admin-tickets")} style={{ cursor: "pointer" }}>
                    ← Back to Tickets
                </h2>
            </header>

            <div className="ticket-details">
                <h2>Edit Ticket</h2>

                <label>Title</label>
                <input
                    type="text"
                    value={ticket.title || ""}
                    onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
                />

                <label>Description</label>
                <textarea
                    value={ticket.description || ""}
                    onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                    rows={4}
                />

                <label>Status</label>
                <select
                    value={ticket.status || "Open"}
                    onChange={(e) => setTicket({ ...ticket, status: e.target.value })}
                >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                </select>

                <label>Type</label>
                <select
                    value={ticket.typeId || ""}
                    onChange={(e) => setTicket({ ...ticket, typeId: parseInt(e.target.value) || 0 })}
                >
                    <option value="0">Uncategorized</option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <button className="btn" onClick={handleSave}>
                    Save Changes
                </button>
            </div>

            <div className="comments-section">
                <h3>Comments</h3>
                <div className="comments-list">
                    {comments.length === 0 && <p>No comments yet.</p>}
                    {comments.map((c) => (
                        <div key={c.id} className="comment">
                            <p>{c.body || c.content}</p>
                            <small>
                                {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                            </small>
                            <button onClick={() => handleDeleteComment(c.id)}>
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
                />
                <button className="btn" onClick={handleAddComment}>
                    Add Comment
                </button>
            </div>

            {message && (
                <div className="modal" onClick={() => setMessage("")}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={() => setMessage("")}>
                            &times;
                        </span>
                        <p>{message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
