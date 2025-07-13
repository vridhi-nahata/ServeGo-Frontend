import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES } from "../constants/services";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
// import { assets } from "../assets/assets";

import {
  FaSearch,
  FaFilter,
  FaListUl,
  FaCouch,
  FaTools,
  FaPaintRoller,
  FaLeaf,
  FaMicrochip,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import {
  MdOutlineCleaningServices,
  MdOutlinePestControl,
} from "react-icons/md";

export default function Services() {
  const navigate = useNavigate();

  // Price extract
  const extractPrice = (priceStr) => {
    const match = priceStr?.match(/\d+/g);
    return match ? parseInt(match[0]) : 0;
  };

  // Flatten and prepare all services
  const flattenedSubcategories = SERVICES.flat();
  let allServices = flattenedSubcategories.flatMap((sub) =>
    sub.services.map((service) => ({
      ...service,
      category: sub.category,
      subcategory: sub.subcategory,
    }))
  );

  // Extract all prices and find max
  const allPrices = allServices.map((s) => extractPrice(s.price));
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 5000;

  useEffect(() => {
    if (priceRange[1] === 0 && maxPrice > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  // States
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showSubcategoryList, setShowSubcategoryList] = useState(false);
  const [categorySort, setCategorySort] = useState("");
  const [subcategorySort, setSubcategorySort] = useState("");
  const [serviceSort, setServiceSort] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 0]); // [min, max]

  // Refs for outside click detection
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Subcategory Icons
  const subcategoryIcons = {
    "Carpentry & Woodwork": <FaCouch className="text-[var(--secondary)]" />,
    "Air Conditioning & Cooling": (
      <FaTools className="text-[var(--secondary)]" />
    ),
    "Painting & Decor": <FaPaintRoller className="text-[var(--secondary)]" />,
    "Gardening & Outdoors": <FaLeaf className="text-[var(--secondary)]" />,
    "Home Automation & Smart Devices": (
      <FaMicrochip className="text-[var(--secondary)]" />
    ),
    "Residential Cleaning": (
      <MdOutlineCleaningServices className="text-[var(--secondary)]" />
    ),
    "Commercial Cleaning": (
      <MdOutlineCleaningServices className="text-[var(--secondary)]" />
    ),
    "Pest Control & Safety": (
      <MdOutlinePestControl className="text-[var(--secondary)]" />
    ),
    Sanitization: <FaLeaf className="text-[var(--secondary)]" />,
  };

  const toggleCategory = (category) =>
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));

  const toggleSubcategory = (category, subcategory) => {
    const key = `${category}__${subcategory}`;
    setExpandedSubcategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Search logic
  if (search.trim()) {
    allServices = allServices.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.subcategory.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filter logic
  if (selectedCategories.length > 0) {
    allServices = allServices.filter((s) =>
      selectedCategories.includes(s.category)
    );
  }

  if (selectedCategories.length > 0) {
    if (selectedSubcategories.length > 0) {
      allServices = allServices.filter(
        (s) =>
          selectedCategories.includes(s.category) &&
          selectedSubcategories.includes(s.subcategory)
      );
    } else {
      // If no subcategory selected, show all subcategories of selected categories
      allServices = allServices.filter((s) =>
        selectedCategories.includes(s.category)
      );
    }
  }

  allServices = allServices.filter((s) => {
    const price = extractPrice(s.price);
    return price >= priceRange[0] && price <= priceRange[1];
  });

  // create groupedServices
  const groupedServices = {};
  allServices.forEach((s) => {
    if (!groupedServices[s.category]) groupedServices[s.category] = {};
    if (!groupedServices[s.category][s.subcategory])
      groupedServices[s.category][s.subcategory] = [];
    groupedServices[s.category][s.subcategory].push(s);
  });

  // Sorting

  // Sort categories
  let sortedCategoryKeys = Object.keys(groupedServices);
  if (categorySort) {
    sortedCategoryKeys.sort((a, b) =>
      categorySort === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
  }

  // Sort subcategories inside each category
  const sortedGroupedServices = {};
  sortedCategoryKeys.forEach((category) => {
    let subcategories = Object.keys(groupedServices[category]);

    if (subcategorySort) {
      subcategories.sort((a, b) =>
        subcategorySort === "asc" ? a.localeCompare(b) : b.localeCompare(a)
      );
    }

    sortedGroupedServices[category] = {};

    subcategories.forEach((subcat) => {
      let services = [...groupedServices[category][subcat]];

      // Sort services inside subcategory
      if (serviceSort) {
        services.sort((a, b) =>
          serviceSort === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
      }

      // Apply price sort only when serviceSort is not set
      if (!serviceSort && priceSort) {
        services.sort((a, b) =>
          priceSort === "asc"
            ? extractPrice(a.price) - extractPrice(b.price)
            : extractPrice(b.price) - extractPrice(a.price)
        );
      }

      sortedGroupedServices[category][subcat] = services;
    });
  });

  const categories = [
    ...new Set(flattenedSubcategories.map((s) => s.category)),
  ];

  useEffect(() => {
    const cat = {};
    const sub = {};
    Object.entries(groupedServices).forEach(([c, subs]) => {
      cat[c] = true;
      Object.keys(subs).forEach((s) => {
        sub[`${c}__${s}`] = true;
      });
    });
    setExpandedCategories(cat);
    setExpandedSubcategories(sub);
  }, [JSON.stringify(groupedServices)]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-2 mb-6">
        <h2 className="py-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--primary)]">
          Service Catalog
        </h2>

        <div className="flex gap-2 items-center justify-center">
          {/* Search */}
          <div className="relative w-3/4 xs:w-28 sm:w-32 md:w-44 lg:w-52">
            <FaSearch className="absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-2 py-1.5 rounded-full border border-gray-300 shadow text-sm w-full outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 shadow text-sm bg-white hover:bg-gray-50"
            >
              <FaFilter />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {showFilter && (
              <div
                ref={filterRef}
                className="absolute z-50 right-0 mt-2 w-[300px] bg-white border shadow-xl rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Filter</h3>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* === Collapsible Category Filter === */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowCategoryList(!showCategoryList)}
                      className="w-full flex justify-between items-center text-sm font-semibold text-[var(--primary)] mb-1"
                    >
                      <span>Categories</span>
                      <FaChevronDown
                        className={`transition-transform ${
                          showCategoryList ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showCategoryList && (
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 border rounded bg-gray-50 p-2">
                        {/* All Categories Checkbox */}
                        <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--primary-light)] cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={
                              selectedCategories.length === categories.length
                            }
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedCategories(
                                isChecked ? [...categories] : []
                              );
                            }}
                            className="accent-[var(--primary)]"
                          />
                          <span className="text-sm">All Categories</span>
                        </label>

                        {categories.map((cat) => (
                          <label
                            key={cat}
                            className="flex items-center gap-2 px-2 py-1 rounded bg:transparent hover:bg-[var(--primary-light)] cursor-pointer w-full"
                          >
                            <input
                              type="checkbox"
                              value={cat}
                              checked={selectedCategories.includes(cat)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedCategories((prev) =>
                                  isChecked
                                    ? [...prev, cat]
                                    : prev.filter((c) => c !== cat)
                                );
                              }}
                              className="accent-[var(--primary)]"
                            />
                            <span className="text-sm">{cat}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* === Collapsible Subcategory Filter (only if categories selected) === */}
                  <div className="mb-4">
                    <button
                      disabled={selectedCategories.length === 0}
                      onClick={() =>
                        setShowSubcategoryList(!showSubcategoryList)
                      }
                      className={`w-full flex justify-between items-center text-sm font-semibold ${
                        selectedCategories.length === 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-[var(--primary)]"
                      } mb-1`}
                    >
                      <span>Subcategories</span>
                      <FaChevronDown
                        className={`transition-transform ${
                          showSubcategoryList ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showSubcategoryList && selectedCategories.length > 0 && (
                      <div className="space-y-2 mt-2 max-h-36 overflow-y-auto pr-1">
                        {selectedCategories.map((cat) => {
                          const subs = flattenedSubcategories
                            .filter((s) => s.category === cat)
                            .map((s) => s.subcategory);
                          const uniqueSubs = [...new Set(subs)];
                          return (
                            <div
                              key={cat}
                              className="bg-gray-50 border rounded p-2"
                            >
                              <p className="text-sm font-medium text-[var(--secondary)] mb-2">
                                {cat}
                              </p>

                              {/* === All Subcategories checkbox === */}
                              <label className="flex items-center gap-2 px-2 py-1 mb-2 bg-transparent rounded hover:bg-[var(--primary-light)] w-full cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={uniqueSubs.every((sub) =>
                                    selectedSubcategories.includes(sub)
                                  )}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setSelectedSubcategories((prev) => {
                                      const withoutCurrent = prev.filter(
                                        (s) => !uniqueSubs.includes(s)
                                      );
                                      return isChecked
                                        ? [...withoutCurrent, ...uniqueSubs]
                                        : withoutCurrent;
                                    });
                                  }}
                                  className="accent-[var(--primary)]"
                                />
                                <span className="text-sm">
                                  All Subcategories
                                </span>
                              </label>

                              <div className="flex flex-wrap gap-2">
                                {uniqueSubs.map((sub) => (
                                  <label
                                    key={sub}
                                    className="flex items-center gap-2 px-2 py-1 bg-transparent rounded hover:bg-[var(--primary-light)] w-full cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      value={sub}
                                      checked={selectedSubcategories.includes(
                                        sub
                                      )}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSelectedSubcategories((prev) =>
                                          isChecked
                                            ? [...prev, sub]
                                            : prev.filter((s) => s !== sub)
                                        );
                                      }}
                                      className="accent-[var(--primary)]"
                                    />
                                    <span className="text-sm">{sub}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price range */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price Range (₹)
                    </label>
                    <Slider
                      range
                      min={0}
                      max={maxPrice}
                      defaultValue={priceRange}
                      value={priceRange}
                      onChange={(range) => setPriceRange(range)}
                      trackStyle={[
                        { backgroundColor: "var(--secondary)", height: 6 },
                      ]}
                      handleStyle={[
                        {
                          borderColor: "var(--secondary)",
                          backgroundColor: "#fff",
                          height: 14,
                          width: 14,
                        },
                        {
                          borderColor: "var(--secondary)",
                          backgroundColor: "#fff",
                          height: 14,
                          width: 14,
                        },
                      ]}
                      railStyle={{ backgroundColor: "#d1d5db" }}
                    />

                    <div className="flex items-center justify-between mt-2 text-sm">
                      <div className="flex flex-row gap-1">
                        <label className="text-sm text-gray-600">Min ₹</label>
                        <input
                          type="number"
                          min={0}
                          max={priceRange[1]}
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newMin = Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            );
                            if (newMin <= priceRange[1]) {
                              setPriceRange([newMin, priceRange[1]]);
                            }
                          }}
                          className="border px-2 py-0.5 rounded text-xs w-20 focus:outline-none focus:ring-1 focus:ring-[var(--secondary)]"
                        />
                      </div>

                      <div className="flex flex-row gap-1">
                        <label className="text-sm text-gray-600">Max ₹</label>
                        <input
                          type="number"
                          min={priceRange[0]}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newMax = Math.min(
                              maxPrice,
                              parseInt(e.target.value) || 0
                            );
                            if (newMax >= priceRange[0]) {
                              setPriceRange([priceRange[0], newMax]);
                            }
                          }}
                          className="border px-1 py-0.5 rounded text-xs w-20 focus:outline-none focus:ring-1 focus:ring-[var(--secondary)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedSubcategories([]);

                        setPriceRange([0, maxPrice]);
                      }}
                      className="text-sm text-[var(--gray)] hover:underline hover:scale-105 transition-transform duration-100 ease-linear"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 shadow text-sm bg-white hover:bg-gray-50"
            >
              <img src="/icons/sort.png" alt="Filter" className="w-5 h-4" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            {showSort && (
              <div
                ref={sortRef}
                className="absolute z-50 right-0 mt-2 w-[260px] bg-white border shadow-xl rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Sort</h3>
                  <button
                    onClick={() => setShowSort(false)}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  {/* Category sort */}
                  <div className="relative w-full">
                    <select
                      value={categorySort}
                      onChange={(e) => setCategorySort(e.target.value)}
                      className="w-full border px-3 py-2 pr-10 rounded text-[var(--primary)] appearance-none"
                    >
                      <option value="" disabled hidden>
                        Sort by Category
                      </option>

                      <option value="">Default</option>
                      <option value="asc">A → Z</option>
                      <option value="desc">Z → A</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--primary)] pointer-events-none" />
                  </div>

                  {/* Subcategory sort */}
                  <div className="relative w-full">
                    <select
                      value={subcategorySort}
                      onChange={(e) => setSubcategorySort(e.target.value)}
                      className="w-full border px-3 py-2 rounded text-[var(--primary)] appearance-none"
                    >
                      <option value="" disabled hidden>
                        Sort by Subcategory
                      </option>

                      <option value="">Default</option>
                      <option value="asc">A → Z</option>
                      <option value="desc">Z → A</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--primary)] pointer-events-none" />
                  </div>

                  {/* Service sort */}
                  <div className="relative w-full">
                    <select
                      value={serviceSort}
                      title={
                        priceSort
                          ? "You can sort by either Service name or Price at a time"
                          : ""
                      }
                      onChange={(e) => setServiceSort(e.target.value)}
                      disabled={!!priceSort}
                      className={`w-full border px-3 py-2 rounded text-[var(--primary)] appearance-none ${
                        priceSort
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="" disabled hidden>
                        Sort by Service
                      </option>

                      <option value="">Default</option>
                      <option value="asc">A → Z</option>
                      <option value="desc">Z → A</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--primary)] pointer-events-none" />
                  </div>

                  {/* Price sort */}
                  <div className="relative w-full">
                    <select
                      value={priceSort}
                      title={
                        serviceSort
                          ? "You can sort by either Service name or Price at a time"
                          : ""
                      }
                      onChange={(e) => setPriceSort(e.target.value)}
                      disabled={!!serviceSort}
                      className={`w-full border px-3 py-2 rounded text-[var(--primary)] appearance-none ${
                        serviceSort
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="" disabled hidden>
                        Sort by Price
                      </option>

                      <option value="">Default</option>
                      <option value="asc">Low → High</option>
                      <option value="desc">High → Low</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--primary)] pointer-events-none" />
                  </div>
                  {/* <option value="rating">Sort by Rating</option>
<option value="popularity">Sort by Popularity</option> */}
                </div>

                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => {
                      setCategorySort("");
                      setSubcategorySort("");
                      setServiceSort("");
                      setPriceSort("");
                    }}
                    className="text-sm text-[var(--gray)] hover:underline hover:scale-105 transition-transform duration-100 ease-linear"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* No Results */}
      {Object.keys(groupedServices).length === 0 && (
        <div className="text-center mt-10">
          <img
            src="/icons/not-found.webp"
            alt="No results"
            className="w-52 mx-auto mb-4"
          />
          <h3 className="text-2xl text-[var(--primary)] font-semibold">
            Oops! No results found
          </h3>
          <p className="text-xl text-[var(--gray)] mt-3">Try something else</p>
        </div>
      )}

      {/* Display Services */}
      <div className="max-w-7xl mx-auto space-y-6">
        {Object.entries(sortedGroupedServices).map(([category, subcats]) => {
          const isCategoryOpen = expandedCategories[category];
          return (
            <div
              key={category}
              className="bg-white border shadow rounded-xl p-4 space-y-4"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left text-2xl font-bold text-[var(--primary)] flex items-center justify-between"
              >
                {category}
                <FaChevronDown
                  className={`transition-transform ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoryOpen &&
                Object.entries(subcats).map(([subcategory, services]) => {
                  const subKey = `${category}__${subcategory}`;
                  const isSubOpen = expandedSubcategories[subKey];

                  return (
                    <div
                      key={subcategory}
                      className="border rounded p-4 bg-white shadow-sm"
                    >
                      <button
                        onClick={() => toggleSubcategory(category, subcategory)}
                        className="flex justify-between items-center w-full text-[var(--secondary)] font-semibold text-lg mb-2"
                      >
                        <span className="flex items-center gap-2">
                          {subcategoryIcons[subcategory] || <FaListUl />}
                          {subcategory}
                        </span>
                        <FaChevronDown
                          className={`transition-transform ${
                            isSubOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isSubOpen && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {services.map((service) => (
                            <div
                              key={service.name}
                              className="cursor-pointer group border rounded bg-gray-50 hover:bg-white hover:shadow p-2 text-center transition"
                              onClick={() =>
                                navigate(
                                  `/services/${encodeURIComponent(
                                    service.name
                                  )}`
                                )
                              }
                            >
                              <div className="relative w-full h-24">
                                <img
                                  src={service.image}
                                  alt={service.name}
                                  className="object-contain w-full h-full"
                                />
                                <span className="absolute bottom-1 right-1 bg-[var(--secondary)] text-white text-xs px-2 py-0.5 rounded">
                                  {service.price}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium text-[var(--ternary)]">
                                {service.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
