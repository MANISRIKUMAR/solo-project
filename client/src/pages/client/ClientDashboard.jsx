import { useEffect, useState } from "react";
import axios from "axios";
import ClientNavbar from "../../components/ClientNavbar";
import API_URL from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects/my`),
          axios.get(`${API_URL}/api/users/${user.id}/profile`),
        ]);
        setProjects(projectsRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user.id]);

  const activeProjects = projects.filter((project) => project.status !== "completed" && project.status !== "cancelled").length;
  const pendingBids = projects.reduce((sum, project) => sum + (project.status === "open" ? project.totalBids : 0), 0);
  const totalSpent = profile?.totalSpent ?? 0;

  return (
    <div>
      <ClientNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Active projects</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{activeProjects}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Pending bids</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{pendingBids}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Total spent</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">${totalSpent}</p>
          </div>
        </div>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your Recent Projects</h2>
              <p className="mt-1 text-sm text-slate-600">Projects posted on your account</p>
            </div>
            <button onClick={() => navigate("/client/post-project")} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Post New Project</button>
          </div>
          <div className="mt-6 space-y-4">
            {projects.slice(0, 4).map((project) => (
              <div key={project._id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-600">Status: {project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.status === "in-progress" && project.selectedBid?.bidder && (
                      <button
                        onClick={() => navigate(`/chat/${project._id}/${project.selectedBid.bidder._id || project.selectedBid.bidder}`)}
                        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 text-sm font-semibold transition"
                      >
                        💬 Chat
                      </button>
                    )}
                    <button onClick={() => navigate(`/client/projects/${project._id}`)} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">View</button>
                  </div>
                </div>
              </div>
            ))}
            {!projects.length && <p className="text-slate-600">No projects posted yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
