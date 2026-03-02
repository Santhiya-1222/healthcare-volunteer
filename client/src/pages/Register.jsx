import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { reverseGeocode } from "../utils/geocode";
import toast from "react-hot-toast";
import {
  HiHeart, HiUser, HiMail, HiPhone, HiLockClosed,
  HiLocationMarker, HiArrowRight, HiRefresh,
  HiIdentification, HiDocumentText, HiUpload, HiX, HiCheckCircle,
} from "react-icons/hi";

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

// ── Cloudinary client-side direct upload (unsigned preset) ───────────────────
const uploadToCloudinary = async (file) => {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to client/.env"
    );
  }

  const formData = new FormData();
  formData.append("file",           file);
  formData.append("upload_preset",  uploadPreset);
  formData.append("folder",         "aadhaar_documents");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Document upload failed.");
  }

  const data = await res.json();
  return data.secure_url;
};

// ── Validation helpers ───────────────────────────────────────────────────────
const ALLOWED_TYPES  = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const isValidAadhaar = (v) => /^\d{12}$/.test(v);

// ─────────────────────────────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();

  /* Core form state */
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "user", address: "", latitude: "", longitude: "",
  });
  const [loading,     setLoading]     = useState(false);
  const [gpsLoading,  setGpsLoading]  = useState(false);

  /* Aadhaar state (volunteer-only) */
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarError, setAadhaarError]   = useState("");
  const [aadhaarFile, setAadhaarFile]     = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null); // data URL or "pdf"
  const [aadhaarDocUrl, setAadhaarDocUrl]   = useState("");   // confirmed Cloudinary URL
  const [docError, setDocError]             = useState("");
  const [uploading, setUploading]           = useState(false);
  const fileInputRef = useRef(null);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser.");
    }
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
      () => {
        setGpsLoading(false);
        toast.error("Location access denied. Please allow location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* Aadhaar number: digits-only, max 12 */
  const handleAadhaarNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarNumber(val);
    if (val.length > 0 && val.length < 12) {
      setAadhaarError("Aadhaar number must be exactly 12 digits.");
    } else {
      setAadhaarError("");
    }
  };

  /* File picker */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setDocError("Only JPG, PNG, and PDF files are accepted.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setDocError("File size must be under 5 MB.");
      return;
    }

    setAadhaarFile(file);
    setAadhaarDocUrl(""); // reset confirmed URL on new selection

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setAadhaarPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setAadhaarPreview("pdf");
    }
  };

  const handleRemoveFile = () => {
    setAadhaarFile(null);
    setAadhaarPreview(null);
    setAadhaarDocUrl("");
    setDocError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.password) {
      return toast.error("Please fill all required fields.");
    }

    if (form.role === "volunteer") {
      if (!isValidAadhaar(aadhaarNumber)) {
        return toast.error("Enter a valid 12-digit Aadhaar number.");
      }
      if (!aadhaarFile) {
        return toast.error("Please upload your Aadhaar document.");
      }
    }

    setLoading(true);

    try {
      let finalDocUrl = aadhaarDocUrl;

      /* Upload to Cloudinary only if not already uploaded */
      if (form.role === "volunteer" && aadhaarFile && !finalDocUrl) {
        setUploading(true);
        try {
          finalDocUrl = await uploadToCloudinary(aadhaarFile);
          setAadhaarDocUrl(finalDocUrl);
        } catch (uploadErr) {
          toast.error(uploadErr.message || "Document upload failed. Please try again.");
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        ...form,
        ...(form.role === "volunteer" && {
          aadhaarNumber,
          aadhaarDocumentUrl: finalDocUrl,
        }),
      };

      const res = await register(payload);
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const isVolunteer = form.role === "volunteer";

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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Location <span className="text-slate-400 font-normal">(for volunteer matching)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input name="latitude" value={form.latitude} readOnly placeholder="Latitude" className="input pl-9 text-sm bg-slate-100 cursor-default" />
                </div>
                <div className="relative flex-1">
                  <input name="longitude" value={form.longitude} readOnly placeholder="Longitude" className="input text-sm bg-slate-100 cursor-default" />
                </div>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={gpsLoading}
                  className="flex-shrink-0 px-3 py-2.5 bg-primary-50 border border-primary-200 text-primary-700 rounded-xl hover:bg-primary-100 text-sm font-semibold transition whitespace-nowrap disabled:opacity-60"
                >
                  {gpsLoading ? (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Locating…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <HiLocationMarker className="inline" /> GPS
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Volunteer-only: Aadhaar section ─────────────────────────── */}
            {isVolunteer && (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                {/* Section label */}
                <div className="flex items-center gap-2">
                  <HiIdentification className="text-primary-600 text-lg flex-shrink-0" />
                  <p className="text-sm font-bold text-slate-800">Aadhaar Verification</p>
                  <span className="badge badge-warning">Required</span>
                </div>

                {/* 1️⃣ Aadhaar Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiIdentification className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={aadhaarNumber}
                      onChange={handleAadhaarNumberChange}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength={12}
                      className={`input pl-10 tracking-widest font-mono ${
                        aadhaarError ? "border-red-400 focus:border-red-400 bg-red-50" : ""
                      }`}
                    />
                    {aadhaarNumber.length === 12 && !aadhaarError && (
                      <HiCheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-lg" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {aadhaarError ? (
                      <p className="text-xs text-red-500 font-medium">{aadhaarError}</p>
                    ) : (
                      <p className="text-xs text-slate-400">Digits only — no spaces or dashes</p>
                    )}
                    <p className={`text-xs font-semibold tabular-nums ${
                      aadhaarNumber.length === 12 ? "text-emerald-600" : "text-slate-400"
                    }`}>
                      {aadhaarNumber.length}/12
                    </p>
                  </div>
                </div>

                {/* 2️⃣ Aadhaar Document Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Aadhaar Document <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs font-normal text-slate-400">JPG · PNG · PDF &middot; Max 5 MB</span>
                  </label>

                  {/* Drop zone (shown when no file selected) */}
                  {!aadhaarFile ? (
                    <label
                      htmlFor="aadhaarDoc"
                      className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group"
                    >
                      <HiUpload className="text-3xl text-slate-400 group-hover:text-primary-500 transition-colors" />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-primary-700">
                        Click to upload or drag &amp; drop
                      </span>
                      <span className="text-xs text-slate-400">Front side of Aadhaar card</span>
                      <input
                        id="aadhaarDoc"
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    /* File preview card */
                    <div className={`relative border rounded-xl overflow-hidden ${
                      docError ? "border-red-400" : "border-slate-200"
                    }`}>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        title="Remove file"
                        className="absolute top-2 right-2 z-10 p-1 bg-slate-900/60 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <HiX className="text-sm" />
                      </button>

                      {/* Image preview */}
                      {aadhaarPreview !== "pdf" ? (
                        <img src={aadhaarPreview} alt="Aadhaar preview" className="w-full h-36 object-cover" />
                      ) : (
                        /* PDF indicator */
                        <div className="flex items-center gap-3 p-4 bg-slate-50">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiDocumentText className="text-red-500 text-xl" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{aadhaarFile.name}</p>
                            <p className="text-xs text-slate-400">
                              {(aadhaarFile.size / 1024).toFixed(0)} KB &middot; PDF Document
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Upload-confirmed badge */}
                      {aadhaarDocUrl && (
                        <div className="absolute bottom-2 left-2">
                          <span className="badge badge-success text-xs">
                            <HiCheckCircle /> Uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {docError && <p className="text-xs text-red-500 font-medium mt-1">{docError}</p>}
                </div>

                {/* Volunteer notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  Volunteer accounts require admin verification before accessing the platform.
                  Your Aadhaar details are kept secure and used only for identity verification.
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || uploading || !!aadhaarError || !!docError}
              className="btn-xl btn-primary w-full mt-2"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading document…
                </span>
              ) : loading ? (
                <span className="flex items-center gap-2">
                  <HiRefresh className="animate-spin" /> Creating account…
                </span>
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
