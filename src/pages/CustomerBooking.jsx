import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import BookingStatusTimeline from "../components/BookingStatusTimeline";
import { FaCheck, FaTimes } from "react-icons/fa";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import ReactStars from "react-rating-stars-component";

dayjs.extend(isSameOrAfter);

export default function CustomerBookings() {
  const { backendUrl, userData } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [tick, setTick] = useState(0);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [splitCount, setSplitCount] = useState(1);
  const [splitUsers, setSplitUsers] = useState([{ email: "" }]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [openedBookingId, setOpenedBookingId] = useState(null);
  const [paymentActionStatus, setPaymentActionStatus] = useState({});
  const [splitLinks, setSplitLinks] = useState({});
  const [shareAmount, setShareAmount] = useState("");
  const [splitModalBooking, setSplitModalBooking] = useState(null);

  const allStatuses = [
    "pending",
    "confirmed",
    "rejected",
    "update-time",
    "in-progress",
    "completed",
    "cancelled",
  ];

  // Search and filter states
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showStatusList, setShowStatusList] = useState(false);
  const [showPaymentStatusList, setShowPaymentStatusList] = useState(false);
  const [sortBy, setSortBy] = useState("");

  // Refs for outside click detection
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const modalRef = useRef();

  useEffect(() => {
    getBookings();
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
                `${backendUrl}/api/bookings/generate-otp/${b._id}`,
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

    fetchOtpForEligibleBookings();
  }, [tick]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setConfirmCancelId(null);
      }
    };

    if (confirmCancelId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmCancelId]);

  const getBookings = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/my-bookings`, {
        withCredentials: true,
      });
      setBookings(res.data.bookings || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load bookings");
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/bookings/filter",
        {
          search,
          statuses: selectedStatuses,
          paymentStatuses: selectedPaymentStatuses,
          dateRange,
          sortBy,
        },
        { withCredentials: true }
      );
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError("Failed to load bookings");
    }
    setLoading(false);
  };

  // split payment fuctions
  const handleSplitCountChange = (e) => {
    const count = parseInt(e.target.value);
    setSplitCount(count);
    setSplitUsers(Array.from({ length: count }, () => ({ email: "" })));
  };

  const handleSplitUserChange = (index, value) => {
    const updated = [...splitUsers];
    updated[index].email = value;
    setSplitUsers(updated);
  };

  const handleSplitPay = async () => {
    if (!selectedBooking || splitUsers.length === 0) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/payments/split-link`,
        {
          bookingId: selectedBooking._id,
          emails: splitUsers.map((u) => u.email),
        },
        { withCredentials: true }
      );

      // toast.success("Payment links sent to users!");
      setSplitModalOpen(false);
      setSplitUsers([]);
    } catch (err) {
      toast.error("Failed to send split payment links.");
      console.error("Split link error:", err);
    }
  };

  // mark complete
  const markCompleted = async (bookingId) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/bookings/mark-complete/${bookingId}`,
        {},
        { withCredentials: true }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.data.booking : b))
      );
      getBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as complete");
    }
  };

  const respondToUpdate = async (id, response) => {
    setActionLoading(id + response);
    try {
      const res = await axios.patch(
        `${backendUrl}/api/bookings/${id}/customer-response`,
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

  // const filteredBookings =
  //   filter === "all"
  //     ? bookings
  //     : bookings.filter((b) => latestStatus(b.statusHistory) === filter);

  const isTooCloseToBooking = (b) => {
    const bookingDateTime = dayjs(
      `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
      "YYYY-MM-DD HH:mm"
    );
    const diffMins = bookingDateTime.diff(dayjs(), "minute");
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

  // Payment by razorpay
  const handlePayOnline = async (booking) => {
    try {
      // Don't multiply by 100 here - let backend handle it
      const { data: order } = await axios.post(
        `${backendUrl}/api/payments/create-order`,
        {
          amount: booking.totalAmount,
          bookingId: booking._id,
        },
        { withCredentials: true }
      );

      // Validate environment variable
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey) {
        throw new Error("Razorpay key not found in environment variables");
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "ServeGo",
        description: booking.serviceName,
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post(
              `${backendUrl}/api/payments/verify`,
              {
                response,
                bookingId: booking._id,
                userId: userData._id,
                amount: booking.totalAmount,
              },
              { withCredentials: true }
            );
            // toast.success("Payment Successful!");
            getBookings();
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed!");
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
        theme: {
          color: "#080a33",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled by user");
          },
        },
      };

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      toast.error(err.response?.data?.message || "Failed to initiate payment.");
    }
  };

  // Cash Payment
  const handleCashOption = async (booking) => {
    try {
      await axios.patch(
        `${backendUrl}/api/bookings/${booking._id}/initiate-cash`,
        {},
        { withCredentials: true }
      );
      // toast.info("Waiting for provider to confirm cash");
      getBookings();
    } catch (err) {
      toast.error("Failed to initiate cash payment");
    }
  };

  // Split Payment
  const openSplitModal = (booking) => {
    setSelectedBooking(booking);
    setSplitModalOpen(true);
  };

  // Feedback
  const handleSubmitFeedback = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/bookings/${selectedBookingId}/feedback`,
        { rating, review },
        { withCredentials: true }
      );
      console.log("Feedback submitted for booking:", selectedBookingId);

      console.log("Feedback submitted for booking:", selectedBookingId, {
        rating,
        review,
      });

      // toast.success("Feedback submitted and booking marked as completed!");
      setShowFeedbackModal(false);
      setRating(0);
      setReview("");
      getBookings(); // refresh data
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback");
    }
  };

  // header
  // Filter and search logic
  let filteredBookings = bookings;

  // Search
  if (search.trim()) {
    filteredBookings = filteredBookings.filter(
      (b) =>
        b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.provider?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        b.address?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Booking status filter
  if (selectedStatuses.length > 0) {
    filteredBookings = filteredBookings.filter((b) => {
      const currentStatus =
        b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
      return selectedStatuses.includes(currentStatus);
    });
  }

  // Payment status filter
  if (selectedPaymentStatuses.length > 0) {
    filteredBookings = filteredBookings.filter((b) =>
      selectedPaymentStatuses.includes(b.paymentStatus)
    );
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

  // Sort groups
  let sortedBookings = [...filteredBookings];
  // Object.keys(grouped).forEach((status) => {
  // let sortedBookings = [...grouped[status]];

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
      (a.provider?.name || "").localeCompare(b.provider?.name || "")
    );
  } else if (sortBy === "name-desc") {
    sortedBookings.sort((a, b) =>
      (b.provider?.name || "").localeCompare(a.provider?.name || "")
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
  // sortedGroups[status] = sortedBookings;
  //     console.log(
  //   "name-asc sorted:",
  //   sortedBookings.map((b) => b.provider?.name || "Unknown")
  // );
  // });

  // Group by status
  // Group by status using the sorted array
  const grouped = sortedBookings.reduce((acc, b) => {
    const latest =
      b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
    acc[latest] = acc[latest] || [];
    acc[latest].push(b);
    return acc;
  }, {});

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

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-12">
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
                  {/* Booking Status Filter */}
                  <div className="mb-2 border p-2 rounded">
                    <button
                      onClick={() => setShowStatusList(!showStatusList)}
                      className="w-full flex justify-between items-center text-sm font-semibold text-[var(--primary)] mb-1"
                    >
                      <span>Booking Status</span>
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
                          <span className="text-sm">All</span>
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

                  {/* Payment Status Filter */}
                  <div className="mb-4 border p-2 rounded">
                    <button
                      onClick={() =>
                        setShowPaymentStatusList(!showPaymentStatusList)
                      }
                      className="w-full flex justify-between items-center text-sm font-semibold text-[var(--primary)] mb-1"
                    >
                      <span>Payment Status</span>
                      <FaChevronDown
                        className={`transition-transform ${
                          showPaymentStatusList ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showPaymentStatusList && (
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 border rounded bg-gray-50 p-2">
                        {/* All Payment Statuses Checkbox */}
                        <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--primary-light)] cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={
                              selectedPaymentStatuses.length ===
                              ["paid", "partial", "pending"].length
                            }
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedPaymentStatuses(
                                isChecked ? ["paid", "partial", "pending"] : []
                              );
                            }}
                            className="accent-[var(--primary)]"
                          />
                          <span className="text-sm">All</span>
                        </label>

                        {["paid", "partial", "pending"].map((status) => (
                          <label
                            key={status}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--primary-light)] cursor-pointer w-full"
                          >
                            <input
                              type="checkbox"
                              value={status}
                              checked={selectedPaymentStatuses.includes(status)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedPaymentStatuses((prev) =>
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
                    Provider Name: A → Z
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
                    Provider Name: Z → A
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

      <div className="w-full mx-auto px-6 max-w-7xl">
        {/* <div className="flex flex-wrap justify-center gap-2 mb-6">
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
        </div> */}

        {loading ? (
          <div
            className="text-center text-xl"
            style={{ color: "var(--primary)" }}
          >
            Loading...
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="text-center mt-10">
            <img
              src="/icons/no-booking.webp"
              alt="No results"
              className="w-52 mx-auto mb-2"
            />
            <h3 className="text-2xl text-[var(--primary)] font-semibold">
              Oops! No bookings found
            </h3>
            <p className="text-xl text-[var(--gray)] mt-3">
              Try something else
            </p>
          </div>
        ) : (
          <div className="w-full mx-auto p-6 max-w-7xl">
            {sortedBookings.map((b, idx) => {
              // const isStatusOpen = expandedStatuses[status];
              const status =
                b.statusHistory?.[b.statusHistory.length - 1]?.status ||
                "pending";
              const isOpen = openedBookingId === b._id;
              const toggleOpen = () =>
                setOpenedBookingId((prev) => (prev === b._id ? null : b._id));
              // return (

              // <div key={status} className="space-y-6">
              //   {/* Collapsible cards matching customer booking style */}
              //   {group.map((b, idx) => {
              //     const isOpen = openedBookingId === b._id;
              //     const toggleOpen = () => {
              //       setOpenedBookingId((prev) =>
              //         prev === b._id ? null : b._id
              //       );
              //     };

              return (
                <div
                  key={b._id}
                  className="border rounded-xl hover:rounded-xl shadow-lg bg-white transition-all duration-300 mb-6"
                >
                  {/* Collapsed Header */}
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 hover:rounded-xl"
                    onClick={toggleOpen}
                  >
                    <div className="flex items-center gap-4">
                      {/* <img
                        src={b.provider?.avatar || "/default-avatar.png"}
                        alt="Provider"
                        className="w-12 h-12 rounded-full border object-cover"
                      /> */}

                      <div className="flex items-center gap-4 mb-3">
                        {b.provider?.avatarUrl ? (
                          <a href={b.provider.avatarUrl} target="_blank">
                            <img
                              src={b.provider.avatarUrl}
                              alt={b.provider?.name || "Provider"}
                              className="w-16 h-16 rounded-full border shadow object-cover hover:scale-110"
                            />
                          </a>
                        ) : (
                          <div
                            className="w-16 h-16 flex items-center justify-center rounded-full font-bold shadow"
                            style={{
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary)",
                            }}
                          >
                            {b.provider?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-[var(--primary)]">
                          {b.provider?.name || "Unknown Provider"}
                        </div>

                        <div className="text-sm text-gray-500 flex flex-col">
                          <div>{b.serviceName}</div>

                          <div className="flex items-left gap-2 mt-1 flex-col md:flex-row">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt className="text-[var(--secondary)]" />
                              <span>{dayjs(b.date).format("DD MMM YYYY")}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <FaClock className="text-[var(--secondary)]" />
                              <span>
                                {b.timeSlot.from} - {b.timeSlot.to}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
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
                      </span>
                      <i
                        className={`fas fa-chevron-${
                          isOpen ? "up" : "down"
                        } text-gray-500 transition-transform`}
                      ></i>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 space-y-4">
                      {/* Notes */}
                      <div className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--secondary)] border-l-4 border-[var(--secondary)] rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-[var(--secondary)] mb-3">
                          Booking Details
                        </h4>

                        <div className="bg-white rounded-lg p-4 border-2 border-[var(--secondary)] text-sm text-gray-700">
                          <p>
                            <strong className="text-gray-800">Address:</strong>{" "}
                            {b.address || "No address specified"}
                          </p>
                          <p>
                            <strong className="text-gray-800">Notes:</strong>{" "}
                            {b.notes || "No additional notes"}
                          </p>
                        </div>
                      </div>

                      {/* Reshedule time */}
                      {status === "update-time" && (
                        <div className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--secondary)] border-l-4 border-[var(--secondary)] rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-semibold text-[var(--secondary)]">
                              Time Update Request
                            </h4>
                          </div>

                          <div className="bg-white rounded-lg p-4 border-2 border-[var(--secondary)] mb-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-800">
                                  Current Time:
                                </p>
                                <p className="text-[var(--gray)] font-mono">
                                  {b.timeSlot.from} - {b.timeSlot.to}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  Proposed Time:
                                </p>
                                <p className="text-[var(--gray)] font-mono">
                                  {b.updatedSlot?.from} - {b.updatedSlot?.to}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-green-400 to-green-900 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-md"
                              disabled={actionLoading === b._id + "accepted"}
                              onClick={() => respondToUpdate(b._id, "accepted")}
                            >
                              <FaCheck className="w-4 h-4" />
                              Accept
                            </button>
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-red-400 to-red-800 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-md"
                              onClick={() => setConfirmCancelId(b._id)}
                            >
                              <FaTimes className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* OTP Section */}
                      {b.otp && !b.otpVerified && (
                        <div className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--secondary)] border-l-4 border-[var(--secondary)] rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-semibold text-[var(--secondary)]">
                              Service Verification OTP
                            </h4>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-2 border-[(var(--secondary))] text-center">
                            <div className="text-3xl font-bold text-[var(--secondary)] tracking-widest mb-2 font-mono">
                              {b.otp}
                            </div>
                            <p className="text-sm text-[(--gray)]">
                              Share this OTP with service provider to start
                              service
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Breakdown */}
                      <div className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--secondary)] border-l-4 border-[var(--secondary)] rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-[var(--secondary)]">
                            Payment Details
                          </h4>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-2 border-[var(--secondary)] text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Service Amount:</span>
                            <span className="font-medium">
                              ₹{b.serviceAmount || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee:</span>
                            <span className="font-medium">
                              ₹{b.platformFee || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-bold border-t border-[var(--secondary)] pt-2">
                            <span>Total Amount:</span>
                            <span>₹{b.totalAmount || 0}</span>
                          </div>
                        </div>
                        {/* Payment Status */}
                        {b.paymentStatus && (
                          <div className="mt-4">
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border-2 ${
                                b.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : b.paymentStatus === "partial"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }`}
                            >
                              {b.paymentStatus === "paid"
                                ? "Payment Complete"
                                : b.paymentStatus === "partial"
                                ? "Partially Paid"
                                : "Payment Pending"}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Options */}

                      {["confirmed", "in-progress", "completed"].includes(
                        status
                      ) &&
                        b.paymentStatus !== "paid" && (
                          <div className="mt-6 w-full">
                            <div className="flex flex-col justify-between sm:flex-row gap-4">
                              {/* Pay Online Button */}
                              <button
                                onClick={() => handlePayOnline(b)}
                                disabled={
                                  paymentActionStatus[b._id] === "loading"
                                }
                                className={`flex items-center justify-center gap-2 px-3 w-full sm:w-1/3 py-3 font-semibold rounded shadow-lg transition duration-300 
    ${
      paymentActionStatus[b._id] === "loading"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-b from-blue-400 to-blue-700 hover:scale-105 text-white"
    }`}
                              >
                                <span>💳</span>
                                <span>
                                  {paymentActionStatus[b._id] === "loading"
                                    ? "Waiting..."
                                    : "Pay Online"}
                                </span>
                              </button>

                              {/* Pay by Cash Button */}
                              <button
                                onClick={() => {
                                  setPaymentActionStatus((prev) => ({
                                    ...prev,
                                    [b._id]: "cash",
                                  }));
                                  handleCashOption(b);
                                }}
                                disabled={paymentActionStatus[b._id] === "cash"}
                                className="flex items-center justify-center gap-2 px-3 w-full sm:w-1/3 py-3 bg-gradient-to-b from-emerald-400 to-emerald-700 text-white font-semibold rounded hover:scale-105 shadow-lg transition duration-300 disabled:opacity-60"
                              >
                                💵{" "}
                                {paymentActionStatus[b._id] === "cash"
                                  ? "Waiting for provider to confirm..."
                                  : "Pay by Cash"}
                              </button>

                              {/* Split Payment Button */}
                              <button
                                onClick={() => {
                                  setPaymentActionStatus((prev) => ({
                                    ...prev,
                                    [b._id]: "split",
                                  }));
                                  openSplitModal(b);
                                }}
                                className="flex items-center justify-center gap-2 px-3 w-full sm:w-1/3 py-3 bg-gradient-to-b from-purple-400 to-purple-700 text-white font-semibold rounded hover:scale-105 shadow-lg transition duration-300"
                              >
                                👥 Split Payment
                              </button>
                            </div>

                            {/* Split Payment Status Section */}
                            {(paymentActionStatus[b._id] === "split" ||
                              b.paymentStatus === "partial") && (
                              <div className="mt-4 bg-gradient-to-r from-[var(--primary-light)] to-[var(--secondary)] border-l-4 border-[var(--secondary)] rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-[var(--secondary)] mb-3">
                                  Split Payment Status
                                </h4>

                                <div className="mt-2">
                                  <p className="text-sm text-gray-600 my-2">
                                    {
                                      b.splitLinksSent.filter((e) => e.paid)
                                        .length
                                    }
                                    /{b.splitLinksSent.length} Paid
                                  </p>
                                </div>

                                <div className="bg-white rounded-lg p-4 border-2 border-[var(--secondary)]">
                                  {b.splitLinksSent?.length === 0 ? (
                                    <p className="text-gray-600 text-sm">
                                      No split links have been sent yet
                                    </p>
                                  ) : (
                                    <ul className="space-y-3 text-sm">
                                      {b.splitLinksSent.map((person, index) => (
                                        <li
                                          key={index}
                                          className="flex justify-between items-center border-b pb-2 border-dashed border-gray-300"
                                        >
                                          <div className="text-gray-700 font-medium">
                                            {person.email}
                                          </div>
                                          <span
                                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                              person.paid
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                          >
                                            {person.paid
                                              ? "Paid ✅"
                                              : "Pending ⏳"}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Cancel Button */}
                      {["pending", "confirmed"].includes(status) && (
                        <button
                          title={
                            isTooCloseToBooking(b)
                              ? "Booking cannot be cancelled within 2 hours"
                              : ""
                          }
                          disabled={isTooCloseToBooking(b)}
                          onClick={() => {
                            if (!isTooCloseToBooking(b))
                              setConfirmCancelId(b._id);
                          }}
                          className={`flex items-center justify-center gap-2 px-6 py-3 w-full font-semibold rounded hover:scale-105 shadow-lg transition duration-300"

                ${
                  isTooCloseToBooking(b)
                    ? "bg-gradient-to-b from-gray-100 to-gray-400 text-gray-800 cursor-not-allowed"
                    : "bg-gradient-to-b from-red-400 to-red-800 text-white"
                }`}
                        >
                          <FaTimes /> Cancel Booking
                        </button>
                      )}

                      {/* Mark Completed */}
                      {b.otpVerified && !b.completedByCustomer && (
                        <button
                          onClick={() => {
                            setSelectedBookingId(b._id);
                            setShowFeedbackModal(true);
                          }}
                          className="flex items-center justify-center bg-gradient-to-b from-[var(--ternary)] to-[var(--secondary)] text-white gap-2 px-6 py-3 w-full font-semibold rounded hover:scale-105 shadow-lg transition duration-300"
                        >
                          Mark Completed
                        </button>
                      )}

                      {/* Timeline */}
                      <div className="pt-2">
                        <BookingStatusTimeline
                          statusHistory={b.statusHistory}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          // );
          // })}
          // </div>
        )}

        {/* Cancel Modal */}
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

        {/* Split Payment Modal */}
        {splitModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
                Split Payment
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-bold">Total Amount:</span> ₹
                {selectedBooking?.totalAmount}
              </p>

              <div className="mb-4 flex flex-row gap-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. of persons splitting :
                </label>
                <input
                  type="number"
                  min="1"
                  value={splitCount}
                  onChange={handleSplitCountChange}
                  placeholder="No. of persons"
                  className="w-32 px-3 py-1 border text-xs border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 my-4">
                {splitUsers.map((u, idx) => (
                  <input
                    key={idx}
                    type="email"
                    className="mt-2 w-full border px-2 py-1 rounded-md text-sm"
                    placeholder={`Person ${idx + 1} Email`}
                    value={u.email}
                    onChange={(e) => handleSplitUserChange(idx, e.target.value)}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => {
                    setSplitModalOpen(false);
                    setShareAmount("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-gradient-to-b from-[var(--ternary)] to-[var(--secondary)] text-white px-4 py-2 rounded hover:bg-[var(--primary)]"
                  onClick={handleSplitPay}
                >
                  Pay Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Rate Your Experience
              </h2>

              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    onClick={() => setRating(i)}
                    className={`cursor-pointer text-2xl ${
                      i <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Write a short review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-b from-[var(--ternary)] to-[var(--secondary)] text-white rounded-md"
                  onClick={handleSubmitFeedback}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
