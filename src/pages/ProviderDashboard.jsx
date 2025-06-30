// // // // import React, { useEffect, useState } from "react";
// // // // import axios from "axios";
// // // // import { FaCheck, FaTimes, FaClock, FaSyncAlt } from "react-icons/fa";
// // // // import dayjs from "dayjs";

// // // // export default function ProviderDashboard() {
// // // //   const [bookings, setBookings] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [actionLoading, setActionLoading] = useState("");
// // // //   const [error, setError] = useState("");
// // // //   const [showTimeUpdate, setShowTimeUpdate] = useState(null);
// // // //   const [newFrom, setNewFrom] = useState("");
// // // //   const [newTo, setNewTo] = useState("");

// // // //   // Fetch bookings for this provider
// // // //   useEffect(() => {
// // // //   setLoading(true);
// // // //   axios
// // // //     .get("http://localhost:5000/api/bookings/provider-requests", { withCredentials: true })
// // // //     .then((res) => {
// // // //       setBookings(res.data.bookings || []);
// // // //       setLoading(false);
// // // //     })
// // // //     .catch((err) => {
// // // //       console.error("Fetch error:", err);
// // // //       setError("Failed to load bookings");
// // // //       setLoading(false);
// // // //     });
// // // // }, []);


// // // //   // Handle status update
// // // //   const handleStatus = async (id, status, newTimeSlot) => {
// // // //     setActionLoading(id + status);
// // // //     try {
// // // //       const res = await axios.patch(
// // // //         `/api/bookings/${id}/status`,
// // // //         status === "update-time"
// // // //           ? { status, newTimeSlot }
// // // //           : { status },
// // // //         { withCredentials: true }
// // // //       );
// // // //       setBookings((prev) =>
// // // //         prev.map((b) => (b._id === id ? res.data.booking : b))
// // // //       );
// // // //       setShowTimeUpdate(null);
// // // //       setNewFrom("");
// // // //       setNewTo("");
// // // //     } catch (err) {
// // // //       alert(err.response?.data?.message || "Failed to update status");
// // // //     }
// // // //     setActionLoading("");
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)] py-10 px-2">
// // // //       <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
// // // //         <h1 className="text-3xl font-bold text-[var(--primary)] mb-8 text-center">
// // // //           Provider Dashboard
// // // //         </h1>
// // // //         {loading ? (
// // // //           <div className="text-center text-lg text-[var(--primary)]">Loading...</div>
// // // //         ) : bookings.length === 0 ? (
// // // //           <div className="text-center text-gray-500">No booking requests yet.</div>
// // // //         ) : (
// // // //           <div className="overflow-x-auto">
// // // //             <table className="min-w-full border rounded-xl shadow">
// // // //               <thead>
// // // //                 <tr className="bg-[var(--primary-light)] text-[var(--primary)]">
// // // //                   <th className="py-2 px-3">Customer</th>
// // // //                   <th className="py-2 px-3">Service</th>
// // // //                   <th className="py-2 px-3">Date</th>
// // // //                   <th className="py-2 px-3">Time</th>
// // // //                   <th className="py-2 px-3">Notes</th>
// // // //                   <th className="py-2 px-3">Status</th>
// // // //                   <th className="py-2 px-3">Actions</th>
// // // //                 </tr>
// // // //               </thead>
// // // //               <tbody>
// // // //                 {bookings.map((b) => {
// // // //                   const latestStatus =
// // // //                     b.statusHistory && b.statusHistory.length
// // // //                       ? b.statusHistory[b.statusHistory.length - 1].status
// // // //                       : "pending";
// // // //                   return (
// // // //                     <tr
// // // //                       key={b._id}
// // // //                       className="border-b hover:bg-[var(--primary-light)] transition"
// // // //                     >
// // // //                       <td className="py-2 px-3 flex items-center gap-2">
// // // //                         {b.customer?.avatarUrl ? (
// // // //                           <img
// // // //                             src={b.customer.avatarUrl}
// // // //                             alt={b.customer.name}
// // // //                             className="w-8 h-8 rounded-full object-cover border"
// // // //                           />
// // // //                         ) : (
// // // //                           <span className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center font-bold text-[var(--primary)]">
// // // //                             {b.customer?.name?.[0]?.toUpperCase() || "U"}
// // // //                           </span>
// // // //                         )}
// // // //                         <div>
// // // //                           <div className="font-semibold">{b.customer?.name}</div>
// // // //                           <div className="text-xs text-gray-500">{b.customer?.email}</div>
// // // //                         </div>
// // // //                       </td>
// // // //                       <td className="py-2 px-3">{b.serviceName}</td>
// // // //                       <td className="py-2 px-3">
// // // //                         {dayjs(b.date).format("DD MMM YYYY")}
// // // //                       </td>
// // // //                       <td className="py-2 px-3">
// // // //                         {b.timeSlot.from} - {b.timeSlot.to}
// // // //                       </td>
// // // //                       <td className="py-2 px-3">{b.notes || "-"}</td>
// // // //                       <td className="py-2 px-3">
// // // //                         <span
// // // //                           className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
// // // //                             latestStatus === "pending"
// // // //                               ? "bg-yellow-100 text-yellow-700"
// // // //                               : latestStatus === "confirmed"
// // // //                               ? "bg-green-100 text-green-700"
// // // //                               : latestStatus === "rejected"
// // // //                               ? "bg-red-100 text-red-700"
// // // //                               : latestStatus === "update-time"
// // // //                               ? "bg-blue-100 text-blue-700"
// // // //                               : ""
// // // //                           }`}
// // // //                         >
// // // //                           {latestStatus.replace("-", " ")}
// // // //                         </span>
// // // //                       </td>
// // // //                       <td className="py-2 px-3">
// // // //                         {latestStatus === "pending" ? (
// // // //                           <div className="flex gap-2">
// // // //                             <button
// // // //                               className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
// // // //                               disabled={actionLoading === b._id + "confirmed"}
// // // //                               onClick={() =>
// // // //                                 handleStatus(b._id, "confirmed")
// // // //                               }
// // // //                             >
// // // //                               <FaCheck /> Accept
// // // //                             </button>
// // // //                             <button
// // // //                               className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
// // // //                               disabled={actionLoading === b._id + "rejected"}
// // // //                               onClick={() =>
// // // //                                 handleStatus(b._id, "rejected")
// // // //                               }
// // // //                             >
// // // //                               <FaTimes /> Reject
// // // //                             </button>
// // // //                             <button
// // // //                               className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
// // // //                               onClick={() => setShowTimeUpdate(b._id)}
// // // //                             >
// // // //                               <FaClock /> Update Time
// // // //                             </button>
// // // //                           </div>
// // // //                         ) : latestStatus === "update-time" ? (
// // // //                           <span className="text-blue-600 flex items-center gap-1">
// // // //                             <FaSyncAlt /> Awaiting customer response
// // // //                           </span>
// // // //                         ) : (
// // // //                           <span className="text-gray-400">No actions</span>
// // // //                         )}
// // // //                         {/* Time update form */}
// // // //                         {showTimeUpdate === b._id && (
// // // //                           <div className="mt-2 bg-gray-50 p-3 rounded shadow">
// // // //                             <div className="flex gap-2 items-center">
// // // //                               <input
// // // //                                 type="time"
// // // //                                 value={newFrom}
// // // //                                 onChange={(e) => setNewFrom(e.target.value)}
// // // //                                 className="border px-2 py-1 rounded"
// // // //                               />
// // // //                               <span>-</span>
// // // //                               <input
// // // //                                 type="time"
// // // //                                 value={newTo}
// // // //                                 onChange={(e) => setNewTo(e.target.value)}
// // // //                                 className="border px-2 py-1 rounded"
// // // //                               />
// // // //                               <button
// // // //                                 className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
// // // //                                 disabled={actionLoading === b._id + "update-time"}
// // // //                                 onClick={() =>
// // // //                                   handleStatus(b._id, "update-time", {
// // // //                                     from: newFrom,
// // // //                                     to: newTo,
// // // //                                   })
// // // //                                 }
// // // //                               >
// // // //                                 Send Update
// // // //                               </button>
// // // //                               <button
// // // //                                 className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
// // // //                                 onClick={() => setShowTimeUpdate(null)}
// // // //                               >
// // // //                                 Cancel
// // // //                               </button>
// // // //                             </div>
// // // //                             <div className="text-xs text-gray-500 mt-1">
// // // //                               Suggest a new time slot to the customer.
// // // //                             </div>
// // // //                           </div>
// // // //                         )}
// // // //                       </td>
// // // //                     </tr>
// // // //                   );
// // // //                 })}
// // // //               </tbody>
// // // //             </table>
// // // //           </div>
// // // //         )}
// // // //         {error && (
// // // //           <div className="text-center text-red-500 mt-4">{error}</div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // Card view
// // // import React, { useEffect, useState } from "react";
// // // import axios from "axios";
// // // import { FaCheck, FaTimes, FaClock, FaSyncAlt } from "react-icons/fa";
// // // import dayjs from "dayjs";

// // // export default function ProviderDashboard() {
// // //   const [bookings, setBookings] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [actionLoading, setActionLoading] = useState("");
// // //   const [error, setError] = useState("");
// // //   const [showTimeUpdate, setShowTimeUpdate] = useState(null);
// // //   const [newFrom, setNewFrom] = useState("");
// // //   const [newTo, setNewTo] = useState("");

// // //   useEffect(() => {
// // //     setLoading(true);
// // //     axios
// // //       .get("http://localhost:5000/api/bookings/provider-requests", { withCredentials: true })
// // //       .then((res) => {
// // //         setBookings(res.data.bookings || []);
// // //         setLoading(false);
// // //       })
// // //       .catch((err) => {
// // //         console.error("Fetch error:", err);
// // //         setError("Failed to load bookings");
// // //         setLoading(false);
// // //       });
// // //   }, []);

// // //   const handleStatus = async (id, status, newTimeSlot) => {
// // //     setActionLoading(id + status);
// // //     try {
// // //       const res = await axios.patch(
// // //         `/api/bookings/${id}/status`,
// // //         status === "update-time"
// // //           ? { status, newTimeSlot }
// // //           : { status },
// // //         { withCredentials: true }
// // //       );
// // //       setBookings((prev) =>
// // //         prev.map((b) => (b._id === id ? res.data.booking : b))
// // //       );
// // //       setShowTimeUpdate(null);
// // //       setNewFrom("");
// // //       setNewTo("");
// // //     } catch (err) {
// // //       alert(err.response?.data?.message || "Failed to update status");
// // //     }
// // //     setActionLoading("");
// // //   };

// // //   const getStatusStyle = (status) => {
// // //     const base = "px-2 py-1 rounded text-xs font-semibold";
// // //     switch (status) {
// // //       case "pending":
// // //         return `${base} bg-yellow-100 text-yellow-700`;
// // //       case "confirmed":
// // //         return `${base} bg-green-100 text-green-700`;
// // //       case "rejected":
// // //         return `${base} bg-red-100 text-red-700`;
// // //       case "update-time":
// // //         return `${base} bg-blue-100 text-blue-700`;
// // //       default:
// // //         return `${base} bg-gray-100 text-gray-700`;
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gray-100 py-10 px-4">
// // //       <div className="max-w-5xl mx-auto">
// // //         <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">Provider Dashboard</h1>
        
// // //         {loading ? (
// // //           <div className="text-center text-lg text-blue-500">Loading...</div>
// // //         ) : bookings.length === 0 ? (
// // //           <div className="text-center text-gray-500 text-lg">No booking requests yet.</div>
// // //         ) : (
// // //           <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
// // //             {bookings.map((b) => {
// // //               const latestStatus = b.statusHistory?.slice(-1)[0]?.status || "pending";
// // //               return (
// // //                 <div key={b._id} className="bg-white rounded-xl shadow-md p-6 space-y-3">
// // //                   <div className="flex items-center gap-4">
// // //                     {b.customer?.avatarUrl ? (
// // //                       <img
// // //                         src={b.customer.avatarUrl}
// // //                         alt={b.customer.name}
// // //                         className="w-12 h-12 rounded-full border object-cover"
// // //                       />
// // //                     ) : (
// // //                       <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
// // //                         {b.customer?.name?.[0]?.toUpperCase() || "U"}
// // //                       </div>
// // //                     )}
// // //                     <div>
// // //                       <h2 className="font-semibold">{b.customer?.name}</h2>
// // //                       <p className="text-sm text-gray-500">{b.customer?.email}</p>
// // //                     </div>
// // //                   </div>

// // //                   <div className="text-sm text-gray-600">
// // //                     <p><span className="font-medium">Service:</span> {b.serviceName}</p>
// // //                     <p><span className="font-medium">Date:</span> {dayjs(b.date).format("DD MMM YYYY")}</p>
// // //                     <p><span className="font-medium">Time:</span> {b.timeSlot.from} - {b.timeSlot.to}</p>
// // //                     <p><span className="font-medium">Notes:</span> {b.notes || "-"}</p>
// // //                     <p><span className="font-medium">Status:</span> <span className={getStatusStyle(latestStatus)}>{latestStatus.replace("-", " ")}</span></p>
// // //                   </div>

// // //                   {latestStatus === "pending" && (
// // //                     <div className="flex flex-wrap gap-2">
// // //                       <button
// // //                         className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
// // //                         disabled={actionLoading === b._id + "confirmed"}
// // //                         onClick={() => handleStatus(b._id, "confirmed")}
// // //                       >
// // //                         <FaCheck /> Accept
// // //                       </button>
// // //                       <button
// // //                         className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
// // //                         disabled={actionLoading === b._id + "rejected"}
// // //                         onClick={() => handleStatus(b._id, "rejected")}
// // //                       >
// // //                         <FaTimes /> Reject
// // //                       </button>
// // //                       <button
// // //                         className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
// // //                         onClick={() => setShowTimeUpdate(b._id)}
// // //                       >
// // //                         <FaClock /> Update Time
// // //                       </button>
// // //                     </div>
// // //                   )}

// // //                   {latestStatus === "update-time" && (
// // //                     <p className="text-blue-600 text-sm flex items-center gap-1"><FaSyncAlt /> Awaiting customer response</p>
// // //                   )}

// // //                   {showTimeUpdate === b._id && (
// // //                     <div className="bg-gray-50 rounded p-4 mt-2 space-y-2">
// // //                       <div className="flex gap-2 items-center">
// // //                         <input
// // //                           type="time"
// // //                           value={newFrom}
// // //                           onChange={(e) => setNewFrom(e.target.value)}
// // //                           className="border rounded px-2 py-1"
// // //                         />
// // //                         <span>-</span>
// // //                         <input
// // //                           type="time"
// // //                           value={newTo}
// // //                           onChange={(e) => setNewTo(e.target.value)}
// // //                           className="border rounded px-2 py-1"
// // //                         />
// // //                       </div>
// // //                       <div className="flex gap-2">
// // //                         <button
// // //                           className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
// // //                           disabled={actionLoading === b._id + "update-time"}
// // //                           onClick={() =>
// // //                             handleStatus(b._id, "update-time", {
// // //                               from: newFrom,
// // //                               to: newTo,
// // //                             })
// // //                           }
// // //                         >
// // //                           Send Update
// // //                         </button>
// // //                         <button
// // //                           className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded"
// // //                           onClick={() => setShowTimeUpdate(null)}
// // //                         >
// // //                           Cancel
// // //                         </button>
// // //                       </div>
// // //                       <p className="text-xs text-gray-500">Suggest a new time slot to the customer.</p>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         )}

// // //         {error && <p className="text-center text-red-500 mt-4">{error}</p>}
// // //       </div>
// // //     </div>
// // //   );
// // // }



// // // version 3
// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { FaCheck, FaTimes, FaClock, FaSyncAlt } from "react-icons/fa";
// // import dayjs from "dayjs";

// // export default function ProviderDashboard() {
// //   const [bookings, setBookings] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [actionLoading, setActionLoading] = useState("");
// //   const [error, setError] = useState("");
// //   const [showTimeUpdate, setShowTimeUpdate] = useState(null);
// //   const [newFrom, setNewFrom] = useState("");
// //   const [newTo, setNewTo] = useState("");

// //   useEffect(() => {
// //     setLoading(true);
// //     axios
// //       .get("http://localhost:5000/api/bookings/provider-requests", { withCredentials: true })
// //       .then((res) => {
// //         setBookings(res.data.bookings || []);
// //         setLoading(false);
// //       })
// //       .catch((err) => {
// //         setError("Failed to load bookings");
// //         setLoading(false);
// //       });
// //   }, []);

// //   const handleStatus = async (id, status, newTimeSlot) => {
// //     setActionLoading(id + status);
// //     try {
// //       const res = await axios.patch(
// //         `/api/bookings/${id}/status`,
// //         status === "update-time"
// //           ? { status, newTimeSlot }
// //           : { status },
// //         { withCredentials: true }
// //       );
// //       setBookings((prev) =>
// //         prev.map((b) => (b._id === id ? res.data.booking : b))
// //       );
// //       setShowTimeUpdate(null);
// //       setNewFrom("");
// //       setNewTo("");
// //     } catch (err) {
// //       alert(err.response?.data?.message || "Failed to update status");
// //     }
// //     setActionLoading("");
// //   };

// //   const statusColor = {
// //     pending: "bg-yellow-100 text-yellow-700",
// //     confirmed: "bg-green-100 text-green-700",
// //     rejected: "bg-red-100 text-red-700",
// //     "update-time": "bg-blue-100 text-blue-700",
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
// //       <div className="max-w-6xl mx-auto">
// //         <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">📋 Provider Dashboard</h1>
// //         {loading ? (
// //           <div className="text-center text-blue-600 text-xl">Loading bookings...</div>
// //         ) : bookings.length === 0 ? (
// //           <div className="text-center text-gray-500 text-lg">No booking requests yet.</div>
// //         ) : (
// //           <div className="grid md:grid-cols-2 gap-6">
// //             {bookings.map((b) => {
// //               const status =
// //                 b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";

// //               return (
// //                 <div key={b._id} className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100">
// //                   <div className="flex items-center gap-4 mb-4">
// //                     {b.customer?.avatarUrl ? (
// //                       <img src={b.customer.avatarUrl} className="w-12 h-12 rounded-full border shadow" />
// //                     ) : (
// //                       <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold shadow">
// //                         {b.customer?.name?.[0]?.toUpperCase() || "U"}
// //                       </div>
// //                     )}
// //                     <div>
// //                       <div className="font-bold text-lg text-blue-800">{b.customer?.name}</div>
// //                       <div className="text-sm text-gray-500">{b.customer?.email}</div>
// //                     </div>
// //                   </div>

// //                   <div className="text-sm mb-2">
// //                     <span className="font-semibold text-gray-600">Service:</span> {b.serviceName}
// //                   </div>
// //                   <div className="text-sm mb-2">
// //                     <span className="font-semibold text-gray-600">Date:</span>{" "}
// //                     {dayjs(b.date).format("DD MMM YYYY")}
// //                   </div>
// //                   <div className="text-sm mb-2">
// //                     <span className="font-semibold text-gray-600">Time:</span>{" "}
// //                     {dayjs(b.timeSlot.from, "HH:mm").format("hh:mm A")} - {dayjs(b.timeSlot.to, "HH:mm").format("hh:mm A")}
// //                   </div>
// //                   <div className="text-sm mb-4">
// //                     <span className="font-semibold text-gray-600">Notes:</span> {b.notes || "—"}
// //                   </div>

// //                   <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${statusColor[status]}`}>
// //                     {status.replace("-", " ")}
// //                   </div>

// //                   {status === "pending" ? (
// //                     <div className="flex flex-wrap gap-2">
// //                       <button
// //                         className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
// //                         disabled={actionLoading === b._id + "confirmed"}
// //                         onClick={() => handleStatus(b._id, "confirmed")}
// //                       >
// //                         <FaCheck /> Accept
// //                       </button>
// //                       <button
// //                         className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
// //                         disabled={actionLoading === b._id + "rejected"}
// //                         onClick={() => handleStatus(b._id, "rejected")}
// //                       >
// //                         <FaTimes /> Reject
// //                       </button>
// //                       <button
// //                         className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
// //                         onClick={() => setShowTimeUpdate(b._id)}
// //                       >
// //                         <FaClock /> Update Time
// //                       </button>
// //                     </div>
// //                   ) : status === "update-time" ? (
// //                     <div className="text-blue-600 flex items-center gap-2 text-sm">
// //                       <FaSyncAlt /> Awaiting customer response
// //                     </div>
// //                   ) : (
// //                     <div className="text-gray-400 text-sm">No further actions</div>
// //                   )}

// //                   {showTimeUpdate === b._id && (
// //                     <div className="mt-4 p-4 bg-gray-50 border rounded-lg shadow-sm">
// //                       <div className="flex gap-2 mb-2 items-center">
// //                         <input
// //                           type="time"
// //                           value={newFrom}
// //                           onChange={(e) => setNewFrom(e.target.value)}
// //                           className="border px-2 py-1 rounded text-sm"
// //                         />
// //                         <span>-</span>
// //                         <input
// //                           type="time"
// //                           value={newTo}
// //                           onChange={(e) => setNewTo(e.target.value)}
// //                           className="border px-2 py-1 rounded text-sm"
// //                         />
// //                       </div>
// //                       <div className="flex gap-2">
// //                         <button
// //                           className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
// //                           disabled={actionLoading === b._id + "update-time"}
// //                           onClick={() =>
// //                             handleStatus(b._id, "update-time", { from: newFrom, to: newTo })
// //                           }
// //                         >
// //                           Send Update
// //                         </button>
// //                         <button
// //                           className="bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-400"
// //                           onClick={() => setShowTimeUpdate(null)}
// //                         >
// //                           Cancel
// //                         </button>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}
// //         {error && <div className="text-center text-red-500 mt-6">{error}</div>}
// //       </div>
// //     </div>
// //   );
// // }


// // version 4
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaCheck, FaTimes, FaClock, FaSyncAlt } from "react-icons/fa";
// import dayjs from "dayjs";
// import { motion } from "framer-motion";

// export default function ProviderDashboard() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState("");
//   const [error, setError] = useState("");
//   const [showTimeUpdate, setShowTimeUpdate] = useState(null);
//   const [newFrom, setNewFrom] = useState("");
//   const [newTo, setNewTo] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [expanded, setExpanded] = useState({});

//   useEffect(() => {
//     setLoading(true);
//     axios
//       .get("http://localhost:5000/api/bookings/provider-requests", { withCredentials: true })
//       .then((res) => {
//         setBookings(res.data.bookings || []);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError("Failed to load bookings");
//         setLoading(false);
//       });
//   }, []);

//   const handleStatus = async (id, status, newTimeSlot) => {
//     setActionLoading(id + status);
//     try {
//       const res = await axios.patch(
//         `/api/bookings/${id}/status`,
//         status === "update-time" ? { status, newTimeSlot } : { status },
//         { withCredentials: true }
//       );
//       setBookings((prev) => prev.map((b) => (b._id === id ? res.data.booking : b)));
//       setShowTimeUpdate(null);
//       setNewFrom("");
//       setNewTo("");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update status");
//     }
//     setActionLoading("");
//   };

//   const statusColor = {
//     pending: "bg-yellow-100 text-yellow-700",
//     confirmed: "bg-green-100 text-green-700",
//     rejected: "bg-red-100 text-red-700",
//     "update-time": "bg-blue-100 text-blue-700",
//   };

//   const grouped = bookings.reduce((acc, b) => {
//     const latest = b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
//     if (filter !== "all" && latest !== filter) return acc;
//     acc[latest] = acc[latest] || [];
//     acc[latest].push(b);
//     return acc;
//   }, {});

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-4xl font-bold text-center text-blue-800 mb-6">📋 Provider Dashboard</h1>

//         <div className="flex justify-center gap-3 mb-8">
//           {['all', 'pending', 'confirmed', 'rejected'].map((s) => (
//             <button
//               key={s}
//               onClick={() => setFilter(s)}
//               className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
//                 filter === s
//                   ? 'bg-blue-600 text-white border-blue-600'
//                   : 'bg-white text-blue-700 border-blue-300'
//               }`}
//             >
//               {s.charAt(0).toUpperCase() + s.slice(1)}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="text-center text-blue-600 text-xl">Loading...</div>
//         ) : Object.keys(grouped).length === 0 ? (
//           <div className="text-center text-gray-500 text-lg">No bookings found.</div>
//         ) : (
//           Object.entries(grouped).map(([status, group]) => (
//             <div key={status} className="mb-8">
//               <div
//                 className="flex justify-between items-center cursor-pointer bg-blue-100 px-5 py-3 rounded-t-xl"
//                 onClick={() => setExpanded((prev) => ({ ...prev, [status]: !prev[status] }))}
//               >
//                 <h2 className="text-lg font-semibold text-blue-800">{status.toUpperCase()} ({group.length})</h2>
//                 <span>{expanded[status] ? "-" : "+"}</span>
//               </div>

//               {expanded[status] && (
//                 <div className="grid md:grid-cols-2 gap-6 border p-4 rounded-b-xl">
//                   {group.map((b, idx) => (
//                     <motion.div
//                       key={b._id}
//                       initial={{ opacity: 0, scale: 0.95 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ duration: 0.3, delay: idx * 0.05 }}
//                       className="bg-white shadow-lg rounded-xl p-5 border"
//                     >
//                       <div className="flex items-center gap-4 mb-3">
//                         {b.customer?.avatarUrl ? (
//                           <img src={b.customer.avatarUrl} className="w-12 h-12 rounded-full border shadow" />
//                         ) : (
//                           <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold shadow">
//                             {b.customer?.name?.[0]?.toUpperCase() || "U"}
//                           </div>
//                         )}
//                         <div>
//                           <div className="font-semibold text-blue-800">{b.customer?.name}</div>
//                           <div className="text-sm text-gray-500">{b.customer?.email}</div>
//                         </div>
//                       </div>
//                       <div className="text-sm mb-1"><strong>Service:</strong> {b.serviceName}</div>
//                       <div className="text-sm mb-1"><strong>Date:</strong> {dayjs(b.date).format("DD MMM YYYY")}</div>
//                       <div className="text-sm mb-1">
//                         <strong>Time:</strong> {b.timeSlot.from} - {b.timeSlot.to}
//                       </div>
//                       <div className="text-sm mb-3"><strong>Notes:</strong> {b.notes || "—"}</div>

//                       <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${statusColor[status]}`}>
//                         {status.replace("-", " ")}
//                       </div>

//                       {status === "pending" && (
//                         <div className="flex flex-wrap gap-2">
//                           <button
//                             className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
//                             disabled={actionLoading === b._id + "confirmed"}
//                             onClick={() => handleStatus(b._id, "confirmed")}
//                           >
//                             <FaCheck /> Accept
//                           </button>
//                           <button
//                             className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
//                             disabled={actionLoading === b._id + "rejected"}
//                             onClick={() => handleStatus(b._id, "rejected")}
//                           >
//                             <FaTimes /> Reject
//                           </button>
//                           <button
//                             className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
//                             onClick={() => setShowTimeUpdate(b._id)}
//                           >
//                             <FaClock /> Update Time
//                           </button>
//                         </div>
//                       )}

//                       {status === "update-time" && (
//                         <div className="text-blue-600 text-sm flex items-center gap-2 mt-2">
//                           <FaSyncAlt /> Awaiting customer response
//                         </div>
//                       )}

//                       {showTimeUpdate === b._id && (
//                         <div className="mt-4 p-3 bg-gray-50 border rounded-lg shadow-sm">
//                           <div className="flex gap-2 mb-2 items-center">
//                             <input
//                               type="time"
//                               value={newFrom}
//                               onChange={(e) => setNewFrom(e.target.value)}
//                               className="border px-2 py-1 rounded text-sm"
//                             />
//                             <span>-</span>
//                             <input
//                               type="time"
//                               value={newTo}
//                               onChange={(e) => setNewTo(e.target.value)}
//                               className="border px-2 py-1 rounded text-sm"
//                             />
//                           </div>
//                           <div className="flex gap-2">
//                             <button
//                               className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
//                               disabled={actionLoading === b._id + "update-time"}
//                               onClick={() => handleStatus(b._id, "update-time", { from: newFrom, to: newTo })}
//                             >
//                               Send Update
//                             </button>
//                             <button
//                               className="bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-400"
//                               onClick={() => setShowTimeUpdate(null)}
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//         {error && <div className="text-center text-red-500 mt-6">{error}</div>}
//       </div>
//     </div>
//   );
// }


// new version
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
      .get("http://localhost:5000/api/bookings/provider-requests", { withCredentials: true })
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
        `/api/bookings/${id}/status`,
        status === "update-time" ? { status, newTimeSlot } : { status },
        { withCredentials: true }
      );
      setBookings((prev) => prev.map((b) => (b._id === id ? res.data.booking : b)));
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
    const latest = b.statusHistory?.[b.statusHistory.length - 1]?.status || "pending";
    if (filter !== "all" && latest !== filter) return acc;
    acc[latest] = acc[latest] || [];
    acc[latest].push(b);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-6">📋 Provider Dashboard</h1>

        <div className="flex justify-center gap-3 mb-8">
          {['all', 'pending', 'confirmed', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-700 border-blue-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-blue-600 text-xl">Loading...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No bookings found.</div>
        ) : (
          Object.entries(grouped).map(([status, group]) => (
            <div key={status} className="mb-8">
              <div
                className="flex justify-between items-center cursor-pointer bg-blue-100 px-5 py-3 rounded-t-xl"
                onClick={() => setExpanded((prev) => ({ ...prev, [status]: !prev[status] }))}
              >
                <h2 className="text-lg font-semibold text-blue-800">{status.toUpperCase()} ({group.length})</h2>
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
                          <img src={b.customer.avatarUrl} className="w-12 h-12 rounded-full border shadow" />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold shadow">
                            {b.customer?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-blue-800">{b.customer?.name}</div>
                          <div className="text-sm text-gray-500">{b.customer?.email}</div>
                        </div>
                      </div>
                      <div className="text-sm mb-1"><strong>Service:</strong> {b.serviceName}</div>
                      <div className="text-sm mb-1"><strong>Date:</strong> {dayjs(b.date).format("DD MMM YYYY")}</div>
                      <div className="text-sm mb-1">
                        <strong>Time:</strong> {b.timeSlot.from} - {b.timeSlot.to}
                      </div>
                      <div className="text-sm mb-3"><strong>Notes:</strong> {b.notes || "—"}</div>

                      <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${statusColor[status]}`}>
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
                              onClick={() => handleStatus(b._id, "update-time", { from: newFrom, to: newTo })}
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
