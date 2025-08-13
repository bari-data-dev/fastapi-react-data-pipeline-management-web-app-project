import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FileAuditLog() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    client_id: "",
    batch_id: "",
    logical_source_file: "",
    convert_status: "",
    sortBy: "file_received_time",
    sortOrder: "desc",
  });

  const statusOptions = ["Success", "Failed", "Processing", "Pending"];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

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

      params.append("limit", pagination.limit);
      params.append("offset", (pagination.page - 1) * pagination.limit);

      const res = await fetch(
        `http://localhost:8000/audit-logs/file-audit?${params}`
      );
      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();
      setLogs(data.data || data);

      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (err) {
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePageChange(newPage) {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            File Audit Logs
          </h2>
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
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Client
            </label>
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
            <label className="block font-medium mb-1 text-gray-700">
              Batch ID
            </label>
            <input
              type="text"
              value={filters.batch_id}
              onChange={(e) => handleFilterChange("batch_id", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch ID"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Source File
            </label>
            <input
              type="text"
              value={filters.logical_source_file}
              onChange={(e) =>
                handleFilterChange("logical_source_file", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter source file"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Convert Status
            </label>
            <select
              value={filters.convert_status}
              onChange={(e) =>
                handleFilterChange("convert_status", e.target.value)
              }
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
            <label className="block font-medium mb-1 text-gray-700">
              Sort Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "File Audit ID",
                  "Client ID",
                  "Logical Source File",
                  "Physical File Name",
                  "Batch ID",
                  "Convert Status",
                  "Total Rows",
                  "Valid Rows",
                  "Invalid Rows",
                  "File Received Time",
                  "JSON Converted Time",
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
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(11)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-2">
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                          </td>
                        ))}
                    </tr>
                  ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.file_audit_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.file_audit_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.client_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.logical_source_file}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.physical_file_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.batch_id}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.convert_status === "Success"
                            ? "bg-green-100 text-green-800"
                            : log.convert_status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : log.convert_status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.convert_status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.total_rows}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.valid_rows}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.invalid_rows}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.file_received_time
                        ? new Date(log.file_received_time).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {log.json_converted_time
                        ? new Date(log.json_converted_time).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
