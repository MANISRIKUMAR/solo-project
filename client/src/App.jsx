import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientPostProject from "./pages/client/ClientPostProject";
import ClientProjects from "./pages/client/ClientProjects";
import ClientProjectDetail from "./pages/client/ClientProjectDetail";
import ClientMilestones from "./pages/client/ClientMilestones";
import StudentDashboard from "./pages/student/StudentDashboard";
import Browse from "./pages/student/Browse";
import ProjectDetail from "./pages/student/ProjectDetail";
import MyBids from "./pages/student/MyBids";
import StudentProfile from "./pages/student/StudentProfile";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children, role, redirectTo }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    // Reset any stuck overflow-hidden style from Razorpay or other modal frameworks
    document.body.style.overflow = "unset";
    document.documentElement.style.overflow = "unset";
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/client/dashboard"
        element={<ProtectedRoute role="client" redirectTo="/student/dashboard"><ClientDashboard /></ProtectedRoute>}
      />
      <Route
        path="/client/post-project"
        element={<ProtectedRoute role="client" redirectTo="/student/dashboard"><ClientPostProject /></ProtectedRoute>}
      />
      <Route
        path="/client/projects"
        element={<ProtectedRoute role="client" redirectTo="/student/dashboard"><ClientProjects /></ProtectedRoute>}
      />
      <Route
        path="/client/projects/:id"
        element={<ProtectedRoute role="client" redirectTo="/student/dashboard"><ClientProjectDetail /></ProtectedRoute>}
      />
      <Route
        path="/client/milestones/:projectId"
        element={<ProtectedRoute role="client" redirectTo="/student/dashboard"><ClientMilestones /></ProtectedRoute>}
      />
      <Route
        path="/student/dashboard"
        element={<ProtectedRoute role="student" redirectTo="/client/dashboard"><StudentDashboard /></ProtectedRoute>}
      />
      <Route
        path="/student/browse"
        element={<ProtectedRoute role="student" redirectTo="/client/dashboard"><Browse /></ProtectedRoute>}
      />
      <Route
        path="/student/projects/:id"
        element={<ProtectedRoute role="student" redirectTo="/client/dashboard"><ProjectDetail /></ProtectedRoute>}
      />
      <Route
        path="/student/my-bids"
        element={<ProtectedRoute role="student" redirectTo="/client/dashboard"><MyBids /></ProtectedRoute>}
      />
      <Route
        path="/student/profile"
        element={<ProtectedRoute role="student" redirectTo="/client/dashboard"><StudentProfile /></ProtectedRoute>}
      />
      <Route
        path="/chat/:projectId/:partnerId"
        element={<ProtectedRoute><Chat /></ProtectedRoute>}
      />
      <Route
        path="/chat"
        element={<ProtectedRoute><Chat /></ProtectedRoute>}
      />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
