import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Memoized row component supaya tiap row render hanya jika props berubah
const TableRow = React.memo(function TableRow({ row, columns, rowIdKey }) {
  return (
    <tr className="hover:bg-indigo-50 transition-colors cursor-pointer" key={row[rowIdKey]}>
      {columns.map(({ key }) => (
        <td
          key={key}
          className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
        >
          {row[key]}
        </td>
      ))}
    </tr>
  );
});

export default function MetadataListFilter({
  title = "Metadata List",
  clientApi,
  versionsApi,
  dataApi,
  baseVersionParam = "mapping_version", // nama param version filter di API
  extraFilterParams = {}, // { key: label }
  rowIdKey = "id",
  columns = [],
  editButtonUrl = "",
  clientNameField = "client_name",
  clientIdField = "client_id",
}) {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");

  const [extraFilters, setExtraFilters] = useState(
    Object.keys(extraFilterParams).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {})
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [extraFilterOptions, setExtraFilterOptions] = useState(
    Object.keys(extraFilterParams).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {})
  );

  // Fetch clients on mount
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch(clientApi);
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchClients();
  }, [clientApi]);

  // Fetch versions on client change
  useEffect(() => {
    if (!selectedClient) {
      setVersions([]);
      setSelectedVersion("");
      setRows([]);
      resetExtraFiltersAndOptions();
      return;
    }
    async function fetchVersions() {
      try {
        const res = await fetch(versionsApi + selectedClient);
        if (!res.ok) throw new Error("Failed to fetch versions");
        const data = await res.json();
        setVersions(data.versions || []);
        setSelectedVersion("");
        setRows([]);
        resetExtraFiltersAndOptions();
      } catch (err) {
        setError(err.message);
      }
    }
    fetchVersions();
  }, [selectedClient]);

  // Reset extra filters and options helper
  function resetExtraFiltersAndOptions() {
    const resetFilters = { ...extraFilters };
    Object.keys(resetFilters).forEach((key) => (resetFilters[key] = ""));
    setExtraFilters(resetFilters);

    setExtraFilterOptions(
      Object.keys(extraFilterParams).reduce((acc, key) => {
        acc[key] = [];
        return acc;
      }, {})
    );
  }

  // Fetch extra filter options on client/version change
  useEffect(() => {
    if (!selectedClient || !selectedVersion) {
      resetExtraFiltersAndOptions();
      return;
    }
    async function fetchExtraFilterOptions() {
      try {
        const url = new URL(dataApi);
        url.searchParams.append("client_id", selectedClient);
        url.searchParams.append(baseVersionParam, selectedVersion);
        url.searchParams.append("limit", "1000");

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch data for filter options");
        const data = await res.json();

        const newOptions = {};
        Object.keys(extraFilterParams).forEach((key) => {
          newOptions[key] = Array.from(
            new Set(data.map((r) => r[key]).filter(Boolean))
          ).sort();
        });

        setExtraFilterOptions(newOptions);

        // reset invalid extra filters
        const resetFilters = { ...extraFilters };
        Object.keys(resetFilters).forEach((key) => (resetFilters[key] = ""));
        setExtraFilters(resetFilters);
      } catch {
        // ignore error
      }
    }
    fetchExtraFilterOptions();
  }, [selectedClient, selectedVersion, dataApi, baseVersionParam]);

  // Fetch rows on filters change
  useEffect(() => {
    async function fetchRows() {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(dataApi);

        if (selectedClient) url.searchParams.append("client_id", selectedClient);
        if (selectedVersion) url.searchParams.append(baseVersionParam, selectedVersion);

        Object.entries(extraFilters).forEach(([key, val]) => {
          if (val) url.searchParams.append(key, val);
        });

        url.searchParams.append("limit", "100");

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();
        setRows(data);
      } catch (err) {
        setError(err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRows();
  }, [selectedClient, selectedVersion, extraFilters, dataApi, baseVersionParam]);

  function handleExtraFilterChange(key, value) {
    setExtraFilters((prev) => ({ ...prev, [key]: value }));
  }

  // Memoized table rows so React only re-renders rows if `rows` or `columns` changed
  const memoizedTableRows = useMemo(() => {
    if (loading) {
      return Array(5).fill(0).map((_, i) => (
        <tr key={"loading-" + i} className="animate-pulse bg-gray-100">
          {columns.map(({ key }) => (
            <td key={key} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ));
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
            No data found
          </td>
        </tr>
      );
    }

    return rows.map((row) => (
      <TableRow key={row[rowIdKey]} row={row} columns={columns} rowIdKey={rowIdKey} />
    ));
  }, [rows, columns, loading, rowIdKey]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-full flex flex-col" style={{ height: "100vh" }}>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-800">
          {title}
        </h2>

        {error && (
          <p className="text-red-600 mb-4 bg-red-100 p-3 rounded border border-red-400">
            {error}
          </p>
        )}

        <form
          className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Client filter */}
          <div className="flex flex-col">
            <label htmlFor="client-select" className="mb-2 font-medium text-gray-700">
              Client
            </label>
            <select
              id="client-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- All Clients --</option>
              {clients.map((c) => (
                <option key={c[clientIdField]} value={c[clientIdField]}>
                  {c[clientNameField]} ({c.client_schema})
                </option>
              ))}
            </select>
          </div>

          {/* Version filter */}
          <div className="flex flex-col">
            <label htmlFor="version-select" className="mb-2 font-medium text-gray-700">
              Version
            </label>
            <select
              id="version-select"
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              disabled={!selectedClient || versions.length === 0}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- All Versions --</option>
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Extra filters */}
          {Object.entries(extraFilterParams).map(([key, label]) => (
            <div key={key} className="flex flex-col">
              <label htmlFor={`${key}-select`} className="mb-2 font-medium text-gray-700">
                {label}
              </label>
              <select
                id={`${key}-select`}
                value={extraFilters[key]}
                onChange={(e) => handleExtraFilterChange(key, e.target.value)}
                disabled={!selectedClient || !selectedVersion || extraFilterOptions[key]?.length === 0}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- All {label} --</option>
                {extraFilterOptions[key]?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Add New Version Button */}
          {editButtonUrl && (
            <div className="flex items-end">
              <button
                onClick={() => navigate(editButtonUrl)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md px-5 py-2 transition duration-200"
              >
                Add New Version
              </button>
            </div>
          )}
        </form>

        {/* Table container with fixed height and vertical scrollbar */}
        <div
          className="overflow-x-auto border border-gray-300 rounded-md shadow-sm flex-grow"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">{memoizedTableRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
