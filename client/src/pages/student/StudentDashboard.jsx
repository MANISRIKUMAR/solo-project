import { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../../components/StudentNavbar";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [bidsRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/bids/my`),
          axios.get(`${API_URL}/api/users/${user.id}/profile`),
        ]);
        setBids(bidsRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user.id]);

  const bidsSent = bids.length;
  const bidsWon = bids.filter((bid) => bid.status === "accepted").length;
  const earnings = profile?.totalEarnings ?? 0;
  const activeProjects = bids.filter((bid) => bid.status === "accepted").length;

  return (
    <div>
      <StudentNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Bids sent</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{bidsSent}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Bids won</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{bidsWon}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Earnings</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">${earnings}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Active projects</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{activeProjects}</p>
          </div>
        </div>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-900">Your Recent Bids</h2>
          <div className="mt-4 space-y-4">
            {bids.slice(0, 5).map((bid) => (
              <div key={bid._id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{bid.project?.title || "Project"}</p>
                    <p className="text-sm text-slate-600">Amount: ${bid.amount} • Status: {bid.status}</p>
                  </div>
                </div>
              </div>
            ))}
            {!bids.length && <p className="text-slate-600">No bids submitted yet. Browse open projects to place a bid.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
