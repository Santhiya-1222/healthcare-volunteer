import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyRequests } from "../../services/requestService";
import { HiPlus, HiClock, HiCheck, HiExclamation, HiRefresh } from "react-icons/hi";

const priorityColors = { emergency: "bg-red-100 text-red-700", urgent: "bg-amber-100 text-amber-700", normal: "bg-green-100 text-green-700" };
const statusColors = { pending: "bg-yellow-100 text-yellow-700", accepted: "bg-blue-100 text-blue-700", in_progress: "bg-purple-100 text-purple-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-500" };

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.data.requests);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const active = requests.filter((r) => ["pending", "accepted", "in_progress"].includes(r.status));
  const completed = requests.filter((r) => r.status === "completed");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
        <Link to="/user/create-request" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          <HiPlus /> New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><HiClock className="text-blue-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
              <p className="text-xs text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><HiExclamation className="text-yellow-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{active.length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><HiCheck className="text-green-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completed.length}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <Link to="/user/recurring" className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><HiRefresh className="text-purple-600 text-xl" /></div>
            <div>
              <p className="text-sm font-semibold text-primary-600">Recurring</p>
              <p className="text-xs text-gray-500">Manage Schedules</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Request List */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">My Requests</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400 mb-4">No requests yet.</p>
          <Link to="/user/create-request" className="text-primary-600 font-medium hover:underline">Create your first request</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 capitalize">{r.serviceType.replace("_", " ")}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{r.description}</p>
                {r.volunteerId && <p className="text-xs text-gray-400 mt-1">Volunteer: {r.volunteerId.name}</p>}
              </div>
              <div className="flex gap-2">
                <Link to={`/user/track/${r._id}`} className="text-sm px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">Track</Link>
                {r.status === "completed" && !r.feedback?.rating && (
                  <Link to={`/user/feedback/${r._id}`} className="text-sm px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">Feedback</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
