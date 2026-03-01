import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import toast from "react-hot-toast";
import { HiHeart, HiUser, HiMail, HiPhone, HiLockClosed, HiLocationMarker, HiArrowRight, HiRefresh } from "react-icons/hi";

const roles = [
  {
    value: "user",
    label: "I Need Help",
    sub:   "Request healthcare services",
    color: "border-primary-400 bg-primary-50 text-primary-700",
    ring:  "ring-primary-400",
  },
  {
    value: "volunteer",
    label: "I Want to Help",
    sub:   "Volunteer & earn trust score",
    color: "border-emerald-400 bg-emerald-50 text-emerald-700",
    ring:  "ring-emerald-400",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "user", address: "", latitude: "", longitude: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm({ ...form, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() });
          toast.success("Location captured!");
        },
        () => toast.error("Location access denied.")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      return toast.error("Please fill all required fields.");
    }
    setLoading(true);
    try {
      const res = await register(form);
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-hero-gradient rounded-2xl shadow-glow mb-4">
            <HiHeart className="text-white text-xl" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Join the healthcare volunteer network today</p>
        </div>

        <div className="card p-6 sm:p-8">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">I want to...</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    form.role === r.value
                      ? `${r.color} ring-2 ${r.ring} ring-offset-1`
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={`text-sm font-bold ${form.role === r.value ? "" : "text-slate-700"}`}>{r.label}</span>
                  <span className={`text-xs mt-0.5 ${form.role === r.value ? "opacity-80" : "text-slate-400"}`}>{r.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="input pl-10" />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
                <div className="relative">
                  <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="9876543210" className="input pl-10" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input pl-10" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Your area / street address" className="input" />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location <span className="text-slate-400 font-normal">(for volunteer matching)</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input name="latitude" value={form.latitude} readOnly placeholder="Latitude" className="input pl-9 text-sm bg-slate-100 cursor-default" />
                </div>
                <div className="relative flex-1">
                  <input name="longitude" value={form.longitude} readOnly placeholder="Longitude" className="input text-sm bg-slate-100 cursor-default" />
                </div>
                <button type="button" onClick={getLocation} className="flex-shrink-0 px-3 py-2.5 bg-primary-50 border border-primary-200 text-primary-700 rounded-xl hover:bg-primary-100 text-sm font-semibold transition whitespace-nowrap">
                  <HiLocationMarker className="inline mr-1" /> GPS
                </button>
              </div>
            </div>

            {form.role === "volunteer" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                Volunteer accounts require admin verification before accessing the platform.
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-xl btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center gap-2"><HiRefresh className="animate-spin" /> Creating account...</span>
              ) : (
                <span className="flex items-center gap-2">Create Account <HiArrowRight /></span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
