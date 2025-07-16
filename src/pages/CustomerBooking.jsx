// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import BookingStatusTimeline from "../components/BookingStatusTimeline";
// import { FaCheck, FaTimes } from "react-icons/fa";
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import { useAppContext } from "../context/AppContext";

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

//   const modalRef = useRef();

//   useEffect(() => {
//     axios.get(`${backendUrl}/api/user/my-bookings`
// , {
//         withCredentials: true,
//       })
//       .then((res) => {
//         setBookings(res.data.bookings || []);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError("Failed to load bookings");
//         setLoading(false);
//       });
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
//           amount: booking.totalAmount*100,
//           bookingId: booking._id,
//         }
//       );

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY, 
//         amount: order.amount,
//         currency: "INR",
//         name: "ServeGo",
//         description: booking.serviceName,
//         order_id: order.id,
//         handler: async function (response) {
//           try {
//             await axios.post(`${backendUrl}/api/payments/verify`, {
//               response,
//               bookingId: booking._id,
//               userId: userData._id,
//               amount: booking.totalAmount*100,
//             });
//             toast.success("Payment Successful!");
//             getBookings(); // Refresh bookings list
//           } catch (error) {
//             toast.error("Payment verification failed!");
//           }
//         },
//         prefill: {
//           name: userData.name,
//           email: userData.email,
//           contact: userData.phone,
//         },
//         theme: {
//           color: "#38bdf8",
//         },
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (err) {
//       console.error("Error creating Razorpay order", err);
//       toast.error("Failed to initiate payment.");
//     }
//   };

//   // Refetch bookings after payment
//   const getBookings = async () => {
//     try {
//       const res = await axios.get(`${backendUrl}/api/user/my-bookings`, {
//         withCredentials: true,
//       });
//       setBookings(res.data.bookings || []);
//     } catch (err) {
//       toast.error("Failed to refresh bookings");
//     }
//   };


// //   // Cash Payment
// //   await axios.put(`/api/bookings/${booking._id}/cash-payment`, {
// //   paymentMethod: "cash",
// // });
// // toast.info("Marked as Pay by Cash");

// // Split Payment
// // const handleSplitPay = async (booking, shareAmount) => {
// //   const { data: order } = await axios.post("/api/payments/create-order", {
// //     amount: shareAmount,
// //     bookingId: booking._id,
// //   });

// //   const options = {
// //     key: "YOUR_RAZORPAY_KEY",
// //     amount: order.amount,
// //     currency: "INR",
// //     name: "ServeGo",
// //     description: booking.serviceName,
// //     order_id: order.id,
// //     handler: async function (response) {
// //       await axios.post("/api/payments/verify", {
// //         response,
// //         bookingId: booking._id,
// //         userId: userData._id,
// //         amount: shareAmount,
// //       });
// //       toast.success("Your share paid");
// //       getBookings();
// //     },
// //   };

// //   const rzp = new window.Razorpay(options);
// //   rzp.open();
// // };


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
//               className={`px-4 py-1 rounded-full border text-sm font-medium ${
//                 filter === opt.value
//                   ? "bg-[var(--primary)] text-[var(--white)]"
//                   : "bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
//               }`}
//               onClick={() => setFilter(opt.value)}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <p className="text-center text-gray-500">Loading...</p>
//         ) : error ? (
//           <p className="text-center text-red-500">{error}</p>
//         ) : filteredBookings.length === 0 ? (
//           <p className="text-center text-gray-500">No bookings found.</p>
//         ) : (
//           <div className="space-y-6">
//             {filteredBookings.map((b) => {
//               const status = latestStatus(b.statusHistory);
//               return (
//                 <div
//                   key={b._id}
//                   className="border rounded-xl p-4 shadow-md bg-white"
//                 >
//                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//                     <div>
//                       <div className="font-semibold text-[var(--primary)]">
//                         {b.serviceName}
//                       </div>
//                       <div className="text-sm text-[var(--secondary)]">
//                         {dayjs(b.date).format("DD MMM YYYY")} |{" "}
//                         {b.timeSlot.from} - {b.timeSlot.to}
//                       </div>
//                       <div className="text-sm text-[var(--gray)]">
//                         Notes: {b.notes || "—"}
//                       </div>
//                       <div
//                         className={`inline-block mt-1 text-xs font-semibold rounded-xl px-2 py-1 ${
//                           status === "pending"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : status === "confirmed"
//                             ? "bg-green-100 text-green-700"
//                             : status === "rejected"
//                             ? "bg-red-100 text-red-700"
//                             : status === "update-time"
//                             ? "bg-blue-100 text-blue-700"
//                             : status === "in-progress"
//                             ? "bg-orange-100 text-orange-700"
//                             : status === "cancelled"
//                             ? "bg-gray-200 text-gray-700"
//                             : status === "completed"
//                             ? "bg-purple-100 text-purple-700"
//                             : ""
//                         }`}
//                       >
//                         {status.replace("-", " ")}
//                       </div>

//                       {b.paymentStatus === "paid" && (
//                         <div className="text-sm text-green-600 font-medium">
//                           Payment: Paid 💰
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex flex-col gap-2 items-start">
//                       {status === "update-time" && (
//                         <div>
//                           <div className="text-[var(--secondary)] text-sm font-semibold">
//                             Provider proposed a new time:
//                           </div>
//                           <div className="text-xs text-[var(--gray)]">
//                             <div>
//                               Earlier: {b.timeSlot.from} - {b.timeSlot.to}
//                             </div>
//                             <div>
//                               New: {b.updatedSlot?.from} - {b.updatedSlot?.to}
//                             </div>
//                           </div>
//                           <div className="flex gap-2 mt-2">
//                             <button
//                               className="flex items-center gap-1 text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
//                               disabled={actionLoading === b._id + "accepted"}
//                               onClick={() => respondToUpdate(b._id, "accepted")}
//                             >
//                               <FaCheck /> Accept
//                             </button>
//                             <button
//                               className="flex items-center gap-1 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
//                               onClick={() => setConfirmCancelId(b._id)}
//                             >
//                               <FaTimes /> Cancel
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* OTP */}
//                       {b.otp && !b.otpVerified && (
//                         <div className="mt-2">
//                           <p className="text-sm font-semibold text-green-600">
//                             OTP: {b.otp}
//                           </p>
//                         </div>
//                       )}

//                       {["pending", "confirmed"].includes(status) && (
//                         <button
//                           title={
//                             isTooCloseToBooking(b)
//                               ? "Booking cannot be cancelled within 2 hours of start time"
//                               : ""
//                           }
//                           className={`flex items-center gap-1 text-sm px-3 py-1 rounded transition w-40
//                             ${
//                               isTooCloseToBooking(b)
//                                 ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                                 : "bg-red-500 text-white hover:bg-red-700"
//                             }`}
//                           onClick={() => {
//                             if (!isTooCloseToBooking(b))
//                               setConfirmCancelId(b._id);
//                           }}
//                           disabled={isTooCloseToBooking(b)}
//                         >
//                           <FaTimes /> Cancel Booking
//                         </button>
//                       )}

//                       {/* Payment Options */}
//                       {["confirmed", "in-progress"].includes(status) && b.paymentStatus !== "paid" && (
//                         <div className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
//                           <button
//                             onClick={() => handlePayOnline(b)}
//                             className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 shadow-lg transition duration-300"
//                           >
//                             <span>💳</span>
//                             <span>Pay Online</span>
//                           </button>

//                           <button
//                             onClick={() => handleCashOption(b)}
//                             className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 shadow-lg transition duration-300"
//                           >
//                             <span>💵</span>
//                             <span>Pay by Cash</span>
//                           </button>

//                           <button
//                             onClick={() => openSplitModal(b)}
//                             className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 shadow-lg transition duration-300"
//                           >
//                             <span>👥</span>
//                             <span>Split Payment</span>
//                           </button>
//                         </div>
//                       )}

//                        {/* Price Display */}
//                       <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
//                         <div className="text-right">
//                           <div className="text-sm text-green-600 font-medium">Service Amount</div>
//                           <div className="text-2xl font-bold text-green-700">
//                             ₹{b.serviceAmount || 0}
//                           </div>
//                           <div className="text-xs text-green-600 mt-1">
//                             Platform Fee: ₹{b.platformFee || 0}
//                           </div>
//                           <div className="text-sm font-semibold text-green-800 border-t border-green-300 pt-1 mt-1">
//                             Total: ₹{b.totalAmount || 0}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Payment Status */}
//                       {b.paymentStatus && (
//                         <div className={`text-sm font-medium px-3 py-1 rounded-full`}>
//                           Payment: {b.paymentStatus === "paid" ? "Paid" : "Pending"}
//                         </div>
//                       )}                    

//                       {/* Mark Complete */}
//                       {b.otpVerified && !b.completedByCustomer && (
//                         <button
//                           onClick={() => markCompleted(b._id)}
//                           className="mt-2 px-3 py-1 bg-[var(--ternary)] text-white rounded hover:bg-[var(--secondary)]"
//                         >
//                           Mark Completed
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Booking Status Timeline */}
//                   <div className="mt-4">
//                     <BookingStatusTimeline statusHistory={b.statusHistory} />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Cancel Modal */}
//       {confirmCancelId && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div
//             ref={modalRef}
//             className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md text-center"
//           >
//             <h3 className="text-xl font-semibold mb-4 text-[var(--primary)]">
//               Confirm Cancellation
//             </h3>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to cancel this booking? This action cannot
//               be undone.
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                 onClick={() => setConfirmCancelId(null)}
//               >
//                 Back
//               </button>
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
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
//     </div>
//   );
// }



import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import BookingStatusTimeline from "../components/BookingStatusTimeline";
import { FaCheck, FaTimes } from "react-icons/fa";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-toastify";

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
  const [shareAmount, setShareAmount] = useState("");

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
          color: "#38bdf8",
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled by user");
          }
        }
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
      await axios.patch(`${backendUrl}/api/bookings/${booking._id}/initiate-cash`, {}, { withCredentials: true });
      toast.info("Waiting for provider to confirm cash");
      getBookings();
    } catch (err) {
      toast.error("Failed to initiate cash payment");
    }
  };

  // Split Payment
  // const openSplitModal = (booking) => {
  //   setSelectedBooking(booking);
  //   setSplitModalOpen(true);
  // };

  // const handleSplitPay = async () => {
  //   if (!shareAmount || shareAmount <= 0) {
  //     toast.error("Please enter a valid amount");
  //     return;
  //   }

  //   try {
  //     const { data: order } = await axios.post(
  //       `${backendUrl}/api/payments/create-order`,
  //       {
  //         amount: shareAmount,
  //         bookingId: selectedBooking._id,
  //       },
  //       { withCredentials: true }
  //     );

  //     const options = {
  //       key: import.meta.env.VITE_RAZORPAY_KEY,
  //       amount: order.amount,
  //       currency: "INR",
  //       name: "ServeGo",
  //       description: selectedBooking.serviceName,
  //       order_id: order.id,
  //       handler: async function (response) {
  //         try {
  //           await axios.post(
  //             `${backendUrl}/api/payments/verify`,
  //             {
  //               response,
  //               bookingId: selectedBooking._id,
  //               userId: userData._id,
  //               amount: shareAmount,
  //             },
  //             { withCredentials: true }
  //           );
  //           toast.success("Your share paid successfully!");
  //           setSplitModalOpen(false);
  //           setShareAmount("");
  //           getBookings();
  //         } catch (error) {
  //           toast.error("Payment verification failed!");
  //         }
  //       },
  //       prefill: {
  //         name: userData.name,
  //         email: userData.email,
  //         contact: userData.phone,
  //       },
  //       theme: {
  //         color: "#38bdf8",
  //       },
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   } catch (err) {
  //     toast.error("Failed to create split payment order");
  //   }
  // };

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

                      {/* {b.paymentStatus === "paid" && (
                        <div className="text-sm text-green-600 font-medium">
                          Payment: Paid 💰
                        </div>
                      )} */}
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
                      {["confirmed", "in-progress"].includes(status) && b.paymentStatus !== "paid" && (
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
                          <div className="text-sm text-green-600 font-medium">Service Amount</div>
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
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                          b.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          Payment Status: {b.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </div>
                      )}                    

                      {/* Mark Complete */}
                      {b.otpVerified && !b.completedByCustomer && (
                        <button
                          onClick={() => markCompleted(b._id)}
                          className="mt-2 px-3 py-1 bg-[var(--ternary)] text-white rounded hover:bg-[var(--secondary)]"
                        >
                          Mark Completed
                        </button>
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
              Total Amount: ₹{selectedBooking?.totalAmount}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Share Amount
              </label>
              <input
                type="number"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                min="1"
                max={selectedBooking?.totalAmount}
              />
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSplitPay}
              >
                Pay Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

