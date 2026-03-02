import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestById, acceptRequest, updateStatus } from "../../services/requestService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  HiArrowLeft, HiPhone, HiLocationMarker,
  HiClock, HiStar, HiCheck,
} from "react-icons/hi";

const serviceIcons = {
  medicine: "💊", hospital: "🏥", grocery: "🛒", emergency: "🚨", daily_care: "🏠",
};

const TaskDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchRequest(); }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Request not found.</p>
      </div>
    );
  }

  const isMyTask = request.volunteerId &&
    String(request.volunteerId._id || request.volunteerId) === String(user.id || user._id);

  const priorityCls =
    request.priority === "emergency" ? "border-l-red-500" :
    request.priority === "urgent"    ? "border-l-amber-500" : "border-l-emerald-500";

  const priorityBadge =
    request.priority === "emergency" ? "badge-danger" :
    request.priority === "urgent"    ? "badge-warning" : "badge-success";

  const statusBadge =
    request.status === "completed"   ? "badge-success" :
    request.status === "in_progress" ? "bg-violet-100 text-violet-700 badge" :
    request.status === "accepted"    ? "badge-primary" :
    request.status === "cancelled"   ? "badge-neutral" : "badge-warning";

  return (
    <div className="max-w-xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <HiArrowLeft className="text-xs" /> Back
        </button>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Task Detail</h1>
      </div>

      {/* Service Header */}
      <div className={`card p-5 mb-5 border-l-4 ${priorityCls}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {serviceIcons[request.serviceType] || "📋"}
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900 capitalize">
              {request.serviceType.replace("_", " ")}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`badge ${priorityBadge}`}>{request.priority}</span>
              <span className={`badge ${statusBadge}`}>{request.status.replace("_", " ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-5 mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Request Details</p>
        <p className="text-slate-700 text-sm leading-relaxed">{request.description}</p>
      </div>

      {/* Contact + Location */}
      <div className="card p-5 mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Requester Info</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-1">Name</p>
            <p className="font-semibold text-slate-800">{request.userId?.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Phone</p>
            <a
              href={`tel:${request.userId?.phone}`}
              className="font-semibold text-primary-600 flex items-center gap-1 hover:text-primary-700 transition-colors"
            >
              <HiPhone className="text-xs" /> {request.userId?.phone}
            </a>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400 mb-1">Address</p>
            <p className="font-semibold text-slate-800 flex items-start gap-1">
              <HiLocationMarker className="text-slate-400 text-sm mt-0.5 flex-shrink-0" />
              {request.address || request.userId?.address || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Requested At</p>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <HiClock className="text-slate-400 text-xs" />
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {request.status === "pending" && !request.volunteerId && (
          <button onClick={handleAccept} disabled={actionLoading} className="btn-xl btn-primary w-full">
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </>
            ) : "Accept This Request"}
          </button>
        )}

        {isMyTask && request.status === "accepted" && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusUpdate("in_progress")}
              disabled={actionLoading}
              className="btn-xl flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {actionLoading ? "Processing…" : "Start Task"}
            </button>
            <button
              onClick={() => handleStatusUpdate("cancelled")}
              disabled={actionLoading}
              className="btn-xl btn-danger flex-1"
            >
              Cancel
            </button>
          </div>
        )}

        {isMyTask && request.status === "in_progress" && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={actionLoading}
            className="btn-xl w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-semibold transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <><HiCheck /> Mark as Completed</>
            )}
          </button>
        )}

        {request.status === "completed" && (
          <div className="card p-5 bg-emerald-50 ring-1 ring-emerald-200">
            <div className="flex items-center gap-3 justify-center mb-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <HiCheck className="text-emerald-600" />
              </div>
              <p className="font-semibold text-emerald-800">Task Completed</p>
            </div>
            {request.feedback?.rating && (
              <div className="flex items-center justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <HiStar key={s} className={`text-lg ${
                    s <= request.feedback.rating ? "text-amber-400" : "text-slate-200"
                  }`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
