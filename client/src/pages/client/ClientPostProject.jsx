import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClientNavbar from "../../components/ClientNavbar";
import API_URL from "../../api";

export default function ClientPostProject() {
  const [form, setForm] = useState({ title: "", description: "", minBudget: "", maxBudget: "", deadline: "", skills: "", category: "web" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const maxDeadline = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const min = Number(form.minBudget);
    const max = Number(form.maxBudget);
    if (min <= 0 || max <= 0) {
      setMessage("Budget values must be greater than $0.");
      return;
    }
    if (min > max) {
      setMessage("Min budget cannot be greater than max budget.");
      return;
    }
    if (!form.deadline || form.deadline < today) {
      setMessage("Deadline must be today or a future date.");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/projects`, {
        title: form.title,
        description: form.description,
        budget: { min: Number(form.minBudget), max: Number(form.maxBudget) },
        deadline: form.deadline,
        skills: form.skills.split(",").map((skill) => skill.trim()),
        category: form.category,
      });
      setMessage("Project posted successfully.");
      navigate("/client/projects");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not post project.");
    }
  };

  return (
    <div>
      <ClientNavbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-8 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">Post a New Project</h1>
          {message && <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-slate-700">{message}</div>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" rows="5" required />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Min Budget ($)</span>
                <input type="number" value={form.minBudget} onChange={(e) => setForm({ ...form, minBudget: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" min="1" step="1" required />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Max Budget ($)</span>
                <input type="number" value={form.maxBudget} onChange={(e) => setForm({ ...form, maxBudget: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" min="1" step="1" required />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Deadline</span>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" min={today} max={maxDeadline} required />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="ai/ml">AI/ML</option>
                  <option value="design">Design</option>
                  <option value="data">Data</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Skills Needed</span>
              <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, UI Design" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
            </label>
            <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Submit Project</button>
          </form>
        </div>
      </main>
    </div>
  );
}
