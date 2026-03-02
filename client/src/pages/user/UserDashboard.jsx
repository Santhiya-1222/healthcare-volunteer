import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { getMyRequests } from "../../services/requestService";
import { getNearbyVolunteers } from "../../services/volunteerService";
import { reverseGeocode } from "../../utils/geocode";
import { useAuth } from "../../context/AuthContext";
import {
  HiPlus, HiClock, HiCheck, HiExclamation,
  HiRefresh, HiChevronRight, HiClipboardList,
  HiUsers, HiX, HiStar, HiShieldCheck,
  HiLocationMarker, HiArrowRight, HiMap, HiViewList,
} from "react-icons/hi";

/* ── constants ── */
const priorityConfig = {
  emergency: { cls: "badge-danger" },
  urgent:    { cls: "badge-warning" },
  normal:    { cls: "badge-success" },
};

const statusConfig = {
  pending:     { cls: "badge-warning",                       label: "Pending" },
  accepted:    { cls: "badge-primary",                       label: "Accepted" },
  in_progress: { cls: "bg-violet-100 text-violet-700 badge", label: "In Progress" },
  completed:   { cls: "badge-success",                       label: "Completed" },
  cancelled:   { cls: "badge-neutral",                       label: "Cancelled" },
};

const serviceIcons = {
  medicine: "💊", hospital: "🏥", grocery: "🛒", emergency: "🚨", daily_care: "🏠",
};

const REFRESH_INTERVAL = 12000;

/* ── distance formatter ── */
const fmtDist = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
};

/* ── shimmer card ── */
const ShimmerCard = () => (
  <div className="card p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-2/5" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
      </div>
      <div className="w-16 h-7 bg-slate-200 rounded-lg flex-shrink-0" />
    </div>
  </div>
);

/* ── volunteer list card ── */
const VolCard = ({ v, i }) => (
  <div
    className="card p-4 flex items-center gap-4 animate-fade-up"
    style={{ animationDelay: `${i * 50}ms` }}
  >
    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-sm">
      {v.name?.[0]?.toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="font-semibold text-slate-800 text-sm truncate">{v.name}</span>
        <HiShieldCheck className="text-emerald-500 text-xs flex-shrink-0" title="Verified" />
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-0.5">
          <HiLocationMarker className="text-slate-400" />
          {fmtDist(v.distanceMeters)}
        </span>
        <span className="flex items-center gap-0.5">
          <HiStar className="text-amber-400" />
          {v.avgRating?.toFixed(1) || "0.0"}
        </span>
        <span className="text-emerald-600 font-medium">{v.completedTasks} done</span>
      </div>
    </div>
    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
      <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-lg">
        {v.trustScore} pts
      </span>
      <Link
        to="/user/create-request"
        className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5"
      >
        Request <HiArrowRight className="text-xs" />
      </Link>
    </div>
  </div>
);

/* ── Google Maps view ── */
const MAP_CONTAINER = { width: "100%", height: "100%" };
const MAP_OPTIONS   = { disableDefaultUI: true, zoomControl: true, clickableIcons: false };

const VolunteerMap = ({ volunteers, userCoords }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });
  const [selected, setSelected] = useState(null);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <HiMap className="text-4xl text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-700 mb-1">Google Maps API key missing</p>
        <p className="text-xs text-slate-400">
          Add <code className="bg-slate-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to{" "}
          <code className="bg-slate-100 px-1 rounded">client/.env</code> and restart the dev server.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER}
      center={{ lat: userCoords.lat, lng: userCoords.lon }}
      zoom={13}
      options={MAP_OPTIONS}
    >
      {/* User location — blue pin */}
      <Marker
        position={{ lat: userCoords.lat, lng: userCoords.lon }}
        title="Your location"
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#0891b2",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        }}
      />

      {/* Volunteer pins */}
      {volunteers.map((v) => {
        const coords = v.location?.coordinates;
        if (!coords) return null;
        const pos = { lat: coords[1], lng: coords[0] };
        return (
          <Marker
            key={v._id}
            position={pos}
            title={v.name}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#10b981",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            }}
            onClick={() => setSelected(v)}
          />
        );
      })}

      {/* Info window on volunteer click */}
      {selected && selected.location?.coordinates && (
        <InfoWindow
          position={{
            lat: selected.location.coordinates[1],
            lng: selected.location.coordinates[0],
          }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="text-sm min-w-[140px]">
            <p className="font-semibold text-slate-800 mb-1">{selected.name}</p>
            <p className="text-slate-500 text-xs mb-0.5">
              ⭐ {selected.avgRating?.toFixed(1) || "0.0"} · {selected.completedTasks} tasks done
            </p>
            <p className="text-slate-500 text-xs mb-2">
              📍 {fmtDist(selected.distanceMeters)}
            </p>
            <a
              href="/user/create-request"
              className="text-xs text-primary-600 font-semibold hover:underline"
            >
              Request this volunteer →
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

/* ── slide-over panel ── */
const VolunteerPanel = ({ open, onClose, storedCoords }) => {
  const [volunteers,   setVolunteers]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [lastRefresh,  setLastRefresh]  = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [address,      setAddress]      = useState("");
  const [gpsLoading,   setGpsLoading]   = useState(false);
  const [viewMode,     setViewMode]     = useState("list"); // "list" | "map"
  const intervalRef = useRef(null);

  const fetchVolunteers = useCallback(async (coords) => {
    const c = coords || activeCoords;
    if (!c) return;
    setLoading((prev) => (volunteers.length === 0 ? true : prev));
    try {
      const res = await getNearbyVolunteers(c.lat, c.lon, 10000);
      setVolunteers(res.data.volunteers || []);
      setLastRefresh(new Date());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeCoords, volunteers.length]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    setAddress("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords = { lat, lon };
        setActiveCoords(coords);
        try {
          const addr = await reverseGeocode(lat, lon);
          setAddress(addr);
        } catch {
          setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
        setGpsLoading(false);
        setVolunteers([]);
        setLoading(true);
        fetchVolunteers(coords);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* on open: use stored coords or prompt GPS */
  useEffect(() => {
    if (!open) {
      clearInterval(intervalRef.current);
      return;
    }
    setVolunteers([]);
    setLastRefresh(null);
    setViewMode("list");

    if (storedCoords) {
      setActiveCoords(storedCoords);
      setLoading(true);
      reverseGeocode(storedCoords.lat, storedCoords.lon)
        .then(setAddress)
        .catch(() => setAddress(`${storedCoords.lat.toFixed(4)}, ${storedCoords.lon.toFixed(4)}`));
      fetchVolunteers(storedCoords);
      intervalRef.current = setInterval(() => fetchVolunteers(storedCoords), REFRESH_INTERVAL);
    } else {
      setActiveCoords(null);
      setAddress("");
      setLoading(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [open]); // eslint-disable-line

  /* restart interval when GPS updates activeCoords */
  useEffect(() => {
    if (!open || !activeCoords) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchVolunteers(activeCoords), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [activeCoords]); // eslint-disable-line

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 bg-white border-l border-slate-200 flex flex-col
          transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-slate-900 text-lg tracking-tight">
              Nearby Volunteers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lastRefresh
                ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : activeCoords ? "Searching within 10 km…" : "Select a location to begin"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Location bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 space-y-2">
          <div className="flex items-start gap-2">
            <HiLocationMarker className="text-primary-500 text-base flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed flex-1 min-w-0 truncate">
              {address || (activeCoords ? "Resolving address…" : "No location selected")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* GPS button */}
            <button
              onClick={handleUseGPS}
              disabled={gpsLoading}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Locating…
                </>
              ) : (
                <>
                  <HiLocationMarker className="text-xs" />
                  Use Current GPS
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              {/* Live indicator + manual refresh */}
              {activeCoords && (
                <>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Live · 12 s
                  </span>
                  <button
                    onClick={() => fetchVolunteers()}
                    disabled={loading}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 disabled:opacity-40"
                  >
                    <HiRefresh className={loading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </>
              )}

              {/* List / Map toggle — only show when we have results */}
              {volunteers.length > 0 && (
                <div className="flex items-center gap-0.5 bg-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === "list" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                    }`}
                    title="List view"
                  >
                    <HiViewList className="text-sm" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === "map" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                    }`}
                    title="Map view"
                  >
                    <HiMap className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={viewMode === "map" ? { padding: 0, overflow: "hidden" } : {}}>
          {!activeCoords ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiLocationMarker className="text-3xl text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Location required</h3>
              <p className="text-sm text-slate-400 mb-5">
                No saved location found. Tap below to use your current GPS location.
              </p>
              <button
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="btn-md btn-primary inline-flex disabled:opacity-60"
              >
                {gpsLoading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Locating…</>
                  : <><HiLocationMarker /> Use My Location</>
                }
              </button>
            </div>
          ) : loading ? (
            <>{[0, 1, 2].map((k) => <ShimmerCard key={k} />)}</>
          ) : volunteers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiUsers className="text-3xl text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">No volunteers nearby</h3>
              <p className="text-sm text-slate-400 mb-5">
                No verified volunteers found within 10 km. Try refreshing or use a different location.
              </p>
              <button onClick={() => fetchVolunteers()} className="btn-md btn-secondary inline-flex">
                <HiRefresh /> Try Again
              </button>
            </div>
          ) : viewMode === "map" ? (
            <VolunteerMap volunteers={volunteers} userCoords={activeCoords} />
          ) : (
            volunteers.map((v, i) => <VolCard key={v._id} v={v} i={i} />)
          )}
        </div>

        {/* Footer */}
        {!loading && volunteers.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""} found nearby
            </span>
            <Link
              to="/user/create-request"
              onClick={onClose}
              className="btn-sm btn-primary"
            >
              <HiPlus /> New Request
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   Main Dashboard
══════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [panelOpen, setPanelOpen]       = useState(false);

  const userCoords = (() => {
    const coords = user?.location?.coordinates;
    if (!coords || coords[0] === 0) return null;
    return { lat: coords[1], lon: coords[0] };
  })();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.data.requests);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const active    = requests.filter((r) => ["pending", "accepted", "in_progress"].includes(r.status));
  const completed = requests.filter((r) => r.status === "completed");

  const filtered =
    activeFilter === "active"    ? active :
    activeFilter === "completed" ? completed :
    activeFilter === "cancelled" ? requests.filter((r) => r.status === "cancelled") :
    requests;

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
              {user?.name || "My Dashboard"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track all your service requests.</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setPanelOpen(true)}
              className="btn-lg btn-secondary flex items-center gap-2"
            >
              <HiUsers /> Find Volunteers
            </button>
            <Link to="/user/create-request" className="btn-lg btn-primary">
              <HiPlus /> New Request
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Requests", value: requests.length,  icon: HiClock,       color: "text-blue-600",    bg: "bg-blue-50",    filter: "all" },
            { label: "Active",         value: active.length,    icon: HiExclamation, color: "text-amber-600",   bg: "bg-amber-50",   filter: "active" },
            { label: "Completed",      value: completed.length, icon: HiCheck,       color: "text-emerald-600", bg: "bg-emerald-50", filter: "completed" },
            { label: "Recurring",      value: null,             icon: HiRefresh,     color: "text-violet-600",  bg: "bg-violet-50",  link: "/user/recurring" },
          ].map((stat, i) => {
            const Icon    = stat.icon;
            const Wrapper = stat.link ? Link : "button";
            const props   = stat.link
              ? { to: stat.link }
              : { onClick: () => stat.filter && setActiveFilter(stat.filter) };

            return (
              <Wrapper
                key={i}
                {...props}
                className={`card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft animate-fade-up ${
                  stat.filter && activeFilter === stat.filter ? "ring-2 ring-primary-300" : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`text-lg ${stat.color}`} />
                </div>
                {stat.value !== null ? (
                  <p className="text-2xl font-bold font-display text-slate-900">{stat.value}</p>
                ) : (
                  <p className="text-sm font-semibold text-primary-600">Manage →</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </Wrapper>
            );
          })}
        </div>

        {/* Nearby Volunteers CTA */}
        <div
          className="card p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-primary-500 cursor-pointer hover:shadow-soft transition-all"
          onClick={() => setPanelOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <HiUsers className="text-primary-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Volunteers Near You</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {userCoords
                  ? "See verified volunteers on a live map within 10 km."
                  : "View all verified volunteers who can help you."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-600 font-semibold flex-shrink-0">
            <HiMap /> Find on Map <HiChevronRight />
          </div>
        </div>

        {/* Section header + filter pills */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">My Requests</h2>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {["all", "active", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                  activeFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Request List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiClipboardList className="text-3xl text-primary-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No requests here</h3>
            <p className="text-sm text-slate-400 mb-5">
              {activeFilter === "all"
                ? "Create your first service request to get started."
                : `No ${activeFilter} requests found.`}
            </p>
            {activeFilter === "all" && (
              <Link to="/user/create-request" className="btn-md btn-primary inline-flex">
                <HiPlus /> Create Request
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r, i) => (
              <div
                key={r._id}
                className="card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                  r.priority === "emergency" ? "bg-red-50" :
                  r.priority === "urgent"    ? "bg-amber-50" : "bg-emerald-50"
                }`}>
                  {serviceIcons[r.serviceType] || "📋"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 capitalize">
                      {r.serviceType.replace("_", " ")}
                    </span>
                    <span className={`badge ${priorityConfig[r.priority]?.cls}`}>{r.priority}</span>
                    <span className={`badge ${statusConfig[r.status]?.cls}`}>
                      {statusConfig[r.status]?.label || r.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{r.description}</p>
                  {r.volunteerId && (
                    <p className="text-xs text-slate-400 mt-1">
                      Volunteer: <span className="text-primary-600 font-medium">{r.volunteerId.name}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/user/track/${r._id}`} className="btn-sm btn-secondary">
                    Track <HiChevronRight className="text-xs" />
                  </Link>
                  {r.status === "completed" && !r.feedback?.rating && (
                    <Link
                      to={`/user/feedback/${r._id}`}
                      className="btn-sm bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 rounded-xl font-semibold text-sm inline-flex items-center gap-1 px-4 py-2 transition-colors"
                    >
                      Rate ★
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over volunteer panel */}
      <VolunteerPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        storedCoords={userCoords}
      />
    </>
  );
};

export default UserDashboard;
