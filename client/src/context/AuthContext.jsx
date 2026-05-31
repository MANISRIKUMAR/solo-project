import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("freelanceToken"));
  const [user, setUser] = useState(() => {
    const profile = localStorage.getItem("freelanceUser");
    return profile ? JSON.parse(profile) : null;
  });

  // Set default authorization header synchronously if token is already present
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

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
