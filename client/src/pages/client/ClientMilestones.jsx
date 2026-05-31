import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ClientNavbar from "../../components/ClientNavbar";
import API_URL from "../../api";

export default function ClientMilestones() {
  const { projectId } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", amount: "", dueDate: "", order: 1 });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/milestones/${projectId}`);
        setMilestones(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/milestones`, {
        projectId,
        ...form,
      });
      setMessage("Milestone created.");
      setForm({ title: "", description: "", amount: "", dueDate: "", order: form.order + 1 });
      const response = await axios.get(`http://localhost:5000/api/milestones/${projectId}`);
      setMilestones(response.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not create milestone.");
    }
  };

  const updateStatus = async (mileId, status) => {
    try {
      await axios.put(`${API_URL}/api/milestones/${mileId}/status`, { status });
      setMessage(`Milestone status updated to ${status}.`);
      setMilestones((prev) => prev.map((milestone) => (milestone._id === mileId ? { ...milestone, status } : milestone)));
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update status.");
    }
  };

  return (
    <div>
      <ClientNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Milestone Tracker</h1>
                <p className="text-slate-600">Manage milestones for the accepted project.</p>
              </div>
              <button onClick={() => navigate(`/client/projects/${projectId}`)} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Back to project</button>
            </div>
            {message && <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-slate-700">{message}</div>}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <form onSubmit={handleCreate} className="rounded-3xl border border-slate-200 p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Create milestone</h2>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
                </label>
                <label className="block mt-4">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
                </label>
                <label className="block mt-4">
                  <span className="text-sm font-medium text-slate-700">Amount</span>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
                </label>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Due Date</span>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Order</span>
                    <input type="number" value={form.order} min="1" onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
                  </label>
                </div>
                <button type="submit" className="mt-6 w-full rounded bg-slate-900 px-4 py-2 text-white">Add milestone</button>
              </form>
              <div className="rounded-3xl border border-slate-200 p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Milestones</h2>
                {milestones.length ? (
                  <div className="space-y-4">
                    {milestones.map((milestone) => (
                      <div key={milestone._id} className="rounded-3xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{milestone.title}</h3>
                            <p className="text-sm text-slate-600">Due {new Date(milestone.dueDate).toLocaleDateString()}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{milestone.status}</span>
                        </div>
                        <p className="mt-3 text-slate-600">Amount: ${milestone.amount}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {milestone.status !== "paid" && (
                            <button onClick={() => updateStatus(milestone._id, milestone.status === "completed" ? "paid" : "completed")} className="rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500">{milestone.status === "completed" ? "Mark paid" : "Mark completed"}</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No milestones configured yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
