import MetadataListFilter from "./MetadataListFilter";

export default function ColumnRequired() {
  return (
    <MetadataListFilter
      title="Column Required"
      clientApi="http://localhost:8000/client-reference"
      versionsApi="http://localhost:8000/required-columns/versions?client_id="
      dataApi="http://localhost:8000/required-columns"
      baseVersionParam="required_column_version"
      extraFilterParams={{ logical_source_file: "Logical Source File" }}
      rowIdKey="required_id" // kalau ada primary key, ganti sesuai data, kalau gak ada, bisa pakai index di MetadataListFilter nanti
      columns={[
        { key: "column_name", label: "Column Name" },
        { key: "required_column_version", label: "Required Column Version" },
        { key: "logical_source_file", label: "Logical Source File" },
      ]}
      editButtonUrl="/metadata/column-required/edit"
      clientNameField="client_name"
      clientIdField="client_id"
    />
  );
}
