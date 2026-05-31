import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import StudentNavbar from "../../components/StudentNavbar";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [myBid, setMyBid] = useState(null);
  const [form, setForm] = useState({ amount: "", deliveryDays: "", proposal: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [projectRes, bidsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`),
        axios.get("http://localhost:5000/api/bids/my"),
      ]);
      setProject(projectRes.data);
      const existing = bidsRes.data.find((bid) => bid.project?._id === id);
      if (existing) {
        setMyBid(existing);
        setForm({ amount: existing.amount, deliveryDays: existing.deliveryDays, proposal: existing.proposal });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    const deliveryDays = Number(form.deliveryDays);
    if (amount <= 0) {
      setMessage("Bid amount must be greater than $0.");
      return;
    }
    if (deliveryDays < 1 || deliveryDays > 365) {
      setMessage("Delivery days must be between 1 and 365.");
      return;
    }
    try {
      if (myBid) {
        await axios.put(`http://localhost:5000/api/bids/${myBid._id}`, form);
        setMessage("Bid updated successfully.");
      } else {
        await axios.post("http://localhost:5000/api/bids", {
          projectId: id,
          ...form,
        });
        setMessage("Bid submitted successfully.");
      }
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit bid.");
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/bids/${myBid._id}`);
      setMessage("Bid withdrawn.");
      setMyBid(null);
      setForm({ amount: "", deliveryDays: "", proposal: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not withdraw bid.");
    }
  };

  return (
    <div>
      <StudentNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          {project ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
                <p className="mt-2 text-slate-600">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>Budget: ${project.budget.min} - ${project.budget.max}</span>
                  <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  <span>Category: {project.category}</span>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Bid Information</h2>
                  {message && <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-slate-700">{message}</div>}
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Your Amount</span>
                      <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" min="1" step="1" required />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Delivery days</span>
                      <input type="number" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" min="1" max="365" step="1" required />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Proposal</span>
                      <textarea value={form.proposal} onChange={(e) => setForm({ ...form, proposal: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" rows="5" required />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">{myBid ? "Update Bid" : "Submit Bid"}</button>
                      {myBid && <button type="button" onClick={handleWithdraw} className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">Withdraw Bid</button>}
                    </div>
                  </form>
                </div>
                <div className="rounded-3xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Project details</h2>
                  <p className="mt-4 text-slate-600">Skills needed: {project.skills.join(", ")}</p>
                  <p className="mt-2 text-slate-600">Total bids: {project.totalBids}</p>
                  <p className="mt-2 text-slate-600">Project posted by: {project.postedBy?.name || "Client"}</p>
                </div>
              </div>
            </>
          ) : (
            <p>Loading project...</p>
          )}
        </div>
      </main>
    </div>
  );
}
