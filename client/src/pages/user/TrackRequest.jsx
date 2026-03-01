import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRequestById } from "../../services/requestService";
import { HiCheck, HiClock } from "react-icons/hi";

const steps = ["pending", "accepted", "in_progress", "completed"];
const stepLabels = { pending: "Pending", accepted: "Accepted", in_progress: "In Progress", completed: "Completed" };

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

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!request) return <div className="text-center py-20 text-gray-400">Request not found.</div>;

  const currentStepIndex = steps.indexOf(request.status);
  const isCancelled = request.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Track Request</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{request.serviceType === "medicine" ? "💊" : request.serviceType === "hospital" ? "🏥" : request.serviceType === "grocery" ? "🛒" : request.serviceType === "emergency" ? "🚨" : "🏠"}</span>
          <h2 className="text-xl font-semibold capitalize text-gray-800">{request.serviceType.replace("_", " ")} Request</h2>
        </div>

        <p className="text-gray-600 mb-4">{request.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><span className="text-gray-400">Priority:</span> <span className="font-medium capitalize">{request.priority}</span></div>
          <div><span className="text-gray-400">Status:</span> <span className="font-medium capitalize">{request.status.replace("_", " ")}</span></div>
          <div><span className="text-gray-400">Created:</span> <span className="font-medium">{new Date(request.createdAt).toLocaleString()}</span></div>
          {request.completedAt && <div><span className="text-gray-400">Completed:</span> <span className="font-medium">{new Date(request.completedAt).toLocaleString()}</span></div>}
        </div>

        {request.volunteerId && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">Assigned Volunteer</p>
            <p className="font-medium text-gray-800">{request.volunteerId.name}</p>
            <p className="text-sm text-gray-500">{request.volunteerId.phone}</p>
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStepIndex ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {i <= currentStepIndex ? <HiCheck /> : <HiClock />}
                  </div>
                  <span className={`text-xs mt-2 ${i <= currentStepIndex ? "text-primary-600 font-medium" : "text-gray-400"}`}>{stepLabels[step]}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${i < currentStepIndex ? "bg-primary-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 text-center font-medium">
            This request has been cancelled.
          </div>
        )}
      </div>

      {/* Feedback */}
      {request.status === "completed" && request.feedback?.rating && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Your Feedback</h3>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-xl ${s <= request.feedback.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          {request.feedback.comment && <p className="text-sm text-gray-600">{request.feedback.comment}</p>}
        </div>
      )}

      {request.status === "completed" && !request.feedback?.rating && (
        <Link to={`/user/feedback/${request._id}`}
          className="block text-center bg-green-50 text-green-600 rounded-xl p-4 border border-green-200 hover:bg-green-100 font-medium">
          Leave Feedback for this Service
        </Link>
      )}
    </div>
  );
};

export default TrackRequest;
