import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Admin from "./Pages/AdminUser";
import Tickets from "./Pages/AdminTickets";
import TicketDetails from "./Pages/Ticket";

export default function App() {
    return (
        <Router>
            <Routes>
             <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/ticket/:id" element={<TicketDetails />} />
            </Routes>
        </Router>
    );
}
