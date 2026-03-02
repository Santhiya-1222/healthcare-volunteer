import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRequestById } from "../../services/requestService";
import { HiCheck, HiClock, HiPhone, HiUser, HiArrowLeft, HiStar } from "react-icons/hi";

const steps       = ["pending", "accepted", "in_progress", "completed"];
const stepLabels  = { pending: "Pending", accepted: "Accepted", in_progress: "In Progress", completed: "Completed" };
const stepDesc    = { pending: "Awaiting volunteer", accepted: "Volunteer assigned", in_progress: "Service underway", completed: "Service complete" };

const serviceIcons = {
  medicine: "💊", hospital: "🏥", grocery: "🛒", emergency: "🚨", daily_care: "🏠",
};

const TrackRequest = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await getRequestById(id);
        setRequest(res.data.request);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

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

  const currentStepIndex = steps.indexOf(request.status);
  const isCancelled      = request.status === "cancelled";
  const progressPct      = currentStepIndex >= 0
    ? Math.round((currentStepIndex / (steps.length - 1)) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <Link
          to="/user/dashboard"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <HiArrowLeft className="text-xs" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Track Request</h1>
      </div>

      {/* Request Info Card */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {serviceIcons[request.serviceType] || "📋"}
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900 capitalize">
              {request.serviceType.replace("_", " ")}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`badge ${
                request.priority === "emergency" ? "badge-danger" :
                request.priority === "urgent"    ? "badge-warning" : "badge-success"
              }`}>{request.priority}</span>
              {isCancelled ? (
                <span className="badge badge-neutral">Cancelled</span>
              ) : (
                <span className={`badge ${
                  request.status === "completed"   ? "badge-success" :
                  request.status === "in_progress" ? "bg-violet-100 text-violet-700 badge" :
                  request.status === "accepted"    ? "badge-primary" : "badge-warning"
                }`}>{request.status.replace("_", " ")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <p className="text-slate-700 text-sm leading-relaxed">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Created</p>
            <p className="font-medium text-slate-800">{new Date(request.createdAt).toLocaleString()}</p>
          </div>
          {request.completedAt && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Completed</p>
              <p className="font-medium text-slate-800">{new Date(request.completedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Card */}
      {request.volunteerId && (
        <div className="card p-5 mb-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <HiUser className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Assigned Volunteer</p>
            <p className="font-semibold text-slate-800">{request.volunteerId.name}</p>
          </div>
          <a
            href={`tel:${request.volunteerId.phone}`}
            className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            <HiPhone /> {request.volunteerId.phone}
          </a>
        </div>
      )}

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="card p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">Progress</h3>
            <span className="text-xs font-semibold text-primary-600">{progressPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step circles */}
          <div className="flex justify-between">
            {steps.map((step, i) => {
              const isDone    = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-slate-200 text-slate-400"
                  } ${isCurrent ? "ring-4 ring-primary-100" : ""}`}>
                    {isDone ? <HiCheck className="text-sm" /> : <HiClock className="text-sm" />}
                  </div>
                  <span className={`text-xs mt-2.5 font-semibold text-center leading-tight ${
                    isDone ? "text-primary-600" : "text-slate-400"
                  }`}>
                    {stepLabels[step]}
                  </span>
                  <span className="text-xs text-slate-400 text-center mt-0.5 hidden sm:block">
                    {stepDesc[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="card p-5 border-l-4 border-l-red-400 bg-red-50 mb-5">
          <p className="text-red-600 font-semibold text-center">This request has been cancelled.</p>
        </div>
      )}

      {/* Feedback Section */}
      {request.status === "completed" && request.feedback?.rating && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Your Feedback</h3>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <HiStar key={s} className={`text-xl ${s <= request.feedback.rating ? "text-amber-400" : "text-slate-200"}`} />
            ))}
            <span className="ml-2 text-sm text-slate-500 font-medium">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][request.feedback.rating]}
            </span>
          </div>
          {request.feedback.comment && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mt-2">
              {request.feedback.comment}
            </p>
          )}
        </div>
      )}

      {request.status === "completed" && !request.feedback?.rating && (
        <Link
          to={`/user/feedback/${request._id}`}
          className="card p-5 flex items-center justify-between hover:shadow-soft transition-all border-l-4 border-l-amber-400 bg-amber-50"
        >
          <div>
            <p className="font-semibold text-amber-800">Rate this service</p>
            <p className="text-sm text-amber-600 mt-0.5">Share your experience to help the community</p>
          </div>
          <div className="flex gap-0.5 text-amber-400 text-xl">★★★★★</div>
        </Link>
      )}
    </div>
  );
};

export default TrackRequest;
