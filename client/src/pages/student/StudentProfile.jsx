import { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", bio: "", skills: "", portfolio: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/me/profile");
        setProfile(response.data);
        setForm({
          name: response.data.name || "",
          bio: response.data.bio || "",
          skills: (response.data.skills || []).join(", "),
          portfolio: JSON.stringify(response.data.portfolio || [], null, 2),
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/users/profile", {
        name: form.name,
        bio: form.bio,
        skills: form.skills,
        portfolio: form.portfolio,
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update profile.");
    }
  };

  return (
    <div>
      <StudentNavbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Portfolio Profile</h1>
              <p className="text-slate-600">Manage your student profile, skills, and portfolio entries.</p>
            </div>
          </div>
          {message && <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-slate-700">{message}</div>}
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Bio</span>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="4" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Skills</span>
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Portfolio JSON</span>
                <textarea value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} rows="6" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
              </label>
              <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Save profile</button>
            </form>
            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Stats</h2>
              {profile ? (
                <div className="mt-4 space-y-3 text-slate-600">
                  <p>Rating: {profile.averageRating || 0} ⭐</p>
                  <p>Completed Projects: {profile.completedProjects || 0}</p>
                  <p>Total Earnings: ${profile.totalEarnings || 0}</p>
                  <div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">Reviews</h3>
                    <div className="mt-2 space-y-2">
                      {profile.reviews?.length ? profile.reviews.map((review, index) => (
                        <div key={index} className="rounded-3xl bg-slate-50 p-3">
                          <p className="text-sm text-slate-700">{review.comment}</p>
                          <p className="mt-1 text-xs text-slate-500">Rating: {review.rating} • {new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      )) : <p className="text-sm text-slate-500">No reviews yet.</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading profile...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
