import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendOtp, verifyOtp } from "../services/authService";
import toast from "react-hot-toast";
import { HiHeart, HiPhone, HiShieldCheck, HiArrowRight, HiRefresh } from "react-icons/hi";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [phone,   setPhone]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [devOtp,  setDevOtp]  = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const dest = user.role === "admin" ? "/admin/dashboard" : user.role === "volunteer" ? "/volunteer/dashboard" : "/user/dashboard";
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Enter your phone number.");
    setLoading(true);
    try {
      const res = await sendOtp(phone.trim());
      if (res.data.otp) setDevOtp(res.data.otp);
      toast.success("OTP sent successfully!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error("Enter the OTP.");
    setLoading(true);
    try {
      const res = await verifyOtp(phone.trim(), otp.trim());
      login(res.data.user);
      toast.success("Login successful!");
      const dest = res.data.user.role === "admin" ? "/admin/dashboard" : res.data.user.role === "volunteer" ? "/volunteer/dashboard" : "/user/dashboard";
      navigate(dest);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-16 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-16 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <HiHeart className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-white text-xl tracking-tight">HealthCare</span>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-white leading-snug mb-4">
            Your trusted network<br />for healthcare support
          </h2>
          <p className="text-primary-100/80 text-base leading-relaxed">
            Secure OTP login connects you to verified volunteers ready to help with
            medicine, emergencies, and daily care.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            { icon: HiShieldCheck, text: "OTP verified secure access" },
            { icon: HiPhone,       text: "No password, just your phone" },
            { icon: HiHeart,       text: "Instant volunteer matching" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="text-white text-base" />
              </div>
              <span className="text-white/90 text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <HiHeart className="text-white text-base" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg">Health<span className="text-primary-600">Care</span></span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            {step === 1 ? "Welcome back" : "Verify your identity"}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {step === 1 ? "Enter your registered phone number to receive an OTP." : `We sent a 6-digit code to ${phone}.`}
          </p>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your registered phone"
                    className="input pl-10"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-xl btn-primary w-full">
                {loading ? (
                  <span className="flex items-center gap-2"><HiRefresh className="animate-spin" /> Sending OTP...</span>
                ) : (
                  <span className="flex items-center gap-2">Send OTP <HiArrowRight /></span>
                )}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-semibold mb-2">
                    <HiShieldCheck /> Dev Mode — Your OTP
                  </div>
                  <p className="text-3xl font-extrabold tracking-[0.3em] text-amber-700 font-display">{devOtp}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="input text-center text-2xl tracking-widest font-display"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1.5 text-center">OTP expires in 5 minutes</p>
              </div>

              <button type="submit" disabled={loading} className="btn-xl btn-primary w-full">
                {loading ? (
                  <span className="flex items-center gap-2"><HiRefresh className="animate-spin" /> Verifying...</span>
                ) : (
                  <span className="flex items-center gap-2">Verify & Sign In <HiArrowRight /></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(""); setDevOtp(""); }}
                className="w-full text-sm text-slate-500 hover:text-primary-600 transition text-center py-1"
              >
                Change phone number
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              {"Don't have an account? "}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
