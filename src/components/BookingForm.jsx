import React, { useState, useEffect } from "react";
import axios from "axios";
import ProviderAvailabilityCalendar from "../components/ProviderAvailabilityCalendar";
import { CalendarDays } from "lucide-react";

export default function BookingForm({
  provider,
  serviceName,
  onClose,
  onSubmit,
  showCalendar,
  setShowCalendar,
}) {
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableTimeRanges, setAvailableTimeRanges] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [preselectedSlot, setPreselectedSlot] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (date && provider) {
      const weekday = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      const availableDay = provider.availability.find((d) => d.day === weekday);
      setAvailableTimeRanges(availableDay?.slots || []);

      // Fetch booked slots
      axios
        .get(
          `http://localhost:5000/api/bookings/booked-slots?providerId=${provider._id}&date=${date}`
        )
        .then((res) => setBookedSlots(res.data.bookedSlots || []))
        .catch(() => setBookedSlots([]));
    }
  }, [date, provider]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (success) {
      const closeTimer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(closeTimer);
    }
  }, [success]);

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  function isWithinAvailability(from, to, ranges) {
    const f = timeToMinutes(from);
    const t = timeToMinutes(to);
    return ranges.some(({ from: af, to: at }) => {
      const start = timeToMinutes(af);
      const end = timeToMinutes(at);
      return f >= start && t <= end;
    });
  }

  function overlapsWithBooking(from, to, bookings) {
    const f = timeToMinutes(from);
    const t = timeToMinutes(to);
    return bookings.some(({ from: bf, to: bt }) => {
      const start = timeToMinutes(bf);
      const end = timeToMinutes(bt);
      return f < end && t > start;
    });
  }

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const selectedDate = new Date(date);
    const today = new Date();

    if (!date || !fromTime || !toTime) {
      setError("Missing required fields");
      setLoading(false);
      return;
    }

    if (fromTime >= toTime) {
      setError("'From' time must be earlier than 'To' time.");
      setLoading(false);
      return;
    }

    const now = new Date();
    const selectedStart = new Date(`${date}T${fromTime}`);

    if (selectedStart <= now) {
      setError("Choose a future time");
      setLoading(false);
      return;
    }

    if (!isWithinAvailability(fromTime, toTime, availableTimeRanges)) {
      setError("Provider is unavailable at the selected date and time");
      setLoading(false);
      return;
    }

    if (overlapsWithBooking(fromTime, toTime, bookedSlots)) {
      setError("This time overlaps with an existing booking");
      setLoading(false);
      return;
    }

    try {
      const response = await onSubmit({
        provider: provider._id,
        serviceName,
        date,
        timeSlot: { from: fromTime, to: toTime },
        address,
        notes,
      });
      console.log("Booking payload: ", {
  provider: provider._id,
  serviceName,
  date,
  timeSlot: { from: fromTime, to: toTime },
  address,
  notes,
});


      if (response?.success) {
        setSuccess("Booking request sent to provider");
        setDate("");
        setFromTime("");
        setToTime("");
      } else {
        setError(response?.message);
      }
    } catch (err) {
      console.log(err);
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
        <h2 className="text-2xl font-semibold text-center text-[var(--primary)] mb-2">
          Book {provider.name}
        </h2>
        <p className="text-center text-sm text-[var(--gray)] mb-2">
          For:{" "}
          <span className="font-medium text-[var(--secondary)]">
            {serviceName}
          </span>
        </p>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="group bg-white border border-gray-300 p-2 rounded-full hover:bg-gray-100 transition flex items-center gap-2"
          >
            <CalendarDays className="w-5 h-5 text-[var(--secondary)] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">
              {showCalendar ? "Hide Availability" : "Check Availability"}
            </span>
          </button>
        </div>

        {showCalendar && (
          <ProviderAvailabilityCalendar
            provider={provider}
            onClose={() => setShowCalendar(false)}
            onSlotSelect={(slot) => {
              // Optional: Auto-fill the form when user selects a slot
              setDate(slot.date);
              setFromTime(slot.from);
              setToTime(slot.to);
              setShowCalendar(false);
            }}
          />
        )}

        {error && (
          <div className="flex items-center justify-center text-red-500 py-2">
            <i className="fas fa-exclamation-circle"></i>
            <span className="text-sm px-2 rounded-md">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-center text-green-700 py-2">
            <i className="fas fa-check-circle"></i>
            <span className="text-sm px-2 rounded-md">{success}</span>
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayStr}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              placeholder="Full address for service"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--secondary)] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end items-center gap-4 pt-3 text-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-b from-red-400 to-red-800 text-[var(--white)] font-bold shadow rounded-lg hover:scale-105 transition duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-b from-green-400 to-green-800 text-[var(--white)] font-bold shadow rounded-lg hover:scale-105 transition duration-200"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
