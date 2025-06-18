import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {SERVICES} from "../constants/services"
 
const SERVICES_PER_PAGE = 6;

function ServicesSection() {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  // pagination logic
  const totalPages = Math.ceil(SERVICES.length / SERVICES_PER_PAGE);
  const start = page * SERVICES_PER_PAGE;
  const visibleServices = SERVICES.slice(start, start + SERVICES_PER_PAGE);

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)] text-center">
      <div className="relative flex items-center mb-8">
        <h2
          className="text-4xl font-bold w-full text-center"
          style={{ color: "var(--primary)" }}
        >
        Services
        </h2>
        <button
          className="absolute right-0 px-6 py-2 rounded-full font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-white shadow hover:scale-105 transition"
          onClick={() => navigate("/services")}
        >
          Explore All
        </button>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
        {visibleServices.map((service) => (
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
  );
}

export default ServicesSection;
