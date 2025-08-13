import BatchEditMetadata from "../../components/BatchEditMetadata";

export default function BatchEditClientConfig() {
  // API endpoint spesifik untuk client config
  const clientApi = "http://localhost:8000/client-reference";
  const versionsApi = "http://localhost:8000/client-config/versions?client_id=";
  const dataApi = "http://localhost:8000/client-config";
  const batchSaveApi = "http://localhost:8000/client-config/batch_save";

  // Template row default untuk baris baru
  const initialRowTemplate = {
    source_type: "",
    target_schema: "",
    target_table: "",
    source_config: "",
    config_version: "",
    logical_source_file: "",
  };

  // Validasi: semua wajib kecuali source_config
  function validateRows(rows) {
    for (let i = 0; i < rows.length; i++) {
      const {
        source_type,
        target_schema,
        target_table,
        config_version,
        logical_source_file,
      } = rows[i];
      const allFilled =
        source_type &&
        target_schema &&
        target_table &&
        config_version &&
        logical_source_file;
      const anyFilled =
        source_type ||
        target_schema ||
        target_table ||
        config_version ||
        logical_source_file ||
        rows[i].source_config;
      if (anyFilled && !allFilled) {
        return {
          valid: false,
          message: `Row ${i + 1}: Semua kolom wajib diisi kecuali Source Config.`,
        };
      }
    }
    return { valid: true, message: "" };
  }

  // Transform payload sesuai API batch_save format
  function transformSavePayload({ selectedClient, selectedVersion, rows, newVersion }) {
  const filteredRows = rows.filter(
    (r) =>
      r.source_type &&
      r.target_schema &&
      r.target_table &&
      (r.config_version || newVersion) &&
      r.logical_source_file
  );

  const client_configs = filteredRows.map((r) => ({
    source_type: r.source_type,
    target_schema: r.target_schema,
    target_table: r.target_table,
    source_config: r.source_config,
    config_version: r.config_version || newVersion,
    logical_source_file: r.logical_source_file,
    client_id: r.client_id || Number(selectedClient),
  }));

  const payload = {
    client_id: Number(selectedClient),
    config_version: newVersion,
    client_configs,
  };

  console.log("Payload to batch_save:", payload); // <--- cek ini di browser console

  return payload;
}

  return (
    <BatchEditMetadata
      title="Edit Client Config (Batch)"
      clientApi={clientApi}
      versionsApi={versionsApi}
      dataApi={dataApi}
      batchSaveApi={batchSaveApi}
      baseVersionParam="config_version"
      rowIdKey="config_id"
      versionKeyInRow="config_version"
      initialRowTemplate={initialRowTemplate}
      validateRows={validateRows}
      transformSavePayload={transformSavePayload}
      navigateBackUrl="/metadata/configuration"
    />
  );
}
