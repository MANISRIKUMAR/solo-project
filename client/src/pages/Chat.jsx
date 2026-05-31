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
  const [conversations, setConversations] = useState([]);
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

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/conversations`);
      setConversations(res.data);
    } catch (err) {
      console.warn("Could not load conversations:", err.message);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (projectId && partnerId) {
      setLoading(true);
      loadData();
      loadMessages();
      const timer = setInterval(loadMessages, 3000);
      return () => clearInterval(timer);
    } else {
      setProject(null);
      setPartner(null);
      setMessages([]);
      setLoading(false);
    }
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
      loadConversations(); // Reload conversations list to update snippet
    } catch (err) {
      console.error("Could not send message:", err);
      setText(originalText); // Restore text on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Navbar based on user role */}
      {user?.role === "client" ? <ClientNavbar /> : <StudentNavbar />}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
        {/* Left Side Pane: All Active Conversations (Inbox) */}
        <section className="w-full md:w-80 flex flex-col rounded-3xl bg-white shadow-sm border border-slate-200/60 overflow-hidden h-[300px] md:h-auto">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Your Discussions
            </h2>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {conversations.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length > 0 ? (
              conversations.map((c) => {
                const isSelected = c.project._id === projectId && c.partner.id === partnerId;
                return (
                  <button
                    key={`${c.project._id}_${c.partner.id}`}
                    onClick={() => navigate(`/chat/${c.project._id}/${c.partner.id}`)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition duration-150 flex items-start gap-3 ${
                      isSelected ? "bg-indigo-50/60 border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-indigo-100/80 flex items-center justify-center font-bold text-indigo-700 border border-indigo-200/40 flex-shrink-0 text-sm">
                      {c.partner.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm truncate">
                          {c.partner.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 capitalize bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                          {c.partner.role}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold truncate mt-0.5">
                        {c.project.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {c.lastMessage.text}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center text-slate-400 text-sm font-medium">
                <p>💬 No messages yet.</p>
                <p className="text-xs text-slate-400/80 mt-1 leading-relaxed">
                  Start conversations by clicking "Discuss Project" or "Chat" on bid cards!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Side Pane: Chat Box Workspace / Selection Screen */}
        <section className="flex-1 rounded-3xl bg-white shadow-sm border border-slate-200/60 flex flex-col overflow-hidden h-[500px] md:h-auto">
          {projectId && partnerId ? (
            <>
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm font-semibold text-slate-800">
                    Live Channel with <span className="font-bold">{partner?.name}</span>
                  </span>
                </div>
                <Link
                  to={user?.role === "client" ? `/client/projects/${projectId}` : `/student/projects/${projectId}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition duration-150"
                >
                  View Project Details →
                </Link>
              </div>

              {/* Project Quick Info Bar */}
              {project && (
                <div className="bg-indigo-50/50 border-b border-indigo-100/60 px-6 py-3 text-xs text-indigo-950 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    Project: <span className="font-bold">{project.title}</span> ({project.category})
                  </div>
                  <div className="flex gap-4">
                    <span>Budget: <span className="font-semibold">${project.budget?.min} - ${project.budget?.max}</span></span>
                    <span>Status: <span className="font-semibold uppercase tracking-wider text-[10px]">{project.status}</span></span>
                  </div>
                </div>
              )}

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
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 transition duration-150 flex items-center justify-center flex-shrink-0"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            /* Welcome / Workspace Selection State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/20 text-center">
              <div className="h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-3xl shadow-sm border border-indigo-100 text-indigo-600 mb-4 animate-bounce">
                💬
              </div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">
                Your Discussion Workspace
              </h3>
              <p className="mt-2 text-slate-500 text-sm max-w-sm leading-relaxed">
                Select a live discussion channel from the left sidebar to coordinate deliverables, discuss project milestones, or negotiate payments.
              </p>
              {user?.role === "student" ? (
                <Link
                  to="/student/browse"
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition duration-150"
                >
                  Browse open projects to bid
                </Link>
              ) : (
                <Link
                  to="/client/post-project"
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition duration-150"
                >
                  Post a new project
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
