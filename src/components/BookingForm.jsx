import React, { useState, useEffect } from "react";

export default function BookingForm({
  provider,
  serviceName,
  onClose,
  onSubmit,
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Auto-hide success or error messages after 2 sec
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Auto-close modal after successful booking
  useEffect(() => {
    if (success) {
      const closeTimer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(closeTimer);
    }
  }, [success]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const selectedDate = new Date(date);
    const today = new Date();

    if (!date || !time) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    // Date check
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      setError("Please choose a valid future date");
      setLoading(false);
      return;
    }

    // Time check
    if (selectedDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      if (selectedTime <= today) {
        setError("Please choose a future time today");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await onSubmit({
        provider: provider._id,
        date,
        time,
        notes,
      });

      if (response?.success) {
        setSuccess("Booking confirmed successfully!");
        setDate("");
        setTime("");
      } else {
        setError(response?.message || "Please login first to book service");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--white)] rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-[var(--primary-light)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Content */}
        <h2 className="text-2xl font-semibold text-center text-[var(--primary)] mb-2">
          Book {provider.name}
        </h2>
        <p className="text-center text-sm text-[var(--gray)] mb-4">
          For:{" "}
          <span className="font-medium text-[var(--secondary)]">
            {serviceName}
          </span>
        </p>

        {/* Inline Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {/* Inline Success */}
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
              Select Date <span className="text-red-700">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              // min={todayStr}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
              Select Time <span className="text-red-700">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end items-center gap-4 pt-4">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-[var(--white)] font-bold shadow hover:scale-105 rounded-lg hover:from-red-400 hover:to-red-700 transition duration-200"
            >
              Cancel
            </button>

            {/* Confirm Booking Button */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-[var(--white)] font-bold shadow hover:scale-105 rounded-lg hover:from-green-500 hover:to-green-700 transition duration-200"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
