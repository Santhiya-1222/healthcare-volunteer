import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitFeedback } from "../../services/requestService";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const ratingColors = [
  "", "text-red-500", "text-orange-500", "text-amber-500", "text-lime-500", "text-emerald-500",
];

const FeedbackForm = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
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

  const display = hover || rating;

  return (
    <div className="max-w-md mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <HiArrowLeft className="text-xs" /> Back
        </button>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Rate This Service</h1>
        <p className="text-sm text-slate-500 mt-1">Your feedback helps volunteers improve and builds trust.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div className="card p-8 text-center">
          <p className="text-sm font-medium text-slate-600 mb-6">How was your experience?</p>

          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className={`text-5xl transition-all duration-150 select-none ${
                  s <= display ? "text-amber-400 scale-110" : "text-slate-200"
                } hover:scale-110`}
              >
                ★
              </button>
            ))}
          </div>

          <div className="min-h-[24px]">
            {display > 0 ? (
              <p className={`text-lg font-semibold ${ratingColors[display]}`}>
                {ratingLabels[display]}
              </p>
            ) : (
              <p className="text-sm text-slate-400">Click a star to rate</p>
            )}
          </div>

          {/* Rating bar */}
          {rating > 0 && (
            <div className="flex gap-1 mt-4 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                    s <= rating ? "bg-amber-400" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <div className="card p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Comment{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience — what went well, what could be better…"
            className="input resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="btn-xl btn-primary w-full"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
