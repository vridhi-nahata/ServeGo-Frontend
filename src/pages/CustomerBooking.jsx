import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user/my-bookings", {
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

  const respondToUpdate = async (id, response) => {
    setActionLoading(id + response);
    try {
      const res = await axios.patch(
  `http://localhost:5000/api/bookings/${id}/customer-response`, 
        { response },
        { withCredentials: true }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? res.data.booking : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to respond");
    }
    setActionLoading("");
  };

  const latestStatus = (history) =>
    history?.[history.length - 1]?.status || "pending";

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => latestStatus(b.statusHistory) === filter);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Rejected", value: "rejected" },
    { label: "Updated", value: "update-time" },
  ];

  return (
    <div className="min-h-screen py-16 px-4 bg-[var(--background-light)]">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-6">
          My Bookings
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              className={`px-4 py-1 rounded-full border text-sm font-medium ${
                filter === opt.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
              }`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredBookings.length === 0 ? (
          <p className="text-center text-gray-500">No bookings found.</p>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const status = latestStatus(b.statusHistory);
              return (
                <div
                  key={b._id}
                  className="border rounded-xl p-4 shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                >
                  <div>
                    <div className="font-semibold text-[var(--primary)]">
                      {b.serviceName}
                    </div>
                    <div className="text-sm text-[var(--secondary)]">
                      {dayjs(b.date).format("DD MMM YYYY")} | {b.timeSlot.from}{" "}
                      - {b.timeSlot.to}
                    </div>
                    <div className="text-sm text-[var(--gray)]">
                      Notes: {b.notes || "—"}
                    </div>
                    <div
                      className={`inline-block mt-1 text-xs font-semibold rounded px-2 py-1 ${
                        status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : status === "update-time"
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }`}
                    >
                      {status.replace("-", " ")}
                    </div>
                  </div>

                  {status === "update-time" && (
                    <div>
                      <div className="text-[var(--secondary)] text-sm py-3 font-semibold">
                        Provider has proposed a new time:
                        <div className="text-[var(--gray)] font-light">
                          <div>
                            Earlier Time : {b.timeSlot.from} - {b.timeSlot.to}
                          </div>
                          <div>
                            Proposed Time : {b.updatedSlot?.from} -{" "}
                            {b.updatedSlot?.to}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          disabled={actionLoading === b._id + "accepted"}
                          onClick={() => respondToUpdate(b._id, "accepted")}
                        >
                          <FaCheck /> Accept
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={actionLoading === b._id + "rejected"}
                          onClick={() => respondToUpdate(b._id, "rejected")}
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
