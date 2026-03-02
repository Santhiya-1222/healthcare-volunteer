import { useState, useEffect } from "react";
import { createSchedule, getMySchedules, cancelSchedule } from "../../services/recurringService";
import toast from "react-hot-toast";
import { HiPlus, HiX, HiRefresh, HiClock, HiCalendar, HiUser } from "react-icons/hi";

const freqLabels = { weekly: "Weekly", monthly: "Monthly" };

const RecurringSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({
    serviceType: "medicine", medicineName: "", frequency: "monthly", nextDueDate: "",
  });

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    try {
      const res = await getMySchedules();
      setSchedules(res.data.schedules);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medicineName || !form.nextDueDate) return toast.error("Fill all fields.");
    try {
      await createSchedule(form);
      toast.success("Recurring schedule created!");
      setShowForm(false);
      setForm({ serviceType: "medicine", medicineName: "", frequency: "monthly", nextDueDate: "" });
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create schedule.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelSchedule(id);
      toast.success("Schedule cancelled.");
      fetchSchedules();
    } catch {
      toast.error("Failed to cancel.");
    }
  };

  const active   = schedules.filter((s) => s.isActive);
  const inactive = schedules.filter((s) => !s.isActive);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Automation</p>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Recurring Services</h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule automatic service requests for regular needs.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-md self-start sm:self-auto ${showForm ? "btn-secondary" : "btn-primary"}`}
        >
          {showForm ? <><HiX /> Cancel</> : <><HiPlus /> New Schedule</>}
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <HiRefresh className="text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-slate-900">{active.length}</p>
            <p className="text-xs text-slate-500">Active Schedules</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <HiClock className="text-slate-400" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-slate-900">{schedules.length}</p>
            <p className="text-xs text-slate-500">Total Schedules</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-6 mb-6 ring-1 ring-primary-200 animate-slide-down">
          <h3 className="font-semibold text-slate-800 mb-5">New Recurring Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Service Type
                </label>
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  className="input"
                >
                  <option value="medicine">💊 Medicine</option>
                  <option value="grocery">🛒 Grocery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="input"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Medicine / Item Name
              </label>
              <input
                value={form.medicineName}
                onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                placeholder="e.g., Diabetes Tablets"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-md btn-primary flex-1">
                Create Schedule
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-md btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiRefresh className="text-3xl text-primary-400" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">No recurring schedules</h3>
          <p className="text-sm text-slate-400 mb-5">
            Set up automatic service requests for your regular needs.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-md btn-primary inline-flex">
            <HiPlus /> Create Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s, i) => (
            <div
              key={s._id}
              className={`card p-5 flex items-center justify-between gap-4 transition-all animate-fade-up ${
                !s.isActive ? "opacity-60" : ""
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {s.serviceType === "medicine" ? "💊" : "🛒"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-slate-800 truncate">{s.medicineName}</span>
                    <span className={`badge ${s.isActive ? "badge-success" : "badge-neutral"}`}>
                      {s.isActive ? "Active" : "Cancelled"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <HiRefresh className="text-slate-400" />
                      {freqLabels[s.frequency]}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiCalendar className="text-slate-400" />
                      Next: {new Date(s.nextDueDate).toLocaleDateString()}
                    </span>
                    {s.volunteerId && (
                      <span className="flex items-center gap-1 text-primary-600 font-medium">
                        <HiUser className="text-primary-400" /> {s.volunteerId.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {s.isActive && (
                <button
                  onClick={() => handleCancel(s._id)}
                  className="btn-sm btn-danger flex-shrink-0"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringSchedule;
