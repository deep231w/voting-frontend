import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProtectedLayout from "./ProtectedLayout";
import CreatePoll from "./pages/CreatePoll";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); 
  if (!token) {
    return <Navigate to="/login" replace />; 
  }
  return children; 
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
                <ProtectedLayout>
                    <Home />
                </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/createpoll"
          element={
            <ProtectedRoute>
                <ProtectedLayout>
                    <CreatePoll/>
                </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
