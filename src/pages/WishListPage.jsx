import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import ProviderCard from "../components/ProviderCard";
import { useNavigate } from "react-router-dom";

export default function WishlistPage() {
  const { backendUrl } = useContext(AppContext);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/user/wishlist`, { withCredentials: true })
      .then((res) => setProviders(res.data.providers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [backendUrl]);

  if (loading) return <p className="text-center mt-20">Loading favourites...</p>;

  if (!providers.length)
    return (
      <div className="text-center mt-20">
        <img
          src="/icons/empty-wishlist.png"
          alt="Empty"
          className="w-60 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-[var(--primary)]">
          No favourites yet
        </h2>
        <p className="text-[var(--gray)] mt-2">
          Add providers to your favourites and they'll appear here.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-8 text-center">
          My Favourites
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {providers.map((p) => (
            <ProviderCard
              key={p._id}
              provider={p}
              serviceName={p.servicesOffered?.[0]?.services?.[0] || "Service"}
              isWishlisted={true}
              showExperience={false}
              showRating={false}
              onProfileClick={() => navigate(`/provider/${p._id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}