import { useState, useEffect } from "react";
import { getAllRequests } from "../../services/adminService";
import { HiSearch } from "react-icons/hi";

const priorityConfig = {
  emergency: { cls: "badge-danger",   label: "Emergency" },
  urgent:    { cls: "badge-warning",  label: "Urgent" },
  normal:    { cls: "badge-success",  label: "Normal" },
};

const statusConfig = {
  pending:     { cls: "badge-warning",                        label: "Pending" },
  accepted:    { cls: "badge-primary",                        label: "Accepted" },
  in_progress: { cls: "bg-violet-100 text-violet-700 badge",  label: "In Progress" },
  completed:   { cls: "badge-success",                        label: "Completed" },
  cancelled:   { cls: "badge-neutral",                        label: "Cancelled" },
};

const serviceIcons = {
  medicine: "💊", hospital: "🏥", grocery: "🛒", emergency: "🚨", daily_care: "🏠",
};

const FILTERS = ["all", "pending", "accepted", "in_progress", "completed", "cancelled"];

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getAllRequests();
        setRequests(res.data.requests);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filtered = requests
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) =>
      !search ||
      r.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.volunteerId?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? requests.length : requests.filter((r) => r.status === f).length;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Operations</p>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Request Management</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and oversee all platform service requests.</p>
        </div>
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm w-56"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filter === f
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
            <span className={`ml-1.5 ${filter === f ? "text-primary-200" : "text-slate-400"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Service", "User", "Volunteer", "Priority", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center text-slate-400 text-sm">
                      {search ? `No results for "${search}"` : "No requests found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r._id}
                      className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 !== 0 ? "bg-slate-50/20" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{serviceIcons[r.serviceType] || "📋"}</span>
                          <span className="font-medium text-slate-800 capitalize">
                            {r.serviceType.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{r.userId?.name || "N/A"}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {r.volunteerId?.name || (
                          <span className="text-slate-300 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${priorityConfig[r.priority]?.cls || "badge-neutral"}`}>
                          {priorityConfig[r.priority]?.label || r.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${statusConfig[r.status]?.cls || "badge-neutral"}`}>
                          {statusConfig[r.status]?.label || r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
              Showing {filtered.length} of {requests.length} requests
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
