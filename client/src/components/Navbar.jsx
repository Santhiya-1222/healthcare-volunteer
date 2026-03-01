import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiMenu, HiX, HiHeart, HiLogout, HiViewGrid } from "react-icons/hi";
import NotificationBell from "./NotificationBell";

const roleColors = {
  admin:     "bg-purple-100 text-purple-700",
  volunteer: "bg-emerald-100 text-emerald-700",
  user:      "bg-primary-100 text-primary-700",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardLink = user
    ? user.role === "admin"     ? "/admin/dashboard"
    : user.role === "volunteer" ? "/volunteer/dashboard"
    : "/user/dashboard"
    : "/";

  const navLink = "text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors duration-150";
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-soft border-b border-slate-100" : "bg-white shadow-soft-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to={dashboardLink} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center group-hover:shadow-glow transition-shadow duration-300">
              <HiHeart className="text-white text-base" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg tracking-tight">
              Health<span className="text-primary-600">Care</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className={`${navLink} px-3 py-1.5 rounded-lg hover:bg-slate-50`}>Sign in</Link>
                <Link to="/register" className="btn-md btn-primary ml-1">Get Started</Link>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link to={dashboardLink} className={`${navLink} flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${isActive(dashboardLink) ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50"}`}>
                  <HiViewGrid className="text-base" /> Dashboard
                </Link>
                {user.role === "user" && <>
                  <Link to="/user/create-request" className={`${navLink} rounded-lg px-3 py-1.5 ${isActive("/user/create-request") ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50"}`}>New Request</Link>
                  <Link to="/user/recurring" className={`${navLink} rounded-lg px-3 py-1.5 ${isActive("/user/recurring") ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50"}`}>Recurring</Link>
                </>}
                {user.role === "admin" && <>
                  <Link to="/admin/volunteers" className={`${navLink} rounded-lg px-3 py-1.5 ${isActive("/admin/volunteers") ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50"}`}>Volunteers</Link>
                  <Link to="/admin/requests" className={`${navLink} rounded-lg px-3 py-1.5 ${isActive("/admin/requests") ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50"}`}>Requests</Link>
                </>}
                <div className="w-px h-5 bg-slate-200 mx-2" />
                <NotificationBell />
                <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-100">
                  <div className="w-8 h-8 bg-hero-gradient rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <span className={`text-xs px-1.5 py-px rounded-full font-semibold capitalize ${roleColors[user.role] || "bg-slate-100 text-slate-600"}`}>{user.role}</span>
                  </div>
                  <button onClick={handleLogout} title="Sign out" className="ml-1 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors duration-150">
                    <HiLogout className="text-base" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Toggle menu">
            {open ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-1 animate-slide-down shadow-soft-lg">
          {!user ? (
            <>
              <Link to="/login"    className="flex py-2.5 px-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-sm transition">Sign in</Link>
              <Link to="/register" className="flex py-2.5 px-3 text-primary-700 bg-primary-50 rounded-xl font-semibold text-sm">Get Started</Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 py-3 px-3 mb-1 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 bg-hero-gradient rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <span className={`text-xs px-2 py-px rounded-full font-medium capitalize ${roleColors[user.role] || "bg-slate-100 text-slate-600"}`}>{user.role}</span>
                </div>
              </div>
              <Link to={dashboardLink} className="flex items-center gap-2 py-2.5 px-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition"><HiViewGrid /> Dashboard</Link>
              {user.role === "user" && <>
                <Link to="/user/create-request" className="block py-2.5 px-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">New Request</Link>
                <Link to="/user/recurring"      className="block py-2.5 px-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">Recurring</Link>
              </>}
              {user.role === "admin" && <>
                <Link to="/admin/volunteers" className="block py-2.5 px-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">Volunteers</Link>
                <Link to="/admin/requests"   className="block py-2.5 px-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition">Requests</Link>
              </>}
              <div className="pt-1 border-t border-slate-100 mt-1">
                <button onClick={handleLogout} className="flex items-center gap-2 w-full py-2.5 px-3 text-rose-500 hover:bg-rose-50 rounded-xl text-sm font-medium transition">
                  <HiLogout /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
