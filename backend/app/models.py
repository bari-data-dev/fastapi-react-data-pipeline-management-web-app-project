from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .database import Base

class ClientReference(Base):
    __tablename__ = "client_reference"
    __table_args__ = {"schema": "tools"} 

    client_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_schema = Column(String(50), nullable=False, unique=True)
    client_name = Column(String(100), nullable=False)
    config_version = Column(String(10), nullable=False)
    mapping_version = Column(String(10), nullable=False)
    required_column_version = Column(String(10), nullable=False)
    transform_version = Column(String(10), nullable=False)
    last_batch_id = Column(String(30), nullable=False)

    client_configs = relationship("ClientConfig", back_populates="client_reference")
    column_mappings = relationship("ColumnMapping", back_populates="client_reference")
    required_columns = relationship("RequiredColumn", back_populates="client_reference")
    transformation_configs = relationship("TransformationConfig", back_populates="client_reference")
    

class ClientConfig(Base):
    __tablename__ = "client_config"
    __table_args__ = {"schema": "tools"}

    config_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    source_type = Column(String(20), nullable=False)
    target_schema = Column(String(50), nullable=False)
    target_table = Column(String(50), nullable=False)
    source_config = Column(JSONB, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    config_version = Column(String(10), nullable=True)
    logical_source_file = Column(String(100), nullable=True)

    # Optional: relasi ke client_reference (bisa ditambahkan jika diperlukan)
    client_reference = relationship("ClientReference", back_populates="client_configs")


class ColumnMapping(Base):
    __tablename__ = "column_mapping"
    __table_args__ = {"schema": "tools"}

    mapping_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    source_column = Column(String(100), nullable=False)
    target_column = Column(String(100), nullable=False)
    mapping_version = Column(String(10), nullable=False)
    logical_source_file = Column(String(100), nullable=False)

    client_reference = relationship("ClientReference", back_populates="column_mappings")



class RequiredColumn(Base):
    __tablename__ = "required_columns"
    __table_args__ = {"schema": "tools"}

    required_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    column_name = Column(String(100), nullable=False)
    required_column_version = Column(String(10), nullable=False)
    logical_source_file = Column(String(100), nullable=False)

    client_reference = relationship("ClientReference", back_populates="required_columns")

class TransformationConfig(Base):
    __tablename__ = "transformation_config"
    __table_args__ = {"schema": "tools"}

    transform_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    proc_name = Column(Text, nullable=False)
    transform_version = Column(String(50), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=False), nullable=True, server_default=func.now())
    created_by = Column(Text, nullable=True, server_default="system")

    client_reference = relationship("ClientReference", back_populates="transformation_configs")


class FileAuditLog(Base):
    __tablename__ = "file_audit_log"
    __table_args__ = {"schema": "tools"}

    file_audit_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    convert_status = Column(String(20), nullable=True)
    mapping_validation_status = Column(String(20), nullable=True)
    row_validation_status = Column(String(20), nullable=True)
    load_status = Column(String(20), nullable=True)
    total_rows = Column(Integer, nullable=True)
    valid_rows = Column(Integer, nullable=True)
    invalid_rows = Column(Integer, nullable=True)
    processed_by = Column(String(100), nullable=True)
    logical_source_file = Column(String(100), nullable=True)
    physical_file_name = Column(String(200), nullable=True)
    json_file_name = Column(String(200), nullable=True)
    batch_id = Column(String(30), nullable=True)
    file_received_time = Column(TIMESTAMP(timezone=False), nullable=True)
    json_converted_time = Column(TIMESTAMP(timezone=False), nullable=True)

    client_reference = relationship("ClientReference")

class MappingValidationLog(Base):
    __tablename__ = "mapping_validation_log"
    __table_args__ = {"schema": "tools"}

    mapping_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    missing_columns = Column(Text, nullable=True)
    extra_columns = Column(Text, nullable=True)
    expected_columns = Column(Text, nullable=True)
    received_columns = Column(Text, nullable=True)
    file_name = Column(String(200), nullable=True)
    batch_id = Column(String(30), nullable=True)
    timestamp = Column(TIMESTAMP(timezone=False), nullable=True, server_default=func.now())

    client_reference = relationship("ClientReference")


class RowValidationLog(Base):
    __tablename__ = "row_validation_log"
    __table_args__ = {"schema": "tools"}

    error_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=True)
    file_name = Column(String(200), nullable=True)
    column_name = Column(String(100), nullable=True)
    row_number = Column(Integer, nullable=True)
    error_type = Column(String(100), nullable=True)
    error_detail = Column(Text, nullable=True)
    batch_id = Column(String(30), nullable=True)
    timestamp = Column(TIMESTAMP(timezone=False), nullable=True, server_default=func.now())

    client_reference = relationship("ClientReference")


class LoadErrorLog(Base):
    __tablename__ = "load_error_log"
    __table_args__ = {"schema": "tools"}

    error_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=True)
    error_detail = Column(Text, nullable=True)
    stage = Column(String(100), nullable=True)
    file_name = Column(String(200), nullable=True)
    batch_id = Column(String(30), nullable=True)
    timestamp = Column(TIMESTAMP(timezone=False), nullable=True, server_default=func.now())

    client_reference = relationship("ClientReference")


class TransformationLog(Base):
    __tablename__ = "transformation_log"
    __table_args__ = {"schema": "tools"}

    transform_log_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=True)
    status = Column(String(50), nullable=True)
    record_count = Column(Integer, nullable=True)
    source_table = Column(String(100), nullable=True)
    target_table = Column(String(100), nullable=True)
    batch_id = Column(String(30), nullable=True)
    message = Column(Text, nullable=True)
    timestamp = Column(TIMESTAMP(timezone=False), nullable=True, server_default=func.now())

    client_reference = relationship("ClientReference")


class JobExecutionLog(Base):
    __tablename__ = "job_execution_log"
    __table_args__ = {"schema": "tools"}

    job_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("tools.client_reference.client_id"), nullable=False)
    job_name = Column(String(100), nullable=True)
    status = Column(String(20), nullable=True)
    error_message = Column(Text, nullable=True)
    file_name = Column(String(200), nullable=True)
    batch_id = Column(String(30), nullable=True)
    start_time = Column(TIMESTAMP, nullable=True)
    end_time = Column(TIMESTAMP, nullable=True)

    client_reference = relationship("ClientReference")