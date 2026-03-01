import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiShieldCheck, HiLocationMarker, HiClock, HiStar,
  HiRefresh, HiBell, HiArrowRight, HiCheckCircle,
  HiUserGroup, HiHeart, HiLightningBolt,
} from "react-icons/hi";

const stats = [
  { value: "500+", label: "Active Volunteers", icon: HiUserGroup,     color: "text-primary-600" },
  { value: "2k+",  label: "Requests Served",   icon: HiCheckCircle,   color: "text-emerald-500" },
  { value: "98%",  label: "Satisfaction Rate",  icon: HiStar,          color: "text-amber-500"   },
  { value: "24/7", label: "Emergency Support",  icon: HiLightningBolt, color: "text-rose-500"    },
];

const features = [
  { icon: HiShieldCheck,    title: "OTP Secure Login",      desc: "Server-generated OTP authentication prevents unauthorized access and credential theft.",   color: "bg-primary-50 text-primary-600" },
  { icon: HiLocationMarker, title: "GeoSpatial Matching",   desc: "Automatically find nearby verified volunteers using MongoDB 2dsphere geolocation indexing.", color: "bg-emerald-50 text-emerald-600" },
  { icon: HiClock,          title: "Priority Scheduling",   desc: "Emergency requests are processed first with intelligent priority-weight queue scheduling.",   color: "bg-rose-50 text-rose-600" },
  { icon: HiStar,           title: "Trust Score System",    desc: "Dynamic trust scores rank volunteers based on completions, ratings, and reliability.",        color: "bg-amber-50 text-amber-600" },
  { icon: HiRefresh,        title: "Recurring Services",    desc: "Schedule weekly grocery support or monthly medicine delivery automatically via cron jobs.",    color: "bg-purple-50 text-purple-600" },
  { icon: HiBell,           title: "Smart Notifications",   desc: "Real-time alerts for emergencies, task updates, and recurring reminders.",                    color: "bg-cyan-50 text-cyan-600" },
];

const steps = [
  { num: "01", title: "Register & Verify",  desc: "Create your account and verify identity with OTP-based secure authentication." },
  { num: "02", title: "Create Request",     desc: "Raise a service request for medicine, hospital, grocery, or emergency help with priority." },
  { num: "03", title: "Get Matched",        desc: "The system finds the nearest verified volunteer automatically using geolocation." },
  { num: "04", title: "Track & Review",     desc: "Follow progress in real-time and leave a rating once the task is completed." },
];

const roles = [
  {
    label: "User",
    gradient: "from-primary-500 to-primary-700",
    light: "bg-primary-50 border-primary-100",
    heading: "text-primary-700",
    items: [
      "Create & prioritize service requests",
      "Set Normal, Urgent, or Emergency priority",
      "Track request status in real-time",
      "Give ratings & feedback after completion",
      "Schedule recurring medicine / grocery services",
    ],
  },
  {
    label: "Volunteer",
    gradient: "from-emerald-500 to-emerald-700",
    light: "bg-emerald-50 border-emerald-100",
    heading: "text-emerald-700",
    items: [
      "View nearby requests by priority on dashboard",
      "Accept and complete assigned tasks",
      "Build trust score through great performance",
      "Receive push notifications and reminders",
      "Get ranked by reliability on leaderboard",
    ],
  },
  {
    label: "Admin",
    gradient: "from-purple-500 to-purple-700",
    light: "bg-purple-50 border-purple-100",
    heading: "text-purple-700",
    items: [
      "Verify & approve volunteer registrations",
      "Monitor all system activity and analytics",
      "Manage trust scores and feedback logs",
      "Block misuse accounts immediately",
      "Access full request and user dashboard",
    ],
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="relative bg-hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-primary-300/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-primary-100 text-xs font-semibold mb-6 animate-fade-in">
              <HiHeart className="text-rose-400 animate-pulse" />
              Trusted Healthcare Volunteer Network
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-up">
              Health &amp; Care Support Through{" "}
              <span className="text-primary-300">Trusted Volunteers</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-100/90 mb-10 leading-relaxed max-w-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Connect with verified nearby volunteers for medicine delivery, hospital assistance,
              emergency help, and daily care services secured with OTP authentication.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-primary-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 shadow-soft-xl hover:-translate-y-0.5"
                  >
                    Get Started Free <HiArrowRight />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to={user.role === "admin" ? "/admin/dashboard" : user.role === "volunteer" ? "/volunteer/dashboard" : "/user/dashboard"}
                  className="inline-flex items-center gap-2 bg-white text-primary-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-soft-xl hover:-translate-y-0.5"
                >
                  Go to Dashboard <HiArrowRight />
                </Link>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-primary-200 text-sm animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {["OTP Secured", "Geolocation Matching", "Priority Queue", "Real-Time Tracking"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <HiCheckCircle className="text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full h-12 sm:h-16 fill-slate-50" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="card flex flex-col items-center text-center p-5 sm:p-6">
                <s.icon className={`text-3xl mb-2 ${s.color}`} />
                <p className="font-display text-3xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="section-title mb-4">Built for Reliability &amp; Trust</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Every feature is engineered to ensure fast, secure, and dependable healthcare volunteer coordination.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-hover p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 ${f.color}`}>
                  <f.icon className="text-2xl" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-slate-50">
        <div className="container-xl">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="section-title mb-4">How It Works</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              From registration to task completion in four clear steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="card flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg mb-5 shadow-glow">
                  {s.num}
                </div>
                <h3 className="font-display font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-3">Three Roles</p>
            <h2 className="section-title mb-4">One Shared Mission</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Every stakeholder has a clear purpose — together we build a reliable care ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.label} className={`card-hover border p-6 ${r.light}`}>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-5 bg-gradient-to-r ${r.gradient} text-white shadow-soft-sm`}>
                  {r.label}
                </div>
                <ul className="space-y-2.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <HiCheckCircle className={`mt-0.5 flex-shrink-0 text-base ${r.heading}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl" />
        </div>
        <div className="container-xl relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-primary-100 text-xs font-semibold mb-6">
            <HiHeart className="text-rose-400" /> Join the Movement
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-5">
            Ready to Make a Difference?
          </h2>
          <p className="text-primary-100/90 text-lg mb-10 max-w-xl mx-auto">
            Whether you need help or want to give it — register today and become part of a trusted care network.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition shadow-soft-xl hover:-translate-y-0.5"
              >
                Become a Volunteer <HiArrowRight />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition backdrop-blur-sm"
              >
                I Need Help
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
