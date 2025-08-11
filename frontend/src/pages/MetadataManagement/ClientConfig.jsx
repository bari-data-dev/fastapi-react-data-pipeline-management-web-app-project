import MetadataListFilter from "./MetadataListFilter"; // sesuaikan path jika perlu

export default function ClientConfig() {
  return (
    <MetadataListFilter
      title="Client Config"
      clientApi="http://localhost:8000/client-reference"
      versionsApi="http://localhost:8000/client-config/versions?client_id="
      dataApi="http://localhost:8000/client-config"
      baseVersionParam="config_version"
      extraFilterParams={{ logical_source_file: "Logical Source File" }}
      rowIdKey="config_id"
      columns={[
        { key: "source_type", label: "Source Type" },
        { key: "target_schema", label: "Target Schema" },
        { key: "target_table", label: "Target Table" },
        { key: "source_config", label: "Source Config" },
        { key: "config_version", label: "Config Version" },
        { key: "logical_source_file", label: "Logical Source File" },
      ]}
      editButtonUrl="/metadata/configuration/edit"
      clientNameField="client_name"
      clientIdField="client_id"
    />
  );
}
