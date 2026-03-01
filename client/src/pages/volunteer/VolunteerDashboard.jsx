import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNearbyRequests } from "../../services/requestService";
import { getMyTasks, getProfile } from "../../services/volunteerService";
import { useAuth } from "../../context/AuthContext";
import { HiStar, HiCheck, HiExclamation, HiLocationMarker } from "react-icons/hi";

const priorityColors = { emergency: "bg-red-100 text-red-700 border-red-200", urgent: "bg-amber-100 text-amber-700 border-amber-200", normal: "bg-green-100 text-green-700 border-green-200" };

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [nearby, setNearby] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("nearby");

  useEffect(() => {
    fetchData();
  }, []);

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

  const activeTasks = myTasks.filter((t) => ["accepted", "in_progress"].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === "completed");

  if (!user.isVerified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
          <HiExclamation className="text-5xl text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Pending</h2>
          <p className="text-gray-500">Your volunteer account is awaiting admin verification. You'll be notified once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Trust Score</p>
          <div className="flex items-center gap-2 mt-1">
            <HiStar className="text-yellow-400 text-xl" />
            <span className="text-2xl font-bold text-gray-800">{profile?.trustScore || 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Avg Rating</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{profile?.avgRating?.toFixed(1) || "0.0"} <span className="text-sm text-yellow-400">★</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{completedTasks.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Active Tasks</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{activeTasks.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setTab("nearby")}
          className={`pb-3 px-1 font-medium ${tab === "nearby" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-400"}`}>
          Nearby Requests ({nearby.length})
        </button>
        <button onClick={() => setTab("active")}
          className={`pb-3 px-1 font-medium ${tab === "active" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-400"}`}>
          My Active Tasks ({activeTasks.length})
        </button>
        <button onClick={() => setTab("completed")}
          className={`pb-3 px-1 font-medium ${tab === "completed" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-400"}`}>
          Completed ({completedTasks.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {tab === "nearby" && (
            nearby.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><p className="text-gray-400">No nearby requests found.</p></div>
            ) : (
              nearby.map((r) => (
                <Link key={r._id} to={`/volunteer/task/${r._id}`}
                  className={`block bg-white rounded-xl p-4 shadow-sm border-l-4 hover:shadow-md transition ${r.priority === "emergency" ? "border-l-red-500" : r.priority === "urgent" ? "border-l-amber-500" : "border-l-green-500"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 capitalize">{r.serviceType.replace("_", " ")}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[r.priority]}`}>{r.priority}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{r.description}</p>
                      {r.userId && <p className="text-xs text-gray-400 mt-1"><HiLocationMarker className="inline" /> {r.userId.address || "Location provided"} &middot; {r.userId.name}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )
          )}

          {tab === "active" && (
            activeTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><p className="text-gray-400">No active tasks.</p></div>
            ) : (
              activeTasks.map((r) => (
                <Link key={r._id} to={`/volunteer/task/${r._id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 capitalize">{r.serviceType.replace("_", " ")}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{r.status.replace("_", " ")}</span>
                      <p className="text-sm text-gray-500 mt-1">{r.userId?.name} &middot; {r.userId?.phone}</p>
                    </div>
                    <span className="text-sm text-primary-600 font-medium">View →</span>
                  </div>
                </Link>
              ))
            )
          )}

          {tab === "completed" && (
            completedTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><p className="text-gray-400">No completed tasks yet.</p></div>
            ) : (
              completedTasks.map((r) => (
                <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 capitalize">{r.serviceType.replace("_", " ")}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"><HiCheck className="inline" /> Completed</span>
                      <p className="text-sm text-gray-500 mt-1">{r.userId?.name}</p>
                    </div>
                    {r.feedback?.rating && (
                      <div className="text-sm text-yellow-500">{"★".repeat(r.feedback.rating)}{"☆".repeat(5 - r.feedback.rating)}</div>
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
