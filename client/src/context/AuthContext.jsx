import React, { createContext, useEffect, useState } from "react";
import api from "../utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      console.error("login failed:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      setUser(data);

      return data;
    } catch (error) {
      console.error("register failed:", error);
      throw error;
    }
  };

  const verifyOtp = async () => {
    try {
      const { data } = await api.post("/auth/verify-otp");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      console.error("verify otp failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, verifyOtp, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
