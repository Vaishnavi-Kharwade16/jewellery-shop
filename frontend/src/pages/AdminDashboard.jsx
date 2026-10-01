import { useEffect, useState } from "react";

import {
  getAdminOrderStats,
} from "../services/adminDashboardService";

import {
  getAdminProducts,
} from "../services/adminProductService";

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN"
  )}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderStats, productData] =
        await Promise.all([
          getAdminOrderStats(),
          getAdminProducts(),
        ]);

      setStats(orderStats);
      setProducts(productData.products || []);
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(
    (product) => product.isActive
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.isActive &&
      Number(product.stock) <= 5
  );

  const getStatusCount = (status) => {
    if (!stats?.orderStatus) {
      return 0;
    }

    const item = stats.orderStatus.find(
      (entry) => entry._id === status
    );

    return item?.count || 0;
  };

  const getPaymentStatusCount = (status) => {
    if (!stats?.paymentStatus) {
      return 0;
    }

    const item = stats.paymentStatus.find(
      (entry) => entry._id === status
    );

    return item?.count || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-stone-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-700">
              Administration
            </p>

            <h1 className="mt-2 font-serif text-4xl text-stone-900">
              Dashboard
            </h1>

            <p className="mt-2 text-stone-500">
              Overview of your jewellery store.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-500"
          >
            Refresh
          </button>
        </div>

        {/* Main Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Products */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">
              Total Products
            </p>

            <p className="mt-3 text-3xl font-semibold text-stone-900">
              {products.length}
            </p>

            <p className="mt-2 text-sm text-emerald-700">
              {activeProducts.length} active
            </p>
          </div>

          {/* Orders */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">
              Total Orders
            </p>

            <p className="mt-3 text-3xl font-semibold text-stone-900">
              {stats?.totalOrders || 0}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              All orders
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">
              Revenue
            </p>

            <p className="mt-3 text-3xl font-semibold text-stone-900">
              {formatCurrency(
                stats?.totalRevenue
              )}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Non-cancelled orders
            </p>
          </div>

          {/* Low Stock */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">
              Low Stock
            </p>

            <p className="mt-3 text-3xl font-semibold text-stone-900">
              {lowStockProducts.length}
            </p>

            <p className="mt-2 text-sm text-amber-700">
              5 or fewer units
            </p>
          </div>
        </div>

        {/* Order Status */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-stone-900">
              Order Status
            </h2>

            <div className="mt-6 space-y-4">

              {[
                "placed",
                "packed",
                "shipped",
                "delivered",
                "cancelled",
              ].map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b border-stone-100 pb-3"
                >
                  <span className="capitalize text-stone-600">
                    {status}
                  </span>

                  <span className="font-semibold text-stone-900">
                    {getStatusCount(status)}
                  </span>
                </div>
              ))}

            </div>
          </div>

          {/* Payment Status */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-stone-900">
              Payment Status
            </h2>

            <div className="mt-6 space-y-4">

              {[
                "pending",
                "paid",
                "failed",
                "refunded",
              ].map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b border-stone-100 pb-3"
                >
                  <span className="capitalize text-stone-600">
                    {status}
                  </span>

                  <span className="font-semibold text-stone-900">
                    {getPaymentStatusCount(
                      status
                    )}
                  </span>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="border-b border-stone-200 px-6 py-5">
            <h2 className="font-serif text-2xl text-stone-900">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Latest customer orders.
            </p>
          </div>

          {stats?.recentOrders?.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-left text-sm text-stone-500">
                    <th className="px-6 py-4">
                      Order
                    </th>

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Payment
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stats?.recentOrders?.map(
                    (order) => (
                      <tr
                        key={order._id}
                        className="border-b border-stone-100 last:border-b-0"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-stone-900">
                            #
                            {order._id
                              .slice(-8)
                              .toUpperCase()}
                          </p>

                          <p className="mt-1 text-xs text-stone-400">
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-stone-800">
                            {order.user?.name ||
                              order.shippingAddress
                                ?.fullName ||
                              "Guest"}
                          </p>

                          <p className="text-sm text-stone-500">
                            {order.user?.email ||
                              ""}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-medium text-stone-900">
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-stone-700">
                            {order.paymentMethod}
                          </p>

                          <p className="text-xs capitalize text-stone-400">
                            {order.paymentStatus}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium capitalize text-stone-700">
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="border-b border-stone-200 px-6 py-5">
            <h2 className="font-serif text-2xl text-stone-900">
              Low Stock Products
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Products that may need restocking.
            </p>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              No low-stock products.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {lowStockProducts
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="font-medium text-stone-900">
                        {product.name}
                      </p>

                      <p className="text-sm text-stone-500">
                        {product.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                      {product.stock} left
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;