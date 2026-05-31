import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", companyName: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, form);
      login(response.data);
      navigate(response.data.user.role === "client" ? "/client/dashboard" : "/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Register</h1>
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
          </label>
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="client" checked={form.role === "client"} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                Client
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="student" checked={form.role === "student"} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                Student
              </label>
            </div>
          </div>
          {form.role === "client" && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Company Name</span>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
            </label>
          )}
          <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-white">Create account</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">Already have an account? <button onClick={() => navigate("/login")} className="text-slate-900 underline">Login</button></p>
      </div>
    </div>
  );
}
