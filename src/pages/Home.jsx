import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTools,
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

const POPULAR_SERVICES = [
  "Home Cleaning",
  "Physiotherapy",
  "Massage",
  "MakeUp",
  "Hairstyle",
  "Cooking",
  "Pest Control",
  "Painting",
  "Waterproofing",
  "AC Repair",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Smart Device Repair",
  "IT Support",
  "Medical Lab Tests",
  "Nutritionist",
  "Photography",
  "Car Cleaning",
  "Tutoring",
  "Mounting",
  "Lifting",
];

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
      <FaPhoneAlt className="text-3xl" style={{ color: "var(--secondary)" }} />
    ),
  },
  {
    title: "Transparent Pricing",
    desc: "See upfront pricing. No hidden charges—what you see is what you pay.",
    icon: (
      <FaRupeeSign className="text-3xl" style={{ color: "var(--accent)" }} />
    ),
  },
  {
    title: "Real-Time Tracking",
    desc: "Live location tracking of your service provider from booking to completion. Stay informed every step of the way.",
    icon: (
      <FaMapMarkerAlt
        className="text-3xl"
        style={{ color: "var(--primary-light)" }}
      />
    ),
  },
  {
    title: "Flexible Scheduling",
    desc: "Book services instantly or schedule for later. Choose the time that works best for your busy lifestyle.",
    icon: (
      <FaCalendarAlt
        className="text-3xl"
        style={{ color: "var(--background-light)" }}
      />
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
        style={{ color: "var(--secondary)" }}
      />
    ),
  },
  {
    title: "Split payments",
    desc: "Divide payment between multiple people if service is for many users.",
    icon: (
      <FaHandHoldingUsd
        className="text-3xl"
        style={{ color: "var(--accent)" }}
      />
    ),
  },
  {
    title: "Fast Support",
    desc: "Our team is available 24/7 for your help and support.",
    icon: (
      <FaHeadset
        className="text-3xl"
        style={{ color: "var(--primary-light)" }}
      />
    ),
  },
];

export default function Home() {
  return (
    <div
      className="font-sans min-h-screen"
      style={{
        "--primary": "#1A237E", // Dark Blue
        "--secondary": "#3949AB", // Medium Blue
        "--accent": "#90CAF9", // Accent Blue
        "--primary-light": "#E3F2FD", // Light Blue
        "--background-light": "#F5F7FA", // Very Light Blue
        "--background": "#E3F2FD", // Very Light Blue
        background:
          "linear-gradient(135deg, var(--background) 0%, var(--primary-light) 40%, var(--accent) 100%)",
        color: "var(--primary)",
      }}
    >
      {/* Hero Section */}
      <section
        className="py-28 px-6 text-center relative overflow-hidden shadow-lg"
        style={{
          background:
            "linear-gradient(120deg, var(--primary) 0%, var(--primary-light) 60%, var(--accent) 100%)",
          color: "#fff",
        }}
      >
        {/* Decorative Blobs */}
        {/* <div
          className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-20 blur-2xl -z-10"
          style={{
            background: "var(--background)",
            top: "-5rem",
            left: "-5rem",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-2xl -z-10"
          style={{
            background: "var(--secondary)",
            bottom: "-7rem",
            right: "-7rem",
          }}
        /> */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight drop-shadow-lg tracking-tight">
          One Platform,{" "}
          <span style={{ color: "var(--background-light)" }}>
            Many Services
          </span>
        </h1>
        <p
          className="text-2xl md:text-3xl mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--background-light)" }}
        >
          From home repairs to beauty services,{" "}
          <span className="font-semibold" style={{ color: "var(--primary)" }}>
            find trusted professionals
          </span>{" "}
          for all your needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
          <Link
            to="/services"
            className="font-bold px-10 py-4 rounded-full shadow-lg transition text-lg border-2"
            style={{
              background: "var(--background-light)",
              color: "var(--primary)",
              borderColor: "var(--secondary)",
              boxShadow: "0 4px 24px 0 rgba(88,87,87,0.12)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "var(--primary-light)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "var(--background-light)")
            }
          >
            <span className="inline-flex items-center gap-2">
              <FaSearch /> Explore Services
            </span>
          </Link>
          <Link
            to="/register"
            className="font-bold px-10 py-4 rounded-full border-2 transition text-lg"
            style={{
              borderColor: "var(--background-light)",
              color: "var(--background-light)",
              background: "transparent",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "var(--background-light)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span className="inline-flex items-center gap-2">
              <FaUserCheck /> Become a Provider
            </span>
          </Link>
        </div>
      </section>

      {/* Popular Services */}
      <section
        className="py-20 px-6"
        style={{
          background:
            "linear-gradient(90deg, var(--background) 0%, var(--secondary) 100%)",
        }}
      >
        <h2
          className="text-4xl font-bold text-center mb-14 tracking-tight"
          style={{ color: "var(--primary)" }}
        >
          Popular Services
        </h2>
        <div className="flex overflow-x-auto gap-8 pb-4 max-w-6xl mx-auto">
          {POPULAR_SERVICES.map((cat, i) => (
            <div
              key={i}
              className="min-w-[180px] p-7 rounded-2xl shadow-lg hover:shadow-2xl text-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 border-t-4"
              style={{
                background: "#fff",
                borderColor: "var(--primary)",
              }}
            >
              <FaTools
                className="mx-auto text-3xl mb-3"
                style={{ color: "var(--primary)" }}
              />
              <p className="font-medium text-lg">{cat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-10 tracking-tight"
          style={{ color: "var(--primary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="text-lg text-gray-500 text-center mb-14 max-w-2xl mx-auto"
          style={{ color: "var(--primary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Book services in just a few simple steps and get the help — when you
          need it.
        </motion.p>
        <motion.div
          className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 max-w-6xl mx-auto text-center"
          style={{ color: "var(--primary)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hover:scale-105 transition-transform duration-300">
            <FaSearch
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--primary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">1. Browse Services</h3>
            <p className="text-sm text-gray-600">
              Explore a wide range of services.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaThList
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">2. Select Service</h3>
            <p className="text-sm text-gray-600">
              Choose the type of service you want to book.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaUserCheck
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--primary-light)" }}
            />
            <h3 className="font-semibold text-lg mb-2">3. Choose Provider</h3>
            <p className="text-sm text-gray-600">
              Pick your preferred provider, date, and time — based on reviews
              and pricing.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaRupeeSign
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--accent)" }}
            />
            <h3 className="font-semibold text-lg mb-2">4. Pay & Book</h3>
            <p className="text-sm text-gray-600">
              Pay securely via UPI, wallet, or card and confirm your booking.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaCogs
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--primary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">5. Get the Service</h3>
            <p className="text-sm text-gray-600">
              Relax while a verified professional delivers your service.
            </p>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            <FaRegCommentDots
              className="mx-auto text-4xl mb-4"
              style={{ color: "var(--secondary)" }}
            />
            <h3 className="font-semibold text-lg mb-2">6. Give Feedback</h3>
            <p className="text-sm text-gray-600">
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
            "linear-gradient(90deg, var(--background) 0%, var(--secondary) 100%)",
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
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
                    background: "#fff",
                    borderColor: "var(--primary)",
                  }}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 text-center">
                    {item.title}
                  </h3>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-lg p-8 transform rotate-y-180 flex flex-col items-center justify-center [backface-visibility:hidden]"
                  style={{
                    background: "var(--background-light)",
                    color: "var(--primary)",
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
          background: "var(--primary)",
          color: "#fff",
        }}
      >
        <h2 className="text-3xl font-semibold mb-4">
          Join 1,000+ users finding professionals every day.
        </h2>
        <Link
          to="/login"
          className="font-semibold px-8 py-3 rounded-full transition text-lg shadow-lg"
          style={{
            background: "var(--background-light)",
            color: "var(--primary)",
          }}
        >
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="text-white text-sm text-center py-6"
        style={{ background: "var(--primary)" }}
      >
        <p>&copy; {new Date().getFullYear()} ServeGo. All rights reserved.</p>
      </footer>
    </div>
  );
}
