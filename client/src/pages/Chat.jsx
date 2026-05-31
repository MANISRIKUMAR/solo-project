import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import StudentNavbar from "../components/StudentNavbar";
import ClientNavbar from "../components/ClientNavbar";
import API_URL from "../api";

export default function Chat() {
  const { projectId, partnerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const loadData = async () => {
    try {
      const [projectRes, partnerRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects/${projectId}`),
        axios.get(`${API_URL}/api/users/${partnerId}/profile`),
      ]);
      setProject(projectRes.data);
      setPartner(partnerRes.data);
    } catch (err) {
      console.error("Could not load chat context:", err);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/messages/project/${projectId}?partnerId=${partnerId}`
      );
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Could not fetch messages:", err);
    }
  };

  useEffect(() => {
    loadData();
    loadMessages();

    // Set up rapid background polling every 3 seconds for simulated instant messaging
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, [projectId, partnerId]);

  // Smooth scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const originalText = text;
    setText(""); // Instant optimistic clear

    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        projectId,
        recipientId: partnerId,
        text: originalText.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Could not send message:", err);
      setText(originalText); // Restore text on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Navbar based on user role */}
      {user?.role === "client" ? <ClientNavbar /> : <StudentNavbar />}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        {/* Left Side Pane: Project Context Details */}
        <section className="w-full md:w-80 flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 self-start transition duration-150"
          >
            ← Back to project
          </button>

          {project ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 flex flex-col gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {project.category}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900 leading-tight">
                  {project.title}
                </h2>
              </div>
              <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                {project.description}
              </p>
              <div className="border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Budget:</span>
                  <span className="font-semibold text-slate-800">
                    ${project.budget?.min} - ${project.budget?.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="font-semibold uppercase tracking-wider text-slate-800 text-[10px]">
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 text-slate-500 text-sm">
              Loading project details...
            </div>
          )}

          {partner && (
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                {partner.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Chatting with
                </p>
                <h3 className="font-bold text-slate-800">{partner.name}</h3>
              </div>
            </div>
          )}
        </section>

        {/* Right Side Pane: Chat Box Workspace */}
        <section className="flex-1 rounded-3xl bg-white shadow-sm border border-slate-200/60 flex flex-col overflow-hidden h-[500px] md:h-auto">
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-800">
                Live Discussion Channel
              </span>
            </div>
          </div>

          {/* Messages list bubble pane */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">
                Loading discussion history...
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => {
                const isSentByMe = message.sender === user?.id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm border transition duration-150 ${
                        isSentByMe
                          ? "bg-indigo-600 border-indigo-600 text-white rounded-br-none"
                          : "bg-white border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <span
                        className={`mt-1.5 block text-[9px] text-right ${
                          isSentByMe ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-slate-400 text-sm font-medium space-y-2">
                <p>💬 No messages exchanged yet.</p>
                <p className="text-xs text-slate-400">
                  Begin the conversation to discuss milestones and deliverables!
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Area */}
          <form
            onSubmit={handleSend}
            className="border-t border-slate-200/60 p-4 flex gap-3 bg-white"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition duration-150"
              required
            />
            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 transition duration-150 flex items-center justify-center"
            >
              Send
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
