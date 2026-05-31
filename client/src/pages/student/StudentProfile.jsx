import { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../../components/StudentNavbar";
import ClientNavbar from "../../components/ClientNavbar";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../api";

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
    portfolio: "",
    companyName: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/me/profile`);
        setProfile(response.data);
        setForm({
          name: response.data.name || "",
          bio: response.data.bio || "",
          skills: (response.data.skills || []).join(", "),
          portfolio: JSON.stringify(response.data.portfolio || [], null, 2),
          companyName: response.data.companyName || "",
        });
        if (response.data.profilePhoto) {
          const photoUrl = response.data.profilePhoto.startsWith("http")
            ? response.data.profilePhoto
            : `${API_URL}${response.data.profilePhoto}`;
          setPhotoPreview(photoUrl);
        }
      } catch (err) {
        console.error("Could not fetch profile info:", err);
      }
    };
    load();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", form.name);

    if (user?.role === "student") {
      formData.append("bio", form.bio);
      formData.append("skills", form.skills);
      formData.append("portfolio", form.portfolio);
    } else if (user?.role === "client") {
      formData.append("companyName", form.companyName);
    }

    if (photoFile) {
      formData.append("profilePhoto", photoFile);
    }

    try {
      const res = await axios.put(`${API_URL}/api/users/profile`, formData);

      // Synchronize changes to local storage so the navbar avatar updates instantly
      const stored = localStorage.getItem("freelanceUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.name = res.data.name;
        parsed.profilePhoto = res.data.profilePhoto;
        localStorage.setItem("freelanceUser", JSON.stringify(parsed));
      }

      setMessage("Profile updated successfully!");
      
      // Short delay before refresh to allow users to see success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update profile details.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dynamic Navbar based on user role */}
      {user?.role === "client" ? <ClientNavbar /> : <StudentNavbar />}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Profile Configuration
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage your public profile identity, contact information, and roles.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 capitalize">
              Account Role: {user?.role}
            </span>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm text-indigo-950 font-medium leading-relaxed">
              {message}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Avatar Photo Section */}
            <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-slate-200/60 bg-slate-50/30">
              <h3 className="font-bold text-slate-800 text-sm self-start">
                Profile Photo
              </h3>
              
              <div className="relative group">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile Preview"
                    className="h-32 w-32 rounded-full object-cover border-4 border-indigo-100 shadow-md transition duration-150 group-hover:opacity-90"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-indigo-600 text-white flex items-center justify-center text-4xl font-extrabold shadow-md border-4 border-indigo-100 uppercase">
                    {form.name?.charAt(0) || user?.name?.charAt(0)}
                  </div>
                )}
              </div>

              <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition duration-150 mt-2">
                Choose Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Accepts JPG, PNG, or GIF.<br />Max size recommended: 5MB.
              </p>
            </div>

            {/* Middle Column: Fields Editor Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition duration-150"
                    required
                  />
                </label>

                {user?.role === "client" && (
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Company Name
                    </span>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition duration-150"
                      required
                    />
                  </label>
                )}

                {user?.role === "student" && (
                  <>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Bio / Overview
                      </span>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        rows="4"
                        placeholder="Introduce yourself to prospective clients..."
                        className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition duration-150 leading-relaxed"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Skills (Comma Separated)
                      </span>
                      <input
                        type="text"
                        value={form.skills}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        placeholder="React, Node.js, Python, Figma"
                        className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition duration-150"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Portfolio Entries (JSON Format)
                      </span>
                      <textarea
                        value={form.portfolio}
                        onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                        rows="6"
                        className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 transition duration-150 leading-relaxed text-slate-700 bg-slate-50/50"
                      />
                    </label>
                  </>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 disabled:bg-slate-300 disabled:shadow-none transition duration-150"
                  >
                    {updating ? "Saving Changes..." : "Save Profile Details"}
                  </button>
                </div>
              </form>

              {/* Stats and Reviews Panel (For students and clients) */}
              {user?.role === "student" && (
                <div className="rounded-3xl border border-slate-200/60 p-6 bg-slate-50/30">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    Student Stats & Performance
                  </h3>
                  {profile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white rounded-2xl p-3 border border-slate-200/40">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Rating</p>
                          <p className="text-lg font-bold text-slate-800 mt-1">{profile.averageRating || 0} ⭐</p>
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-200/40">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Completed</p>
                          <p className="text-lg font-bold text-slate-800 mt-1">{profile.completedProjects || 0}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-200/40">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Earnings</p>
                          <p className="text-lg font-bold text-slate-800 mt-1">${profile.totalEarnings || 0}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-2">Client Reviews</h4>
                        <div className="space-y-2">
                          {profile.reviews?.length ? (
                            profile.reviews.map((review, index) => (
                              <div key={index} className="rounded-2xl bg-white p-3 border border-slate-200/40 text-xs">
                                <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                                <div className="mt-2 flex items-center justify-between text-slate-400 font-medium">
                                  <span>Rating: {review.rating} ⭐</span>
                                  <span>{new Date(review.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-4 bg-white rounded-2xl border border-slate-200/40">
                              No client reviews recorded yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs py-4 text-center">Loading performance stats...</p>
                  )}
                </div>
              )}

              {user?.role === "client" && profile && (
                <div className="rounded-3xl border border-slate-200/60 p-6 bg-slate-50/30">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    Client Activity Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/40">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Total Investment</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">${profile.totalSpent || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/40">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Company Affiliation</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">{profile.companyName || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
