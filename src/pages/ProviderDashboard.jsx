import React, { useEffect, useState, useRef } from "react";
import BookingStatusTimeline from "../components/BookingStatusTimeline";
import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaSyncAlt,
  FaSearch,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toast } from "react-toastify";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [showTimeUpdate, setShowTimeUpdate] = useState(null);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [expandedStatuses, setExpandedStatuses] = useState({});
  const [otpInputs, setOtpInputs] = useState({});
  const [otpError, setOtpError] = useState({});

  // Search and filter states
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showStatusList, setShowStatusList] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [timeError, setTimeError] = useState("");

  // Refs for outside click detection
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // useEffect(() => {
  //   fetchBookings(); // initial call

  //   const interval = setInterval(fetchBookings, 10_000); // poll every 10 seconds

  //   return () => clearInterval(interval); // cleanup
  // }, []);

  // Fetch bookings from API (restored from original)
  useEffect(() => {
    fetchBookings();
  }, []);

  // Restored original handleStatus function
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
    "in-progress": "bg-orange-100 text-orange-700",
    completed: "bg-purple-100 text-purple-700",
    cancelled: "bg-gray-200 text-gray-700",
  };

  const allStatuses = [
    "pending",
    "confirmed",
    "rejected",
    "update-time",
    "in-progress",
    "completed",
    "cancelled",
  ];

  // Filter and search logic
  let filteredBookings = bookings;

  // Search
  if (search.trim()) {
    filteredBookings = filteredBookings.filter(
      (b) =>
        b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        b.address?.toLowerCase().includes(search.toLowerCase()) // New: Search by Address
    );
  }

  // Status filter
  if (selectedStatuses.length > 0) {
    filteredBookings = filteredBookings.filter((b) => {
      const currentStatus =
        b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
      return selectedStatuses.includes(currentStatus);
    });
  }

  // Date range filter
  if (dateRange.from) {
    const fromDate = dayjs(dateRange.from).startOf("day");
    filteredBookings = filteredBookings.filter((b) =>
      dayjs(b.date).isSameOrAfter(fromDate)
    );
  }
  if (dateRange.to) {
    const toDate = dayjs(dateRange.to).endOf("day");
    filteredBookings = filteredBookings.filter((b) =>
      dayjs(b.date).isSameOrBefore(toDate)
    );
  }

  // Group by status
  const grouped = filteredBookings.reduce((acc, b) => {
    const latest =
      b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
    acc[latest] = acc[latest] || [];
    acc[latest].push(b);
    return acc;
  }, {});

  // Sort groups - FIXED SORTING LOGIC
  const sortedGroups = {};
  Object.keys(grouped).forEach((status) => {
    let sortedBookings = [...grouped[status]];

    if (sortBy === "date-asc") {
      sortedBookings.sort((a, b) => {
        // First compare dates
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const dateDiff = dateA.getTime() - dateB.getTime();

        if (dateDiff !== 0) return dateDiff;

        // If dates are same, compare times
        // Convert time strings (e.g., "14:30") to comparable format
        const timeA = a.timeSlot.from.split(":").map(Number);
        const timeB = b.timeSlot.from.split(":").map(Number);

        // Compare hours first, then minutes
        const hourDiff = timeA[0] - timeB[0];
        if (hourDiff !== 0) return hourDiff;

        return timeA[1] - timeB[1]; // Compare minutes
      });
    } else if (sortBy === "date-desc") {
      sortedBookings.sort((a, b) => {
        // First compare dates (reversed for descending)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const dateDiff = dateB.getTime() - dateA.getTime();

        if (dateDiff !== 0) return dateDiff;

        // If dates are same, compare times (reversed for descending)
        const timeA = a.timeSlot.from.split(":").map(Number);
        const timeB = b.timeSlot.from.split(":").map(Number);

        // Compare hours first, then minutes (reversed)
        const hourDiff = timeB[0] - timeA[0];
        if (hourDiff !== 0) return hourDiff;

        return timeB[1] - timeA[1]; // Compare minutes (reversed)
      });
    } else if (sortBy === "name-asc") {
      sortedBookings.sort((a, b) =>
        (a.customer?.name || "").localeCompare(b.customer?.name || "")
      );
    } else if (sortBy === "name-desc") {
      sortedBookings.sort((a, b) =>
        (b.customer?.name || "").localeCompare(a.customer?.name || "")
      );
    } else if (sortBy === "service-asc") {
      sortedBookings.sort((a, b) =>
        (a.serviceName || "").localeCompare(b.serviceName || "")
      );
    } else if (sortBy === "service-desc") {
      sortedBookings.sort((a, b) =>
        (b.serviceName || "").localeCompare(a.serviceName || "")
      );
    }

    sortedGroups[status] = sortedBookings;
  });

  // Restored original markCompleted function
  const markCompleted = async (bookingId) => {
    try {
      console.log("Mark completed triggered");
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

  // Initialize all statuses as expanded
  useEffect(() => {
    const initialExpanded = {};
    allStatuses.forEach((status) => {
      initialExpanded[status] = true;
    });
    setExpandedStatuses(initialExpanded);
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleStatus = (status) => {
    setExpandedStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const handleConfirmCash = async (bookingId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/confirm-cash`,
        {},
        { withCredentials: true }
      );
      toast.success("Cash payment confirmed!");
      await fetchBookings(); // refetch the provider bookings
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to confirm cash payment"
      );
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/bookings/provider-requests",
        { withCredentials: true }
      );
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError("Failed to load bookings");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-2 mb-6">
        <h2 className="py-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--primary)]">
          My Bookings
        </h2>

        <div className="flex gap-2 items-center justify-center">
          {/* Search */}
          <div className="relative w-3/4 xs:w-28 sm:w-32 md:w-44 lg:w-52">
            <FaSearch className="absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-2 py-1.5 rounded-full border border-gray-300 shadow text-sm w-full outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 shadow text-sm bg-white hover:bg-gray-50"
            >
              <FaFilter />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {showFilter && (
              <div
                ref={filterRef}
                className="absolute z-50 right-0 mt-2 w-[300px] bg-white border shadow-xl rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Filter</h3>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Status Filter */}
                  <div className="mb-4  border p-2 rounded">
                    <button
                      onClick={() => setShowStatusList(!showStatusList)}
                      className="w-full flex justify-between items-center text-sm font-semibold text-[var(--primary)] mb-1"
                    >
                      <span>Status</span>
                      <FaChevronDown
                        className={`transition-transform ${
                          showStatusList ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showStatusList && (
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 border rounded bg-gray-50 p-2">
                        {/* All Statuses Checkbox */}
                        <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--primary-light)] cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={
                              selectedStatuses.length === allStatuses.length
                            }
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedStatuses(
                                isChecked ? [...allStatuses] : []
                              );
                            }}
                            className="accent-[var(--primary)]"
                          />
                          <span className="text-sm">All Statuses</span>
                        </label>

                        {allStatuses.map((status) => (
                          <label
                            key={status}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--primary-light)] cursor-pointer w-full"
                          >
                            <input
                              type="checkbox"
                              value={status}
                              checked={selectedStatuses.includes(status)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedStatuses((prev) =>
                                  isChecked
                                    ? [...prev, status]
                                    : prev.filter((s) => s !== status)
                                );
                              }}
                              className="accent-[var(--primary)]"
                            />
                            <span className="text-sm capitalize">
                              {status.replace("-", " ")}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Range Filter */}
                  <div className="mb-4 border p-2 rounded">
                    <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                      Date Range
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                        className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="From"
                      />
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            to: e.target.value,
                          }))
                        }
                        className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="To"
                      />
                    </div>
                  </div>

                  {/* Clear All */}
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => {
                        setSelectedStatuses([]);
                        setDateRange({ from: "", to: "" });
                      }}
                      className="text-sm text-[var(--gray)] hover:underline hover:scale-105 transition-transform duration-100 ease-linear"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 shadow text-sm bg-white hover:bg-gray-50"
            >
              <img src="/icons/sort.png" alt="Filter" className="w-5 h-4" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            {showSort && (
              <div
                ref={sortRef}
                className="absolute z-50 right-0 mt-2 w-[260px] bg-white border shadow-xl rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Sort</h3>
                  <button
                    onClick={() => setShowSort(false)}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-[var(--primary)]">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value=""
                      checked={sortBy === ""}
                      onChange={() => setSortBy("")}
                      className="accent-[var(--ternary)]"
                    />
                    Default
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value="date-asc"
                      checked={sortBy === "date-asc"}
                      onChange={() => setSortBy("date-asc")}
                      className="accent-[var(--ternary)]"
                    />
                    Date & Time: Earliest → Latest
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value="date-desc"
                      checked={sortBy === "date-desc"}
                      onChange={() => setSortBy("date-desc")}
                      className="accent-[var(--ternary)]"
                    />
                    Date & Time: Latest → Earliest
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value="name-asc"
                      checked={sortBy === "name-asc"}
                      onChange={() => setSortBy("name-asc")}
                      className="accent-[var(--ternary)]"
                    />
                    Customer Name: A → Z
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value="name-desc"
                      checked={sortBy === "name-desc"}
                      onChange={() => setSortBy("name-desc")}
                      className="accent-[var(--ternary)]"
                    />
                    Customer Name: Z → A
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value="service-asc"
                      checked={sortBy === "service-asc"}
                      onChange={() => setSortBy("service-asc")}
                      className="accent-[var(--ternary)]"
                    />
                    Service Name: A → Z
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value="service-desc"
                      checked={sortBy === "service-desc"}
                      onChange={() => setSortBy("service-desc")}
                      className="accent-[var(--ternary)]"
                    />
                    Service Name: Z → A
                  </label>
                </div>

                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => setSortBy("")}
                    className="text-sm text-[var(--gray)] hover:underline hover:scale-105 transition-transform duration-100 ease-linear"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div
          className="text-center text-xl"
          style={{ color: "var(--primary)" }}
        >
          Loading...
        </div>
      ) : Object.keys(sortedGroups).length === 0 ? (
        <div className="text-center mt-10">
          <img
            src="/icons/no-booking.webp"
            alt="No results"
            className="w-52 mx-auto mb-2"
          />
          <h3 className="text-2xl text-[var(--primary)] font-semibold">
            Oops! No bookings found
          </h3>
          <p className="text-xl text-[var(--gray)] mt-3">Try something else</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {Object.entries(sortedGroups).map(([status, group]) => {
            const isStatusOpen = expandedStatuses[status];
            return (
              <div
                key={status}
                className="bg-white border shadow rounded-xl p-4 space-y-4"
              >
                <button
                  onClick={() => toggleStatus(status)}
                  className="w-full text-left text-2xl font-bold text-[var(--primary)] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {status.replace("-", " ").toUpperCase()} ({group.length})
                  </span>
                  <FaChevronDown
                    className={`transition-transform ${
                      isStatusOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Cards */}
                {isStatusOpen && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {group.map((b, idx) => (
                      <motion.div
                        key={b._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="bg-white shadow-lg rounded-xl p-4 border"
                      >
                        <div className="flex flex-col justify-between overflow-x-auto max-w-full">
                          <div className="flex flex-row overflow-x-auto">
                            {/* Details */}
                            <div className="w-3/5 mr-5">
                              {/* Avatar */}
                              <div className="flex items-center gap-4 mb-3">
                                {b.customer?.avatarUrl ? (
                                  <img
                                    src={b.customer.avatarUrl}
                                    alt={b.customer?.name || "User"}
                                    className="w-12 h-12 rounded-full border shadow object-cover hover:scale-110"
                                  />
                                ) : (
                                  <div
                                    className="w-12 h-12 flex items-center justify-center rounded-full font-bold shadow"
                                    style={{
                                      backgroundColor: "var(--primary-light)",
                                      color: "var(--primary)",
                                    }}
                                  >
                                    {b.customer?.name?.[0]?.toUpperCase() ||
                                      "U"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-[var(--primary)]">
                                    {b.customer?.name || "Unknown User"}
                                  </div>
                                </div>
                              </div>
                              {/* Details */}
                              <div className="space-y-1 mb-3">
                                <div
                                  className="text-sm"
                                  style={{ color: "var(--gray)" }}
                                >
                                  <strong>Service:</strong> {b.serviceName}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "var(--gray)" }}
                                >
                                  <strong>Date:</strong>{" "}
                                  {dayjs(b.date).format("DD MMM YYYY")}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "var(--gray)" }}
                                >
                                  <strong>Time:</strong> {b.timeSlot.from} -{" "}
                                  {b.timeSlot.to}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "var(--gray)" }}
                                >
                                  <strong>Address:</strong> {b.address || "—"}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "var(--gray)" }}
                                >
                                  <strong>Notes:</strong> {b.notes || "—"}
                                </div>

                                {/* Status */}
                                <div className="flex flex-row gap-1">
                                  <strong
                                    className="text-sm"
                                    style={{ color: "var(--gray)" }}
                                  >
                                    Booking Status:
                                  </strong>
                                  <div
                                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${statusColor[status]}`}
                                  >
                                    {status.replace("-", " ")}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Track */}
                            <div className="w-2/5 pl-4">
                              <BookingStatusTimeline
                                statusHistory={b.statusHistory}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 w-3/5 mb-2">
                            {/* Amount */}
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 w-4/5 max-w-xs">
                              <div className="text-sm text-green-600 font-medium">
                                Service Amount
                              </div>

                              {/* Show quantity for non-fixed units */}
                              {b.unit && b.unit !== "fixed" && (
                                <div className="text-xs text-green-600 mt-1">
                                  {b.units || 1} × ₹
                                  {b.serviceAmount / (b.units || 1)} per{" "}
                                  {b.unit}
                                </div>
                              )}

                              {/* Show fixed price or total */}
                              <div className="text-2xl font-bold text-green-700 mt-1">
                                ₹{b.serviceAmount || 0}
                              </div>
                            </div>
                            {/* Payment Status */}
                            {b.paymentStatus && (
                              <div
                                className={`text-sm w-4/5 font-medium px-3 py-1 rounded-full ${
                                  b.paymentStatus === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : b.paymentStatus === "partial"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                Payment :{" "}
                                {b.paymentStatus === "paid"
                                  ? "Paid"
                                  : b.paymentStatus === "partial"
                                  ? "Partially Paid"
                                  : "Pending"}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {status === "pending" && (
                            <div className="flex flex-wrap gap-4 p-1">
                              <button
                                className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-gradient-to-b from-green-400 to-green-800 text-white hover:scale-105"
                                disabled={actionLoading === b._id + "confirmed"}
                                onClick={() => handleStatus(b._id, "confirmed")}
                              >
                                <FaCheck /> Accept
                              </button>
                              <button
                                className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-gradient-to-b from-red-400 to-red-800 text-white hover:scale-105"
                                disabled={actionLoading === b._id + "rejected"}
                                onClick={() => handleStatus(b._id, "rejected")}
                              >
                                <FaTimes /> Reject
                              </button>
                              <button
                                className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-gradient-to-b from-blue-400 to-blue-800 text-white hover:scale-105"
                                onClick={() => setShowTimeUpdate(b._id)}
                              >
                                <FaClock /> Reschedule
                              </button>
                            </div>
                          )}

                          {status === "update-time" && (
                            <div className="text-[var(--secondary)] text-sm flex items-center gap-2 mt-2">
                              <FaSyncAlt /> Awaiting customer response
                            </div>
                          )}

                          {showTimeUpdate === b._id && (
                            <div className="mt-4 p-3 bg-gray-50 border rounded-lg shadow-sm">
                              <div className="flex gap-3 mb-2 items-center">
                                <input
                                  type="time"
                                  value={newFrom}
                                  onChange={(e) => {
                                    setNewFrom(e.target.value);
                                    setTimeError(""); // Clear error on change
                                  }}
                                  className="border px-2 py-1 rounded text-sm"
                                />
                                <span> to </span>
                                <input
                                  type="time"
                                  value={newTo}
                                  onChange={(e) => {
                                    setNewTo(e.target.value);
                                    setTimeError(""); // Clear error on change
                                  }}
                                  className="border px-2 py-1 rounded text-sm"
                                />
                              </div>

                              {timeError && (
                                <div className="flex flex-row gap-2 text-red-500 ">
                                  <i className="fas fa-exclamation-circle"></i>

                                  <p className="text-xs mb-2">{timeError}</p>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button
                                  className="bg-gradient-to-b from-blue-400 to-blue-800 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                                  disabled={
                                    actionLoading === b._id + "update-time"
                                  }
                                  onClick={() => {
                                    if (!newFrom || !newTo) {
                                      setTimeError(
                                        "Both 'from' and 'to' times are required."
                                      );
                                      return;
                                    }
                                    setTimeError(""); // Clear error if valid
                                    handleStatus(b._id, "update-time", {
                                      from: newFrom,
                                      to: newTo,
                                    });
                                  }}
                                >
                                  Send Updated Time
                                </button>

                                <button
                                  className="bg-gradient-to-b from-gray-400 to-gray-600 text-white text-sm px-3 py-1 rounded hover:bg-gray-400"
                                  onClick={() => {
                                    setShowTimeUpdate(null);
                                    setTimeError("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {b.otp && !b.otpVerified && (
                            <div className="mt-2">
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  setOtpError((prev) => ({
                                    ...prev,
                                    [b._id]: "",
                                  }));
                                  try {
                                    await axios.post(
                                      `http://localhost:5000/api/bookings/verify-otp/${b._id}`,
                                      { otp: otpInputs[b._id] },
                                      { withCredentials: true }
                                    );

                                    // refresh bookings
                                    // const res = await axios.get(
                                    //   "http://localhost:5000/api/bookings/provider-requests",
                                    //   {
                                    //     withCredentials: true,
                                    //   }
                                    // );
                                    // setBookings(res.data.bookings || []);
                                    await fetchBookings();
                                  } catch (error) {
                                    const msg =
                                      error.response?.data?.message ||
                                      "OTP verification failed";
                                    setOtpError((prev) => ({
                                      ...prev,
                                      [b._id]: msg,
                                    }));
                                  }
                                }}
                              >
                                <input
                                  type="text"
                                  value={otpInputs[b._id] || ""}
                                  onChange={(e) =>
                                    setOtpInputs((prev) => ({
                                      ...prev,
                                      [b._id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter OTP"
                                  className="border px-2 py-1 rounded w-32 text-sm"
                                />
                                <button className="ml-2 px-3 py-1 bg-gradient-to-r from-[var(--ternary)] to-[var(--secondary)] hover:scale-105 text-sm text-white rounded">
                                  Verify OTP
                                </button>

                                {otpError[b._id] && (
                                  <div className="flex gap-2 text-sm text-red-700 mt-3">
                                    <i className="fas fa-exclamation-circle mt-1"></i>
                                    {otpError[b._id]}
                                  </div>
                                )}
                              </form>
                            </div>
                          )}

                          {b.otpVerified && !b.completedByProvider && (
                            <button
                              onClick={() => markCompleted(b._id)}
                              className="mt-2 px-3 py-1 bg-gradient-to-r from-[var(--ternary)] to-[var(--secondary)] text-white rounded w-full"
                            >
                              Mark Completed
                            </button>
                          )}

                          {/* Cash Received */}
                          {b.paymentStatus === "cash_initiated" && (
                            <button
                              onClick={() => handleConfirmCash(b._id)}
                              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Confirm Cash Received
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <div className="text-center text-red-500 mt-6">{error}</div>}
    </div>
  );
}
