import React, { useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { MdClear } from "react-icons/md";
import dayjs from "dayjs";

export default function BookingHeader({
  search,
  setSearch,
  bookings,
  setBookings,
  getAllBookings,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const panelRef = useRef();

  const statusOptions = [
    "pending",
    "confirmed",
    "rejected",
    "completed",
    "cancelled",
  ];

  const paymentStatusOptions = ["paid", "unpaid"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    let filteredBookings = [...bookings];

    if (selectedStatuses.length > 0) {
      filteredBookings = filteredBookings.filter((booking) =>
        selectedStatuses.includes(booking.statusHistory?.at(-1)?.status)
      );
    }

    if (selectedPaymentStatuses.length > 0) {
      filteredBookings = filteredBookings.filter((booking) =>
        selectedPaymentStatuses.includes(booking.paymentStatus)
      );
    }

    if (dateRange.from) {
      filteredBookings = filteredBookings.filter((booking) =>
        dayjs(booking.date).isAfter(dayjs(dateRange.from).subtract(1, "day"))
      );
    }

    if (dateRange.to) {
      filteredBookings = filteredBookings.filter((booking) =>
        dayjs(booking.date).isBefore(dayjs(dateRange.to).add(1, "day"))
      );
    }

    if (sortBy === "recent") {
      filteredBookings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "oldest") {
      filteredBookings.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortBy === "upcoming") {
      filteredBookings.sort(
        (a, b) =>
          new Date(a.date + "T" + a.timeSlot.from) -
          new Date(b.date + "T" + b.timeSlot.from)
      );
    }

    setBookings(filteredBookings);
  }, [bookings, selectedStatuses, selectedPaymentStatuses, dateRange, sortBy]);

  return (
    <div className="bg-white rounded-xl p-4 shadow mb-6 border border-gray-200">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex items-center w-full md:w-1/3">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name, user, or provider"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              <FaFilter />
              Filters
              {filtersOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {filtersOpen && (
              <div className="absolute z-10 bg-white p-4 shadow rounded-md border mt-2 w-80">
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => {
                            setSelectedStatuses((prev) =>
                              prev.includes(status)
                                ? prev.filter((s) => s !== status)
                                : [...prev, status]
                            );
                          }}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Payment Status
                  </label>
                  <div className="flex gap-4">
                    {paymentStatusOptions.map((status) => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPaymentStatuses.includes(status)}
                          onChange={() => {
                            setSelectedPaymentStatuses((prev) =>
                              prev.includes(status)
                                ? prev.filter((s) => s !== status)
                                : [...prev, status]
                            );
                          }}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedStatuses([]);
                      setSelectedPaymentStatuses([]);
                      setDateRange({ from: "", to: "" });
                      setSortBy("");
                      setSearch("");
                    }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <MdClear />
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-gray-700"
          >
            <option value="">Sort By</option>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>
    </div>
  );
}
