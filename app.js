import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
 
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
 
  const handleLogin = async (e) => {
    e.preventDefault();
 
    // Step 1: Basic validation
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
 
    try {
      // Step 2: Send login request to Spring Boot backend
      const res = await axios.post("http://localhost:8080/api/v1/auth/login", {
        email: email,
        password: password,
      });
 
      // Step 3: Handle successful response
      if (res.data) {
        const { jwt, role, name } = res.data;
 
        if (!jwt) {
          toast.error("Invalid response from server");
          return;
        }
 
        // Save login data in global context/localStorage
        login(res.data);
        toast.success(`Welcome back, ${name || "User"}!`);
 
        // Step 4: Redirect based on user role
        if (role === "Instructor") {
          navigate("/instructor-home");
        } else if (role === "Student") {
          navigate("/student-home");
        } else {
          toast.warning("Unknown user role");
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err) {
      // Step 5: Handle errors
      if (err.response) {
        if (err.response.status === 400) toast.error("Bad request: check your credentials");
        else if (err.response.status === 401) toast.error("Invalid email or password");
        else if (err.response.status === 404) toast.error("User not found");
        else toast.error(`Server error: ${err.response.status}`);
      } else {
        toast.error("Network error: Unable to reach server");
      }
      console.error("Login failed:", err);
    }
  };
 
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Login
      </h2>
 
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
 
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
 
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
};
 
export default Login;




app.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CourseDetail from "./pages/Student/CourseDetail";
import CoursePlayer from "./pages/Student/CoursePlayer";
import LearningDashboard from "./pages/Student/LearningDashboard";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import CreateCourse from "./pages/Instructor/CreateCourse";
import EditCourse from "./pages/InstructorEdit/EditCourse";
import EditCourseVideos from "./pages/InstructorEdit/EditCourseVideos";
import EditCourseAssessments from "./pages/InstructorEdit/EditCourseAssessments";
import Enrollment from "./pages/Student/Enrollment";
import Notifications from "./pages/Notifications";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import InstructorHome from "./pages/Instructor/InstructorHome";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";
import CreateAssessment from "./pages/Instructor/CreateAssessment";
import CreateAnnouncement from "./pages/Instructor/CreateAnnouncement";

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route
            path="/course-player/:courseId"
            element={
              <ProtectedRoute role={["Student", "Instructor"]}>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enroll"
            element={
              <ProtectedRoute role="Student">
                <Enrollment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />

          {/* Protected Student Routes */}
          <Route
            path="/student-home"
            element={
              <ProtectedRoute role="Student">
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-dashboard"
            element={
              <ProtectedRoute role="Student">
                <LearningDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Instructor Routes */}
          <Route
            path="/instructor-home"
            element={
              <ProtectedRoute role="Instructor">
                <InstructorHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-dashboard"
            element={
              <ProtectedRoute role="Instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <ProtectedRoute role="Instructor">
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id"
            element={
              <ProtectedRoute role="Instructor">
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id/videos"
            element={
              <ProtectedRoute role="Instructor">
                <EditCourseVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id/assessments"
            element={
              <ProtectedRoute role="Instructor">
                <EditCourseAssessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-assessment"
            element={
              <ProtectedRoute role="Instructor">
                <CreateAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-announcement"
            element={
              <ProtectedRoute role="Instructor">
                <CreateAnnouncement />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-center" autoClose={2000} transition={Slide} />
      </div>
    </Router>
    </AppProvider>
  );
}

export default App;
