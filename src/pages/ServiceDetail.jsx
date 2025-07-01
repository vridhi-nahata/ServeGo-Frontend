import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import ProviderCard from "../components/ProviderCard";
import BookingForm from "../components/BookingForm";
import axios from "axios";
import { SERVICES } from "../constants/services";

export default function ServiceDetail() {
  const { serviceName } = useParams();
  const { userData } = useContext(AppContext);
  const service = SERVICES.find((s) => s.name === serviceName);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null); // track booking state

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/api/user/providers-by-service?service=${encodeURIComponent(
          serviceName
        )}`,
        { withCredentials: true }
      )
      .then((res) => {
        setProviders(res.data.providers || []);
        setLoading(false);
      });
  }, [serviceName]);

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      {/* About service section */}
      <div className="max-w-3xl mx-auto bg-[var(--white)] rounded-2xl shadow-lg p-8 mb-10 flex flex-col items-center">
        <img
          src={service?.image}
          alt={service?.name}
          className="w-32 h-32 object-contain mb-4"
        />
        <h2 className="text-3xl font-bold mb-2 text-[var(--primary)]">
          {service?.name}
        </h2>
        <p className="text-[var(--gray)] text-lg text-center">
          {service?.desc || "Service details coming soon."}
        </p>
      </div>

      {/* Available providers list */}
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--primary)] text-center">
        Available Providers
      </h3>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="text-center text-[var(--gray)]">
          No providers found for this service.
        </div>
      ) : (
        <div className="w-full px-4">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto justify-center">
{providers.map((provider) => (
  <div className="flex justify-center" key={provider._id}>
    <ProviderCard
      provider={provider}
      serviceName={serviceName}
      isWishlisted={userData?.wishlist?.includes(provider._id)}
      onProfileClick={() => navigate(`/provider/${provider._id}`)}
      onBook={() => setSelectedProvider(provider)}
    />
  </div>
))}

          </div>
        </div>
      )}

      {/* Booking Form */}
      {selectedProvider && (
        <BookingForm
          provider={selectedProvider}
          serviceName={serviceName}
          onClose={() => setSelectedProvider(null)}
          onSubmit={async ({ date, time }) => {
            const bookingData = {
              provider: selectedProvider._id,
              serviceName,
              date,
              timeSlot: time,
              notes: "",
            };
            try {
              const res = await axios.post(
                "http://localhost:5000/api/bookings",
                bookingData,
                {
                  withCredentials: true,
                }
              );
              return res.data;
            } catch (err) {
              return {
                success: false,
                message: err.response?.data?.message || err.message,
              };
            }
          }}
        />
      )}
    </div>
  );
}
