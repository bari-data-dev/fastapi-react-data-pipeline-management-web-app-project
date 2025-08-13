import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JobExecutionLog() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    client_id: "",
    batch_id: "",
    job_name: "",
    status: "",
    sortBy: "start_time",
    sortOrder: "desc",
    limit: "50"
  });

  const statusOptions = ["Success", "Failed", "Running", "Queued", "Cancelled"];
  const jobNameOptions = ["data_import", "validation", "transformation", "export", "cleanup"];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  async function fetchClients() {
    try {
      const res = await fetch("http://localhost:8000/client-reference");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`http://localhost:8000/audit-logs/job-execution?${params}`);
      if (!res.ok) throw new Error("Failed to fetch job execution logs");
      
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return '-';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ${diffSecs % 60}s`;
    if (diffMins > 0) return `${diffMins}m ${diffSecs % 60}s`;
    return `${diffSecs}s`;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Job Execution Logs</h2>
          <button
            onClick={() => navigate("/logs")}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Back to Logs
          </button>
        </div>

        {error && (
          <p className="text-red-600 mb-4 bg-red-100 p-3 rounded border border-red-400">
            {error}
          </p>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Client</label>
            <select
              value={filters.client_id}
              onChange={(e) => handleFilterChange("client_id", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Batch ID</label>
            <input
              type="text"
              value={filters.batch_id}
              onChange={(e) => handleFilterChange("batch_id", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch ID"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Job Name</label>
            <select
              value={filters.job_name}
              onChange={(e) => handleFilterChange("job_name", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Jobs</option>
              {jobNameOptions.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Sort Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Job ID",
                  "Client ID",
                  "Job Name",
                  "Status", 
                  "File Name",
                  "Batch ID",
                  "Start Time",
                  "End Time",
                  "Duration",
                  "Error Message"
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-2">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.job_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{log.job_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.client_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.job_name}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'Success' ? 'bg-green-100 text-green-800' :
                        log.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        log.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                        log.status === 'Queued' ? 'bg-yellow-100 text-yellow-800' :
                        log.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.file_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.batch_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.start_time ? new Date(log.start_time).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.end_time ? new Date(log.end_time).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {calculateDuration(log.start_time, log.end_time)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate" title={log.error_message}>
                      {log.error_message || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        {logs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800">Successful Jobs</div>
              <div className="text-2xl font-bold text-green-900">
                {logs.filter(log => log.status === 'Success').length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-800">Failed Jobs</div>
              <div className="text-2xl font-bold text-red-900">
                {logs.filter(log => log.status === 'Failed').length}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Running Jobs</div>
              <div className="text-2xl font-bold text-blue-900">
                {logs.filter(log => log.status === 'Running').length}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-800">Queued Jobs</div>
              <div className="text-2xl font-bold text-yellow-900">
                {logs.filter(log => log.status === 'Queued').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}