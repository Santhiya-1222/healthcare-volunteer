import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestById, acceptRequest, updateStatus } from "../../services/requestService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await getRequestById(id);
      setRequest(res.data.request);
    } catch {
      toast.error("Failed to load request.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptRequest(id);
      toast.success("Request accepted!");
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to accept.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus.replace("_", " ")}.`);
      if (newStatus === "completed") {
        navigate("/volunteer/dashboard");
      } else {
        fetchRequest();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!request) return <div className="text-center py-20 text-gray-400">Request not found.</div>;

  const isMyTask = request.volunteerId && String(request.volunteerId._id || request.volunteerId) === String(user.id || user._id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Task Detail</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {request.serviceType === "medicine" ? "💊" : request.serviceType === "hospital" ? "🏥" : request.serviceType === "grocery" ? "🛒" : request.serviceType === "emergency" ? "🚨" : "🏠"}
          </span>
          <div>
            <h2 className="text-xl font-semibold capitalize text-gray-800">{request.serviceType.replace("_", " ")}</h2>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${request.priority === "emergency" ? "bg-red-100 text-red-700" : request.priority === "urgent" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                {request.priority}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{request.status.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Requested By</p>
            <p className="font-medium text-gray-800">{request.userId?.name}</p>
            <p className="text-gray-500">{request.userId?.phone}</p>
          </div>
          <div>
            <p className="text-gray-400">Address</p>
            <p className="font-medium text-gray-800">{request.address || request.userId?.address || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-400">Created</p>
            <p className="font-medium text-gray-800">{new Date(request.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Priority</p>
            <p className="font-medium text-gray-800 capitalize">{request.priority}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t space-y-3">
          {request.status === "pending" && !request.volunteerId && (
            <button onClick={handleAccept} disabled={actionLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
              {actionLoading ? "Processing..." : "Accept This Request"}
            </button>
          )}

          {isMyTask && request.status === "accepted" && (
            <div className="flex gap-3">
              <button onClick={() => handleStatusUpdate("in_progress")} disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                Start Task
              </button>
              <button onClick={() => handleStatusUpdate("cancelled")} disabled={actionLoading}
                className="flex-1 bg-red-100 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50">
                Cancel
              </button>
            </div>
          )}

          {isMyTask && request.status === "in_progress" && (
            <button onClick={() => handleStatusUpdate("completed")} disabled={actionLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
              {actionLoading ? "Processing..." : "Mark as Completed"}
            </button>
          )}

          {request.status === "completed" && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
              This task has been completed.
              {request.feedback?.rating && (
                <p className="text-sm mt-1">Rating: {"★".repeat(request.feedback.rating)}{"☆".repeat(5 - request.feedback.rating)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
