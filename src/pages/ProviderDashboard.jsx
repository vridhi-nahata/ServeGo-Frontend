import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaClock, FaSyncAlt } from "react-icons/fa";
import dayjs from "dayjs";
import { motion } from "framer-motion";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [showTimeUpdate, setShowTimeUpdate] = useState(null);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/bookings/provider-requests", {
        withCredentials: true,
      })
      .then((res) => {
        setBookings(res.data.bookings || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bookings");
        setLoading(false);
      });
  }, []);

  const handleStatus = async (id, status, newTimeSlot) => {
    setActionLoading(id + status);
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        status === "update-time" ? { status, newTimeSlot } : { status },
        { withCredentials: true }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? res.data.booking : b))
      );
      setShowTimeUpdate(null);
      setNewFrom("");
      setNewTo("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
    setActionLoading("");
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    "update-time": "bg-blue-100 text-blue-700",
  };

  const grouped = bookings.reduce((acc, b) => {
    const latest =
      b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
    if (filter !== "all" && latest !== filter) return acc;
    acc[latest] = acc[latest] || [];
    acc[latest].push(b);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen py-20 px-4"
      style={{ background: "var(--background-light)" }}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl font-bold text-center mb-6"
          style={{ color: "var(--primary)" }}
        >
          My Bookings
        </h1>

        <div className="flex justify-center gap-3 mb-8">
          {["all", "pending", "confirmed", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{
                backgroundColor: filter === s ? "var(--primary)" : "white",
                color: filter === s ? "white" : "var(--primary)",
                borderColor: "var(--accent)",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            className="text-center text-xl"
            style={{ color: "var(--primary)" }}
          >
            Loading...
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No bookings found.
          </div>
        ) : (
          Object.entries(grouped).map(([status, group]) => (
            <div key={status} className="mb-8">
              <div
                className="flex justify-between items-center cursor-pointer px-5 py-3 rounded-t-xl"
                style={{
                  backgroundColor: "var(--primary-light)",
                  color: "var(--secondary)",
                }}
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [status]: !prev[status] }))
                }
              >
                <h2 className="text-lg font-semibold">
                  {status.toUpperCase()} ({group.length})
                </h2>
                <span>{expanded[status] ? "-" : "+"}</span>
              </div>

              {expanded[status] && (
                <div className="grid md:grid-cols-2 gap-6 border p-4 rounded-b-xl">
                  {group.map((b, idx) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="bg-white shadow-lg rounded-xl p-5 border"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        {b.customer?.avatarUrl ? (
                          <img
                            src={b.customer.avatarUrl}
                            className="w-12 h-12 rounded-full border shadow"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 flex items-center justify-center rounded-full font-bold shadow"
                            style={{
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary)",
                            }}
                          >
                            {b.customer?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <div
                            className="font-semibold"
                            style={{ color: "var(--primary)" }}
                          >
                            {b.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {b.customer?.email}
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-sm mb-1"
                        style={{ color: "var(--gray)" }}
                      >
                        <strong>Service:</strong> {b.serviceName}
                      </div>
                      <div
                        className="text-sm mb-1"
                        style={{ color: "var(--gray)" }}
                      >
                        <strong>Date:</strong>{" "}
                        {dayjs(b.date).format("DD MMM YYYY")}
                      </div>
                      <div
                        className="text-sm mb-1"
                        style={{ color: "var(--gray)" }}
                      >
                        <strong>Time:</strong> {b.timeSlot.from} -{" "}
                        {b.timeSlot.to}
                      </div>
                      <div
                        className="text-sm mb-3"
                        style={{ color: "var(--gray)" }}
                      >
                        <strong>Notes:</strong> {b.notes || "—"}
                      </div>

                      <div
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${statusColor[status]}`}
                      >
                        {status.replace("-", " ")}
                      </div>

                      {status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                            disabled={actionLoading === b._id + "confirmed"}
                            onClick={() => handleStatus(b._id, "confirmed")}
                          >
                            <FaCheck /> Accept
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                            disabled={actionLoading === b._id + "rejected"}
                            onClick={() => handleStatus(b._id, "rejected")}
                          >
                            <FaTimes /> Reject
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => setShowTimeUpdate(b._id)}
                          >
                            <FaClock /> Update Time
                          </button>
                        </div>
                      )}

                      {status === "update-time" && (
                        <div className="text-blue-600 text-sm flex items-center gap-2 mt-2">
                          <FaSyncAlt /> Awaiting customer response
                        </div>
                      )}

                      {showTimeUpdate === b._id && (
                        <div className="mt-4 p-3 bg-gray-50 border rounded-lg shadow-sm">
                          <div className="flex gap-2 mb-2 items-center">
                            <input
                              type="time"
                              value={newFrom}
                              onChange={(e) => setNewFrom(e.target.value)}
                              className="border px-2 py-1 rounded text-sm"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={newTo}
                              onChange={(e) => setNewTo(e.target.value)}
                              className="border px-2 py-1 rounded text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                              disabled={actionLoading === b._id + "update-time"}
                              onClick={() =>
                                handleStatus(b._id, "update-time", {
                                  from: newFrom,
                                  to: newTo,
                                })
                              }
                            >
                              Send Update
                            </button>
                            <button
                              className="bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-400"
                              onClick={() => setShowTimeUpdate(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {error && <div className="text-center text-red-500 mt-6">{error}</div>}
      </div>
    </div>
  );
}
