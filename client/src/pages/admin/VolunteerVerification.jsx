import { useState, useEffect } from "react";
import {
  getPendingVolunteers, getAllVolunteers,
  verifyVolunteer, blockVolunteer, verifyAadhaar,
} from "../../services/adminService";
import toast from "react-hot-toast";
import {
  HiCheck, HiBan, HiShieldCheck, HiSearch,
  HiUser, HiPhone, HiCalendar, HiStar,
  HiIdentification, HiDocumentText, HiExternalLink,
  HiCheckCircle, HiXCircle, HiClock,
} from "react-icons/hi";

/* ── helpers ── */
const maskAadhaar = (num) => {
  if (!num || num.length < 4) return num || "—";
  return `XXXX XXXX ${num.slice(-4)}`;
};

const AadhaarStatusBadge = ({ status }) => {
  if (status === "verified")
    return (
      <span className="badge badge-success flex items-center gap-1">
        <HiCheckCircle className="text-xs" /> Verified
      </span>
    );
  if (status === "rejected")
    return (
      <span className="badge badge-danger flex items-center gap-1">
        <HiXCircle className="text-xs" /> Rejected
      </span>
    );
  return (
    <span className="badge badge-warning flex items-center gap-1">
      <HiClock className="text-xs" /> Pending
    </span>
  );
};

const AadhaarDocPreview = ({ url }) => {
  if (!url) return <span className="text-xs text-slate-400 italic">No document</span>;
  const isPdf = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/raw/upload/");
  if (isPdf) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        <HiDocumentText className="text-base" /> View PDF
        <HiExternalLink className="text-xs" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={url}
        alt="Aadhaar document"
        className="w-40 h-24 object-cover rounded-lg border border-slate-200 hover:opacity-90 transition-opacity"
      />
    </a>
  );
};

/* ── main component ── */
const VolunteerVerification = () => {
  const [pending, setPending]           = useState([]);
  const [all, setAll]                   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState("pending");
  const [search, setSearch]             = useState("");
  const [aadhaarLoading, setAadhaarLoading] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        getPendingVolunteers(), getAllVolunteers(),
      ]);
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

  const handleAadhaarAction = async (id, status) => {
    setAadhaarLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await verifyAadhaar(id, status);
      toast.success(status === "verified" ? "Aadhaar verified!" : "Aadhaar rejected.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Aadhaar action failed.");
    } finally {
      setAadhaarLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredAll = all.filter((v) =>
    !search ||
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  );

  const statusBadge = (v) => {
    if (v.isBlocked)  return <span className="badge badge-danger">Blocked</span>;
    if (v.isVerified) return <span className="badge badge-success">Verified</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Management</p>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Volunteer Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review applications, verify identities, and manage volunteer access.
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Pending
            {pending.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs rounded-full font-bold">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All Volunteers ({all.length})
          </button>
        </div>

        {tab === "all" && (
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 py-2 text-sm w-64"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {/* ── Pending Tab ── */}
          {tab === "pending" && (
            pending.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiShieldCheck className="text-3xl text-emerald-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">All caught up!</h3>
                <p className="text-sm text-slate-400">No pending volunteer verifications at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((v, i) => (
                  <div
                    key={v._id}
                    className="card p-5 animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Volunteer info row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <HiUser className="text-slate-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{v.name}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <HiPhone className="text-xs" /> {v.phone} &middot; {v.email}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <HiCalendar className="text-xs" />
                            {v.address || "No address"} &middot; Registered {new Date(v.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <button onClick={() => handleVerify(v._id)} className="btn-sm btn-primary gap-1.5">
                          <HiCheck /> Verify
                        </button>
                        <button onClick={() => handleBlock(v._id)} className="btn-sm btn-danger gap-1.5">
                          <HiBan /> Reject
                        </button>
                      </div>
                    </div>

                    {/* Aadhaar section */}
                    {(v.aadhaarNumber || v.aadhaarDocumentUrl) && (
                      <div className="border-t border-slate-100 pt-4 mt-1">
                        <div className="flex items-center gap-2 mb-3">
                          <HiIdentification className="text-primary-500" />
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Aadhaar Verification
                          </span>
                          <AadhaarStatusBadge status={v.aadhaarVerified} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                          {/* Number */}
                          <div className="flex-1 space-y-1">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Aadhaar Number</p>
                            <p className="text-sm font-mono text-slate-700 font-medium tracking-wider">
                              {maskAadhaar(v.aadhaarNumber)}
                            </p>
                            {v.aadhaarNumber && (
                              <p className="text-xs text-slate-400">Full: {v.aadhaarNumber}</p>
                            )}
                          </div>

                          {/* Document */}
                          <div className="flex-1 space-y-1.5">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Document</p>
                            <AadhaarDocPreview url={v.aadhaarDocumentUrl} />
                          </div>
                        </div>

                        {/* Audit trail (if already actioned) */}
                        {v.aadhaarVerified !== "pending" && v.aadhaarVerifiedBy && (
                          <p className="text-xs text-slate-400 mt-3">
                            {v.aadhaarVerified === "verified" ? "Verified" : "Rejected"} by{" "}
                            <span className="font-medium text-slate-600">{v.aadhaarVerifiedBy}</span>
                            {v.aadhaarVerifiedAt && (
                              <> on {new Date(v.aadhaarVerifiedAt).toLocaleString()}</>
                            )}
                          </p>
                        )}

                        {/* Aadhaar action buttons (only when pending) */}
                        {v.aadhaarVerified === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAadhaarAction(v._id, "verified")}
                              disabled={aadhaarLoading[v._id]}
                              className="btn-sm btn-primary gap-1.5 disabled:opacity-60"
                            >
                              {aadhaarLoading[v._id] ? (
                                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiCheckCircle />
                              )}
                              Verify Aadhaar
                            </button>
                            <button
                              onClick={() => handleAadhaarAction(v._id, "rejected")}
                              disabled={aadhaarLoading[v._id]}
                              className="btn-sm btn-danger gap-1.5 disabled:opacity-60"
                            >
                              {aadhaarLoading[v._id] ? (
                                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiXCircle />
                              )}
                              Reject Aadhaar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── All Volunteers Tab ── */}
          {tab === "all" && (
            filteredAll.length === 0 ? (
              <div className="card p-16 text-center">
                <p className="text-slate-400">
                  No volunteers found{search ? ` matching "${search}"` : ""}.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Volunteer", "Contact", "Trust Score", "Rating", "Tasks", "Status", "Aadhaar", "Actions"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAll.map((v, i) => (
                        <tr
                          key={v._id}
                          className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 !== 0 ? "bg-slate-50/20" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <HiUser className="text-slate-400 text-sm" />
                              </div>
                              <span className="font-medium text-slate-800">{v.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{v.phone}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-primary-600">{v.trustScore}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1 text-amber-500 font-medium">
                              <HiStar className="text-xs" /> {v.avgRating?.toFixed(1) || "0.0"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-emerald-600 font-medium">{v.completedTasks}</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-slate-400 text-xs">{v.cancelledTasks} cancelled</span>
                          </td>
                          <td className="px-5 py-3.5">{statusBadge(v)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              <AadhaarStatusBadge status={v.aadhaarVerified || "pending"} />
                              {v.aadhaarNumber && (
                                <span className="text-xs font-mono text-slate-500">
                                  {maskAadhaar(v.aadhaarNumber)}
                                </span>
                              )}
                              {v.aadhaarDocumentUrl && (
                                <a
                                  href={v.aadhaarDocumentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 hover:underline flex items-center gap-0.5"
                                >
                                  View Doc <HiExternalLink className="text-xs" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-1">
                              {!v.isVerified && !v.isBlocked && (
                                <button
                                  onClick={() => handleVerify(v._id)}
                                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold text-left"
                                >
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => handleBlock(v._id)}
                                className="text-xs text-rose-500 hover:text-rose-700 font-semibold text-left"
                              >
                                {v.isBlocked ? "Unblock" : "Block"}
                              </button>
                              {v.aadhaarVerified === "pending" && v.aadhaarNumber && (
                                <>
                                  <button
                                    onClick={() => handleAadhaarAction(v._id, "verified")}
                                    disabled={aadhaarLoading[v._id]}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold text-left disabled:opacity-50"
                                  >
                                    {aadhaarLoading[v._id] ? "…" : "Verify ID"}
                                  </button>
                                  <button
                                    onClick={() => handleAadhaarAction(v._id, "rejected")}
                                    disabled={aadhaarLoading[v._id]}
                                    className="text-xs text-rose-400 hover:text-rose-600 font-semibold text-left disabled:opacity-50"
                                  >
                                    {aadhaarLoading[v._id] ? "…" : "Reject ID"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                  Showing {filteredAll.length} of {all.length} volunteers
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerVerification;
