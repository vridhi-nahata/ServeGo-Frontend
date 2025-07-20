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
  pending: {
    icon: <FaClock />,
    color: "bg-yellow-400",
    label: "Pending",
    description: "Awaiting confirmation",
  },
  confirmed: {
    icon: <FaCheck />,
    color: "bg-green-500",
    label: "Confirmed",
    description: "Booking confirmed",
  },
  rejected: {
    icon: <FaTimes />,
    color: "bg-red-500",
    label: "Rejected",
    description: "Booking was rejected",
  },
  "update-time": {
    icon: <FaSyncAlt />,
    color: "bg-blue-500",
    label: "Time Updated",
    description: "New time suggested",
  },
  "in-progress": {
    icon: <FaTools />,
    color: "bg-orange-400",
    label: "In Progress",
    description: "Service ongoing",
  },
  completed: {
    icon: <FaFlag />,
    color: "bg-purple-500",
    label: "Completed",
    description: "Service finished",
  },
  cancelled: {
    icon: <FaCalendarTimes />,
    color: "bg-gray-400",
    label: "Cancelled",
    description: "Booking cancelled",
  },
};

const BookingStatusTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory?.length) return null;

  return (
    <div className="w-full mt-6">
      {/* Desktop horizontal timeline */}
      <div className="hidden sm:flex items-start relative w-full">
        {statusHistory.map((item, index) => {
          const isLast = index === statusHistory.length - 1;
          const { status, changedAt } = item;
          const config = statusConfig[status] || statusConfig.pending;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative"
              style={{ width: `${100 / statusHistory.length}%` }}
            >
              {/* Horizontal line */}
              {!isLast && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 z-0">
                  <div className="h-full w-full bg-gray-300 mx-auto" />
                </div>
              )}

              {/* Icon */}
              <div className="relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 ${config.color} ${
                    isLast ? "ring-4 ring-blue-100 scale-110" : ""
                  }`}
                >
                  <span className="text-lg">{config.icon}</span>
                </div>

                {/* Ping Animation */}
                {isLast && (
                  <div
                    className={`absolute inset-0 rounded-full animate-ping ${config.color} opacity-20`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-4 text-center max-w-32">
                <h4
                  className={`text-sm font-semibold ${
                    isLast ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {config.label}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-tight">
                  {config.description}
                </p>
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-600 pb-1">
                    {dayjs(changedAt).format("MMM DD")}
                  </div>
                  <div className="text-xs text-gray-400">
                    {dayjs(changedAt).format("hh:mm A")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile vertical timeline */}
      <div className="flex flex-col sm:hidden relative ml-4">
        {statusHistory.map((item, index) => {
          const isLast = index === statusHistory.length - 1;
          const { status, changedAt } = item;
          const config = statusConfig[status] || statusConfig.pending;

          return (
            <div key={index} className="flex items-start mb-6 relative">
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute top-8 left-[1.125rem] h-[5.5rem] w-0.5 bg-gray-300 z-0" />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 ${config.color} ${
                    isLast ? "ring-4 ring-blue-100 scale-110" : ""
                  }`}
                >
                  <span className="text-lg">{config.icon}</span>
                </div>

                {/* Ping */}
                {isLast && (
                  <div
                    className={`absolute inset-0 rounded-full animate-ping ${config.color} opacity-20`}
                  />
                )}
              </div>

              {/* Info */}
              <div className="ml-4 mt-1">
                <h4 className="text-sm font-semibold text-gray-800">
                  {config.label}
                </h4>
                <p className="text-xs text-gray-500">{config.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  <div>{dayjs(changedAt).format("MMM DD, YYYY")}</div>
                  <div>{dayjs(changedAt).format("hh:mm A")}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
        <FaClock className="inline mr-1" />
        Last updated:{" "}
        {dayjs(statusHistory[statusHistory.length - 1]?.changedAt).format(
          "DD MMM YYYY, hh:mm A"
        )}
      </div>
    </div>
  );
};

export default BookingStatusTimeline;
