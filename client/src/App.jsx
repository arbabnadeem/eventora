import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import UserDashboard from "./page/UserDashboard";
import EventDetail from "./page/EventDetail";
import AdminDashboard from "./page/AdminDashboard";
import PaymentSuccess from "./page/PaymentSuccess";
import PaymentFailed from "./page/PaymentFailed";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route
              path="*"
              element={
                <h1 className="text-3xl font-bold text-center mt-20">
                  404 - Page Not Found
                </h1>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
