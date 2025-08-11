import BatchEditMetadata from "./BatchEditMetadata";

export default function BatchEditTransformationConfig() {
  // API endpoint spesifik untuk transformation config
  const clientApi = "http://localhost:8000/client-reference";
  const versionsApi = "http://localhost:8000/transformation-config/versions?client_id=";
  const dataApi = "http://localhost:8000/transformation-config";
  const batchSaveApi = "http://localhost:8000/transformation-config/batch_save";

  // Template row default untuk baris baru (hanya proc_name yg show dan wajib diisi)
  const initialRowTemplate = {
    proc_name: "",
  };

  // Validasi: semua field wajib terisi (proc_name wajib diisi)
  function validateRows(rows) {
    for (let i = 0; i < rows.length; i++) {
      const { proc_name } = rows[i];
      const allFilled = proc_name;
      const anyFilled = proc_name;
      if (anyFilled && !allFilled) {
        return {
          valid: false,
          message: `Row ${i + 1}: "proc_name" wajib diisi jika ada data.`,
        };
      }
    }
    return { valid: true, message: "" };
  }

  // Transform payload sesuai API batch_save format
  function transformSavePayload({ selectedClient, selectedVersion, rows, newVersion }) {
    // Filter rows yang lengkap saja (proc_name wajib)
    const filteredRows = rows.filter((r) => r.proc_name);

    // Lengkapi client_id & transform_version di tiap row
    const transformation_configs = filteredRows.map((r) => ({
      proc_name: r.proc_name,
      client_id: r.client_id || Number(selectedClient),
      transform_version: r.transform_version || newVersion,
    }));

    return {
      client_id: Number(selectedClient),
      transform_version: newVersion,
      transformation_configs,
    };
  }

  return (
    <BatchEditMetadata
      title="Edit Transformation Config (Batch)"
      clientApi={clientApi}
      versionsApi={versionsApi}
      dataApi={dataApi}
      batchSaveApi={batchSaveApi}
      baseVersionParam="transform_version"
      rowIdKey="transform_id"
      versionKeyInRow="transform_version"
      initialRowTemplate={initialRowTemplate}
      validateRows={validateRows}
      transformSavePayload={transformSavePayload}
      navigateBackUrl="/transformation"
    />
  );
}
