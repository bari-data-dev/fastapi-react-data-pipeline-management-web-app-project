import MetadataListFilter from "../../components/MetadataListFilter";

export default function ColumnMapping() {
  return (
    <MetadataListFilter
      title="Column Mapping"
      clientApi="http://localhost:8000/client-reference"
      versionsApi="http://localhost:8000/column-mapping/versions?client_id="
      dataApi="http://localhost:8000/column-mapping"
      baseVersionParam="mapping_version"
      rowIdKey="mapping_id"
      clientNameField="client_name"
      clientIdField="client_id"
      columns={[
        { key: "source_column", label: "Source Column" },
        { key: "target_column", label: "Target Column" },
        { key: "mapping_version", label: "Mapping Version" },
        { key: "logical_source_file", label: "Logical Source File" },
      ]}
      extraFilterParams={{ logical_source_file: "Logical Source File" }}
      editButtonUrl="/metadata/column-mapping/edit"
    />
  );
}
