import { useState, useEffect } from "react";
import { createSchedule, getMySchedules, cancelSchedule } from "../../services/recurringService";
import toast from "react-hot-toast";
import { HiPlus } from "react-icons/hi";

const RecurringSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    serviceType: "medicine", medicineName: "", frequency: "monthly", nextDueDate: "",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recurring Services</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <HiPlus /> New Schedule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg outline-none bg-white">
                <option value="medicine">Medicine</option>
                <option value="grocery">Grocery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg outline-none bg-white">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine / Item Name</label>
            <input value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
              placeholder="e.g., Diabetes Tablets" className="w-full px-4 py-2.5 border rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
            <input type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg outline-none" />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700">
            Create Schedule
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400">No recurring schedules yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div key={s._id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{s.medicineName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Active" : "Cancelled"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {s.serviceType} &middot; {s.frequency} &middot; Next: {new Date(s.nextDueDate).toLocaleDateString()}
                </p>
                {s.volunteerId && <p className="text-xs text-gray-400 mt-1">Volunteer: {s.volunteerId.name}</p>}
              </div>
              {s.isActive && (
                <button onClick={() => handleCancel(s._id)} className="text-sm text-red-500 hover:text-red-700 font-medium">
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
