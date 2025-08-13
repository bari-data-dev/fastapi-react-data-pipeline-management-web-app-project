import { Routes, Route, NavLink } from "react-router-dom";
import Client from "./Client";
import ColumnMapping from "./ColumnMapping";
import BatchEditColumnMapping from "./BatchEditColumnMapping";
import ColumnRequired from "./ColumnRequired";
import BatchEditColumnRequired from "./BatchEditColumnRequired";
import ClientConfig from "./ClientConfig";
import BatchEditClientConfig from "./BatchEditClientConfig";
import TransformConfig from "./TransformConfig";
import BatchEditTransformConfig from "./BatchEditTransformConfig";

export default function MetadataManagement() {
  return (
    <>
      <div className="flex justify-end mb-4 border-b border-gray-300 px-4 sm:px-6 lg:px-12">
        {/* Dropdown menu sebagai nav submenu */}
        <nav className="mb-4 border-b border-gray-300 flex space-x-4">
          <NavLink
            to="/metadata/client"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-600 pb-1 font-semibold"
                : "pb-1"
            }
          >
            Client
          </NavLink>
          <NavLink
            to="/metadata/column-mapping"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-600 pb-1 font-semibold"
                : "pb-1"
            }
          >
            Column Mapping
          </NavLink>
          <NavLink
            to="/metadata/column-required"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-600 pb-1 font-semibold"
                : "pb-1"
            }
          >
            Column Required
          </NavLink>
          <NavLink
            to="/metadata/configuration"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-600 pb-1 font-semibold"
                : "pb-1"
            }
          >
            Configuration
          </NavLink>
          <NavLink
            to="/metadata/transformation"
            className={({ isActive }) =>
              isActive
                ? "border-b-2 border-blue-600 pb-1 font-semibold"
                : "pb-1"
            }
          >
            Transformation
          </NavLink>
        </nav>
      </div>

      <Routes>
        <Route path="/client" element={<Client />} />
        <Route path="/column-mapping" element={<ColumnMapping />} />
        <Route
          path="/column-mapping/edit"
          element={<BatchEditColumnMapping />}
        />

        <Route path="/column-required" element={<ColumnRequired />} />
        <Route
          path="/column-required/edit"
          element={<BatchEditColumnRequired />}
        />

        <Route path="/configuration" element={<ClientConfig />} />
        <Route path="/configuration/edit" element={<BatchEditClientConfig />} />
        <Route path="/transformation" element={<TransformConfig />} />
        <Route
          path="/transformation/edit"
          element={<BatchEditTransformConfig />}
        />

        {/* Default fallback route */}
        <Route path="*" element={<Client />} />
      </Routes>
    </>
  );
}
