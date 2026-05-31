import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", form);
      login(response.data);
      navigate(response.data.user.role === "client" ? "/client/dashboard" : "/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Login</h1>
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
          </label>
          <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-white">Login</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">New here? <button onClick={() => navigate("/register")} className="text-slate-900 underline">Create account</button></p>
      </div>
    </div>
  );
}
