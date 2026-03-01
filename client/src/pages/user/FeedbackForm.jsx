import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitFeedback } from "../../services/requestService";
import toast from "react-hot-toast";

const FeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating.");
    setLoading(true);
    try {
      await submitFeedback(id, { rating, comment });
      toast.success("Feedback submitted! Thank you.");
      navigate("/user/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Rate This Service</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">How was your experience?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="text-4xl transition-transform hover:scale-110">
                <span className={s <= (hover || rating) ? "text-yellow-400" : "text-gray-200"}>★</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {rating === 1 && "Poor"}{rating === 2 && "Fair"}{rating === 3 && "Good"}{rating === 4 && "Very Good"}{rating === 5 && "Excellent"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
            placeholder="Share your experience..."
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
