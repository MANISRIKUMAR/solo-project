import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StudentNavbar from "../../components/StudentNavbar";

export default function Browse() {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", minBudget: "", maxBudget: "", deadline: "" });

  const loadProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects", { params: filters });
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadProjects();
  };

  return (
    <div>
      <StudentNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Browse Open Projects</h1>
              <p className="mt-1 text-slate-600">Search and filter projects by category, budget, and deadline.</p>
            </div>
            <button onClick={loadProjects} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Refresh</button>
          </div>
          <form onSubmit={handleSearch} className="mt-6 grid gap-4 md:grid-cols-5">
            <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search keyword" className="rounded border border-slate-300 px-3 py-2" />
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="rounded border border-slate-300 px-3 py-2">
              <option value="">All Categories</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="ai/ml">AI/ML</option>
              <option value="design">Design</option>
              <option value="data">Data</option>
              <option value="other">Other</option>
            </select>
            <input type="number" value={filters.minBudget} onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })} placeholder="Min budget" className="rounded border border-slate-300 px-3 py-2" />
            <input type="number" value={filters.maxBudget} onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })} placeholder="Max budget" className="rounded border border-slate-300 px-3 py-2" />
            <input type="date" value={filters.deadline} onChange={(e) => setFilters({ ...filters, deadline: e.target.value })} className="rounded border border-slate-300 px-3 py-2" />
            <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Filter</button>
          </form>
          <div className="mt-8 space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="rounded-3xl border border-slate-200 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{project.title}</h2>
                    <p className="mt-2 text-slate-600">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>Budget: ${project.budget.min} - ${project.budget.max}</span>
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link to={`/student/projects/${project._id}`} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">View project</Link>
                </div>
              </div>
            ))}
            {!projects.length && <p className="text-slate-600">No open projects match the current filter.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
