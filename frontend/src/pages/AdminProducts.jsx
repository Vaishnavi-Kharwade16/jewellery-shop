import { useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from "../services/adminProductService";

const initialForm = {
  name: "",
  description: "",
  category: "Rings",
  metalType: "Gold",
  karat: 18,
  weight: "",
  price: "",
  stock: "",
  images: "",
};

const categories = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Bangles",
  "Pendants",
];

const metalTypes = [
  "Gold",
  "Silver",
  "Platinum",
  "Rose Gold",
];

const karats = [14, 18, 22, 24];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProductId, setEditingProductId] =
    useState(null);

  const [form, setForm] = useState(initialForm);

  // Fetch admin products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminProducts();

      setProducts(data.products || []);
    } catch (err) {
      console.error(
        "Fetch admin products error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Open add form
  const handleAddProduct = () => {
    setEditingProductId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open edit form
  const handleEditProduct = (product) => {
    setEditingProductId(product._id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Rings",
      metalType: product.metalType || "Gold",
      karat: product.karat || 18,
      weight: product.weight ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      images:
        product.images?.join(", ") || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingProductId(null);
    setForm(initialForm);
  };

  // Submit product
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Product description is required.");
      return;
    }

    if (!form.weight || Number(form.weight) < 0) {
      setError("Please enter a valid weight.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      metalType: form.metalType,
      karat: Number(form.karat),
      weight: Number(form.weight),
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images
        ? form.images
            .split(",")
            .map((image) => image.trim())
            .filter(Boolean)
        : [],
    };

    try {
      setSaving(true);

      if (editingProductId) {
        await updateProduct(
          editingProductId,
          productData
        );

        setSuccess(
          "Product updated successfully."
        );
      } else {
        await createProduct(productData);

        setSuccess(
          "Product created successfully."
        );
      }

      setShowForm(false);
      setEditingProductId(null);
      setForm(initialForm);

      await fetchProducts();
    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  // Deactivate product
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteProduct(product._id);

      setSuccess(
        "Product deactivated successfully."
      );

      await fetchProducts();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to deactivate product"
      );
    }
  };

  // Filter products
  const filteredProducts = products.filter(
    (product) => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) return true;

      return (
        product.name
          ?.toLowerCase()
          .includes(searchValue) ||
        product.category
          ?.toLowerCase()
          .includes(searchValue) ||
        product.metalType
          ?.toLowerCase()
          .includes(searchValue)
      );
    }
  );

  return (
    <div className="min-h-screen bg-[#f8f4ed]">
      {/* Header */}
      <section className="border-b border-stone-200 bg-[#fdfbf7]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                Administration
              </p>

              <h1 className="font-serif text-4xl text-stone-900">
                Product Management
              </h1>

              <p className="mt-2 text-sm text-stone-600">
                Manage your jewellery catalog,
                inventory and product details.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              + Add Product
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="product-search"
            className="mb-2 block text-sm font-semibold text-stone-800"
          >
            Search Products
          </label>

          <input
            id="product-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, category or metal..."
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-semibold text-stone-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-semibold text-green-700">
              {
                products.filter(
                  (product) =>
                    product.isActive
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-semibold text-red-700">
              {
                products.filter(
                  (product) =>
                    !product.isActive
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-semibold text-amber-700">
              {
                products.filter(
                  (product) =>
                    product.isActive &&
                    product.stock <= 5
                ).length
              }
            </p>
          </div>
        </div>

        {/* Product table */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">
                  Products
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-stone-500">
              Loading products...
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-serif text-xl text-stone-800">
                No products found
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Try another search or add a new
                product.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-stone-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                    <th className="px-6 py-4 font-semibold">
                      Product
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Metal
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Price
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Stock
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={product._id}
                        className="transition hover:bg-stone-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex min-w-[250px] items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                              {product.images?.[0] ? (
                                <img
                                  src={
                                    product
                                      .images[0]
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-stone-400">
                                  No image
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-stone-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-stone-500">
                                {product.weight}g ·{" "}
                                {product.karat}K
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-stone-700">
                          {product.category}
                        </td>

                        <td className="px-6 py-5 text-sm text-stone-700">
                          {product.metalType}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-stone-900">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`text-sm font-semibold ${
                              product.stock <= 5
                                ? "text-red-600"
                                : "text-stone-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEditProduct(
                                  product
                                )
                              }
                              className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                            >
                              Edit
                            </button>

                            {product.isActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    product
                                  )
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8">
          <div className="mx-auto max-w-3xl rounded-3xl bg-[#fdfbf7] shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {editingProductId
                    ? "Edit"
                    : "Create"}
                </p>

                <h2 className="font-serif text-2xl text-stone-900">
                  {editingProductId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-full px-3 py-2 text-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Diamond Gold Ring"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the jewellery product..."
                  className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              {/* Category + Metal */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-stone-800"
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  >
                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="metalType"
                    className="mb-2 block text-sm font-semibold text-stone-800"
                  >
                    Metal Type
                  </label>

                  <select
                    id="metalType"
                    name="metalType"
                    value={form.metalType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  >
                    {metalTypes.map(
                      (metal) => (
                        <option
                          key={metal}
                          value={metal}
                        >
                          {metal}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Karat + Weight + Price + Stock */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label
                    htmlFor="karat"
                    className="mb-2 block text-sm font-semibold text-stone-800"
                  >
                    Karat
                  </label>

                  <select
                    id="karat"
                    name="karat"
                    value={form.karat}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  >
                    {karats.map((karat) => (
                      <option
                        key={karat}
                        value={karat}
                      >
                        {karat}K
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="mb-2 block text-sm font-semibold text-stone-800"
                  >
                    Weight (g)
                  </label>

                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="5.5"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-stone-800"
                  >
                    Price (₹)
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="25000"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-sm font-semibold text-stone-800"
                  >
                    Stock
                  </label>

                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label
                  htmlFor="images"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Image URLs
                </label>

                <input
                  id="images"
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  placeholder="https://example.com/ring.jpg, https://example.com/ring-2.jpg"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                />

                <p className="mt-2 text-xs text-stone-500">
                  Add multiple image URLs separated
                  by commas.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={saving}
                  className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProductId
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;