import BatchEditMetadata from "../../components/BatchEditMetadata";

export default function BatchEditColumnRequired() {
  // API endpoint spesifik untuk required columns
  const clientApi = "http://localhost:8000/client-reference";
  const versionsApi =
    "http://localhost:8000/required-columns/versions?client_id=";
  const dataApi = "http://localhost:8000/required-columns";
  const batchSaveApi = "http://localhost:8000/required-columns/batch_save";

  // Template row default untuk baris baru
  const initialRowTemplate = {
    column_name: "",
    logical_source_file: "",
  };

  // Validasi: semua field wajib terisi di setiap row
  function validateRows(rows) {
    for (let i = 0; i < rows.length; i++) {
      const { column_name, logical_source_file } = rows[i];
      const allFilled = column_name && logical_source_file;
      const anyFilled = column_name || logical_source_file;
      if (anyFilled && !allFilled) {
        return {
          valid: false,
          message: `Row ${i + 1}: Semua kolom harus diisi jika ada data.`,
        };
      }
    }
    return { valid: true, message: "" };
  }

  // Transform payload sesuai API batch_save format
  function transformSavePayload({
    selectedClient,
    selectedVersion,
    rows,
    newVersion,
  }) {
    // Filter rows yang lengkap saja
    const filteredRows = rows.filter(
      (r) => r.column_name && r.logical_source_file
    );

    // Lengkapi client_id & version di tiap row
    const required_columns = filteredRows.map((r) => ({
      column_name: r.column_name,
      logical_source_file: r.logical_source_file,
      client_id: r.client_id || Number(selectedClient),
      required_column_version: r.required_column_version || newVersion,
    }));

    return {
      client_id: Number(selectedClient),
      required_column_version: newVersion,
      required_columns,
    };
  }

  return (
    <BatchEditMetadata
      title="Edit Required Columns (Batch)"
      clientApi={clientApi}
      versionsApi={versionsApi}
      dataApi={dataApi}
      batchSaveApi={batchSaveApi}
      baseVersionParam="required_column_version"
      rowIdKey="required_id"
      versionKeyInRow="required_column_version"
      initialRowTemplate={initialRowTemplate}
      validateRows={validateRows}
      transformSavePayload={transformSavePayload}
      navigateBackUrl="/metadata/column-required"
      // Tidak perlu extraDropdownOptions sekarang, bisa ditambahkan jika diperlukan
    />
  );
}
