import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import PipelineManagement from "./pages/PipelineManagement/index.jsx";
import MetadataManagement from "./pages/MetadataManagement/index.jsx";
import LogsReports from "./pages/LogsReports/index.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 backdrop-blur-md shadow-lg">
          <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-12">
            <div className="flex items-center justify-normal space-x-12 h-16">
              {[
                { to: "/pipeline", label: "Pipeline Management" },
                { to: "/metadata", label: "Metadata Management" },
                { to: "/logs", label: "Logs and Reports" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative text-sm font-semibold tracking-wide uppercase text-white py-2 cursor-pointer transition-colors duration-300
            ${isActive ? "text-white" : "text-white/80 hover:text-white"}`
                  }
                  end
                >
                  {({ isActive }) => (
                    <>
                      <span>{label}</span>
                      <span
                        className={`absolute left-0 -bottom-1 h-1 rounded-full bg-white transition-all duration-300 ease-in-out
                ${isActive ? "w-full opacity-100" : "w-0 opacity-0"}`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-grow w-full px-6 py-10 overflow-auto">
          <Routes>
            <Route path="/pipeline" element={<PipelineManagement />} />
            <Route path="/metadata/*" element={<MetadataManagement />} />
            <Route path="/logs" element={<LogsReports />} />
            <Route path="*" element={<MetadataManagement />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
