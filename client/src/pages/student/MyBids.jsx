import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StudentNavbar from "../../components/StudentNavbar";
import API_URL from "../../api";

export default function MyBids() {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bids/my`);
        setBids(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <StudentNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">My Bids</h1>
          <div className="mt-6 space-y-4">
            {bids.map((bid) => (
              <div key={bid._id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Link to={`/student/projects/${bid.project?._id}`} className="text-lg font-semibold text-slate-900 hover:text-slate-700">{bid.project?.title || "Project"}</Link>
                    <p className="mt-1 text-sm text-slate-600">Amount: ${bid.amount} • Delivery: {bid.deliveryDays} days</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{bid.status}</span>
                </div>
                <p className="mt-3 text-slate-600">{bid.proposal}</p>
                {bid.project?.postedBy && (
                  <div className="mt-4">
                    <Link
                      to={`/chat/${bid.project._id}/${bid.project.postedBy._id || bid.project.postedBy}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition duration-150"
                    >
                      💬 Chat with Client
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {!bids.length && <p className="text-slate-600">You have not placed any bids yet.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
