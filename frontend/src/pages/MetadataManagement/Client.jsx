import { useEffect, useState } from "react";
import ModalForm from "../../components/ModalForm";

export default function Client() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({
    client_schema: "",
    client_name: "",
    config_version: "",
    mapping_version: "",
    required_column_version: "",
    transform_version: "",
    last_batch_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const apiUrl = "http://localhost:8000/client-reference";

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setFormMode("add");
    setFormData({
      client_schema: "",
      client_name: "",
      config_version: "",
      mapping_version: "",
      required_column_version: "",
      transform_version: "",
      last_batch_id: "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(client) {
    setFormMode("edit");
    setFormData({
      client_schema: client.client_schema ?? "",
      client_name: client.client_name ?? "",
      config_version: client.config_version ?? "",
      mapping_version: client.mapping_version ?? "",
      required_column_version: client.required_column_version ?? "",
      transform_version: client.transform_version ?? "",
      last_batch_id: client.last_batch_id ?? "",
      client_id: client.client_id,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError(null);

    try {
      let res;
      if (formMode === "add") {
        res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(`${apiUrl}/${formData.client_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save data");
      }

      setModalOpen(false);
      fetchClients();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(client_id) {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`${apiUrl}/${client_id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to delete data");
      }
      fetchClients();
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Client Management
        </h2>

        <button
          className="mb-6 px-5 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition-colors"
          onClick={openAddModal}
        >
          Add New Client
        </button>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && (
          <p className="mb-4 text-red-700 bg-red-100 p-3 rounded border border-red-300">
            Error: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "Client ID",
                    "Client Schema",
                    "Client Name",
                    "Config Version",
                    "Mapping Version",
                    "Required Column Version",
                    "Transform Version",
                    "Last Batch ID",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr
                      key={client.client_id}
                      className="hover:bg-gray-50 transition-colors cursor-default"
                    >
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.client_id}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.client_schema}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.client_name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.config_version}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.mapping_version}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.required_column_version}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.transform_version}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {client.last_batch_id}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 space-x-4">
                        <button
                          onClick={() => openEditModal(client)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client.client_id)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Form */}
        <ModalForm
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            formMode === "add"
              ? "Add New Client"
              : `Edit Client ID ${formData.client_id}`
          }
          onSubmit={handleSubmit}
          submitting={submitting}
        >
          {formError && (
            <p className="text-red-700 bg-red-100 p-2 rounded mb-4">
              {formError}
            </p>
          )}

          {[
            { id: "client_schema", label: "Client Schema", required: true },
            { id: "client_name", label: "Client Name", required: true },
            { id: "config_version", label: "Config Version" },
            { id: "mapping_version", label: "Mapping Version" },
            { id: "required_column_version", label: "Required Column Version" },
            { id: "transform_version", label: "Transform Version" },
            { id: "last_batch_id", label: "Last Batch ID" },
          ].map(({ id, label, required }) => (
            <div className="mb-4" key={id}>
              <label
                htmlFor={id}
                className="block font-medium mb-1 text-gray-700"
              >
                {label}
              </label>
              <input
                id={id}
                name={id}
                type="text"
                value={formData[id]}
                onChange={handleChange}
                required={required}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </ModalForm>
      </div>
    </div>
  );
}
