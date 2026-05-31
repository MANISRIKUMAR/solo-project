import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("freelanceToken");
    const profile = localStorage.getItem("freelanceUser");
    if (stored && profile) {
      setToken(stored);
      setUser(JSON.parse(profile));
      axios.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("freelanceToken", data.token);
    localStorage.setItem("freelanceUser", JSON.stringify(data.user));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("freelanceToken");
    localStorage.removeItem("freelanceUser");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
