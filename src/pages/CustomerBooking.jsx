import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import BookingStatusTimeline from "../components/BookingStatusTimeline";
import { FaCheck, FaTimes } from "react-icons/fa";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-toastify";
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

  const modalRef = useRef();

  // useEffect(() => {
  //   getBookings(); // initial call

  //   const interval = setInterval(getBookings, 10_000); // poll every 5 seconds

  //   return () => clearInterval(interval); // cleanup
  // }, []);

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

      toast.success("Payment links sent to users!");
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
            toast.success("Payment Successful!");
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
      toast.info("Waiting for provider to confirm cash");
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

      toast.success("Feedback submitted!");
      setShowFeedbackModal(false);
      setRating(0);
      setReview("");
      getBookings(); // refresh data
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-[var(--background-light)]">
      <div className="w-full mx-auto bg-white shadow-md rounded-xl p-6 max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-6">
          My Bookings
        </h2>

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
          <div className="space-y-6">
            {filteredBookings.map((b) => {
              const status = latestStatus(b.statusHistory);
              return (
                <div
                  key={b._id}
                  className="border rounded-xl p-4 shadow-md bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <div className="font-semibold text-[var(--primary)]">
                        {b.serviceName}
                      </div>
                      <div className="text-sm text-[var(--secondary)]">
                        {dayjs(b.date).format("DD MMM YYYY")} |{" "}
                        {b.timeSlot.from} - {b.timeSlot.to}
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

                    <div className="flex flex-col gap-2 items-start">
                      {status === "update-time" && (
                        <div>
                          <div className="text-[var(--secondary)] text-sm font-semibold">
                            Provider proposed a new time:
                          </div>
                          <div className="text-xs text-[var(--gray)]">
                            <div>
                              Earlier: {b.timeSlot.from} - {b.timeSlot.to}
                            </div>
                            <div>
                              New: {b.updatedSlot?.from} - {b.updatedSlot?.to}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
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

                      {/* OTP */}
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
                            if (!isTooCloseToBooking(b))
                              setConfirmCancelId(b._id);
                          }}
                          disabled={isTooCloseToBooking(b)}
                        >
                          <FaTimes /> Cancel Booking
                        </button>
                      )}

                      {/* Payment Options */}
                      {["confirmed", "in-progress", "completed"].includes(
                        status
                      ) &&
                        b.paymentStatus !== "paid" && (
                          <div className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
                            <button
                              onClick={() => handlePayOnline(b)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 shadow-lg transition duration-300"
                            >
                              <span>💳</span>
                              <span>Pay Online</span>
                            </button>

                            <button
                              onClick={() => handleCashOption(b)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 shadow-lg transition duration-300"
                            >
                              <span>💵</span>
                              <span>Pay by Cash</span>
                            </button>

                            <button
                              onClick={() => openSplitModal(b)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 shadow-lg transition duration-300"
                            >
                              <span>👥</span>
                              <span>Split Payment</span>
                            </button>
                          </div>
                        )}

                      {/* Price Display */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 w-3/4">
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">
                            Service Amount
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            ₹{b.serviceAmount || 0}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Platform Fee: ₹{b.platformFee || 0}
                          </div>
                          <div className="text-sm font-semibold text-green-800 border-t border-green-300 pt-1 mt-1">
                            Total: ₹{b.totalAmount || 0}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status */}

                      {b.paymentStatus && (
                        <div
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            b.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : b.paymentStatus === "partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Payment Status:{" "}
                          {b.paymentStatus === "paid"
                            ? "Paid"
                            : b.paymentStatus === "partial"
                            ? "Partially Paid"
                            : "Pending"}
                        </div>
                      )}

                      {/* Mark Complete */}
                      {b.otpVerified && !b.completedByCustomer && (
                        // <button
                        //   onClick={() => markCompleted(b._id)}
                        //   className="mt-2 px-3 py-1 bg-[var(--ternary)] text-white rounded hover:bg-[var(--secondary)]"
                        // >
                        //   Mark Completed
                        // </button>
                        <button
                          onClick={() => {
                            setSelectedBookingId(b._id);
                            setShowFeedbackModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md"
                        >
                          Mark as Complete
                        </button>
                      )}

                      {/* Display feedback */}
                      {b.customerFeedback?.rating && (
                        <div className="mt-2 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-yellow-500">
                              {"★".repeat(b.customerFeedback.rating)}
                              {"☆".repeat(5 - b.customerFeedback.rating)}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({b.customerFeedback.rating}/5)
                            </span>
                          </div>
                          <p className="mt-1 italic">
                            “{b.customerFeedback.review}”
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Status Timeline */}
                  <div className="mt-4">
                    <BookingStatusTimeline statusHistory={b.statusHistory} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={handleSubmitFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ***************************version 2*************************************
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import BookingStatusTimeline from "../components/BookingStatusTimeline";
// import { FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaCreditCard, FaMoneyBillWave, FaUsers, FaCalendarAlt, FaClock, FaRupeeSign } from "react-icons/fa";
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import { useAppContext } from "../context/AppContext";
// import { toast } from "react-toastify";

// dayjs.extend(isSameOrAfter);

// export default function CustomerBookings() {
//   const { backendUrl, userData } = useAppContext();

//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState("");
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [confirmCancelId, setConfirmCancelId] = useState(null);
//   const [tick, setTick] = useState(0);
//   const [splitModalOpen, setSplitModalOpen] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [splitCount, setSplitCount] = useState(1);
//   const [splitUsers, setSplitUsers] = useState([{ email: "" }]);
//   const [expandedBookings, setExpandedBookings] = useState({});

//   const modalRef = useRef();

//   useEffect(() => {
//     getBookings();
//   }, []);

//   useEffect(() => {
//     const fetchOtpForEligibleBookings = async () => {
//       const now = dayjs();
//       const updatedBookings = await Promise.all(
//         bookings.map(async (b) => {
//           const latestStatus = b.statusHistory?.at(-1)?.status;
//           const bookingTime = dayjs(
//             `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
//             "YYYY-MM-DD HH:mm"
//           );

//           const isEligible =
//             latestStatus === "confirmed" &&
//             now.isSameOrAfter(bookingTime, "minute") &&
//             !b.otp;

//           if (isEligible) {
//             try {
//               const res = await axios.get(
//                 `${backendUrl}/api/bookings/generate-otp/${b._id}`,
//                 { withCredentials: true }
//               );
//               return { ...b, otp: res.data.otp };
//             } catch (err) {
//               console.error(
//                 `OTP fetch failed for ${b._id}:`,
//                 err.response?.data?.message || err.message
//               );
//             }
//           }
//           return b;
//         })
//       );
//       setBookings(updatedBookings);
//     };

//     fetchOtpForEligibleBookings();
//   }, [tick]);

//   useEffect(() => {
//     const timer = setInterval(() => setTick((t) => t + 1), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         setConfirmCancelId(null);
//       }
//     };

//     if (confirmCancelId) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [confirmCancelId]);

//   const getBookings = async () => {
//     try {
//       const res = await axios.get(`${backendUrl}/api/user/my-bookings`, {
//         withCredentials: true,
//       });
//       setBookings(res.data.bookings || []);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to load bookings");
//       setLoading(false);
//     }
//   };

//   const toggleBookingExpansion = (bookingId) => {
//     setExpandedBookings(prev => ({
//       ...prev,
//       [bookingId]: !prev[bookingId]
//     }));
//   };

//   // split payment functions
//   const handleSplitCountChange = (e) => {
//     const count = parseInt(e.target.value);
//     setSplitCount(count);
//     setSplitUsers(Array.from({ length: count }, () => ({ email: "" })));
//   };

//   const handleSplitUserChange = (index, value) => {
//     const updated = [...splitUsers];
//     updated[index].email = value;
//     setSplitUsers(updated);
//   };

//   const handleSplitPay = async () => {
//     if (!selectedBooking || splitUsers.length === 0) return;

//     try {
//       const res = await axios.post(
//         `${backendUrl}/api/payments/split-link`,
//         {
//           bookingId: selectedBooking._id,
//           emails: splitUsers.map((u) => u.email),
//         },
//         { withCredentials: true }
//       );

//       toast.success("Payment links sent to users!");
//       setSplitModalOpen(false);
//       setSplitUsers([]);
//     } catch (err) {
//       toast.error("Failed to send split payment links.");
//       console.error("Split link error:", err);
//     }
//   };

//   // mark complete
//   const markCompleted = async (bookingId) => {
//     try {
//       const res = await axios.patch(
//         `${backendUrl}/api/bookings/mark-complete/${bookingId}`,
//         {},
//         { withCredentials: true }
//       );
//       setBookings((prev) =>
//         prev.map((b) => (b._id === bookingId ? res.data.booking : b))
//       );
//       getBookings();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to mark as complete");
//     }
//   };

//   const respondToUpdate = async (id, response) => {
//     setActionLoading(id + response);
//     try {
//       const res = await axios.patch(
//         `${backendUrl}/api/bookings/${id}/customer-response`,
//         { response },
//         { withCredentials: true }
//       );
//       setBookings((prev) =>
//         prev.map((b) => (b._id === id ? res.data.booking : b))
//       );
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to respond");
//     }
//     setActionLoading("");
//   };

//   const latestStatus = (history) =>
//     history?.[history.length - 1]?.status || "pending";

//   const filteredBookings =
//     filter === "all"
//       ? bookings
//       : bookings.filter((b) => latestStatus(b.statusHistory) === filter);

//   const isTooCloseToBooking = (b) => {
//     const bookingDateTime = dayjs(
//       `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
//       "YYYY-MM-DD HH:mm"
//     );
//     const diffMins = bookingDateTime.diff(dayjs(), "minute");
//     return diffMins <= 120;
//   };

//   const statusOptions = [
//     { label: "All", value: "all" },
//     { label: "Pending", value: "pending" },
//     { label: "Confirmed", value: "confirmed" },
//     { label: "Updated", value: "update-time" },
//     { label: "In Progress", value: "in-progress" },
//     { label: "Rejected", value: "rejected" },
//     { label: "Cancelled", value: "cancelled" },
//     { label: "Completed", value: "completed" },
//   ];

//   // Payment by razorpay
//   const handlePayOnline = async (booking) => {
//     try {
//       const { data: order } = await axios.post(
//         `${backendUrl}/api/payments/create-order`,
//         {
//           amount: booking.totalAmount,
//           bookingId: booking._id,
//         },
//         { withCredentials: true }
//       );

//       const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
//       if (!razorpayKey) {
//         throw new Error("Razorpay key not found in environment variables");
//       }

//       const options = {
//         key: razorpayKey,
//         amount: order.amount,
//         currency: "INR",
//         name: "ServeGo",
//         description: booking.serviceName,
//         order_id: order.id,
//         handler: async function (response) {
//           try {
//             await axios.post(
//               `${backendUrl}/api/payments/verify`,
//               {
//                 response,
//                 bookingId: booking._id,
//                 userId: userData._id,
//                 amount: booking.totalAmount,
//               },
//               { withCredentials: true }
//             );
//             toast.success("Payment Successful!");
//             getBookings();
//           } catch (error) {
//             console.error("Payment verification error:", error);
//             toast.error("Payment verification failed!");
//           }
//         },
//         prefill: {
//           name: userData.name,
//           email: userData.email,
//           contact: userData.phone,
//         },
//         theme: {
//           color: "#080a33",
//         },
//         modal: {
//           ondismiss: function () {
//             toast.info("Payment cancelled by user");
//           },
//         },
//       };

//       if (!window.Razorpay) {
//         toast.error("Payment gateway not loaded. Please refresh the page.");
//         return;
//       }

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (err) {
//       console.error("Error creating Razorpay order:", err);
//       toast.error(err.response?.data?.message || "Failed to initiate payment.");
//     }
//   };

//   // Cash Payment
//   const handleCashOption = async (booking) => {
//     try {
//       await axios.patch(
//         `${backendUrl}/api/bookings/${booking._id}/initiate-cash`,
//         {},
//         { withCredentials: true }
//       );
//       toast.info("Waiting for provider to confirm cash");
//       getBookings();
//     } catch (err) {
//       toast.error("Failed to initiate cash payment");
//     }
//   };

//   // Split Payment
//   const openSplitModal = (booking) => {
//     setSelectedBooking(booking);
//     setSplitModalOpen(true);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case "confirmed":
//         return "bg-green-100 text-green-700 border-green-200";
//       case "rejected":
//         return "bg-red-100 text-red-700 border-red-200";
//       case "update-time":
//         return "bg-blue-100 text-blue-700 border-blue-200";
//       case "in-progress":
//         return "bg-orange-100 text-orange-700 border-orange-200";
//       case "cancelled":
//         return "bg-gray-100 text-gray-700 border-gray-200";
//       case "completed":
//         return "bg-purple-100 text-purple-700 border-purple-200";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   return (
//     <div className="min-h-screen py-16 px-4 bg-[var(--background-light)]">
//       <div className="w-full mx-auto bg-white shadow-md rounded-xl p-6 max-w-4xl">
//         <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-6">
//           My Bookings
//         </h2>

//         <div className="flex flex-wrap justify-center gap-2 mb-6">
//           {statusOptions.map((opt) => (
//             <button
//               key={opt.value}
//               className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
//                 filter === opt.value
//                   ? "bg-[var(--primary)] text-white border-[var(--primary)]"
//                   : "bg-white text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
//               }`}
//               onClick={() => setFilter(opt.value)}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
//             <p className="text-gray-500 mt-4">Loading bookings...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-8">
//             <p className="text-red-500">{error}</p>
//           </div>
//         ) : filteredBookings.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-gray-500">No bookings found.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredBookings.map((b) => {
//               const status = latestStatus(b.statusHistory);
//               const isExpanded = expandedBookings[b._id];

//               return (
//                 <div
//                   key={b._id}
//                   className="border rounded-xl shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow"
//                 >
//                   {/* Main Header - Always Visible */}
//                   <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="text-lg font-semibold text-[var(--primary)]">
//                             {b.serviceName}
//                           </h3>
//                           <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
//                             {status.replace("-", " ").toUpperCase()}
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-4 text-sm text-gray-600">
//                           <div className="flex items-center gap-1">
//                             <FaCalendarAlt className="w-3 h-3" />
//                             <span>{dayjs(b.date).format("DD MMM YYYY")}</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <FaClock className="w-3 h-3" />
//                             <span>{b.timeSlot.from} - {b.timeSlot.to}</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <FaRupeeSign className="w-3 h-3" />
//                             <span className="font-medium">₹{b.totalAmount}</span>
//                           </div>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => toggleBookingExpansion(b._id)}
//                         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                       >
//                         {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Expanded Content */}
//                   {isExpanded && (
//                     <div className="p-4 border-t bg-white">
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         {/* Left Column - Details & Actions */}
//                         <div className="space-y-4">
//                           {/* Booking Details */}
//                           <div className="bg-gray-50 rounded-lg p-4">
//                             <h4 className="font-medium text-gray-800 mb-2">Booking Details</h4>
//                             <div className="text-sm text-gray-600">
//                               <p><strong>Notes:</strong> {b.notes || "No additional notes"}</p>
//                             </div>
//                           </div>

//                           {/* Time Update Section */}
//                           {status === "update-time" && (
//                             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                               <h4 className="font-medium text-blue-800 mb-2">Time Update Request</h4>
//                               <div className="text-sm text-blue-700 mb-3">
//                                 <p><strong>Current:</strong> {b.timeSlot.from} - {b.timeSlot.to}</p>
//                                 <p><strong>Proposed:</strong> {b.updatedSlot?.from} - {b.updatedSlot?.to}</p>
//                               </div>
//                               <div className="flex gap-2">
//                                 <button
//                                   className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
//                                   disabled={actionLoading === b._id + "accepted"}
//                                   onClick={() => respondToUpdate(b._id, "accepted")}
//                                 >
//                                   <FaCheck className="w-3 h-3" />
//                                   Accept
//                                 </button>
//                                 <button
//                                   className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//                                   onClick={() => setConfirmCancelId(b._id)}
//                                 >
//                                   <FaTimes className="w-3 h-3" />
//                                   Decline
//                                 </button>
//                               </div>
//                             </div>
//                           )}

//                           {/* OTP Section */}
//                           {b.otp && !b.otpVerified && (
//                             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                               <h4 className="font-medium text-green-800 mb-2">Service OTP</h4>
//                               <div className="text-2xl font-bold text-green-700 tracking-wider">
//                                 {b.otp}
//                               </div>
//                               <p className="text-sm text-green-600 mt-1">
//                                 Share this OTP with your service provider
//                               </p>
//                             </div>
//                           )}

//                           {/* Action Buttons */}
//                           <div className="flex flex-wrap gap-2">
//                             {["pending", "confirmed"].includes(status) && (
//                               <button
//                                 title={
//                                   isTooCloseToBooking(b)
//                                     ? "Cannot cancel within 2 hours of start time"
//                                     : ""
//                                 }
//                                 className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                                   isTooCloseToBooking(b)
//                                     ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                                     : "bg-red-500 text-white hover:bg-red-600"
//                                 }`}
//                                 onClick={() => {
//                                   if (!isTooCloseToBooking(b)) setConfirmCancelId(b._id);
//                                 }}
//                                 disabled={isTooCloseToBooking(b)}
//                               >
//                                 <FaTimes className="w-3 h-3" />
//                                 Cancel Booking
//                               </button>
//                             )}

//                             {b.otpVerified && !b.completedByCustomer && (
//                               <button
//                                 onClick={() => markCompleted(b._id)}
//                                 className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium"
//                               >
//                                 <FaCheck className="w-3 h-3" />
//                                 Mark Complete
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {/* Right Column - Payment & Timeline */}
//                         <div className="space-y-4">
//                           {/* Payment Section */}
//                           <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
//                             <h4 className="font-medium text-green-800 mb-3">Payment Details</h4>

//                             <div className="space-y-2 text-sm">
//                               <div className="flex justify-between">
//                                 <span>Service Amount:</span>
//                                 <span className="font-medium">₹{b.serviceAmount || 0}</span>
//                               </div>
//                               <div className="flex justify-between">
//                                 <span>Platform Fee:</span>
//                                 <span className="font-medium">₹{b.platformFee || 0}</span>
//                               </div>
//                               <div className="flex justify-between text-base font-bold border-t border-green-300 pt-2">
//                                 <span>Total Amount:</span>
//                                 <span>₹{b.totalAmount || 0}</span>
//                               </div>
//                             </div>

//                             {/* Payment Status */}
//                             {b.paymentStatus && (
//                               <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
//                                 b.paymentStatus === "paid"
//                                   ? "bg-green-200 text-green-800"
//                                   : b.paymentStatus === "partial"
//                                   ? "bg-yellow-200 text-yellow-800"
//                                   : "bg-red-200 text-red-800"
//                               }`}>
//                                 {b.paymentStatus === "paid" ? "Paid" :
//                                  b.paymentStatus === "partial" ? "Partially Paid" : "Payment Pending"}
//                               </div>
//                             )}

//                             {/* Payment Options */}
//                             {["confirmed", "in-progress", "completed"].includes(status) &&
//                              b.paymentStatus !== "paid" && (
//                               <div className="mt-4 space-y-2">
//                                 <button
//                                   onClick={() => handlePayOnline(b)}
//                                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
//                                 >
//                                   <FaCreditCard className="w-4 h-4" />
//                                   Pay Online
//                                 </button>

//                                 <button
//                                   onClick={() => handleCashOption(b)}
//                                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
//                                 >
//                                   <FaMoneyBillWave className="w-4 h-4" />
//                                   Pay Cash
//                                 </button>

//                                 <button
//                                   onClick={() => openSplitModal(b)}
//                                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium"
//                                 >
//                                   <FaUsers className="w-4 h-4" />
//                                   Split Payment
//                                 </button>
//                               </div>
//                             )}
//                           </div>

//                           {/* Timeline */}
//                           <div className="bg-gray-50 rounded-lg p-4">
//                             <h4 className="font-medium text-gray-800 mb-3">Status Timeline</h4>
//                             <BookingStatusTimeline statusHistory={b.statusHistory} />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Cancel Modal */}
//       {confirmCancelId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div
//             ref={modalRef}
//             className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md"
//           >
//             <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
//               Confirm Cancellation
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to cancel this booking? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//                 onClick={() => setConfirmCancelId(null)}
//               >
//                 Keep Booking
//               </button>
//               <button
//                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//                 onClick={() => {
//                   respondToUpdate(confirmCancelId, "cancelled");
//                   setConfirmCancelId(null);
//                 }}
//               >
//                 Cancel Booking
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Split Payment Modal */}
//       {splitModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
//             <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
//               Split Payment
//             </h3>

//             <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//               <p className="text-sm text-gray-600">
//                 <span className="font-medium">Total Amount:</span> ₹{selectedBooking?.totalAmount}
//               </p>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Number of people splitting the bill:
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="10"
//                 value={splitCount}
//                 onChange={handleSplitCountChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email addresses:
//               </label>
//               <div className="max-h-60 overflow-y-auto space-y-2">
//                 {splitUsers.map((user, index) => (
//                   <input
//                     key={index}
//                     type="email"
//                     placeholder={`Person ${index + 1} email`}
//                     value={user.email}
//                     onChange={(e) => handleSplitUserChange(index, e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
//                   />
//                 ))}
//               </div>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//                 onClick={() => {
//                   setSplitModalOpen(false);
//                   setSplitUsers([{ email: "" }]);
//                   setSplitCount(1);
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--secondary)] transition-colors"
//                 onClick={handleSplitPay}
//               >
//                 Send Payment Links
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// **********************************version 3*******************************
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import BookingStatusTimeline from "../components/BookingStatusTimeline";
// import { FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaCreditCard, FaMoneyBillWave, FaUsers, FaCalendarAlt, FaClock, FaRupeeSign } from "react-icons/fa";
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import { useAppContext } from "../context/AppContext";
// import { toast } from "react-toastify";

// dayjs.extend(isSameOrAfter);

// export default function CustomerBookings() {
//   const { backendUrl, userData } = useAppContext();

//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState("");
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [confirmCancelId, setConfirmCancelId] = useState(null);
//   const [tick, setTick] = useState(0);
//   const [splitModalOpen, setSplitModalOpen] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [splitCount, setSplitCount] = useState(1);
//   const [splitUsers, setSplitUsers] = useState([{ email: "" }]);
//   const [expandedBookings, setExpandedBookings] = useState({});
//   const [expandedTimelines, setExpandedTimelines] = useState({});

//   const modalRef = useRef();

//   // Add new function for timeline expansion
//   const toggleTimelineExpansion = (bookingId) => {
//     setExpandedTimelines(prev => ({
//       ...prev,
//       [bookingId]: !prev[bookingId]
//     }));
//   };

//   // Add StatusTimelineSection component
//   const StatusTimelineSection = ({ statusHistory, bookingId }) => {
//     const isTimelineExpanded = expandedTimelines[bookingId];

//     return (
//       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
//         <div
//           className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-3 cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all"
//           onClick={() => toggleTimelineExpansion(bookingId)}
//         >
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
//                 <div className="w-2 h-2 bg-white rounded-full"></div>
//               </div>
//               <h4 className="font-semibold">Status Timeline</h4>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm opacity-75">
//                 {isTimelineExpanded ? 'Hide' : 'Show'} Timeline
//               </span>
//               {isTimelineExpanded ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </div>
//         </div>

//         {isTimelineExpanded && (
//           <div className="p-4 bg-white">
//             <BookingStatusTimeline statusHistory={statusHistory} />
//           </div>
//         )}
//       </div>
//     );
//   };

//   useEffect(() => {
//     getBookings();
//   }, []);

//   useEffect(() => {
//     const fetchOtpForEligibleBookings = async () => {
//       const now = dayjs();
//       const updatedBookings = await Promise.all(
//         bookings.map(async (b) => {
//           const latestStatus = b.statusHistory?.at(-1)?.status;
//           const bookingTime = dayjs(
//             `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
//             "YYYY-MM-DD HH:mm"
//           );

//           const isEligible =
//             latestStatus === "confirmed" &&
//             now.isSameOrAfter(bookingTime, "minute") &&
//             !b.otp;

//           if (isEligible) {
//             try {
//               const res = await axios.get(
//                 `${backendUrl}/api/bookings/generate-otp/${b._id}`,
//                 { withCredentials: true }
//               );
//               return { ...b, otp: res.data.otp };
//             } catch (err) {
//               console.error(
//                 `OTP fetch failed for ${b._id}:`,
//                 err.response?.data?.message || err.message
//               );
//             }
//           }
//           return b;
//         })
//       );
//       setBookings(updatedBookings);
//     };

//     fetchOtpForEligibleBookings();
//   }, [tick]);

//   useEffect(() => {
//     const timer = setInterval(() => setTick((t) => t + 1), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         setConfirmCancelId(null);
//       }
//     };

//     if (confirmCancelId) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [confirmCancelId]);

//   const getBookings = async () => {
//     try {
//       const res = await axios.get(`${backendUrl}/api/user/my-bookings`, {
//         withCredentials: true,
//       });
//       setBookings(res.data.bookings || []);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to load bookings");
//       setLoading(false);
//     }
//   };

//   const toggleBookingExpansion = (bookingId) => {
//     setExpandedBookings(prev => ({
//       ...prev,
//       [bookingId]: !prev[bookingId]
//     }));
//   };

//   // split payment functions
//   const handleSplitCountChange = (e) => {
//     const count = parseInt(e.target.value);
//     setSplitCount(count);
//     setSplitUsers(Array.from({ length: count }, () => ({ email: "" })));
//   };

//   const handleSplitUserChange = (index, value) => {
//     const updated = [...splitUsers];
//     updated[index].email = value;
//     setSplitUsers(updated);
//   };

//   const handleSplitPay = async () => {
//     if (!selectedBooking || splitUsers.length === 0) return;

//     try {
//       const res = await axios.post(
//         `${backendUrl}/api/payments/split-link`,
//         {
//           bookingId: selectedBooking._id,
//           emails: splitUsers.map((u) => u.email),
//         },
//         { withCredentials: true }
//       );

//       toast.success("Payment links sent to users!");
//       setSplitModalOpen(false);
//       setSplitUsers([]);
//     } catch (err) {
//       toast.error("Failed to send split payment links.");
//       console.error("Split link error:", err);
//     }
//   };

//   // mark complete
//   const markCompleted = async (bookingId) => {
//     try {
//       const res = await axios.patch(
//         `${backendUrl}/api/bookings/mark-complete/${bookingId}`,
//         {},
//         { withCredentials: true }
//       );
//       setBookings((prev) =>
//         prev.map((b) => (b._id === bookingId ? res.data.booking : b))
//       );
//       getBookings();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to mark as complete");
//     }
//   };

//   const respondToUpdate = async (id, response) => {
//     setActionLoading(id + response);
//     try {
//       const res = await axios.patch(
//         `${backendUrl}/api/bookings/${id}/customer-response`,
//         { response },
//         { withCredentials: true }
//       );
//       setBookings((prev) =>
//         prev.map((b) => (b._id === id ? res.data.booking : b))
//       );
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to respond");
//     }
//     setActionLoading("");
//   };

//   const latestStatus = (history) =>
//     history?.[history.length - 1]?.status || "pending";

//   const filteredBookings =
//     filter === "all"
//       ? bookings
//       : bookings.filter((b) => latestStatus(b.statusHistory) === filter);

//   const isTooCloseToBooking = (b) => {
//     const bookingDateTime = dayjs(
//       `${dayjs(b.date).format("YYYY-MM-DD")} ${b.timeSlot.from}`,
//       "YYYY-MM-DD HH:mm"
//     );
//     const diffMins = bookingDateTime.diff(dayjs(), "minute");
//     return diffMins <= 120;
//   };

//   const statusOptions = [
//     { label: "All", value: "all" },
//     { label: "Pending", value: "pending" },
//     { label: "Confirmed", value: "confirmed" },
//     { label: "Updated", value: "update-time" },
//     { label: "In Progress", value: "in-progress" },
//     { label: "Rejected", value: "rejected" },
//     { label: "Cancelled", value: "cancelled" },
//     { label: "Completed", value: "completed" },
//   ];

//   // Payment by razorpay
//   const handlePayOnline = async (booking) => {
//     try {
//       const { data: order } = await axios.post(
//         `${backendUrl}/api/payments/create-order`,
//         {
//           amount: booking.totalAmount,
//           bookingId: booking._id,
//         },
//         { withCredentials: true }
//       );

//       const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
//       if (!razorpayKey) {
//         throw new Error("Razorpay key not found in environment variables");
//       }

//       const options = {
//         key: razorpayKey,
//         amount: order.amount,
//         currency: "INR",
//         name: "ServeGo",
//         description: booking.serviceName,
//         order_id: order.id,
//         handler: async function (response) {
//           try {
//             await axios.post(
//               `${backendUrl}/api/payments/verify`,
//               {
//                 response,
//                 bookingId: booking._id,
//                 userId: userData._id,
//                 amount: booking.totalAmount,
//               },
//               { withCredentials: true }
//             );
//             toast.success("Payment Successful!");
//             getBookings();
//           } catch (error) {
//             console.error("Payment verification error:", error);
//             toast.error("Payment verification failed!");
//           }
//         },
//         prefill: {
//           name: userData.name,
//           email: userData.email,
//           contact: userData.phone,
//         },
//         theme: {
//           color: "#080a33",
//         },
//         modal: {
//           ondismiss: function () {
//             toast.info("Payment cancelled by user");
//           },
//         },
//       };

//       if (!window.Razorpay) {
//         toast.error("Payment gateway not loaded. Please refresh the page.");
//         return;
//       }

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (err) {
//       console.error("Error creating Razorpay order:", err);
//       toast.error(err.response?.data?.message || "Failed to initiate payment.");
//     }
//   };

//   // Cash Payment
//   const handleCashOption = async (booking) => {
//     try {
//       await axios.patch(
//         `${backendUrl}/api/bookings/${booking._id}/initiate-cash`,
//         {},
//         { withCredentials: true }
//       );
//       toast.info("Waiting for provider to confirm cash");
//       getBookings();
//     } catch (err) {
//       toast.error("Failed to initiate cash payment");
//     }
//   };

//   // Split Payment
//   const openSplitModal = (booking) => {
//     setSelectedBooking(booking);
//     setSplitModalOpen(true);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case "confirmed":
//         return "bg-green-100 text-green-700 border-green-200";
//       case "rejected":
//         return "bg-red-100 text-red-700 border-red-200";
//       case "update-time":
//         return "bg-blue-100 text-blue-700 border-blue-200";
//       case "in-progress":
//         return "bg-orange-100 text-orange-700 border-orange-200";
//       case "cancelled":
//         return "bg-gray-100 text-gray-700 border-gray-200";
//       case "completed":
//         return "bg-purple-100 text-purple-700 border-purple-200";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   return (
//     <div className="min-h-screen py-16 px-4 bg-[var(--background-light)]">
//       <div className="w-full mx-auto bg-white shadow-md rounded-xl p-6 max-w-4xl">
//         <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-6">
//           My Bookings
//         </h2>

//         <div className="flex flex-wrap justify-center gap-2 mb-6">
//           {statusOptions.map((opt) => (
//             <button
//               key={opt.value}
//               className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
//                 filter === opt.value
//                   ? "bg-[var(--primary)] text-white border-[var(--primary)]"
//                   : "bg-white text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
//               }`}
//               onClick={() => setFilter(opt.value)}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
//             <p className="text-gray-500 mt-4">Loading bookings...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-8">
//             <p className="text-red-500">{error}</p>
//           </div>
//         ) : filteredBookings.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-gray-500">No bookings found.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredBookings.map((b) => {
//               const status = latestStatus(b.statusHistory);
//               const isExpanded = expandedBookings[b._id];

//               return (
//                 <div
//                   key={b._id}
//                   className="border rounded-xl shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow"
//                 >
//                   {/* Main Header - Always Visible */}
//                   <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="text-lg font-semibold text-[var(--primary)]">
//                             {b.serviceName}
//                           </h3>
//                           <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
//                             {status.replace("-", " ").toUpperCase()}
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-4 text-sm text-gray-600">
//                           <div className="flex items-center gap-1">
//                             <FaCalendarAlt className="w-3 h-3" />
//                             <span>{dayjs(b.date).format("DD MMM YYYY")}</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <FaClock className="w-3 h-3" />
//                             <span>{b.timeSlot.from} - {b.timeSlot.to}</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <FaRupeeSign className="w-3 h-3" />
//                             <span className="font-medium">₹{b.totalAmount}</span>
//                           </div>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => toggleBookingExpansion(b._id)}
//                         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                       >
//                         {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Expanded Content */}
//                   {isExpanded && (
//                     <div className="p-4 border-t bg-white">
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         {/* Left Column - Details & Actions */}
//                         <div className="space-y-4">
//                           {/* Booking Details */}
//                           <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
//                             <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
//                               <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                               Booking Details
//                             </h4>
//                             <div className="bg-white rounded-md p-3 border border-gray-200">
//                               <p className="text-sm text-gray-700">
//                                 <span className="font-medium text-gray-800">Notes:</span>
//                                 <span className="ml-2 italic">{b.notes || "No additional notes provided"}</span>
//                               </p>
//                             </div>
//                           </div>

//                           {/* Time Update Section */}
//                           {status === "update-time" && (
//                             <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
//                               <div className="flex items-center gap-2 mb-3">
//                                 <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
//                                 <h4 className="font-semibold text-blue-800">Time Update Request</h4>
//                               </div>
//                               <div className="bg-white rounded-md p-3 mb-3 border border-blue-200">
//                                 <div className="grid grid-cols-2 gap-4 text-sm">
//                                   <div>
//                                     <p className="font-medium text-gray-800">Current Time:</p>
//                                     <p className="text-blue-700 font-mono">{b.timeSlot.from} - {b.timeSlot.to}</p>
//                                   </div>
//                                   <div>
//                                     <p className="font-medium text-gray-800">Proposed Time:</p>
//                                     <p className="text-green-700 font-mono">{b.updatedSlot?.from} - {b.updatedSlot?.to}</p>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="flex gap-2">
//                                 <button
//                                   className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-md"
//                                   disabled={actionLoading === b._id + "accepted"}
//                                   onClick={() => respondToUpdate(b._id, "accepted")}
//                                 >
//                                   <FaCheck className="w-4 h-4" />
//                                   Accept New Time
//                                 </button>
//                                 <button
//                                   className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-md"
//                                   onClick={() => setConfirmCancelId(b._id)}
//                                 >
//                                   <FaTimes className="w-4 h-4" />
//                                   Decline & Cancel
//                                 </button>
//                               </div>
//                             </div>
//                           )}

//                           {/* OTP Section */}
//                           {b.otp && !b.otpVerified && (
//                             <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
//                               <div className="flex items-center gap-2 mb-3">
//                                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                                 <h4 className="font-semibold text-green-800">Service Verification OTP</h4>
//                               </div>
//                               <div className="bg-white rounded-lg p-4 border-2 border-green-200 text-center">
//                                 <div className="text-3xl font-bold text-green-700 tracking-widest mb-2 font-mono">
//                                   {b.otp}
//                                 </div>
//                                 <div className="w-16 h-1 bg-green-500 rounded-full mx-auto mb-2"></div>
//                                 <p className="text-sm text-green-600">
//                                   Share this OTP with your service provider to verify service completion
//                                 </p>
//                               </div>
//                             </div>
//                           )}

//                           {/* Action Buttons */}
//                           <div className="flex flex-wrap gap-3">
//                             {["pending", "confirmed"].includes(status) && (
//                               <button
//                                 title={
//                                   isTooCloseToBooking(b)
//                                     ? "Cannot cancel within 2 hours of start time"
//                                     : ""
//                                 }
//                                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md ${
//                                   isTooCloseToBooking(b)
//                                     ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                                     : "bg-red-500 text-white hover:bg-red-600"
//                                 }`}
//                                 onClick={() => {
//                                   if (!isTooCloseToBooking(b)) setConfirmCancelId(b._id);
//                                 }}
//                                 disabled={isTooCloseToBooking(b)}
//                               >
//                                 <FaTimes className="w-4 h-4" />
//                                 Cancel Booking
//                               </button>
//                             )}

//                             {b.otpVerified && !b.completedByCustomer && (
//                               <button
//                                 onClick={() => markCompleted(b._id)}
//                                 className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all transform hover:scale-105 shadow-md text-sm font-medium"
//                               >
//                                 <FaCheck className="w-4 h-4" />
//                                 Mark as Complete
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {/* Right Column - Payment & Timeline */}
//                         <div className="space-y-4">
//                           {/* Payment Section */}
//                           <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-green-200 overflow-hidden shadow-sm">
//                             <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3">
//                               <div className="flex items-center gap-2">
//                                 <FaRupeeSign className="w-5 h-5" />
//                                 <h4 className="font-semibold">Payment Information</h4>
//                               </div>
//                             </div>

//                             <div className="p-4">
//                               <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
//                                 <div className="space-y-3">
//                                   <div className="flex justify-between items-center">
//                                     <span className="text-gray-700">Service Amount:</span>
//                                     <span className="font-semibold text-gray-900">₹{b.serviceAmount || 0}</span>
//                                   </div>
//                                   <div className="flex justify-between items-center">
//                                     <span className="text-gray-700">Platform Fee:</span>
//                                     <span className="font-semibold text-gray-900">₹{b.platformFee || 0}</span>
//                                   </div>
//                                   <div className="border-t-2 border-green-200 pt-3">
//                                     <div className="flex justify-between items-center">
//                                       <span className="text-lg font-bold text-green-800">Total Amount:</span>
//                                       <span className="text-2xl font-bold text-green-700">₹{b.totalAmount || 0}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Payment Status */}
//                               {b.paymentStatus && (
//                                 <div className="mb-4">
//                                   <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border-2 ${
//                                     b.paymentStatus === "paid"
//                                       ? "bg-green-100 text-green-800 border-green-300"
//                                       : b.paymentStatus === "partial"
//                                       ? "bg-yellow-100 text-yellow-800 border-yellow-300"
//                                       : "bg-red-100 text-red-800 border-red-300"
//                                   }`}>
//                                     <div className={`w-2 h-2 rounded-full mr-2 ${
//                                       b.paymentStatus === "paid" ? "bg-green-500" :
//                                       b.paymentStatus === "partial" ? "bg-yellow-500" : "bg-red-500"
//                                     }`}></div>
//                                     {b.paymentStatus === "paid" ? "Payment Complete" :
//                                      b.paymentStatus === "partial" ? "Partially Paid" : "Payment Pending"}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Payment Options */}
//                               {["confirmed", "in-progress", "completed"].includes(status) &&
//                                b.paymentStatus !== "paid" && (
//                                 <div className="space-y-3">
//                                   <h5 className="font-medium text-gray-800 mb-3">Choose Payment Method:</h5>

//                                   <button
//                                     onClick={() => handlePayOnline(b)}
//                                     className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium"
//                                   >
//                                     <FaCreditCard className="w-5 h-5" />
//                                     <span>Pay Online</span>
//                                     <div className="ml-auto bg-blue-400 px-2 py-1 rounded text-xs">Instant</div>
//                                   </button>

//                                   <button
//                                     onClick={() => handleCashOption(b)}
//                                     className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg font-medium"
//                                   >
//                                     <FaMoneyBillWave className="w-5 h-5" />
//                                     <span>Pay with Cash</span>
//                                     <div className="ml-auto bg-green-400 px-2 py-1 rounded text-xs">On Service</div>
//                                   </button>

//                                   <button
//                                     onClick={() => openSplitModal(b)}
//                                     className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-medium"
//                                   >
//                                     <FaUsers className="w-5 h-5" />
//                                     <span>Split Payment</span>
//                                     <div className="ml-auto bg-purple-400 px-2 py-1 rounded text-xs">Share</div>
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {/* Timeline */}
//                           <StatusTimelineSection
//                             statusHistory={b.statusHistory}
//                             bookingId={b._id}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Cancel Modal */}
//       {confirmCancelId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div
//             ref={modalRef}
//             className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md"
//           >
//             <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
//               Confirm Cancellation
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to cancel this booking? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//                 onClick={() => setConfirmCancelId(null)}
//               >
//                 Keep Booking
//               </button>
//               <button
//                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//                 onClick={() => {
//                   respondToUpdate(confirmCancelId, "cancelled");
//                   setConfirmCancelId(null);
//                 }}
//               >
//                 Cancel Booking
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Split Payment Modal */}
//       {splitModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
//             <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
//               Split Payment
//             </h3>

//             <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//               <p className="text-sm text-gray-600">
//                 <span className="font-medium">Total Amount:</span> ₹{selectedBooking?.totalAmount}
//               </p>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Number of people splitting the bill:
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="10"
//                 value={splitCount}
//                 onChange={handleSplitCountChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email addresses:
//               </label>
//               <div className="max-h-60 overflow-y-auto space-y-2">
//                 {splitUsers.map((user, index) => (
//                   <input
//                     key={index}
//                     type="email"
//                     placeholder={`Person ${index + 1} email`}
//                     value={user.email}
//                     onChange={(e) => handleSplitUserChange(index, e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
//                   />
//                 ))}
//               </div>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//                 onClick={() => {
//                   setSplitModalOpen(false);
//                   setSplitUsers([{ email: "" }]);
//                   setSplitCount(1);
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--secondary)] transition-colors"
//                 onClick={handleSplitPay}
//               >
//                 Send Payment Links
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
