import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ClientNavbar from "../../components/ClientNavbar";
import API_URL from "../../api";

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects/my`);
        setProjects(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`);
      setProjects((prev) => prev.filter((project) => project._id !== id));
      setMessage("Project deleted successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete project.");
    }
  };

  return (
    <div>
      <ClientNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">My Projects</h1>
          {message && <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-slate-700">{message}</div>}
          <div className="mt-6 space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Link to={`/client/projects/${project._id}`} className="text-xl font-semibold text-slate-900 hover:text-slate-700">{project.title}</Link>
                    <p className="mt-1 text-sm text-slate-600">Status: {project.status} • Bids: {project.totalBids}</p>
                  </div>
                  <div className="flex gap-2">
                    {project.totalBids === 0 && project.status === "open" && (
                      <button onClick={() => handleDelete(project._id)} className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">Delete</button>
                    )}
                    <Link to={`/client/projects/${project._id}`} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">View</Link>
                  </div>
                </div>
              </div>
            ))}
            {!projects.length && <p className="text-slate-600">No projects yet. Post one to receive bids.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
