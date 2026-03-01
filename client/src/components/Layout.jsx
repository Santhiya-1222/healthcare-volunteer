import Navbar from "./Navbar";
import { HiHeart, HiMail, HiPhone } from "react-icons/hi";
import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                  <HiHeart className="text-white text-base" />
                </div>
                <span className="font-display font-bold text-white text-lg">Health<span className="text-primary-400">Care</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                OTP-secured volunteer network connecting those in need with verified caregivers nearby.
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><HiMail className="text-primary-400" /> support@healthcare.com</div>
                <div className="flex items-center gap-2"><HiPhone className="text-primary-400" /> 9999999999 (Demo)</div>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                {[["Home", "/"], ["Login", "/login"], ["Register", "/register"]].map(([label, path]) => (
                  <li key={label}><Link to={path} className="hover:text-primary-400 transition">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Roles */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Roles</h4>
              <ul className="space-y-2.5 text-sm">
                <li>User — Request services</li>
                <li>Volunteer — Accept tasks</li>
                <li>Admin — Manage platform</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>HealthCare Volunteer Network &copy; {new Date().getFullYear()} — All rights reserved.</p>
            <p>OTP-Based Secure Volunteer System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
