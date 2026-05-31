import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import ClientNavbar from "../../components/ClientNavbar";
import API_URL from "../../api";

export default function ClientProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [projectRes, bidsRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects/${id}`),
          axios.get(`${API_URL}/api/bids/project/${id}`),
        ]);
        setProject(projectRes.data);
        setBids(bidsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    try {
      // 1. Create Razorpay Order on the backend (24% advance fee)
      const response = await axios.post(`${API_URL}/api/payments/create-order`, { bidId });
      const { orderId, amount, currency, advanceAmount, keyId } = response.data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Freelance Bid Portal",
        description: `24% Advance Payment for accepted bid (₹${advanceAmount})`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify signature and accept bid on the backend
            await axios.post(`${API_URL}/api/payments/verify-payment`, {
              bidId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setMessage("Payment verified and bid accepted successfully!");
            
            // 4. Update local state
            setProject((prev) => ({ ...prev, status: "in-progress", selectedBid: bidId }));
            setBids((prev) =>
              prev.map((bid) =>
                bid._id === bidId
                  ? { ...bid, status: "accepted" }
                  : bid.status === "pending"
                  ? { ...bid, status: "rejected" }
                  : bid
              )
            );
          } catch (verifyErr) {
            console.error(verifyErr);
            setMessage(verifyErr.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: project?.postedBy?.name || "",
          email: project?.postedBy?.email || "",
        },
        theme: {
          color: "#4f46e5", // Indigo theme color
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to initiate payment.");
    }
  };

  const handleAction = async (bidId, action) => {
    if (action === "accept") {
      await handleAcceptBid(bidId);
      return;
    }
    try {
      await axios.put(`${API_URL}/api/bids/${bidId}/${action}`);
      setMessage(`Bid ${action}ed successfully.`);
      setBids((prev) => prev.map((bid) => bid._id === bidId ? { ...bid, status: "rejected" } : bid));
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div>
      <ClientNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          {project ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
                  <p className="mt-2 text-slate-600">{project.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span>Budget: ${project.budget.min} - ${project.budget.max}</span>
                    <span>Category: {project.category}</span>
                    <span>Status: {project.status}</span>
                  </div>
                </div>
                <Link to={`/client/milestones/${project._id}`} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Milestones</Link>
              </div>
              {message && <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-slate-700">{message}</div>}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-900">Bids Received</h2>
                {bids.length ? (
                  <div className="mt-4 space-y-4">
                    {bids.map((bid) => (
                      <div key={bid._id} className="rounded-3xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{bid.bidder.name}</h3>
                            <p className="text-sm text-slate-600">{bid.bidder.bio || "Student bidder"}</p>
                            <p className="mt-2 text-sm text-slate-600">Amount: ${bid.amount} • Delivery: {bid.deliveryDays} days</p>
                          </div>
                          <div className="text-sm text-slate-700">Status: {bid.status}</div>
                        </div>
                        <p className="mt-4 text-slate-600">{bid.proposal}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {bid.status === "pending" && (
                            <>
                              <button onClick={() => handleAction(bid._id, "accept")} className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Accept</button>
                              <button onClick={() => handleAction(bid._id, "reject")} className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">Reject</button>
                            </>
                          )}
                          <Link
                            to={`/chat/${project._id}/${bid.bidder._id || bid.bidder}`}
                            className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition duration-150"
                          >
                            💬 Chat
                          </Link>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Portfolio preview unavailable</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-slate-600">No bids have been received yet.</p>
                )}
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
