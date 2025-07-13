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

  // Find the service using the flattened array:
  const allServices = SERVICES.flatMap((categoryArray) =>
    categoryArray.flatMap((subcatObj) =>
      subcatObj.services.map((service) => ({
        ...service,
        category: subcatObj.category,
        subcategory: subcatObj.subcategory,
      }))
    )
  );

  const service = allServices.find((s) => s.name === serviceName);

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

      <div className="w-full mx-auto bg-[var(--white)] rounded-2xl shadow-lg p-6 mb-10 flex flex-col md:flex-row items-stretch justify-between md:h-72">
        {/* Left: Text Section */}
        <div className="w-full md:w-3/5 md:pr-6 flex flex-col mb-4 md:mb-0">
          <h2 className="text-3xl font-bold mb-2 text-[var(--primary)]">
            {service?.name}
          </h2>
          <p className="text-[var(--gray)] text-md">
            {service?.description || "Service details coming soon."}
          </p>
        </div>

        {/* Right: Full Height Image */}
        <div className="w-full md:w-2/5 h-64 md:h-full">
          <a
            href={service?.image}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
          >
            <img
              src={service?.image}
              alt={service?.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </a>
        </div>
      </div>

      {/* Available providers list */}
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--primary)] text-center">
        Available Providers
      </h3>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="text-center mt-10">
          <img
            src="/icons/no-provider.webp"
            alt="No results"
            className="w-52 mx-auto mb-4"
          />
          <h3 className="text-2xl text-[var(--primary)] font-semibold">
            Oops! No provider available
          </h3>
          <p className="text-xl text-[var(--gray)] mt-3">No provider found for this service</p>
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
