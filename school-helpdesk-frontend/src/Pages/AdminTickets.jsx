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

  // Fetch tickets for each type
  const fetchTicketsByType = async () => {
    const newTickets = {};
    for (const type of types) {
      try {
        const res = await fetch(
          `https://stpp-3qmk.onrender.com/api/Ticket?typeId=${type.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) newTickets[type.id] = data;
      } catch (err) {
        console.error(err);
      }
    }
    setTickets(newTickets);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (types.length > 0) fetchTicketsByType();
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
        setTickets({
          ...tickets,
          [typeId]: tickets[typeId].filter((t) => t.id !== id),
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

  // OPEN MODAL
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
          body: JSON.stringify({ name: modalData.name }),
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
      <main className="main-content" style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
        {types.map((type) => (
          <div key={type.id} style={{ minWidth: "250px", background: "#1e1e1e", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            <button style={{ marginTop: "0.5rem" }} onClick={() => openModal("ticket", { typeId: type.id })}>
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
                    value={modalData.name || ""}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    required
                  />
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
                  />
                  <textarea
                    placeholder="Description"
                    value={modalData.description || ""}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                    rows={3}
                  />
                  <select
                    value={modalData.status || "Open"}
                    onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
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
