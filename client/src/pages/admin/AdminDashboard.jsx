import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../services/adminService";
import { HiUsers, HiClipboardList, HiShieldCheck, HiExclamation, HiCheck, HiStar } from "react-icons/hi";

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

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-20 text-gray-400">Failed to load dashboard.</div>;

  const { stats, recentRequests, topVolunteers } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><HiUsers className="text-blue-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><HiShieldCheck className="text-green-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalVolunteers}</p>
              <p className="text-xs text-gray-500">Volunteers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <Link to="/admin/volunteers" className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg"><HiExclamation className="text-amber-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingVolunteers}</p>
              <p className="text-xs text-gray-500">Pending Verification</p>
            </div>
          </Link>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><HiClipboardList className="text-purple-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
              <p className="text-xs text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.activeRequests}</p>
          <p className="text-xs text-yellow-600">Active Requests</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.completedRequests}</p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.emergencyRequests}</p>
          <p className="text-xs text-red-600">Emergency Requests</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold text-gray-800">Recent Requests</h2>
            <Link to="/admin/requests" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y">
            {recentRequests.slice(0, 5).map((r) => (
              <div key={r._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">{r.serviceType.replace("_", " ")}</p>
                  <p className="text-xs text-gray-400">{r.userId?.name} &middot; {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${r.status === "completed" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                  {r.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Volunteers */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold text-gray-800">Top Volunteers</h2>
            <Link to="/admin/volunteers" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y">
            {topVolunteers.map((v, i) => (
              <div key={v._id} className="p-4 flex items-center gap-4">
                <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.completedTasks} tasks completed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">{v.trustScore}</p>
                  <p className="text-xs text-yellow-500"><HiStar className="inline" /> {v.avgRating?.toFixed(1) || "0.0"}</p>
                </div>
              </div>
            ))}
            {topVolunteers.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">No verified volunteers yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
