import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const activeClass = "text-white bg-slate-900";
const inactiveClass = "text-slate-700 hover:text-slate-900";

export default function StudentNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="text-lg font-semibold text-slate-900">Student Portal</div>
          <NavLink to="/student/dashboard" className={({ isActive }) => isActive ? activeClass + " px-3 py-2 rounded" : inactiveClass + " px-3 py-2 rounded"}>Dashboard</NavLink>
          <NavLink to="/student/browse" className={({ isActive }) => isActive ? activeClass + " px-3 py-2 rounded" : inactiveClass + " px-3 py-2 rounded"}>Browse</NavLink>
          <NavLink to="/student/my-bids" className={({ isActive }) => isActive ? activeClass + " px-3 py-2 rounded" : inactiveClass + " px-3 py-2 rounded"}>My Bids</NavLink>
          <NavLink to="/student/profile" className={({ isActive }) => isActive ? activeClass + " px-3 py-2 rounded" : inactiveClass + " px-3 py-2 rounded"}>Portfolio</NavLink>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Logout</button>
      </div>
    </nav>
  );
}
