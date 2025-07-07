import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES } from "../constants/services";

export default function Services() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // Flatten the SERVICES
  const flattenedSubcategories = SERVICES.flat();
  let allServices = flattenedSubcategories.flatMap((sub) =>
    sub.services.map((service) => ({
      ...service,
      category: sub.category,
      subcategory: sub.subcategory,
    }))
  );

  // Apply search filter
  if (search.trim()) {
    allServices = allServices.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.subcategory.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply category/subcategory filters
  if (selectedCategory) {
    allServices = allServices.filter((s) => s.category === selectedCategory);
  }
  if (selectedSubcategory) {
    allServices = allServices.filter(
      (s) => s.subcategory === selectedSubcategory
    );
  }

  // Sort
  if (sort === "name") {
    allServices.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "category") {
    allServices.sort((a, b) => a.category.localeCompare(b.category));
  }

  // Unique categories
  const categories = [
    ...new Set(flattenedSubcategories.map((s) => s.category)),
  ];

  // Unique subcategories for the selected category
  const subcategories = selectedCategory
    ? [
        ...new Set(
          flattenedSubcategories
            .filter((s) => s.category === selectedCategory)
            .map((s) => s.subcategory)
        ),
      ]
    : [];

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      <h2
        className="text-4xl font-extrabold mb-10 text-center"
        style={{ color: "var(--primary)" }}
      >
        All Services
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-300 shadow text-sm w-60"
        />
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("");
          }}
          className="px-4 py-2 rounded-full border border-gray-300 shadow text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-300 shadow text-sm"
          disabled={!selectedCategory}
        >
          <option value="">All Subcategories</option>
          {subcategories.map((sub) => (
            <option key={`${selectedCategory}-${sub}`} value={sub}>
              {sub}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-300 shadow text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* Service Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto text-center">
        {allServices.map((service) => (
          <div
            key={`${service.category}-${service.subcategory}-${service.name}`}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group border-t-4 border-[var(--primary)]"
            onClick={() =>
              navigate(`/services/${encodeURIComponent(service.name)}`)
            }
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
              <p className="text-gray-600">{service.description}</p>
              <p className="text-gray-500 mt-1 text-sm">{service.price}</p>
              <div className="text-xs text-gray-500 mt-2">
                {service.category} / {service.subcategory}
              </div>
            </div>
          </div>
        ))}
      </div>

      {allServices.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No services found.
        </div>
      )}
    </div>
  );
}
