import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SERVICES } from "../constants/services";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaUserShield,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHeadset,
  FaThList,
  FaUserCheck,
  FaCogs,
  FaRegCommentDots,
  FaClipboardList,
  FaHandHoldingUsd,
  FaPhoneAlt,
  FaGift,
} from "react-icons/fa";

const WHY_CHOOSE = [
  {
    title: "Verified Providers",
    desc: "All service providers undergo thorough background checks and profile verification for your safety and peace of mind.",
    icon: (
      <FaUserShield className="text-3xl" style={{ color: "var(--primary)" }} />
    ),
  },
  {
    title: "In-App Communication",
    desc: "Voice call, or video call with providers through the app. Get consultation, clarify details, and get quotes.",
    icon: (
      <FaPhoneAlt className="text-3xl" style={{ color: "var(--primary)" }} />
    ),
  },
  {
    title: "Transparent Pricing",
    desc: "See upfront pricing. No hidden charges—what you see is what you pay.",
    icon: (
      <FaRupeeSign className="text-3xl" style={{ color: "var(--primary)" }} />
    ),
  },
  {
    title: "Real-Time Tracking",
    desc: "Live location tracking of your service provider from booking to completion. Stay informed every step of the way.",
    icon: (
      <FaMapMarkerAlt
        className="text-3xl"
        style={{ color: "var(--primary)" }}
      />
    ),
  },
  {
    title: "Flexible Scheduling",
    desc: "Book services instantly or schedule for later. Choose the time that works best for your busy lifestyle.",
    icon: (
      <FaCalendarAlt className="text-3xl" style={{ color: "var(--primary)" }} />
    ),
  },
  {
    title: "Loyalty Rewards",
    desc: "Earn points and discounts based on your usage milestones.",
    icon: <FaGift className="text-3xl" style={{ color: "var(--primary)" }} />,
  },
  {
    title: "Subscription Plans",
    desc: "Monthly packages with priority booking and discounted rates for frequent users.",
    icon: (
      <FaClipboardList
        className="text-3xl"
        style={{ color: "var(--primary)" }}
      />
    ),
  },
  {
    title: "Split payments",
    desc: "Divide payment between multiple people if service is for many users.",
    icon: (
      <FaHandHoldingUsd
        className="text-3xl"
        style={{ color: "var(--primary)" }}
      />
    ),
  },
  {
    title: "Fast Support",
    desc: "Our team is available 24/7 for your help and support.",
    icon: (
      <FaHeadset className="text-3xl" style={{ color: "var(--primary)" }} />
    ),
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  // pagination logic
  const SERVICES_PER_PAGE = 6;

  const totalPages = Math.ceil(SERVICES.length / SERVICES_PER_PAGE);
  const start = page * SERVICES_PER_PAGE;
  const visibleServices = SERVICES.slice(start, start + SERVICES_PER_PAGE);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="py-36 text-center relative overflow-hidden shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, var(--secondary) 0%, var(--primary-light) 60%, var(--accent) 100%)",
          color: "var(--white)",
        }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-16 px-4 leading-tight drop-shadow-lg tracking-tight">
          One Platform,{" "}
          <span style={{ color: "var(--background-light)" }}>
            Many Services
          </span>
        </h1>
        <p
          className="text-2xl pt-4 md:text-3xl mb-12 px-5 max-w-2xl mx-auto leading-relaxed "
          style={{ color: "var(--background-light)" }}
        >
          From home repairs to beauty services,{" "}
          <span className="font-semibold" style={{ color: "var(--primary)" }}>
            find trusted professionals
          </span>{" "}
          for all your needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 py-10 px-8">
          <Link
            to="/services"
            className="font-bold px-10 py-4 rounded-full shadow-lg transition text-lg"
            style={{
              background:
                "linear-gradient(to right, var(--accent), var(--secondary))",
              color: "var(--white)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--ternary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to right, var(--accent), var(--secondary))";
            }}
          >
            <span className="inline-flex items-center gap-2">
              <FaSearch /> Explore Services
            </span>
          </Link>
          {/* <Link
            to="/login"
            className="font-bold px-10 py-4 rounded-full shadow-lg transition text-lg"
            style={{
              background:
                "linear-gradient(to right, var(--accent), var(--secondary))",
              color: "var(--white)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--ternary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to right, var(--accent), var(--secondary))";
            }}
          >
            <span className="inline-flex items-center gap-2">
              <FaUserCheck /> Become a Provider
            </span>
          </Link> */}
        </div>
      </section>

      {/* Popular services */}
      <section className="py-20 px-6 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)] text-center">
        <div className="relative mb-8">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center"
            style={{ color: "var(--primary)" }}
          >
            Services
          </h2>

          <div className="mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <button
              className="px-6 py-2 rounded-full font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-white shadow hover:scale-105 transition"
              onClick={() => navigate("/services")}
               onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--ternary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to right, var(--accent), var(--secondary))";
            }}
            >
              Explore All
            </button>
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {visibleServices.map((service) => (
            <div
              key={service.name}
              className="bg-[var(--white)] rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group border-t-4 border-[var(--primary)]"
              onClick={() =>
                navigate(`/services/${encodeURIComponent(service.name)}`)
              }
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-40 object-contain p-5 bg-[var(--white)] group-hover:scale-105 transition-transform"
              />
              <div>
                <h3 className="font-bold text-xl mb-2 text-[var(--primary)]">
                  {service.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="px-4 py-2 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-semibold shadow disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Prev
          </button>
          <button
            className="px-4 py-2 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-semibold shadow disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6" style={{ background: "var(--white)" }}>
        <motion.h2
          className="text-4xl font-bold text-center mb-10 tracking-tight"
          style={{ color: "var(--primary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          How ServeGo Works
        </motion.h2>
        <motion.p
          className="text-lg text-center mb-14 max-w-2xl mx-auto"
          style={{ color: "var(--secondary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Book services in few simple steps and get the help — when you need it.
        </motion.p>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 max-w-6xl mx-auto text-center"
          style={{ color: "var(--secondary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hover:scale-105 transition-transform duration-300">
            <FaSearch
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">1. Browse Services</h3>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              Explore a wide range of services.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaThList
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">2. Select Service</h3>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              Choose the type of service you want to book.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaUserCheck
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">3. Choose Provider</h3>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              Pick your preferred provider, date, and time — based on reviews
              and pricing.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaRupeeSign
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">4. Pay & Book</h3>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              Pay securely via UPI, wallet, or card and confirm your booking.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaCogs
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">5. Get the Service</h3>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              Relax while a verified professional delivers your service.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaRegCommentDots
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">6. Give Feedback</h3>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              Rate your experience and help others by leaving a review.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us - Flip Cards */}
      <section
        className="py-20 px-6"
        style={{
          background:
            "linear-gradient(120deg, var(--primary-light) 0%, var(--white) 100%)",
        }}
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-14 tracking-tight"
          style={{ color: "var(--primary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Why Choose ServeGo?
        </motion.h2>
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {WHY_CHOOSE.map((item, index) => (
            <motion.div
              key={index}
              className="group perspective-[1000px]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-64 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center [backface-visibility:hidden] border-b-4"
                  style={{
                    background:
                      "linear-gradient(to right, var(--accent),var(--background-light))",
                    borderColor: "var(--primary)",
                  }}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3
                    className="text-xl font-semibold text-center"
                    style={{ color: "var(--primary)" }}
                  >
                    {item.title}
                  </h3>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-lg p-8 transform rotate-y-180 flex flex-col items-center justify-center [backface-visibility:hidden]"
                  style={{
                    background:
                      "linear-gradient(to right, var(--background-light),var(--accent))",
                    color: "var(--secondary)",
                  }}
                >
                  <div className="flex items-start justify-start px-15 gap-3 mb-5">
                    <div className="mb-2">{item.icon}</div>
                    <h3 className="text-lg font-bold mb-2 text-center">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-center">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section
        className="py-14 text-center"
        style={{
          background: "var(--secondary)",
          color: "var(--white)",
        }}
      >
        <h2 className="text-3xl font-semibold mb-10">
          Join 1,000+ users finding professionals every day.
        </h2>
        <Link
          to="/login"
          className="font-semibold px-8 py-3 rounded-full transition text-lg shadow-lg"
          style={{
            background: "var(--background-light)",
            color: "var(--primary)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--primary-light)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--background-light)";
          }}
        >
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="text-sm text-center py-6"
        style={{ background: "var(--primary)", color: "var(--white)" }}
      >
        <p>&copy; {new Date().getFullYear()} ServeGo. All rights reserved.</p>
      </footer>
    </div>
  );
}
