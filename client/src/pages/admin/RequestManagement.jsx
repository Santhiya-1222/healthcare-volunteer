import { useState, useEffect } from "react";
import { getAllRequests } from "../../services/adminService";

const priorityColors = { emergency: "bg-red-100 text-red-700", urgent: "bg-amber-100 text-amber-700", normal: "bg-green-100 text-green-700" };
const statusColors = { pending: "bg-yellow-100 text-yellow-700", accepted: "bg-blue-100 text-blue-700", in_progress: "bg-purple-100 text-purple-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-500" };

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Request Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === f ? "bg-primary-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>
            {f === "all" ? "All" : f.replace("_", " ")} ({f === "all" ? requests.length : requests.filter((r) => r.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Type</th>
                <th className="text-left p-3 font-medium text-gray-500">User</th>
                <th className="text-left p-3 font-medium text-gray-500">Volunteer</th>
                <th className="text-left p-3 font-medium text-gray-500">Priority</th>
                <th className="text-left p-3 font-medium text-gray-500">Status</th>
                <th className="text-left p-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No requests found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800 capitalize">{r.serviceType.replace("_", " ")}</td>
                    <td className="p-3 text-gray-600">{r.userId?.name || "N/A"}</td>
                    <td className="p-3 text-gray-600">{r.volunteerId?.name || "-"}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[r.status]}`}>{r.status.replace("_", " ")}</span>
                    </td>
                    <td className="p-3 text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
