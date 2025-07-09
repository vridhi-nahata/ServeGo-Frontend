import React from "react";
import { FaCheckCircle, FaHandshake, FaUsers, FaBolt, FaShieldAlt } from "react-icons/fa";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-[var(--primary)] mb-4">
          About ServeGo
        </h1>
        <p className="text-center text-gray-700 mb-12 max-w-3xl mx-auto">
          ServeGo is your trusted partner for on-demand home and professional services. From skilled electricians and carpenters to reliable cleaners and wellness experts, we connect you with verified professionals for every need—seamlessly and safely.
        </p>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-md transition">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--primary)] mb-2">
              <FaHandshake />
              Our Mission
            </h2>
            <p className="text-gray-600">
              To simplify everyday life by making quality services accessible at the tap of a button. We empower customers with convenience and professionals with growth opportunities.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-md transition">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--primary)] mb-2">
              <FaBolt />
              Our Vision
            </h2>
            <p className="text-gray-600">
              To become the most trusted and comprehensive platform for home and professional services across India, driving innovation, transparency, and excellence.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <h2 className="text-3xl font-bold text-center text-[var(--primary)] mb-6">
          Our Core Values
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow hover:shadow-md transition">
            <FaShieldAlt className="text-[var(--primary)] text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
            <p className="text-gray-600 text-sm">
              All professionals are background-verified and trained to ensure peace of mind.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow hover:shadow-md transition">
            <FaUsers className="text-[var(--primary)] text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Customer Centricity</h3>
            <p className="text-gray-600 text-sm">
              We put your needs first—ensuring quality service and transparent pricing every time.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow hover:shadow-md transition">
            <FaCheckCircle className="text-[var(--primary)] text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Excellence</h3>
            <p className="text-gray-600 text-sm">
              Continuous improvement and commitment to the highest standards of service delivery.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-3">
            Join Thousands Who Trust ServeGo
          </h2>
          <p className="text-gray-700 mb-6">
            Discover how we can make your life easier and your business thrive.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[var(--primary)] text-white font-semibold px-6 py-3 rounded-full shadow hover:bg-[var(--primary-dark)] transition"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
