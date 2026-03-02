import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../services/adminService";
import {
  HiUsers, HiClipboardList, HiShieldCheck, HiExclamation,
  HiCheck, HiStar, HiClock, HiArrowRight,
} from "react-icons/hi";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setData(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Failed to load dashboard.</p>
      </div>
    );
  }

  const { stats, recentRequests, topVolunteers } = data;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const primaryStats = [
    {
      label: "Total Users", value: stats.totalUsers,
      icon: HiUsers, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
    },
    {
      label: "Volunteers", value: stats.totalVolunteers,
      icon: HiShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
    },
    {
      label: "Pending Verification", value: stats.pendingVolunteers,
      icon: HiExclamation, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
      link: "/admin/volunteers", highlight: true,
    },
    {
      label: "Total Requests", value: stats.totalRequests,
      icon: HiClipboardList, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{today}</p>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform overview and management center</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link to="/admin/volunteers" className="btn-md btn-secondary">Volunteers</Link>
          <Link to="/admin/requests" className="btn-md btn-primary">All Requests</Link>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {primaryStats.map((stat, i) => {
          const Icon = stat.icon;
          const Wrapper = stat.link ? Link : "div";
          const wrapperProps = stat.link ? { to: stat.link } : {};
          return (
            <Wrapper
              key={i}
              {...wrapperProps}
              className={`card p-5 flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft animate-fade-up ${stat.highlight ? "ring-1 ring-amber-200" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`p-2.5 rounded-xl ${stat.bg} border ${stat.border} flex-shrink-0`}>
                <Icon className={`text-xl ${stat.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold font-display ${stat.highlight ? "text-amber-600" : "text-slate-900"}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Active</p>
              <p className="text-3xl font-bold font-display text-amber-600 mt-1">{stats.activeRequests}</p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <HiClock className="text-amber-500 text-xl" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Requests in progress</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Completed</p>
              <p className="text-3xl font-bold font-display text-emerald-600 mt-1">{stats.completedRequests}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <HiCheck className="text-emerald-500 text-xl" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Services fulfilled</p>
        </div>

        <div className="card p-5 border-l-4 border-l-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Emergency</p>
              <p className="text-3xl font-bold font-display text-red-600 mt-1">{stats.emergencyRequests}</p>
            </div>
            <div className="p-2.5 bg-red-50 rounded-xl">
              <HiExclamation className="text-red-500 text-xl" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Critical requests</p>
        </div>
      </div>

      {/* Two-column lower section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HiClipboardList className="text-slate-400" />
              <h2 className="font-semibold text-slate-800">Recent Requests</h2>
            </div>
            <Link to="/admin/requests" className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View All <HiArrowRight />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentRequests.slice(0, 5).map((r) => (
              <div key={r._id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 capitalize truncate">
                    {r.serviceType.replace("_", " ")}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.userId?.name} &middot; {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`ml-3 badge flex-shrink-0 ${
                  r.status === "completed" ? "badge-success" :
                  r.status === "pending"   ? "badge-warning" :
                  r.status === "cancelled" ? "badge-neutral" : "badge-primary"
                }`}>
                  {r.status.replace("_", " ")}
                </span>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <p className="px-6 py-10 text-sm text-slate-400 text-center">No recent requests.</p>
            )}
          </div>
        </div>

        {/* Top Volunteers */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HiStar className="text-slate-400" />
              <h2 className="font-semibold text-slate-800">Top Volunteers</h2>
            </div>
            <Link to="/admin/volunteers" className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View All <HiArrowRight />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {topVolunteers.map((v, i) => (
              <div key={v._id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                <span className={`text-sm font-bold w-6 flex-shrink-0 ${
                  i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700/70" : "text-slate-300"
                }`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{v.name}</p>
                  <p className="text-xs text-slate-400">{v.completedTasks} tasks completed</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary-600">{v.trustScore}</p>
                  <p className="text-xs text-amber-500 flex items-center gap-0.5 justify-end">
                    <HiStar className="text-xs" /> {v.avgRating?.toFixed(1) || "0.0"}
                  </p>
                </div>
              </div>
            ))}
            {topVolunteers.length === 0 && (
              <p className="px-6 py-10 text-sm text-slate-400 text-center">No verified volunteers yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
