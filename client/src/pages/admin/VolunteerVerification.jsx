import { useState, useEffect } from "react";
import { getPendingVolunteers, getAllVolunteers, verifyVolunteer, blockVolunteer } from "../../services/adminService";
import toast from "react-hot-toast";
import { HiCheck, HiBan, HiShieldCheck } from "react-icons/hi";

const VolunteerVerification = () => {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([getPendingVolunteers(), getAllVolunteers()]);
      setPending(pendingRes.data.volunteers);
      setAll(allRes.data.volunteers);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyVolunteer(id);
      toast.success("Volunteer verified!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed.");
    }
  };

  const handleBlock = async (id) => {
    try {
      await blockVolunteer(id);
      toast.success("Status updated.");
      fetchData();
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Volunteer Management</h1>

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setTab("pending")}
          className={`pb-3 px-1 font-medium ${tab === "pending" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-400"}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab("all")}
          className={`pb-3 px-1 font-medium ${tab === "all" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-400"}`}>
          All Volunteers ({all.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {tab === "pending" && (
            pending.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <HiShieldCheck className="text-4xl text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">No pending verifications.</p>
              </div>
            ) : (
              pending.map((v) => (
                <div key={v._id} className="bg-white rounded-xl p-4 shadow-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{v.name}</p>
                    <p className="text-sm text-gray-500">{v.email} &middot; {v.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">{v.address || "No address"} &middot; Registered {new Date(v.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleVerify(v._id)}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                      <HiCheck /> Verify
                    </button>
                    <button onClick={() => handleBlock(v._id)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium">
                      <HiBan /> Reject
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {tab === "all" && (
            all.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><p className="text-gray-400">No volunteers registered.</p></div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-500">Name</th>
                      <th className="text-left p-3 font-medium text-gray-500">Contact</th>
                      <th className="text-left p-3 font-medium text-gray-500">Trust Score</th>
                      <th className="text-left p-3 font-medium text-gray-500">Rating</th>
                      <th className="text-left p-3 font-medium text-gray-500">Tasks</th>
                      <th className="text-left p-3 font-medium text-gray-500">Status</th>
                      <th className="text-left p-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {all.map((v) => (
                      <tr key={v._id}>
                        <td className="p-3 font-medium text-gray-800">{v.name}</td>
                        <td className="p-3 text-gray-500">{v.phone}</td>
                        <td className="p-3 font-bold text-primary-600">{v.trustScore}</td>
                        <td className="p-3 text-yellow-500">{v.avgRating?.toFixed(1) || "0.0"} ★</td>
                        <td className="p-3 text-gray-600">{v.completedTasks} done / {v.cancelledTasks} cancelled</td>
                        <td className="p-3">
                          {v.isBlocked ? (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Blocked</span>
                          ) : v.isVerified ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Verified</span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </td>
                        <td className="p-3">
                          {!v.isVerified && !v.isBlocked && (
                            <button onClick={() => handleVerify(v._id)} className="text-xs text-green-600 hover:underline mr-2">Verify</button>
                          )}
                          <button onClick={() => handleBlock(v._id)} className="text-xs text-red-500 hover:underline">
                            {v.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerVerification;
