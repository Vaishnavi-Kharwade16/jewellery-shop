import { useEffect, useState } from "react";
import axios from "axios";
import ProductList from "../components/ProductList";

function Products() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [metalType, setMetalType] = useState("");
  const [karat, setKarat] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/products",
        {
          params: filters,
        }
      );

      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Unable to load jewellery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApplyFilters = () => {
    const filters = {};

    if (search.trim()) filters.search = search.trim();
    if (category) filters.category = category;
    if (metalType) filters.metalType = metalType;
    if (karat) filters.karat = karat;

    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    if (minWeight) filters.minWeight = minWeight;
    if (maxWeight) filters.maxWeight = maxWeight;

    setAppliedFilters(filters);
    fetchProducts(filters);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setMetalType("");
    setKarat("");
    setMinPrice("");
    setMaxPrice("");
    setMinWeight("");
    setMaxWeight("");

    setAppliedFilters({});
    fetchProducts();
  };

  return (
    <section className="min-h-screen bg-[#fdfbf7] px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b08d57]">
            Curated Collection
          </p>

          <h1 className="mt-3 font-serif text-4xl text-stone-900 md:text-5xl">
            Discover Your Jewellery
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-500">
            Explore our collection of timeless pieces crafted to complement
            every occasion and personal style.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-12 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">
              Refine Collection
            </p>

            <h2 className="mt-2 font-serif text-2xl text-stone-900">
              Find your perfect piece
            </h2>
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jewellery..."
              className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none transition focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57]"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="mt-5 grid gap-4 md:grid-cols-3">

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none transition focus:border-[#b08d57]"
              >
                <option value="">All Categories</option>
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
                <option value="Bangles">Bangles</option>
                <option value="Pendants">Pendants</option>
              </select>
            </div>

            {/* Metal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Metal
              </label>

              <select
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none transition focus:border-[#b08d57]"
              >
                <option value="">All Metals</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Rose Gold">Rose Gold</option>
              </select>
            </div>

            {/* Karat */}
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Karat
              </label>

              <select
                value={karat}
                onChange={(e) => setKarat(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none transition focus:border-[#b08d57]"
              >
                <option value="">All Karats</option>
                <option value="14">14K</option>
                <option value="18">18K</option>
                <option value="22">22K</option>
                <option value="24">24K</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Price Range
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Minimum price"
                min="0"
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
              />

              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Maximum price"
                min="0"
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Weight Range (grams)
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                placeholder="Minimum weight"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
              />

              <input
                type="number"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                placeholder="Maximum weight"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-4 py-3 text-sm outline-none focus:border-[#b08d57]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex-1 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-[#b08d57]"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="flex-1 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-[#b08d57] hover:text-[#b08d57]"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Result information */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">
              {loading
                ? "Finding jewellery..."
                : `${products.length} piece${
                    products.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          {Object.keys(appliedFilters).length > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-[#b08d57] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-stone-200 bg-white"
              >
                <div className="h-80 bg-[#f4eee3]" />

                <div className="space-y-4 p-6">
                  <div className="h-3 w-24 rounded bg-stone-200" />
                  <div className="h-6 w-40 rounded bg-stone-200" />
                  <div className="h-4 w-full rounded bg-stone-200" />
                  <div className="h-4 w-3/4 rounded bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => fetchProducts(appliedFilters)}
              className="mt-4 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-[#b08d57]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products */}
        {!loading && !error && (
          <div className="mt-6">
            <ProductList products={products} />
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;