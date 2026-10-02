import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      await register(name, email, password);

      // Registration successful → go to Home
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#fdfbf7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(80,60,30,0.10)] lg:grid-cols-2">

        {/* Left - Jewellery Visual */}
        <div className="relative hidden min-h-[700px] overflow-hidden bg-[#f4eee3] lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-[#eee2cf] via-[#f7f1e7] to-[#e8dcc8]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">

            {/* Heading */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#b08d57]">
                Begin Your Journey
              </p>

              <h1 className="mt-4 font-serif text-5xl leading-tight text-stone-900">
                Your Story,
                <br />
                Your Jewellery
              </h1>

              <p className="mt-6 max-w-sm text-sm leading-7 text-stone-600">
                Create your account and discover jewellery pieces designed
                to become part of your most memorable moments.
              </p>
            </div>

            {/* Decorative Circle */}
            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-72 w-72 items-center justify-center rounded-full border border-[#b08d57]/30">
                <div className="flex h-56 w-56 items-center justify-center rounded-full border border-[#b08d57]/20">
                  <div className="text-center">
                    <div className="font-serif text-7xl text-[#b08d57]">
                      ✦
                    </div>

                    <p className="mt-3 text-xs uppercase tracking-[0.3em] text-stone-500">
                      Crafted With Love
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div>
              <div className="h-px w-20 bg-[#b08d57]" />

              <p className="mt-5 font-serif text-xl italic text-stone-700">
                "Every piece tells a story."
              </p>
            </div>
          </div>
        </div>

        {/* Right - Register Form */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4eee3]">
                <span className="font-serif text-2xl text-[#b08d57]">
                  ✦
                </span>
              </div>

              <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-[#b08d57]">
                Create Account
              </p>

              <h2 className="mt-3 font-serif text-4xl text-stone-900">
                Join Us
              </h2>

              <p className="mt-3 text-sm text-stone-500">
                Create your account and start exploring.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-5 py-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Email Address
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-5 py-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-5 py-4 pr-16 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 transition hover:text-[#b08d57]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] px-5 py-4 pr-16 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 transition hover:text-[#b08d57]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-medium tracking-wide text-white shadow-lg transition-all duration-300 hover:bg-[#b08d57] hover:shadow-xl disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-stone-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#b08d57] transition hover:text-stone-900"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust */}
            <div className="mt-8 border-t border-stone-200 pt-6">
              <div className="flex items-center justify-center gap-6 text-xs text-stone-400">
                <span>Secure Registration</span>
                <span>•</span>
                <span>Private & Protected</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
