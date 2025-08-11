import BatchEditMetadata from "./BatchEditMetadata";

export default function BatchEditColumnMapping() {
  // Validasi khusus
  function validateRows(rows) {
    for (let i = 0; i < rows.length; i++) {
      const { source_column, target_column, logical_source_file } = rows[i];
      const isAnyFilled = source_column || target_column || logical_source_file;
      const isAllFilled = source_column && target_column && logical_source_file;

      if (isAnyFilled && !isAllFilled) {
        return {
          valid: false,
          message: `Row ${i + 1}: Jika ada satu field diisi, semua field harus diisi lengkap.`,
        };
      }

      if ((source_column || target_column) && !logical_source_file) {
        return {
          valid: false,
          message: `Row ${i + 1}: Logical Source File harus diisi jika ada data kolom lain.`,
        };
      }
    }
    return { valid: true };
  }

  // Transform payload sesuai API backend
  function transformSavePayload({ selectedClient, selectedVersion, rows, versions, newVersion }) {
    // Filter rows yang lengkap saja
    const filteredRows = rows.filter(
      (r) => r.source_column && r.target_column && r.logical_source_file
    );

    return {
      client_id: selectedClient,
      base_mapping_version: selectedVersion,
      mapping_version: newVersion,
      mappings: filteredRows.map(({ source_column, target_column, logical_source_file }) => ({
        source_column,
        target_column,
        logical_source_file,
      })),
    };
  }

  return (
    <BatchEditMetadata
      title="Edit Column Mapping (Batch)"
      clientApi="http://localhost:8000/client-reference"
      versionsApi="http://localhost:8000/column-mapping/versions?client_id="
      dataApi="http://localhost:8000/column-mapping"
      batchSaveApi="http://localhost:8000/column-mapping/batch_save"
      baseVersionParam="mapping_version"
      rowIdKey="mapping_id"
      versionKeyInRow="mapping_version"
      initialRowTemplate={{
        source_column: "",
        target_column: "",
        logical_source_file: "",
      }}
      validateRows={validateRows}
      transformSavePayload={transformSavePayload}
      navigateBackUrl="/metadata/column-mapping"
      extraDropdownOptions={{
        logical_source_file: [], // nanti bisa dikasih list logical_source_file versi ini jika mau
      }}
    />
  );
}
