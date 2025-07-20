import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaClipboardList,
  FaDollarSign,
  FaClipboardCheck,
  FaStar,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const COLORS = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#6b7280",
];

const fmt = (d, g) => {
  const date = dayjs(d);
  switch (g) {
    case "daily":
      return date.format("DD MMM");
    case "weekly":
      return `W${date.week()}`;
    case "monthly":
      return date.format("MMM YY");
    case "yearly":
      return date.format("YYYY");
    default:
      return date.format("DD MMM");
  }
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640); // Tailwind's `sm`
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

function ProviderAnalytics({ bookings, setBookings }) {
  const isMobile = useIsMobile();

  const [from, setFrom] = useState("2025-01-01"); // Set to a very early date
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [granularity, setGranularity] = useState("daily"); // daily | weekly | monthly
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const filtered = useMemo(() => {
    console.log("Filtering bookings with from:", from, "to:", to);
    // Add one day to the 'to' date to make it inclusive
    const toDate = dayjs(to).add(1, "day");
    return bookings.filter((b) => {
      const createdAt = dayjs(b.createdAt);
      console.log("Booking createdAt:", createdAt.format());
      return createdAt.isBetween(from, toDate, null, "[]");
    });
  }, [bookings, from, to]);

  const kpis = useMemo(() => {
    console.log("Computing KPIs with filtered data:", filtered);
    const completed = filtered.filter((b) =>
      b.statusHistory?.some((s) => s.status === "completed")
    );
    const revenue = completed.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const rated = filtered.filter((b) => b.customerFeedback?.rating);
    const avg = rated.length
      ? rated.reduce((s, b) => s + b.customerFeedback.rating, 0) / rated.length
      : 0;
    return { revenue, completed: completed.length, avg: avg.toFixed(1) };
  }, [filtered]);

  const statusData = useMemo(() => {
    console.log("Computing statusData with filtered data:", filtered);
    const counts = {};
    filtered.forEach((b) => {
      const latest = b.statusHistory?.at(-1)?.status || "pending";
      counts[latest] = (counts[latest] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const serviceRevenueData = useMemo(() => {
    console.log("Computing serviceRevenueData with filtered data:", filtered);
    const map = {};
    filtered
      .filter((b) => b.statusHistory?.some((s) => s.status === "completed"))
      .forEach((b) => {
        map[b.serviceName] = (map[b.serviceName] || 0) + (b.totalAmount || 0);
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const serviceData = useMemo(() => {
    console.log("Computing serviceData with filtered data:", filtered);
    const map = {};
    filtered
      .filter((b) => b.statusHistory?.some((s) => s.status === "completed"))
      .forEach((b) => {
        map[b.serviceName] = (map[b.serviceName] || 0) + 1;
      });
    return Object.entries(map)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const trendData = useMemo(() => {
    console.log("Computing trendData with filtered data:", filtered);
    const map = {};
    filtered
      .filter((b) => b.statusHistory?.some((s) => s.status === "completed"))
      .forEach((b) => {
        const key = fmt(b.createdAt, granularity);
        map[key] = (map[key] || 0) + (b.totalAmount || 0);
      });
    return Object.entries(map)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [filtered, granularity]);

  const ratingStats = useMemo(() => {
    console.log("Computing ratingStats with bookings data:", bookings);
    const reviews = bookings.filter((b) => b.customerFeedback?.rating);
    const total = reviews.length;
    if (!total) return null;
    const avg = (
      reviews.reduce((s, b) => s + b.customerFeedback.rating, 0) / total
    ).toFixed(1);
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((b) => b.customerFeedback.rating === star).length,
      percent: (
        (reviews.filter((b) => b.customerFeedback.rating === star).length /
          total) *
        100
      ).toFixed(0),
    }));
    return { avg, counts, total };
  }, [bookings]);

  const reviews = useMemo(() => {
    console.log("Computing reviews with bookings data:", bookings);
    return bookings
      .filter((b) => b.customerFeedback?.rating)
      .map((b) => ({
        rating: b.customerFeedback.rating,
        review: b.customerFeedback.review || "",
        date: b.customerFeedback.date,
        customer: b.customer,
      }))
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [bookings]);

  const handleStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status },
        { withCredentials: true }
      );
      const { data } = await axios.get(
        "http://localhost:5000/api/bookings/provider-requests",
        { withCredentials: true }
      );
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleReschedule = (bookingId) => {
    setSelectedBookingId(bookingId);
  };

  const isValidTime = (time) => {
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const handleRescheduleSubmit = async () => {
    if (!newFrom || !newTo || !selectedBookingId) {
      console.error("New time slot or booking ID is missing.");
      return;
    }

    if (!isValidTime(newFrom) || !isValidTime(newTo)) {
      console.error("Invalid time format. Please use HH:MM.");
      return;
    }

    try {
      const url = `http://localhost:5000/api/bookings/${selectedBookingId}/status`;
      const payload = {
        status: "update-time",
        newTimeSlot: {
          from: newFrom,
          to: newTo,
        },
      };
      console.log("Reschedule Payload:", payload); // Debugging log

      const response = await axios.patch(url, payload, {
        withCredentials: true,
      });
      console.log("Reschedule successful:", response.data);

      // Refresh bookings after successful update
      const { data } = await axios.get(
        "http://localhost:5000/api/bookings/provider-requests",
        { withCredentials: true }
      );
      setBookings(data.bookings || []);

      // Clear form and selection
      setSelectedBookingId(null);
      setNewFrom("");
      setNewTo("");
    } catch (err) {
      console.error("Failed to reschedule booking:", err);
    }
  };

  const upcomingBookings = useMemo(() => {
    console.log("Computing upcomingBookings with bookings data:", bookings);
    const now = dayjs();
    const next7Days = now.add(7, "day");

    return bookings
      .filter((b) => b.statusHistory?.some((s) => s.status === "confirmed"))
      .filter((b) => {
        const bookingDate = dayjs(b.date);
        return bookingDate.isAfter(now) && bookingDate.isBefore(next7Days);
      });
  }, [bookings]);

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-[var(--primary-light)] to-white p-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">
          Dashboard
        </h1>

        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex flex-col">
            <label
              htmlFor="from"
              className="text-sm text-[var(--primary)] mb-1"
            >
              From
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border w-32 border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="to" className="text-sm text-[var(--primary)] mb-1">
              To
            </label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border w-32 border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<FaClipboardList />}
          label="Total Bookings"
          value={filtered.length}
        />
        <KpiCard
          icon={<FaClipboardCheck />}
          label="Completed"
          value={kpis.completed}
        />
        <KpiCard
          icon={<FaDollarSign />}
          label="Revenue"
          value={`₹${kpis.revenue.toLocaleString()}`}
        />
        <KpiCard icon={<FaStar />} label="Avg Rating" value={kpis.avg} />
      </div>

      <div className="my-6">
        <ChartBox title="Pending Requests">
          {filtered.filter(
            (b) => (b.statusHistory?.at(-1)?.status || "pending") === "pending"
          ).length === 0 ? (
            <p className="text-gray-500 text-center">No pending requests</p>
          ) : (
            filtered
              .filter(
                (b) =>
                  (b.statusHistory?.at(-1)?.status || "pending") === "pending"
              )
              .map((b) => (
                <div
                  key={b._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white rounded shadow"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{b.serviceName}</p>
                    <p className="text-sm text-gray-600">
                      {b.customer.name} • {dayjs(b.date).format("DD MMM")} •{" "}
                      {b.timeSlot.from}-{b.timeSlot.to}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(b._id, "confirmed")}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatus(b._id, "rejected")}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReschedule(b._id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Reschedule
                    </button>
                  </div>

                  {selectedBookingId === b._id && (
                    <div className="mt-4 w-full sm:w-1/2">
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          New From Time
                        </label>
                        <input
                          type="time"
                          value={newFrom}
                          onChange={(e) => setNewFrom(e.target.value)}
                          className="w-full border rounded py-2 px-3"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          New To Time
                        </label>
                        <input
                          type="time"
                          value={newTo}
                          onChange={(e) => setNewTo(e.target.value)}
                          className="w-full border rounded py-2 px-3"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedBookingId(null);
                            setNewFrom("");
                            setNewTo("");
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRescheduleSubmit}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </ChartBox>
      </div>

      <div className="my-6">
        <ChartBox title="Upcoming Bookings">
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-500 text-center">No upcoming bookings</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {upcomingBookings.map((b, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-lg border bg-white shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{b.serviceName}</p>
                    <p className="text-sm text-gray-600">
                      {b.customer.name} • {dayjs(b.date).format("DD MMM")} •{" "}
                      {b.timeSlot.from}-{b.timeSlot.to}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartBox>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartBox title="Top Services">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                activeBar={{ fill: "#3b82f6", strokeWidth: 0, stroke: "none" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Bookings by Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={false}
                isAnimationActive={true}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                align={isMobile ? "left" : "right"}
                verticalAlign={isMobile ? "bottom" : "middle"}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox
          title={
            <div className="flex justify-between items-center w-full">
              <h2 className="text-lg">Revenue Trend</h2>
              <div className="relative w-28 ml-auto">
                <select
                  id="granularity"
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value)}
                  className="w-full font-thin text-sm appearance-none border rounded-md px-3 pr-10 py-2 shadow-sm focus:outline-none text-gray-700"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>

                {/* Chevron icon on right */}
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                  <FiChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => "₹" + v.toLocaleString()} />
              <Tooltip
                formatter={(v) => "₹" + v.toLocaleString()}
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                activeBar={{ fill: "#10b981", stroke: "none", strokeWidth: 0 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Revenue by Service">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceRevenueData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={false}
                isAnimationActive={true}
              >
                {serviceRevenueData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                align={isMobile ? "left" : "right"}
                verticalAlign={isMobile ? "bottom" : "middle"}
              />{" "}
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      <div className="mt-6">
        {ratingStats && (
          <ChartBox title="Customer Ratings Overview">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--primary)]">
                  {ratingStats.avg}
                  <i className="fa-solid fa-star text-yellow-500 text-xl pl-2 mb-2"></i>
                </div>
                <div className="text-sm text-gray-500">
                  {ratingStats.total} reviews
                </div>
              </div>

              <div className="flex-1 space-y-1">
                {ratingStats.counts.map(({ star, count, percent }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-12">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartBox>
        )}
      </div>

      <div className="mt-6">
        <ChartBox title="Customer Reviews">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center">No reviews yet.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-lg border bg-white shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0
                      ${r.customer.avatarUrl ? "" : "bg-[var(--primary)]"}`}
                  >
                    {r.customer.avatarUrl ? (
                      <img
                        src={r.customer.avatarUrl}
                        alt={r.customer.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (r.customer.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--primary)]">
                        {r.customer.name}
                      </span>
                      <span className="text-sm text-yellow-500">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{r.review}</p>
                    <p className="text-xs text-gray-400">
                      {dayjs(r.date).format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartBox>
      </div>
    </div>
  );
}

const KpiCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded shadow">
    <div className="p-3 bg-[var(--primary-light)] text-[var(--primary)] rounded-full text-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-[var(--primary)]">{value}</p>
    </div>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">
      {title}
    </h3>
    {children}
  </div>
);

export default function ProviderAnalyticsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bookings/provider-requests", {
        withCredentials: true,
      })
      .then((res) => {
        console.log("API Response:", res.data);
        setBookings(res.data.bookings || []);
      })
      .catch((error) => {
        console.error("API Error:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center text-[var(--primary)]">
        Loading…
      </div>
    );

  return <ProviderAnalytics bookings={bookings} setBookings={setBookings} />;
}
