import { useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { useCart } from "../context/CartContext";

import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const { cart } = useCart();

  const { wishlist } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);

  const cartItems =
    cart?.items?.reduce(
      (total, item) => total + item.quantity,
      0
    ) || 0;

  const wishlistItems = wishlist?.length || 0;

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-[#b08d57]"
        : "text-stone-700 hover:text-[#b08d57]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block border-b border-stone-100 px-2 py-3 text-sm transition-colors ${
      isActive
        ? "text-[#b08d57]"
        : "text-stone-700 hover:text-[#b08d57]"
    }`;

  const closeMenu = () => {
    setMenuOpen(false);
  };

 const handleLogout = () => {
  logout();
  navigate("/");
};

  // Check whether the logged-in user is an admin
  const isAdmin =
    token && user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fdfbf7]/95 backdrop-blur">
      <nav className="mx-auto max-w-7xl px-6 py-4 lg:px-8">

        {/* Top Bar */}
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b08d57] text-lg text-[#b08d57] transition group-hover:bg-[#b08d57] group-hover:text-white">
              J
            </div>

            <div>
              <h1 className="font-serif text-xl tracking-[0.18em] text-stone-900">
                JEWELLERY
              </h1>

              <p className="text-[9px] tracking-[0.35em] text-[#b08d57]">
                COLLECTION
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <NavLink
              to="/"
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={navLinkClass}
            >
              Collections
            </NavLink>

            {/* Cart is visible to everyone */}
            <NavLink
              to="/cart"
              className={navLinkClass}
            >
              Cart

              {cartItems > 0 && (
                <span className="ml-1 rounded-full bg-[#b08d57] px-2 py-0.5 text-xs text-white">
                  {cartItems}
                </span>
              )}
            </NavLink>

            {/* Login-only links */}
            {token && (
              <>
                <NavLink
                  to="/wishlist"
                  className={navLinkClass}
                >
                  Wishlist

                  {wishlistItems > 0 && (
                    <span className="ml-1 rounded-full bg-[#b08d57] px-2 py-0.5 text-xs text-white">
                      {wishlistItems}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/checkout"
                  className={navLinkClass}
                >
                  Checkout
                </NavLink>

                <NavLink
                  to="/orders"
                  className={navLinkClass}
                >
                  My Orders
                </NavLink>

                {/* ADMIN LINK */}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-[#b08d57] bg-[#b08d57] text-white"
                          : "border-[#b08d57] text-[#8c6b3e] hover:bg-[#b08d57] hover:text-white"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-3 md:flex">

            {token ? (
              <>
                <span className="hidden text-sm text-stone-600 lg:block">
                  Hello{" "}
                  <span className="font-medium text-stone-900">
                    {user?.name || "Customer"}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-stone-900 px-5 py-2 text-sm font-medium text-stone-900 transition-all duration-200 hover:bg-stone-900 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-800 transition-all duration-200 hover:border-[#b08d57] hover:text-[#b08d57]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#b08d57] hover:shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-800 transition hover:border-[#b08d57] hover:text-[#b08d57] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <span className="text-xl">×</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mt-5 border-t border-stone-200 pt-4 md:hidden">

            {/* Main Links */}
            <div>

              <NavLink
                to="/"
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                Collections
              </NavLink>

              {/* Cart */}
              <NavLink
                to="/cart"
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                <div className="flex items-center justify-between">
                  <span>Cart</span>

                  {cartItems > 0 && (
                    <span className="rounded-full bg-[#b08d57] px-2 py-0.5 text-xs text-white">
                      {cartItems}
                    </span>
                  )}
                </div>
              </NavLink>

              {/* Login-only links */}
              {token && (
                <>
                  <NavLink
                    to="/wishlist"
                    onClick={closeMenu}
                    className={mobileLinkClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>Wishlist</span>

                      {wishlistItems > 0 && (
                        <span className="rounded-full bg-[#b08d57] px-2 py-0.5 text-xs text-white">
                          {wishlistItems}
                        </span>
                      )}
                    </div>
                  </NavLink>

                  <NavLink
                    to="/checkout"
                    onClick={closeMenu}
                    className={mobileLinkClass}
                  >
                    Checkout
                  </NavLink>

                  <NavLink
                    to="/orders"
                    onClick={closeMenu}
                    className={mobileLinkClass}
                  >
                    My Orders
                  </NavLink>

                  {/* MOBILE ADMIN */}
                  {isAdmin && (
                    <>
                      <NavLink
                        to="/admin"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `my-2 block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            isActive
                              ? "bg-[#b08d57] text-white"
                              : "bg-[#f4eee3] text-[#8c6b3e] hover:bg-[#b08d57] hover:text-white"
                          }`
                        }
                      >
                        Admin Dashboard
                      </NavLink>

                      <NavLink
                        to="/admin/products"
                        onClick={closeMenu}
                        className={mobileLinkClass}
                      >
                        Manage Products
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Account Section */}
            <div className="mt-5 border-t border-stone-200 pt-5">

              {token ? (
                <>
                  <div className="mb-4 rounded-2xl bg-[#f4eee3] px-4 py-3">

                    <p className="text-xs uppercase tracking-[0.2em] text-[#b08d57]">
                      Signed in as
                    </p>

                    <p className="mt-1 text-sm font-medium text-stone-900">
                      {user?.name || "Customer"}
                    </p>

                    {/* Admin badge */}
                    {isAdmin && (
                      <span className="mt-2 inline-block rounded-full bg-[#b08d57] px-3 py-1 text-xs font-semibold text-white">
                        ADMIN
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-full border border-stone-900 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">

                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm font-medium text-stone-800 transition hover:border-[#b08d57] hover:text-[#b08d57]"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-full bg-stone-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#b08d57]"
                  >
                    Register
                  </Link>

                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;