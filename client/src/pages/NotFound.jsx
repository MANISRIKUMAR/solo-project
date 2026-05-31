import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 py-20 text-center">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-12 shadow-lg">
        <h1 className="text-5xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-slate-600">The page you are looking for does not exist.</p>
        <button onClick={() => navigate("/")} className="mt-8 rounded bg-slate-900 px-6 py-2 text-white hover:bg-slate-700">Back to home</button>
      </div>
    </div>
  );
}
