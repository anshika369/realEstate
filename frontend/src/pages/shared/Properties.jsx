import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  HiSearch,
  HiFilter,
  HiAdjustments,
  HiViewGrid,
  HiViewList,
  HiOutlineChevronDown,
  HiX,
} from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";
import Navbar from "../../components/common/Navbar";
import { propertiesStyles as s } from "../../assets/dummyStyles";

const Properties = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // ✅ FIX: added minPrice
  const [filters, setFilters] = useState({
    city: "",
    propertyType: [],
    bhk: "",
    minPrice: 100000,         // 🔥 ADDED
    maxPrice: 100000000,
    amenities: [],
    furnishing: [],
    sort: "latest",
  });

  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (currentFilters.city)
        params.append("city", currentFilters.city);

      if (currentFilters.propertyType.length > 0)
        params.append("propertyType", currentFilters.propertyType.join(","));

      if (currentFilters.bhk)
        params.append("bhk", currentFilters.bhk);

      // ✅ FIX: send BOTH minPrice & maxPrice
      if (currentFilters.minPrice)
        params.append("minPrice", currentFilters.minPrice);

      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);

      if (currentFilters.furnishing && currentFilters.furnishing.length > 0)
        params.append("furnishing", currentFilters.furnishing.join(","));

      if (currentFilters.sort)
        params.append("sort", currentFilters.sort);

      const res = await axios.get(
        `${API_URL}/api/property?${params.toString()}`
      );

      setProperties(res.data.properties);
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimer = useRef(null);

  const debouncedFetch = (updatedFilters) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchProperties(updatedFilters);
    }, 500);
  };

  // ✅ FIX: price slider now updates min + max properly
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);

    const updatedFilters = {
      ...filters,
      minPrice: 100000,
      maxPrice: value,
    };

    setFilters(updatedFilters);
    debouncedFetch(updatedFilters);
  };

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <div className={s.container}>

        {/* PRICE SLIDER (FIXED WORKING RANGE) */}
        <div className={s.filterSection}>
          <label className={s.filterLabel}>Price Range</label>

          <input
            type="range"
            min="100000"
            max="100000000"
            step="500000"
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className={s.priceSlider}
          />

          <div>
            Min: ₹1L - Max: ₹{filters.maxPrice}
          </div>
        </div>

        {/* PROPERTY LIST */}
        {loading ? (
          <p>Loading...</p>
        ) : properties.length === 0 ? (
          <p>No properties found</p>
        ) : (
          <div>
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;