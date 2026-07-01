import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import Dashboard from "../pages/Dashboard";
import NotFoundPage from "../pages/NotFound";
import CreateRoomPage from "../pages/CreateRoomPage";
import JoinRoomPage from "../pages/JoinRoomPage";
import CodingRoom from "../pages/EditorRoomPage";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      }/>

      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }/>

      <Route path="/signup" element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      }/>

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }/>

      <Route path="/create-room" element={
        <ProtectedRoute>
          <CreateRoomPage />
        </ProtectedRoute>
      }/>

      <Route path="/join-room" element={
        <ProtectedRoute>
          <JoinRoomPage />
        </ProtectedRoute>
      }/>
 

      <Route path="/room/:id" element={
        <ProtectedRoute>
          <CodingRoom />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}
