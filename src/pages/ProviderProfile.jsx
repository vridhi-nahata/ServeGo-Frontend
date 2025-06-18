import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/user/provider-profile?id=${providerId}`, { withCredentials: true })
      .then((res) => {
        setProvider(res.data.provider);
        setLoading(false);
      });
  }, [providerId]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!provider) return <div className="text-center py-20 text-gray-500">Provider not found.</div>;

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)] flex flex-col items-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--primary-light)] to-[var(--accent)] flex items-center justify-center text-5xl font-bold text-white shadow-lg mb-6 border-4 border-[var(--primary)]">
          {provider.avatarUrl ? (
            <img src={provider.avatarUrl} alt={provider.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            provider.name?.[0]?.toUpperCase() || "P"
          )}
        </div>
        <h2 className="text-3xl font-bold text-[var(--primary)] mb-2">{provider.name}</h2>
        <p className="text-gray-500 mb-2">{provider.email}</p>
        <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full mb-4">
          {provider.isAccountVerified ? "Verified" : "Not Verified"}
        </span>
        <div className="flex flex-col gap-2 text-gray-700 text-base w-full">
          <span><b>Experience:</b> {provider.experienceYears || 0} years</span>
          <span><b>Availability:</b> {provider.availability || "N/A"}</span>
          <span><b>Services Offered:</b> {provider.servicesOffered?.join(", ")}</span>
          {/* Add more fields as needed */}
        </div>
      </div>
    </div>
  );
}