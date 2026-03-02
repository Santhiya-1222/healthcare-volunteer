import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNearbyRequests } from "../../services/requestService";
import { getMyTasks, getProfile } from "../../services/volunteerService";
import { useAuth } from "../../context/AuthContext";
import {
  HiStar, HiCheck, HiExclamation, HiLocationMarker,
  HiChevronRight, HiClock, HiShieldCheck,
} from "react-icons/hi";

const serviceIcons = {
  medicine: "💊", hospital: "🏥", grocery: "🛒", emergency: "🚨", daily_care: "🏠",
};

const priorityBorder = {
  emergency: "border-l-red-500",
  urgent:    "border-l-amber-500",
  normal:    "border-l-emerald-500",
};

const priorityBadge = {
  emergency: "badge-danger",
  urgent:    "badge-warning",
  normal:    "badge-success",
};

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [nearby, setNearby]   = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("nearby");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [nearbyRes, tasksRes, profileRes] = await Promise.all([
        getNearbyRequests(10000).catch(() => ({ data: { requests: [] } })),
        getMyTasks(),
        getProfile(),
      ]);
      setNearby(nearbyRes.data.requests);
      setMyTasks(tasksRes.data.requests);
      setProfile(profileRes.data.profile);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const activeTasks    = myTasks.filter((t) => ["accepted", "in_progress"].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === "completed");

  /* ── Unverified state ── */
  if (!user.isVerified) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="card p-12 ring-1 ring-amber-200">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <HiExclamation className="text-4xl text-amber-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Verification Pending</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your volunteer account is awaiting admin verification. You will be notified once your account is approved.
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">Usually takes 1–2 business days</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "nearby",    label: "Nearby",     count: nearby.length },
    { key: "active",    label: "My Tasks",   count: activeTasks.length, highlight: activeTasks.length > 0 },
    { key: "completed", label: "Completed",  count: completedTasks.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Volunteer Portal</p>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{user?.name}</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <HiShieldCheck className="text-emerald-500 text-sm" />
          <span className="text-sm text-emerald-600 font-medium">Verified Volunteer</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="card p-5 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center gap-2 mb-2">
            <HiStar className="text-amber-400 text-lg" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Trust Score</span>
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">{profile?.trustScore || 0}</p>
        </div>

        <div className="card p-5 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 font-bold text-sm">★</span>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Avg Rating</span>
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">
            {profile?.avgRating?.toFixed(1) || "0.0"}
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-400 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Completed</p>
          <p className="text-3xl font-bold font-display text-emerald-600">{completedTasks.length}</p>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-400 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Active Tasks</p>
          <p className="text-3xl font-bold font-display text-blue-600">{activeTasks.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tab === t.key
                ? t.highlight ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                : "bg-slate-200 text-slate-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Nearby Requests */}
          {tab === "nearby" && (
            nearby.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiLocationMarker className="text-3xl text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">No nearby requests</h3>
                <p className="text-sm text-slate-400">New requests in your area will appear here.</p>
              </div>
            ) : (
              nearby.map((r, i) => (
                <Link
                  key={r._id}
                  to={`/volunteer/task/${r._id}`}
                  className={`card-hover block p-5 border-l-4 animate-fade-up ${
                    priorityBorder[r.priority] || "border-l-slate-300"
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {serviceIcons[r.serviceType] || "📋"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 capitalize">
                            {r.serviceType.replace("_", " ")}
                          </span>
                          <span className={`badge ${priorityBadge[r.priority]}`}>{r.priority}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mb-1">{r.description}</p>
                        {r.userId && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <HiLocationMarker className="text-slate-300" />
                            {r.userId.address || "Location provided"} &middot; {r.userId.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                      <HiChevronRight className="text-slate-400" />
                    </div>
                  </div>
                </Link>
              ))
            )
          )}

          {/* Active Tasks */}
          {tab === "active" && (
            activeTasks.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiClock className="text-3xl text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">No active tasks</h3>
                <p className="text-sm text-slate-400">Accept a request from the Nearby tab to get started.</p>
              </div>
            ) : (
              activeTasks.map((r, i) => (
                <Link
                  key={r._id}
                  to={`/volunteer/task/${r._id}`}
                  className="card-hover block p-5 animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {serviceIcons[r.serviceType] || "📋"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 capitalize">
                            {r.serviceType.replace("_", " ")}
                          </span>
                          <span className={`badge ${
                            r.status === "in_progress"
                              ? "bg-violet-100 text-violet-700 badge"
                              : "badge-primary"
                          }`}>
                            {r.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {r.userId?.name} &middot; {r.userId?.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-primary-600 font-medium flex-shrink-0">
                      Continue <HiChevronRight />
                    </div>
                  </div>
                </Link>
              ))
            )
          )}

          {/* Completed Tasks */}
          {tab === "completed" && (
            completedTasks.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiCheck className="text-3xl text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">No completed tasks yet</h3>
                <p className="text-sm text-slate-400">Your completed tasks will appear here.</p>
              </div>
            ) : (
              completedTasks.map((r, i) => (
                <div
                  key={r._id}
                  className="card p-5 animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {serviceIcons[r.serviceType] || "📋"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 capitalize">
                            {r.serviceType.replace("_", " ")}
                          </span>
                          <span className="badge badge-success">
                            <HiCheck className="text-xs" /> Done
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{r.userId?.name}</p>
                      </div>
                    </div>
                    {r.feedback?.rating && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <HiStar key={s} className={`text-base ${
                            s <= r.feedback.rating ? "text-amber-400" : "text-slate-200"
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
