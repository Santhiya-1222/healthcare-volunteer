import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../../services/requestService";
import { reverseGeocode } from "../../utils/geocode";
import toast from "react-hot-toast";
import { HiLocationMarker, HiArrowLeft, HiCheck } from "react-icons/hi";

const serviceTypes = [
  { value: "medicine",   label: "Medicine Delivery",   icon: "💊", desc: "Prescription & OTC medicines" },
  { value: "hospital",   label: "Hospital Assistance",  icon: "🏥", desc: "Transport & in-hospital support" },
  { value: "grocery",    label: "Grocery Support",      icon: "🛒", desc: "Essential grocery shopping" },
  { value: "emergency",  label: "Emergency Care",       icon: "🚨", desc: "Urgent medical assistance" },
  { value: "daily_care", label: "Daily Care",           icon: "🏠", desc: "Daily living assistance" },
];

const priorities = [
  { v: "normal",    label: "Normal",    desc: "Standard timeline",     activeCls: "border-emerald-400 bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  { v: "urgent",    label: "Urgent",    desc: "Needed within hours",   activeCls: "border-amber-400 bg-amber-50 text-amber-700",       dot: "bg-amber-400" },
  { v: "emergency", label: "Emergency", desc: "Immediate help needed", activeCls: "border-red-400 bg-red-50 text-red-700",             dot: "bg-red-400" },
];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    serviceType: "medicine", priority: "normal",
    description: "", address: "", latitude: "", longitude: "",
  });
  const [loading,    setLoading]    = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setForm((prev) => ({ ...prev, latitude: lat.toString(), longitude: lon.toString() }));
        try {
          const addr = await reverseGeocode(lat, lon);
          setForm((prev) => ({ ...prev, address: addr }));
          toast.success("Location & address captured!");
        } catch {
          toast.success("Location captured! (Address lookup failed)");
        } finally {
          setGpsLoading(false);
        }
      },
      () => { setGpsLoading(false); toast.error("Location access denied."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error("Please describe your request.");
    setLoading(true);
    try {
      await createRequest(form);
      toast.success("Request created successfully!");
      navigate("/user/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <HiArrowLeft className="text-xs" /> Back
        </button>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">New Service Request</h1>
        <p className="text-sm text-slate-500 mt-1">
          Describe what you need — a verified volunteer will be matched to help you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Service Type */}
        <div className="card p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">
            Service Type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {serviceTypes.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm({ ...form, serviceType: s.value })}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  form.serviceType === s.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {form.serviceType === s.value && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                    <HiCheck className="text-white text-xs" />
                  </div>
                )}
                <span className="text-2xl block mb-2">{s.icon}</span>
                <span className="text-xs font-semibold text-slate-800 block leading-tight">{s.label}</span>
                <span className="text-xs text-slate-400 mt-0.5 block leading-tight">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="card p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">Priority Level</label>
          <div className="grid grid-cols-3 gap-3">
            {priorities.map((p) => (
              <button
                key={p.v}
                type="button"
                onClick={() => setForm({ ...form, priority: p.v })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.priority === p.v
                    ? `${p.activeCls} border-2`
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2.5 ${
                  form.priority === p.v ? p.dot : "bg-slate-300"
                }`} />
                <span className="text-sm font-semibold block">{p.label}</span>
                <span className="text-xs opacity-60 block mt-0.5">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description, Address, Location */}
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what you need help with in detail…"
              className="input resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{form.description.length} characters</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Your address for this request"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">GPS Location</label>
            <button
              type="button"
              onClick={getLocation}
              disabled={gpsLoading}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium disabled:opacity-60 ${
                form.latitude
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-500"
              }`}
            >
              {gpsLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Locating…
                </>
              ) : (
                <>
                  <HiLocationMarker className={`text-lg ${form.latitude ? "text-emerald-500" : "text-primary-400"}`} />
                  {form.latitude
                    ? `📍 ${form.address || `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}`}`
                    : "Click to capture your current location"}
                </>
              )}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-xl btn-primary w-full">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default CreateRequest;
