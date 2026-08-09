import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import { LoginPage } from "./pages/LoginPage";
import { AmbulanceDashboardPage } from "./pages/AmbulanceDashboardPage";
import { PoliceDashboardPage } from "./pages/PoliceDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { TripsPage } from "./pages/TripsPage";
import { OfficersPage } from "./pages/OfficersPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/ambulance/dashboard"
            element={
              <AuthGuard allowedRoles={["Ambulance", "Admin"]}>
                <AmbulanceDashboardPage />
              </AuthGuard>
            }
          />

          <Route
            path="/police/dashboard"
            element={
              <AuthGuard allowedRoles={["Police", "Admin"]}>
                <PoliceDashboardPage />
              </AuthGuard>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AuthGuard allowedRoles={["Admin"]}>
                <AdminDashboardPage />
              </AuthGuard>
            }
          />

          <Route
            path="/trips"
            element={
              <AuthGuard>
                <TripsPage />
              </AuthGuard>
            }
          />

          <Route
            path="/officers"
            element={
              <AuthGuard>
                <OfficersPage />
              </AuthGuard>
            }
          />

          <Route
            path="/statistics"
            element={
              <AuthGuard>
                <StatisticsPage />
              </AuthGuard>
            }
          />

          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
