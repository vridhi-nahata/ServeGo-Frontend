import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FaCheck, FaTimes } from "react-icons/fa";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [tick, setTick] = useState(0);

  const modalRef = useRef();

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

  useEffect(() => {
    const fetchOtpForEligibleBookings = async () => {
      const now = dayjs();
      const updatedBookings = await Promise.all(
        bookings.map(async (b) => {
          const latestStatus = b.statusHistory?.at(-1)?.status;
          const bookingTime = dayjs(
            `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
            "YYYY-MM-DD HH:mm"
          );

          const isEligible =
            latestStatus === "confirmed" &&
            now.isSameOrAfter(bookingTime, "minute") &&
            !b.otp;

          if (isEligible) {
            try {
              const res = await axios.get(
                `http://localhost:5000/api/bookings/generate-otp/${b._id}`,
                { withCredentials: true }
              );
              return { ...b, otp: res.data.otp };
            } catch (err) {
              console.error(
                `OTP fetch failed for ${b._id}:`,
                err.response?.data?.message || err.message
              );
            }
          }
          return b;
        })
      );
      setBookings(updatedBookings);
    };

    fetchOtpForEligibleBookings(); // run immediately when tick changes
  }, [tick]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1_000); // every 1 second
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setConfirmCancelId(null); // Close the modal
      }
    };

    if (confirmCancelId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmCancelId]);

  const markCompleted = async (bookingId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/bookings/mark-complete/${bookingId}`,
        {},
        { withCredentials: true }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.data.booking : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as complete");
    }
  };

  

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

  const isTooCloseToBooking = (b) => {
    const bookingDateTime = dayjs(
      `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
      "YYYY-MM-DD HH:mm"
    );
    const diffMins = bookingDateTime.diff(dayjs(), "minute");
    // Disable cancel if the booking has already started or is within 2 hours
    return diffMins <= 120;
  };

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Updated", value: "update-time" },
    { label: "In Progress", value: "in-progress" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Completed", value: "completed" },
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
                  ? "bg-[var(--primary)] text-[var(--white)]"
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
                      className={`inline-block mt-1 text-xs font-semibold rounded-xl px-2 py-1 ${
                        status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : status === "update-time"
                          ? "bg-blue-100 text-blue-700"
                          : status === "in-progress"
                          ? "bg-orange-100 text-orange-700"
                          : status === "cancelled"
                          ? "bg-gray-200 text-gray-700"
                          : status === "completed"
                          ? "bg-purple-100 text-purple-700"
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
                          className="flex items-center gap-1 text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                          disabled={actionLoading === b._id + "accepted"}
                          onClick={() => respondToUpdate(b._id, "accepted")}
                        >
                          <FaCheck /> Accept
                        </button>
                        <button
                          className="flex items-center gap-1 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                          onClick={() => setConfirmCancelId(b._id)}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {b.otp && !b.otpVerified && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-green-600">
                        OTP: {b.otp}
                      </p>
                    </div>
                  )}

                  {["pending", "confirmed"].includes(status) && (
                    <button
                      title={
                        isTooCloseToBooking(b)
                          ? "Booking cannot be cancelled within 2 hours of start time"
                          : ""
                      }
                      className={`flex items-center gap-1 text-sm px-3 py-1 rounded transition w-40
      ${
        isTooCloseToBooking(b)
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-red-500 text-white hover:bg-red-700"
      }`}
                      onClick={() => {
                        if (!isTooCloseToBooking(b)) setConfirmCancelId(b._id);
                      }}
                      disabled={isTooCloseToBooking(b)}
                    >
                      <FaTimes /> Cancel Booking
                    </button>
                  )}

                  {b.otpVerified && !b.completedByCustomer && (
                    <button
                      onClick={() => markCompleted(b._id)}
                      className="mt-2 px-3 py-1 bg-[var(--ternary)] text-white rounded hover:bg-[var(--secondary)]"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {confirmCancelId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md text-center"
          >
            <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
              Confirm Cancellation
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setConfirmCancelId(null)}
              >
                Back
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => {
                  respondToUpdate(confirmCancelId, "cancelled");
                  setConfirmCancelId(null);
                }}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
