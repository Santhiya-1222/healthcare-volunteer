import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../../services/requestService";
import toast from "react-hot-toast";
import { HiLocationMarker } from "react-icons/hi";

const serviceTypes = [
  { value: "medicine", label: "Medicine Delivery", icon: "💊" },
  { value: "hospital", label: "Hospital Assistance", icon: "🏥" },
  { value: "grocery", label: "Grocery Support", icon: "🛒" },
  { value: "emergency", label: "Emergency Care", icon: "🚨" },
  { value: "daily_care", label: "Daily Care", icon: "🏠" },
];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    serviceType: "medicine", priority: "normal", description: "", address: "", latitude: "", longitude: "",
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Service Request</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {serviceTypes.map((s) => (
              <button key={s.value} type="button"
                onClick={() => setForm({ ...form, serviceType: s.value })}
                className={`p-3 rounded-xl border-2 text-center transition ${form.serviceType === s.value ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}>
                <span className="text-2xl block mb-1">{s.icon}</span>
                <span className="text-xs font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
          <div className="flex gap-3">
            {[{ v: "normal", label: "Normal", color: "border-green-500 bg-green-50 text-green-700" },
              { v: "urgent", label: "Urgent", color: "border-amber-500 bg-amber-50 text-amber-700" },
              { v: "emergency", label: "Emergency", color: "border-red-500 bg-red-50 text-red-700" }].map((p) => (
              <button key={p.v} type="button"
                onClick={() => setForm({ ...form, priority: p.v })}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition ${form.priority === p.v ? p.color : "border-gray-200 text-gray-500"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Describe what you need help with..."
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Your address for this request"
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <button type="button" onClick={getLocation}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50 text-sm text-gray-600 w-full">
            <HiLocationMarker className="text-primary-600" />
            {form.latitude ? `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}` : "Click to capture your location"}
          </button>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default CreateRequest;
