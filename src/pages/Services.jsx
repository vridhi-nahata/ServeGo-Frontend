import React from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES} from "../constants/services";

export default function Services() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      <h2 className="text-4xl font-extrabold mb-10 text-center" style={{ color: "var(--primary)" }}>
        All Services
      </h2>
      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 max-w-7xl mx-auto text-center">
        {SERVICES.map((service) => (
          <div
            key={service.name}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group border-t-4 border-[var(--primary)]"
            onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
          >
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-40 object-contain p-6 bg-white group-hover:scale-105 transition-transform"
            />
            <div className="p-5">
              <h3 className="font-bold text-xl mb-2 text-[var(--primary)]">{service.name}</h3>
              <p className="text-gray-600">{service.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}