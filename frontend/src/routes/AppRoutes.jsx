import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import CopilotPage from "../pages/CopilotPage";
import DocumentsPage from "../pages/DocumentsPage";
import DocumentDetailsPage from "../pages/DocumentDetailsPage";
import EvaluationPage from "../pages/EvaluationPage";
import TelemetryPage from "../pages/TelemetryPage";
import SettingsPage from "../pages/SettingsPage";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">AI Engineering Knowledge Copilot</p>

      <h1>{title}</h1>

      <p>
        This section will be implemented in a later phase.
      </p>
    </main>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/documents" replace />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route
            path="/documents/:id"
            element={<DocumentDetailsPage />}
          />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/telemetry" element={<TelemetryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;