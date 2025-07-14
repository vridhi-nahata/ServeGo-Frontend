// import React from "react";
// import dayjs from "dayjs";
// import {
//   FaCheck,
//   FaTimes,
//   FaSyncAlt,
//   FaClock,
//   FaTools,
//   FaFlag,
//   FaCalendarTimes,
// } from "react-icons/fa";

// const statusConfig = {
//   pending: { icon: <FaClock />, color: "bg-yellow-400" },
//   confirmed: { icon: <FaCheck />, color: "bg-green-500" },
//   rejected: { icon: <FaTimes />, color: "bg-red-500" },
//   "update-time": { icon: <FaSyncAlt />, color: "bg-blue-500" },
//   "in-progress": { icon: <FaTools />, color: "bg-orange-400" },
//   completed: { icon: <FaFlag />, color: "bg-purple-500" },
//   cancelled: { icon: <FaCalendarTimes />, color: "bg-gray-400" },
// };

// const BookingStatusTimeline = ({ statusHistory = [] }) => {
//   if (!statusHistory?.length) return null;

//   return (
//     <div className="relative mt-6 pl-8">
//       {/* Vertical line */}
// <div className="absolute inset-y-0 left-2.5 w-1 bg-gradient-to-b from-[var(--primary-light)] to-[var(--primary)] rounded-full" />

//       {statusHistory.map((item, index) => {
//         const isLast = index === statusHistory.length - 1;
//         const { status, changedAt } = item;
//         const conf = statusConfig[status] || statusConfig.pending;

//         return (
//           <div key={index} className="relative mb-6 group">
//             {/* Icon */}
//             <div
//               className={`absolute left-0 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-sm shadow-lg z-10 transition-transform duration-300 ${
//                 conf.color
//               } ${isLast ? "ring-2 ring-[var(--secondary)]" : ""}`}
//             >
//               {conf.icon}
//             </div>

//             {/* Content */}
//             <div className="ml-10">
//               <div
//                 className={`text-sm font-semibold capitalize mb-1 ${
//                   isLast ? "text-[var(--primary)]" : "text-gray-800"
//                 }`}
//               >
//                 {status.replace("-", " ")}
//               </div>
//               <div className="text-xs text-gray-500">
//                 {dayjs(changedAt).format("DD MMM YYYY, hh:mm A")}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default BookingStatusTimeline;

import React from "react";
import dayjs from "dayjs";
import {
  FaCheck,
  FaTimes,
  FaSyncAlt,
  FaClock,
  FaTools,
  FaFlag,
  FaCalendarTimes,
} from "react-icons/fa";

const statusConfig = {
  pending: { icon: <FaClock />, color: "bg-yellow-400" },
  confirmed: { icon: <FaCheck />, color: "bg-green-500" },
  rejected: { icon: <FaTimes />, color: "bg-red-500" },
  "update-time": { icon: <FaSyncAlt />, color: "bg-blue-500" },
  "in-progress": { icon: <FaTools />, color: "bg-orange-400" },
  completed: { icon: <FaFlag />, color: "bg-purple-500" },
  cancelled: { icon: <FaCalendarTimes />, color: "bg-gray-400" },
};

const BookingStatusTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory?.length) return null;

  return (
    <div className="relative mt-6">
      {statusHistory.map((item, index) => {
        const isLast = index === statusHistory.length - 1;
        const { status, changedAt } = item;
        const conf = statusConfig[status] || statusConfig.pending;

        return (
          <div key={index} className="relative mb-6">
            {/* Connecting line to next icon */}
            {!isLast && (
              <div className="absolute top-2 left-2.5 w-[3px] h-[calc(100%+15px)] bg-gradient-to-b from-[var(--primary-light)] to-[var(--primary)] z-0" />
            )}

            {/* Status icon */}
            <div
              className={`absolute left-0 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-sm shadow z-10 ${
                conf.color
              } ${isLast ? "ring-2 ring-[var(--secondary)]" : ""}`}
            >
              {conf.icon}
            </div>

            {/* Text content */}
            <div className="ml-10">
              <div
                className={`text-sm font-semibold capitalize mb-1 ${
                  isLast ? "text-[var(--primary)]" : "text-gray-800"
                }`}
              >
                {status.replace("-", " ")}
              </div>
              <div className="text-xs text-gray-500">
                {dayjs(changedAt).format("DD MMM YYYY, hh:mm A")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingStatusTimeline;
