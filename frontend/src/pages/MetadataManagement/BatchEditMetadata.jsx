import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BatchEditMetadata({
  title = "Edit Metadata (Batch)",
  clientApi,
  versionsApi,
  dataApi,
  batchSaveApi,
  baseVersionParam = "mapping_version",
  rowIdKey = "id",
  versionKeyInRow = "mapping_version",
  initialRowTemplate = {},
  validateRows,
  transformSavePayload,
  navigateBackUrl = "/metadata",
  extraDropdownOptions = {},
}) {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");

  const [rows, setRows] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load clients on mount
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

  // Load versions when client changes
  useEffect(() => {
    if (!selectedClient) {
      setVersions([]);
      setSelectedVersion("");
      setRows([]);
      return;
    }
    async function fetchVersions() {
      setLoadingVersions(true);
      setError(null);
      setSelectedVersion("");
      setRows([]);
      try {
        const res = await fetch(versionsApi + selectedClient);
        if (!res.ok) throw new Error("Failed to fetch versions");
        const data = await res.json();
        const vers = data.versions || [];

        setVersions(vers);

        if (vers.length === 0) setSelectedVersion("v1");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingVersions(false);
      }
    }
    fetchVersions();
  }, [selectedClient, versionsApi]);

  // Load rows when client or version changes
  useEffect(() => {
    if (!selectedClient || !selectedVersion) {
      setRows([]);
      return;
    }
    async function fetchRows() {
      setLoadingRows(true);
      setError(null);
      try {
        const url = new URL(dataApi);
        url.searchParams.append("client_id", selectedClient);
        url.searchParams.append(baseVersionParam, selectedVersion);

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch data rows");
        const data = await res.json();

        const mappedRows = data.map((row, idx) => ({
          id: row[rowIdKey] || idx + 1,
          ...row,
        }));

        setRows(mappedRows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRows(false);
      }
    }
    fetchRows();
  }, [selectedClient, selectedVersion, dataApi, baseVersionParam, rowIdKey]);

  function getDropdownOptions(field) {
    const uniqueValues = new Set();
    rows.forEach((row) => {
      const val = row[field];
      if (val) uniqueValues.add(val);
    });
    if (extraDropdownOptions[field]) {
      extraDropdownOptions[field].forEach((opt) => uniqueValues.add(opt));
    }
    return Array.from(uniqueValues).sort();
  }

  function handleRowChange(index, field, value) {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addRow() {
    if (!selectedVersion) return;
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...initialRowTemplate,
        [versionKeyInRow]: selectedVersion,
      },
    ]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function incrementVersion(versions) {
    if (!Array.isArray(versions) || versions.length === 0) return "v1";

    const versionNumbers = versions
      .map((v) => {
        if (typeof v === "string" && v.startsWith("v")) {
          const n = parseInt(v.slice(1), 10);
          return isNaN(n) ? 0 : n;
        }
        return 0;
      })
      .filter((n) => n > 0);

    if (versionNumbers.length === 0) return "v1";

    return "v" + (Math.max(...versionNumbers) + 1);
  }

  async function handleSave() {
    setSaveError(null);

    if (!selectedClient) {
      setSaveError("Please select a client.");
      return;
    }
    if (!selectedVersion) {
      setSaveError("Please select a version.");
      return;
    }

    if (validateRows) {
      const { valid, message } = validateRows(rows);
      if (!valid) {
        setSaveError(message);
        return;
      }
    }

    const nonEmptyRows = rows.filter((r) =>
      Object.values(r).some((v) => v !== "" && v !== null && v !== undefined)
    );
    if (nonEmptyRows.length === 0) {
      setSaveError("At least one row must be filled.");
      return;
    }

    const newVersion = incrementVersion(versions);

    let payload = {};
    if (transformSavePayload) {
      payload = transformSavePayload({
        selectedClient,
        selectedVersion,
        rows: nonEmptyRows,
        versions,
        newVersion,
      });
    } else {
      payload = {
        client_id: selectedClient,
        base_version: selectedVersion,
        version: newVersion,
        data: nonEmptyRows,
      };
    }

    setSaving(true);
    try {
      const res = await fetch(batchSaveApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save batch data");
      }
      alert(`Successfully saved new version: ${newVersion}`);
      navigate(navigateBackUrl);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h2>

        {error && (
          <p className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
            {error}
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-6 items-end">
          <div className="flex flex-col">
            <label
              htmlFor="client-select"
              className="mb-1 font-medium text-gray-700"
            >
              Client
            </label>
            <select
              id="client-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_name} ({c.client_schema})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="version-select"
              className="mb-1 font-medium text-gray-700"
            >
              Version (Base)
            </label>
            <select
              id="version-select"
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              disabled={!selectedClient || loadingVersions}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">-- Select Version --</option>
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(loadingRows || loadingVersions) && (
          <p className="text-gray-600 mb-4">Loading data...</p>
        )}

        {!loadingRows && !loadingVersions && selectedVersion && (
          <>
            <div className="overflow-auto mb-6 border border-gray-300 rounded shadow-sm">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.entries(initialRowTemplate).map(([field]) => (
                      <th
                        key={field}
                        className="border px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {field.replace(/_/g, " ")}
                      </th>
                    ))}
                    <th className="border px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? (
                    rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 transition-colors cursor-default"
                      >
                        {Object.entries(initialRowTemplate).map(([field]) => (
                          <td key={field} className="border px-3 py-2">
                            <EditableDropdown
                              value={row[field] || ""}
                              options={getDropdownOptions(field)}
                              onChange={(val) => handleRowChange(i, field, val)}
                            />
                          </td>
                        ))}
                        <td className="border px-3 py-2 text-center">
                          <button
                            onClick={() => removeRow(i)}
                            className="text-red-600 hover:underline font-semibold"
                            title="Remove Row"
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={Object.keys(initialRowTemplate).length + 1}
                        className="text-center py-6 text-gray-400 italic"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={addRow}
              disabled={!selectedVersion}
              className="mb-6 px-5 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 disabled:opacity-50 transition"
              type="button"
            >
              Add Row
            </button>

            {saveError && (
              <p className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
                {saveError}
              </p>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => navigate(navigateBackUrl)}
                disabled={saving}
                className="px-5 py-2 border rounded hover:bg-gray-100 transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                type="button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// EditableDropdown: dropdown editable dengan input manual
function EditableDropdown({ value, options, onChange }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  function handleInputChange(e) {
    setInputValue(e.target.value);
    onChange(e.target.value);
  }

  function toggleDropdown() {
    setDropdownOpen((prev) => !prev);
  }

  function selectOption(opt) {
    setInputValue(opt);
    onChange(opt);
    setDropdownOpen(false);
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
        autoComplete="off"
      />
      {isDropdownOpen && options.length > 0 && (
        <ul className="absolute z-20 w-full max-h-32 overflow-auto border border-gray-300 bg-white rounded shadow-md mt-1">
          {options.map((opt, idx) => (
            <li
              key={idx}
              className="px-3 py-1 cursor-pointer hover:bg-blue-100"
              onMouseDown={() => selectOption(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
