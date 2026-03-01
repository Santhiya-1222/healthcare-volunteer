import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/UserDashboard";
import CreateRequest from "./pages/user/CreateRequest";
import TrackRequest from "./pages/user/TrackRequest";
import FeedbackForm from "./pages/user/FeedbackForm";
import RecurringSchedule from "./pages/user/RecurringSchedule";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import TaskDetail from "./pages/volunteer/TaskDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VolunteerVerification from "./pages/admin/VolunteerVerification";
import RequestManagement from "./pages/admin/RequestManagement";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/create-request" element={<ProtectedRoute role="user"><CreateRequest /></ProtectedRoute>} />
        <Route path="/user/track/:id" element={<ProtectedRoute role="user"><TrackRequest /></ProtectedRoute>} />
        <Route path="/user/feedback/:id" element={<ProtectedRoute role="user"><FeedbackForm /></ProtectedRoute>} />
        <Route path="/user/recurring" element={<ProtectedRoute role="user"><RecurringSchedule /></ProtectedRoute>} />

        {/* Volunteer Routes */}
        <Route path="/volunteer/dashboard" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/volunteer/task/:id" element={<ProtectedRoute role="volunteer"><TaskDetail /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/volunteers" element={<ProtectedRoute role="admin"><VolunteerVerification /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute role="admin"><RequestManagement /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
