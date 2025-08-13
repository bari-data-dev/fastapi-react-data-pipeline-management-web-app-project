import MetadataListFilter from "../../components/MetadataListFilter";

export default function TransformConfig() {
  return (
    <MetadataListFilter
      title="Transformation Config"
      clientApi="http://localhost:8000/client-reference"
      versionsApi="http://localhost:8000/transformation-config/versions?client_id="
      dataApi="http://localhost:8000/transformation-config"
      baseVersionParam="transform_version"
      extraFilterParams={{}} // tidak ada extra filter tambahan sekarang
      rowIdKey="transform_id"
      columns={[
        { key: "proc_name", label: "Procedure Name" },
        { key: "transform_version", label: "Transform Version" },
      ]}
      editButtonUrl="/metadata/transformation/edit"
      clientNameField="client_name"
      clientIdField="client_id"
    />
  );
}
